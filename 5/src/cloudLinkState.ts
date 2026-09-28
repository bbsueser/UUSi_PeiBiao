export type CloudCommandStatus = 'pending' | 'acknowledged' | 'failed';

export interface CloudLatestValues {
  temp: number;
  hum: number;
  light: number;
  co2: number;
  fanStatus: string;
  relayStatus: string;
  waterPumpStatus: string;
}

export interface CloudDownlink {
  id: string;
  property: string;
  value: string;
  time: string;
  seq: number;
  commandStatus: CloudCommandStatus;
  ackAt: string | null;
  message: string;
}

export interface CloudLinkState {
  isConnected: boolean;
  isSynced: boolean;
  isReporting: boolean;
  todayReportCount: number;
  latestValues: CloudLatestValues;
  uploadRecords: Array<{
    id: string;
    time: string;
    device: string;
    topic: string;
    payload: string;
    status: string;
  }>;
  lastReportTime: string;
  downlink?: CloudDownlink;
}

export function createDefaultCloudState(): CloudLinkState {
  return {
    isConnected: false,
    isSynced: false,
    isReporting: false,
    todayReportCount: 12,
    latestValues: {
      temp: 24.6,
      hum: 58,
      light: 450,
      co2: 620,
      fanStatus: '关闭',
      relayStatus: '关闭',
      waterPumpStatus: '关闭'
    },
    uploadRecords: [],
    lastReportTime: '--:--:--'
  };
}

export function publishCloudTelemetry(
  state: CloudLinkState,
  latestValues: CloudLatestValues,
  reportedAt: string
): CloudLinkState {
  return {
    ...state,
    isConnected: true,
    isSynced: true,
    isReporting: true,
    todayReportCount: state.todayReportCount + 1,
    latestValues: { ...latestValues },
    lastReportTime: reportedAt
  };
}

export function queueCloudCommand(
  state: CloudLinkState,
  command: { id: string; property: string; value: string; sentAt: string }
): CloudLinkState {
  return {
    ...state,
    downlink: {
      id: command.id,
      property: command.property,
      value: command.value,
      time: command.sentAt,
      seq: Date.now(),
      commandStatus: 'pending',
      ackAt: null,
      message: '指令已发送，等待仿真设备回执'
    }
  };
}

function commandMeansOn(value: string): boolean {
  return /运行中|开启|on|true|1/i.test(value);
}

export function acknowledgeCloudCommand(
  state: CloudLinkState,
  commandId: string,
  acknowledgedAt: string
): CloudLinkState {
  if (!state.downlink || state.downlink.id !== commandId || state.downlink.commandStatus !== 'pending') {
    return state;
  }

  const isOn = commandMeansOn(state.downlink.value);
  const latestValues = { ...state.latestValues };
  if (state.downlink.property === 'fanStatus') latestValues.fanStatus = isOn ? '运行中' : '关闭';
  if (state.downlink.property === 'relayStatus') latestValues.relayStatus = isOn ? '开启' : '关闭';
  if (state.downlink.property === 'waterPumpStatus') latestValues.waterPumpStatus = isOn ? '运行中' : '关闭';

  return {
    ...state,
    latestValues,
    downlink: {
      ...state.downlink,
      commandStatus: 'acknowledged',
      ackAt: acknowledgedAt,
      message: `设备已执行：${state.downlink.property} = ${state.downlink.value}`
    }
  };
}

export function markCloudOffline(state: CloudLinkState, stoppedAt: string): CloudLinkState {
  return {
    ...state,
    isConnected: false,
    isReporting: false,
    lastReportTime: stoppedAt,
    downlink: state.downlink?.commandStatus === 'pending'
      ? {
          ...state.downlink,
          commandStatus: 'failed',
          ackAt: stoppedAt,
          message: '仿真环境已关闭，指令未执行'
        }
      : state.downlink
  };
}
