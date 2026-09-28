const fs = require('fs');

let txt = fs.readFileSync('src/components/TwoDDesigner.tsx', 'utf-8');

const newDeviceList = `  const [deviceList, setDeviceList] = useState<any[]>([
    {
      id: "conveyor-01",
      name: "输送带设备 CONVEYOR-01",
      product: "输送带设备",
      status: "运行中",
      dataPoints: [
        { key: "speed", name: "速度", type: "number", typeDesc: "数值型", unit: "m/min", value: 60 },
        { key: "load", name: "负载", type: "number", typeDesc: "数值型", unit: "%", value: 42 },
        { key: "running", name: "运行状态", type: "string", typeDesc: "状态文本", unit: "", value: "运行中" }
      ]
    },
    {
      id: "fan-01",
      name: "工业风机 FAN-01",
      product: "工业风机",
      status: "运行中",
      dataPoints: [
        { key: "speed", name: "转速", type: "number", typeDesc: "数值型", unit: "rpm", value: 1200 },
        { key: "temperature", name: "电机温度", type: "number", typeDesc: "数值型", unit: "℃", value: 48 },
        { key: "current", name: "电流", type: "number", typeDesc: "数值型", unit: "A", value: 3.2 }
      ]
    },
    {
      id: "valve-01",
      name: "控制阀门 VALVE-01",
      product: "控制阀门",
      status: "开启",
      dataPoints: [
        { key: "openRate", name: "开度", type: "number", typeDesc: "数值型", unit: "%", value: 75 },
        { key: "pressure", name: "压力", type: "number", typeDesc: "数值型", unit: "MPa", value: 0.36 },
        { key: "flow", name: "流量", type: "number", typeDesc: "数值型", unit: "L/min", value: 18 }
      ]
    },
    {
      id: "pump-01",
      name: "水泵设备 PUMP-01",
      product: "水泵设备",
      status: "运行中",
      dataPoints: [
        { key: "running", name: "运行状态", type: "string", typeDesc: "状态文本", unit: "", value: "运行中" },
        { key: "pressure", name: "出口压力", type: "number", typeDesc: "数值型", unit: "MPa", value: 0.42 },
        { key: "flow", name: "流量", type: "number", typeDesc: "数值型", unit: "L/min", value: 22 }
      ]
    },
    {
      id: "light-01",
      name: "警示灯 LIGHT-01",
      product: "警示灯",
      status: "正常",
      dataPoints: [
        { key: "alarm", name: "报警状态", type: "string", typeDesc: "状态文本", unit: "", value: "正常" },
        { key: "lightStatus", name: "灯光状态", type: "string", typeDesc: "状态文本", unit: "", value: "绿色常亮" }
      ]
    },
    {
      id: "robot-01",
      name: "机械臂 ROBOT-01",
      product: "机械臂",
      status: "搬运中",
      dataPoints: [
        { key: "action", name: "动作状态", type: "string", typeDesc: "状态文本", unit: "", value: "搬运中" },
        { key: "axisAngle", name: "轴角度", type: "string", typeDesc: "数值型", unit: "°", value: 68 },
        { key: "cycleCount", name: "循环次数", type: "number", typeDesc: "数值型", unit: "次", value: 128 }
      ]
    }
  ]);`;

const start1 = txt.indexOf('const [deviceList, setDeviceList]');
const end1 = txt.indexOf('  const [dataSourceList', start1);
txt = txt.substring(0, start1) + newDeviceList + '\n\n' + txt.substring(end1);

fs.writeFileSync('src/components/TwoDDesigner.tsx', txt);
