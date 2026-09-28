(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.TroubleshootingScenario = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    function portOf(wire, device) {
        if (!wire || !device) return null;
        if (wire.device1 && wire.device1.id === device.id) return device.ports[wire.portIndex1] || null;
        if (wire.device2 && wire.device2.id === device.id) return device.ports[wire.portIndex2] || null;
        return null;
    }

    function otherEnd(wire, device) {
        if (!wire || !device) return null;
        if (wire.device1 && wire.device1.id === device.id) {
            return { device: wire.device2, port: wire.device2 && wire.device2.ports[wire.portIndex2] };
        }
        if (wire.device2 && wire.device2.id === device.id) {
            return { device: wire.device1, port: wire.device1 && wire.device1.ports[wire.portIndex1] };
        }
        return null;
    }

    function wiresFor(wires, device) {
        return (wires || []).filter(wire => wire.device1 && wire.device2 &&
            (wire.device1.id === device.id || wire.device2.id === device.id));
    }

    function hasLink(wires, source, sourcePortType, targetTemplate, targetPortRole) {
        if (!source) return false;
        return wiresFor(wires, source).some(wire => {
            const ownPort = portOf(wire, source);
            const target = otherEnd(wire, source);
            return ownPort && ownPort.type === sourcePortType && target && target.device && target.port &&
                target.device.templateId === targetTemplate && target.port.role === targetPortRole;
        });
    }

    function hasPowerLink(wires, target, powerTemplate) {
        if (!target) return false;
        return wiresFor(wires, target).some(wire => {
            const ownPort = portOf(wire, target);
            const source = otherEnd(wire, target);
            return ownPort && ownPort.type === 'power' && source && source.device && source.port &&
                source.device.templateId === powerTemplate && source.port.type === 'vcc';
        });
    }

    function evaluate(devices, wires) {
        const byTemplate = templateId => (devices || []).find(device => device.templateId === templateId);
        const temperature = byTemplate('temp_pt100');
        const humidity = byTemplate('humi_capacitive');
        const gateway = byTemplate('gw_chipstack');
        const fan = byTemplate('load_fan');
        const errors = [];
        const warnings = [];
        const success = [];

        if (hasLink(wires, temperature, 'data', 'gw_chipstack', 'temperature')) {
            success.push({ device: temperature.name, issue: '数据线连接正常', category: '连线' });
        } else if (temperature) {
            errors.push({
                device: temperature.name,
                issue: '数据端口未连接',
                category: '连线',
                suggestion: '将DATA端口连接到ChipStack网关的温度数据端口'
            });
        }

        if (hasLink(wires, humidity, 'data', 'gw_chipstack', 'humidity')) {
            success.push({ device: humidity.name, issue: '数据线连接正常', category: '连线' });
        } else if (humidity) {
            errors.push({
                device: humidity.name,
                issue: '数据端口未连接',
                category: '连线',
                suggestion: '将DATA端口连接到ChipStack网关的湿度数据端口'
            });
        }

        if (hasPowerLink(wires, gateway, 'power_12v')) {
            success.push({ device: gateway.name, issue: '网关电源正常', category: '连线' });
        } else if (gateway) {
            errors.push({
                device: gateway.name,
                issue: '网关电源未连接',
                category: '连线',
                suggestion: '连接12V电源VCC+端口到网关VCC端口'
            });
        }

        // 检查地线：与连线验证面板的 GND 检查保持一致（存在任意 GND 线即视为已接地）
        const hasGNDWire = (wires || []).some(w => {
            const p1 = w.device1 && w.device1.ports && w.device1.ports[w.portIndex1];
            const p2 = w.device2 && w.device2.ports && w.device2.ports[w.portIndex2];
            return (p1 && p1.type === 'gnd') || (p2 && p2.type === 'gnd');
        });
        if (hasGNDWire) {
            success.push({ device: gateway.name, issue: '地线连接正常', category: '连线' });
        } else if (gateway) {
            errors.push({
                device: gateway.name,
                issue: 'GND地线未连接',
                category: '连线',
                suggestion: '将12V电源的GND-端口连接到网关的GND端口'
            });
        }

        if (hasLink(wires, fan, 'ctrl', 'gw_chipstack', 'actuator')) {
            success.push({ device: fan.name, issue: '控制线连接正常', category: '连线' });
        } else if (fan) {
            warnings.push({
                device: fan.name,
                issue: '控制端口未连接',
                category: '连线',
                suggestion: '将CTRL端口连接到ChipStack网关的风扇控制端口'
            });
        }

        const has12v = hasPowerLink(wires, fan, 'power_12v');
        const has5v = hasPowerLink(wires, fan, 'power_5v');
        if (has12v && !has5v) {
            success.push({ device: fan.name, issue: '电源连接正确', category: '设备选型' });
        } else if (has12v && has5v) {
            errors.push({
                device: fan.name,
                issue: '电源接线冗余',
                category: '设备选型',
                suggestion: '12V电源连接正常，但5V电源仍与通风风扇相连。请删除5V连线，仅保留12V供电。'
            });
        } else if (has5v) {
            errors.push({
                device: fan.name,
                issue: '电源电压不足',
                category: '设备选型',
                suggestion: '当前使用5V电源，建议更换为12V电源。通风风扇等执行器设备通常需要12V电压才能正常工作。'
            });
        } else if (fan) {
            warnings.push({
                device: fan.name,
                issue: '电源端口未连接',
                category: '连线',
                suggestion: '连接12V电源的VCC+端口到通风风扇的VCC端口'
            });
        }

        return { errors, warnings, success };
    }

    return { evaluate, hasLink, hasPowerLink };
});
