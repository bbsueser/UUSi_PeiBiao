const test = require('node:test');
const assert = require('node:assert/strict');

const { evaluate } = require('../js/troubleshooting-scenario.js');

function device(id, templateId, name, ports) {
    return { id, templateId, name, ports };
}

function wire(device1, portIndex1, device2, portIndex2) {
    return { device1, portIndex1, device2, portIndex2 };
}

function scenario() {
    const temperature = device('temp', 'temp_pt100', '温度传感器', [{ type: 'data', label: 'DATA' }]);
    const humidity = device('humi', 'humi_capacitive', '湿度传感器', [{ type: 'data', label: 'DATA' }]);
    const gateway = device('gateway', 'gw_chipstack', 'ChipStack网关', [
        { type: 'data', role: 'temperature', label: '温度' },
        { type: 'data', role: 'humidity', label: '湿度' },
        { type: 'ctrl', role: 'actuator', label: '控制' },
        { type: 'power', role: 'power', label: 'VCC' },
        { type: 'gnd', label: 'GND' }
    ]);
    const fan = device('fan', 'load_fan', '通风风扇', [
        { type: 'ctrl', label: 'CTRL' },
        { type: 'power', label: 'VCC' }
    ]);
    const power5 = device('power5', 'power_5v', '5V电源', [{ type: 'vcc', label: 'VCC+' }]);
    const power12 = device('power12', 'power_12v', '12V电源', [
        { type: 'vcc', role: 'gateway-power', label: '网关+' },
        { type: 'vcc', role: 'fan-power', label: '风扇+' }
    ]);
    return { devices: [temperature, humidity, gateway, fan, power5, power12], temperature, humidity, gateway, fan, power5, power12 };
}

test('initial troubleshooting topology reports the three scripted problems and two normal links', () => {
    const s = scenario();
    const wires = [
        wire(s.temperature, 0, s.gateway, 0),
        wire(s.fan, 0, s.gateway, 2),
        wire(s.power5, 0, s.fan, 1)
    ];

    const result = evaluate(s.devices, wires);

    assert.deepEqual(result.errors.map(item => `${item.device}:${item.issue}`), [
        '湿度传感器:数据端口未连接',
        'ChipStack网关:网关电源未连接',
        '通风风扇:电源电压不足'
    ]);
    assert.deepEqual(result.warnings, []);
    assert.deepEqual(result.success.map(item => `${item.device}:${item.issue}`), [
        '温度传感器:数据线连接正常',
        '通风风扇:控制线连接正常'
    ]);
});

test('the documented repairs clear every troubleshooting problem', () => {
    const s = scenario();
    const wires = [
        wire(s.temperature, 0, s.gateway, 0),
        wire(s.humidity, 0, s.gateway, 1),
        wire(s.fan, 0, s.gateway, 2),
        wire(s.power12, 0, s.gateway, 3),
        wire(s.power12, 1, s.fan, 1)
    ];

    const result = evaluate(s.devices, wires);

    assert.equal(result.errors.length, 0);
    assert.equal(result.warnings.length, 0);
    assert.equal(result.success.length, 5);
});

test('a sensor connected to the wrong dedicated gateway input is not accepted', () => {
    const s = scenario();
    const wires = [
        wire(s.temperature, 0, s.gateway, 1),
        wire(s.humidity, 0, s.gateway, 0)
    ];

    const result = evaluate(s.devices, wires);

    assert.equal(result.errors.some(item => item.device === '温度传感器'), true);
    assert.equal(result.errors.some(item => item.device === '湿度传感器'), true);
});
