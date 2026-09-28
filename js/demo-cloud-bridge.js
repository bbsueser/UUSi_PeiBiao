(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }
    if (root) {
        root.DemoCloudBridge = api;
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    const STORAGE_KEY = 'uusi.demo.industry-cloud.v1';
    const CHANNEL_NAME = 'uusi-demo-industry-cloud';
    const MAX_LOGS = 80;

    function defaultState() {
        return {
            version: 1,
            simulation: { running: false, connected: false, scene: '智慧温室' },
            telemetry: {
                temperature: null,
                humidity: null,
                light: null,
                door: null,
                sequence: 0,
                updatedAt: null
            },
            actuator: { fanOn: false, updatedAt: null },
            command: {
                id: null,
                target: 'fan',
                desiredOn: false,
                status: 'idle',
                sentAt: null,
                ackAt: null,
                message: ''
            },
            logs: []
        };
    }

    function normalizeState(value) {
        const base = defaultState();
        const source = value && typeof value === 'object' ? value : {};
        return {
            ...base,
            ...source,
            simulation: { ...base.simulation, ...(source.simulation || {}) },
            telemetry: { ...base.telemetry, ...(source.telemetry || {}) },
            actuator: { ...base.actuator, ...(source.actuator || {}) },
            command: { ...base.command, ...(source.command || {}) },
            logs: Array.isArray(source.logs) ? source.logs.slice(0, MAX_LOGS) : []
        };
    }

    function createDemoCloudBridge(options) {
        const config = options || {};
        const browserWindow = typeof window !== 'undefined' ? window : null;
        const storage = config.storage || (browserWindow && browserWindow.localStorage);
        const now = config.now || (() => new Date().toISOString());
        const channelFactory = config.channelFactory || ((name) => {
            if (typeof BroadcastChannel === 'undefined') return null;
            return new BroadcastChannel(name);
        });
        const channel = channelFactory(CHANNEL_NAME);
        const listeners = new Set();

        function read() {
            if (!storage) return defaultState();
            try {
                const raw = storage.getItem(STORAGE_KEY);
                return raw ? normalizeState(JSON.parse(raw)) : defaultState();
            } catch {
                return defaultState();
            }
        }

        function notify(state) {
            listeners.forEach((listener) => listener(state));
            if (channel && typeof channel.postMessage === 'function') {
                channel.postMessage({ type: 'state-changed' });
            }
        }

        function write(state) {
            const normalized = normalizeState(state);
            if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(normalized));
            notify(normalized);
            return normalized;
        }

        function appendLog(state, type, message, timestamp) {
            return {
                ...state,
                logs: [
                    { id: `${timestamp}-${type}`, time: timestamp, type, message },
                    ...state.logs
                ].slice(0, MAX_LOGS)
            };
        }

        function startSimulation(scene) {
            const timestamp = now();
            let state = read();
            const sceneName = scene || '智慧温室';
            state = {
                ...state,
                simulation: { running: true, connected: true, scene: sceneName }
            };
            return write(appendLog(state, 'connection', `${sceneName}仿真已连接行业云平台`, timestamp));
        }

        function stopSimulation() {
            const timestamp = now();
            let state = read();
            state = {
                ...state,
                simulation: { ...state.simulation, running: false, connected: false },
                command: state.command.status === 'pending'
                    ? { ...state.command, status: 'failed', ackAt: timestamp, message: '仿真已停止，设备未执行指令' }
                    : state.command
            };
            return write(appendLog(state, 'connection', '仿真已停止，行业云设备离线', timestamp));
        }

        function publishTelemetry(values) {
            const current = read();
            if (!current.simulation.running || !current.simulation.connected) return current;
            const timestamp = now();
            let state = {
                ...current,
                telemetry: {
                    ...current.telemetry,
                    ...values,
                    sequence: current.telemetry.sequence + 1,
                    updatedAt: timestamp
                }
            };
            const telParts = [];
            if (state.telemetry.temperature != null) telParts.push(`温度 ${state.telemetry.temperature}℃`);
            if (state.telemetry.humidity != null) telParts.push(`湿度 ${state.telemetry.humidity}%RH`);
            if (state.telemetry.light != null) telParts.push(`光照 ${state.telemetry.light} Lux`);
            if (state.telemetry.door != null) telParts.push(`门磁 ${state.telemetry.door}`);
            state = appendLog(
                state,
                'telemetry',
                `遥测 #${state.telemetry.sequence} 已同步：${telParts.join('，')}`,
                timestamp
            );
            return write(state);
        }

        function sendFanCommand(desiredOn) {
            const timestamp = now();
            const current = read();
            if (!current.simulation.connected) {
                return write(appendLog({
                    ...current,
                    command: {
                        id: `cmd-${Date.now()}`,
                        target: 'fan',
                        desiredOn: !!desiredOn,
                        status: 'failed',
                        sentAt: timestamp,
                        ackAt: timestamp,
                        message: '仿真设备离线，指令未发送'
                    }
                }, 'command', '设备离线，通风风扇控制指令发送失败', timestamp));
            }
            const id = `cmd-${Date.now()}-${current.telemetry.sequence + 1}`;
            let state = {
                ...current,
                command: {
                    id,
                    target: 'fan',
                    desiredOn: !!desiredOn,
                    status: 'pending',
                    sentAt: timestamp,
                    ackAt: null,
                    message: '指令已发送，等待设备回执'
                }
            };
            return write(appendLog(state, 'command', `云端下发：通风风扇${desiredOn ? '开启' : '关闭'}`, timestamp));
        }

        function acknowledgeCommand(commandId, actualOn, message) {
            const current = read();
            if (!commandId || current.command.id !== commandId || current.command.status !== 'pending') return current;
            const timestamp = now();
            let state = {
                ...current,
                actuator: { fanOn: !!actualOn, updatedAt: timestamp },
                command: {
                    ...current.command,
                    status: 'acknowledged',
                    ackAt: timestamp,
                    message: message || `通风风扇已${actualOn ? '开启' : '关闭'}`
                }
            };
            return write(appendLog(state, 'ack', `设备回执：${state.command.message}`, timestamp));
        }

        function subscribe(listener) {
            listeners.add(listener);
            const refresh = () => listener(read());
            if (channel) channel.onmessage = refresh;
            if (browserWindow) browserWindow.addEventListener('storage', refresh);
            listener(read());
            return function unsubscribe() {
                listeners.delete(listener);
                if (browserWindow) browserWindow.removeEventListener('storage', refresh);
            };
        }

        return {
            getState: read,
            startSimulation,
            stopSimulation,
            publishTelemetry,
            sendFanCommand,
            acknowledgeCommand,
            subscribe
        };
    }

    let singleton = null;
    function getDemoCloudBridge() {
        if (!singleton) singleton = createDemoCloudBridge();
        return singleton;
    }

    return { createDemoCloudBridge, getDemoCloudBridge, defaultState, normalizeState };
});
