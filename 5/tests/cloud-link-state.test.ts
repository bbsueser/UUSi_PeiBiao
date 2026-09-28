import test from 'node:test';
import assert from 'node:assert/strict';

let cloudState: typeof import('../src/cloudLinkState') | undefined;
try {
  cloudState = await import('../src/cloudLinkState');
} catch {
  cloudState = undefined;
}

test('P2 cloud command waits for an engineering acknowledgement', () => {
  assert.equal(typeof cloudState?.createDefaultCloudState, 'function');
  const initial = cloudState!.createDefaultCloudState();
  const pending = cloudState!.queueCloudCommand(initial, {
    id: 'cmd-1001',
    property: 'fanStatus',
    value: 'on',
    sentAt: '10:00:00'
  });

  assert.equal(pending.downlink?.commandStatus, 'pending');
  assert.equal(pending.downlink?.ackAt, null);

  const acknowledged = cloudState!.acknowledgeCloudCommand(pending, 'cmd-1001', '10:00:01');
  assert.equal(acknowledged.downlink?.commandStatus, 'acknowledged');
  assert.equal(acknowledged.downlink?.ackAt, '10:00:01');
  assert.equal(acknowledged.latestValues.fanStatus, '运行中');
});

test('closing P2 engineering simulation marks cloud devices offline', () => {
  const initial = cloudState!.createDefaultCloudState();
  const online = cloudState!.publishCloudTelemetry(initial, {
    temp: 26.4,
    hum: 68,
    light: 842,
    co2: 620,
    fanStatus: '关闭',
    relayStatus: '关闭',
    waterPumpStatus: '关闭'
  }, '10:00:00');
  const offline = cloudState!.markCloudOffline(online, '10:00:05');

  assert.equal(offline.isConnected, false);
  assert.equal(offline.isReporting, false);
  assert.equal(offline.lastReportTime, '10:00:05');
  assert.equal(offline.latestValues.temp, 26.4);
});
