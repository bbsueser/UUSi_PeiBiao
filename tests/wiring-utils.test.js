const test = require('node:test');
const assert = require('node:assert/strict');

const { findTargetPort } = require('../js/wiring-utils.js');

function port(deviceId, left, top, size = 16) {
    return {
        dataset: { deviceId },
        getBoundingClientRect() {
            return { left, top, width: size, height: size, right: left + size, bottom: top + size };
        }
    };
}

test('snaps a near miss to the closest connection port', () => {
    const target = port('device_2', 100, 100);

    assert.equal(findTargetPort([target], 126, 108, { snapDistance: 22 }), target);
});

test('does not snap back to a port on the source device', () => {
    const source = port('device_1', 100, 100);
    const target = port('device_2', 140, 100);

    assert.equal(findTargetPort([source, target], 112, 108, {
        snapDistance: 40,
        excludeDeviceId: 'device_1'
    }), target);
});

test('rejects a release point that is too far from every port', () => {
    assert.equal(findTargetPort([port('device_2', 100, 100)], 180, 180, { snapDistance: 22 }), null);
});
