const test = require('node:test');
const assert = require('node:assert/strict');

let createDemoCloudBridge;
try {
    ({ createDemoCloudBridge } = require('../js/demo-cloud-bridge.js'));
} catch {
    createDemoCloudBridge = undefined;
}

function memoryStorage() {
    const values = new Map();
    return {
        getItem(key) {
            return values.has(key) ? values.get(key) : null;
        },
        setItem(key, value) {
            values.set(key, String(value));
        }
    };
}

function createBridge() {
    let tick = 0;
    return createDemoCloudBridge({
        storage: memoryStorage(),
        now: () => `2026-09-23T10:00:0${tick++}.000Z`,
        channelFactory: () => null
    });
}

test('cloud bridge starts offline with an idle command', () => {
    assert.equal(typeof createDemoCloudBridge, 'function');
    const bridge = createBridge();

    assert.deepEqual(bridge.getState().simulation, {
        running: false,
        connected: false,
        scene: '智慧温室'
    });
    assert.equal(bridge.getState().command.status, 'idle');
});

test('running simulation publishes one authoritative telemetry sample', () => {
    const bridge = createBridge();
    bridge.startSimulation('智慧温室');
    bridge.publishTelemetry({ temperature: 26.4, humidity: 68, light: 842, door: '关闭' });

    const state = bridge.getState();
    assert.equal(state.simulation.connected, true);
    assert.deepEqual(state.telemetry, {
        temperature: 26.4,
        humidity: 68,
        light: 842,
        door: '关闭',
        sequence: 1,
        updatedAt: '2026-09-23T10:00:01.000Z'
    });
});

test('fan command remains pending until the simulation acknowledges it', () => {
    const bridge = createBridge();
    bridge.startSimulation();
    const pending = bridge.sendFanCommand(true);

    assert.equal(pending.command.status, 'pending');
    assert.equal(pending.command.desiredOn, true);
    assert.equal(pending.actuator.fanOn, false);

    const acknowledged = bridge.acknowledgeCommand(pending.command.id, true, '通风风扇已开启');
    assert.equal(acknowledged.command.status, 'acknowledged');
    assert.equal(acknowledged.command.ackAt, '2026-09-23T10:00:02.000Z');
    assert.equal(acknowledged.actuator.fanOn, true);
});

test('stopped simulation stays offline and rejects further telemetry', () => {
    const bridge = createBridge();
    bridge.startSimulation();
    bridge.publishTelemetry({ temperature: 25, humidity: 60, light: 700, door: '关闭' });
    bridge.stopSimulation();
    bridge.publishTelemetry({ temperature: 99, humidity: 1, light: 1, door: '开启' });

    const state = bridge.getState();
    assert.equal(state.simulation.running, false);
    assert.equal(state.simulation.connected, false);
    assert.equal(state.telemetry.sequence, 1);
    assert.equal(state.telemetry.temperature, 25);
});
