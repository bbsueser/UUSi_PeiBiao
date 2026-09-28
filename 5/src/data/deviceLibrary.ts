export interface DeviceLibraryItem {
  id: string;
  name: string;
  category: string;
  code: string;
  comm: string;
  nodesCount: number;
  status: "可用" | "正常" | "故障";
  protocol: string;
  inputs: string[];
  outputs: string[];
  scenarios: string[];
  connectable: string[];
  /** 设备实物图路径（无线传感器已配图） */
  image?: string;
}

// Map each of the 10 categories to their specific requirements
export const categoryConfig = [
  { name: "网关", count: 28, codePrefix: "GW", comm: "RS485 / MQTT", protocol: "Modbus RTU / MQTT", inputs: ["VCC", "GND", "DI1", "DI2"], outputs: ["A", "B", "LAN", "4G"], scenarios: ["智慧温室", "工业控制", "智慧牧场"], connectable: ["温湿度传感器", "I/O模块", "边缘网关"] },
  { name: "I/O模块", count: 22, codePrefix: "IO", comm: "RS485", protocol: "Modbus RTU", inputs: ["VCC", "GND", "DI1", "AI1"], outputs: ["A", "B", "DO1", "AO1"], scenarios: ["智慧灌溉", "工厂自动化", "楼宇自控"], connectable: ["PLC控制器", "Modbus网关", "传感器"] },
  { name: "有线传感器", count: 35, codePrefix: "SENSOR", comm: "RS485", protocol: "Modbus RTU", inputs: ["VCC", "GND"], outputs: ["DATA", "A", "B"], scenarios: ["智慧温室", "温室监控", "机房监控"], connectable: ["Modbus网关", "I/O模块", "边缘网关"] },
  { name: "无线传感器", count: 30, codePrefix: "WS", comm: "LoRa", protocol: "LoRaWAN / Private", inputs: ["3.6V Battery"], outputs: ["RF Antenna"], scenarios: ["大田种植", "山体滑坡监测", "管网检测"], connectable: ["LoRa网关", "无线基站"] },
  { name: "继电器", count: 18, codePrefix: "RELAY", comm: "RS485", protocol: "Modbus RTU", inputs: ["IN1", "IN2", "VCC", "GND"], outputs: ["NC1", "COM1", "NO1"], scenarios: ["强电控制", "卷帘控制", "自动喂食"], connectable: ["Modbus网关", "I/O模块", "水泵", "风机"] },
  { name: "RFID", count: 16, codePrefix: "RFID", comm: "RS485", protocol: "Wiegand / Modbus", inputs: ["VCC", "GND", "TXD"], outputs: ["RXD", "A", "B"], scenarios: ["仓储物流", "图书管理", "门禁通道"], connectable: ["工业网关", "门禁控制器"] },
  { name: "终端", count: 20, codePrefix: "TERM", comm: "以太网 / Wi-Fi", protocol: "Modbus TCP / HTTP", inputs: ["VCC", "GND", "HDMI"], outputs: ["Touch Out", "LAN"], scenarios: ["中控发布", "人机交互", "设备检修"], connectable: ["边缘网关", "云平台接口"] },
  { name: "负载", count: 24, codePrefix: "LOAD", comm: "开关量 / 模拟量", protocol: "电平控制", inputs: ["VCC+", "VCC-"], outputs: ["STATUS feedback"], scenarios: ["设备启停", "灌溉水泵", "大功率排风"], connectable: ["继电器", "I/O控制模块"] },
  { name: "电源", count: 15, codePrefix: "PWR", comm: "DC 接线端子", protocol: "静电防护/过载保护", inputs: ["AC 220V"], outputs: ["DC 24V", "DC 12V", "GND"], scenarios: ["系统供电", "设备箱供电", "备用电池供电"], connectable: ["全场设备", "网关", "传感器"] },
  { name: "其它外设", count: 22, codePrefix: "DEV", comm: "GPIO / UART", protocol: "电平 / 串口协议", inputs: ["VCC", "GND", "SIG"], outputs: ["Beep / Display"], scenarios: ["本地警报", "门禁联动", "文字播报"], connectable: ["单片机", "网关", "I/O模块"] }
];

const baselineDevices: { [key: string]: string[] } = {
  "网关": [
    "Modbus网关",
    "边缘网关",
    "工业网关",
    "LoRa网关",
    "MQTT网关",
    "4G智能网关",
    "NB-IoT网关",
    "以太网网关",
    "RFID网关",
    "Zigbee无线智能网关",
    "5G边缘计算网关",
    "CAN-Bus工业网关",
    "Wi-Fi 6双频物联网网关",
    "蓝牙Mesh自组网网关",
    "RS485智能数据网关"
  ],
  "I/O模块": [
    "数字量输入模块",
    "数字量输出模块",
    "模拟量输入模块",
    "模拟量输出模块",
    "DI模块",
    "DO模块",
    "AI模块",
    "AO模块",
    "RS485远程I/O采集模块",
    "以太网多路开关量模块",
    "Modbus-RTU脉冲采集模块"
  ],
  "有线传感器": [
    "温湿度传感器",
    "工业温湿度传感器",
    "光照传感器",
    "二氧化碳传感器",
    "土壤湿度传感器",
    "烟雾传感器",
    "甲烷传感器",
    "粉尘传感器",
    "水位传感器",
    "土壤EC传感器",
    "氨气传感器",
    "空气质量传感器",
    "红外测温传感器",
    "超声波测距传感器"
  ],
  "无线传感器": [
    "无线温湿度传感器",
    "无线光照传感器",
    "无线空气质量传感器",
    "无线火焰传感器",
    "无线人体传感器",
    "无线可燃气体传感器",
    "无线烟雾探测器",
    "无线燃气泄漏传感器",
    "无线水浸探测器",
    "无线门磁探测器",
    "无线声光报警器",
    "Nb-IoT无线压力传感器",
    "Zigbee温湿度采集终端",
    "LoRaWAN土壤墒情传感器",
    "蓝牙气压高度传感器"
  ],
  "继电器": [
    "单路继电器",
    "双路继电器",
    "四路继电器",
    "八路继电器",
    "无线继电器",
    "工业继电器模块",
    "智能断路器控制器",
    "高电压固态继电器",
    "RS485隔离型多路继电器"
  ],
  "RFID": [
    "RFID读写器",
    "RFID标签",
    "RFID天线",
    "RFID门禁终端",
    "RFID手持终端",
    "125K高频RFID读卡器",
    "13.56M超高频读卡器",
    "UHF超高频无源读写头"
  ],
  "终端": [
    "工业触摸屏",
    "移动采集终端",
    "人员定位终端",
    "环境监测终端",
    "边缘计算终端",
    "物联网人机交互屏",
    "工业平板电脑",
    "智能数据采集终端",
    "智能看板终端"
  ],
  "负载": [
    "风机",
    "水泵",
    "灯光",
    "报警器",
    "电磁阀",
    "电机",
    "加热器",
    "喷淋设备",
    "直流风扇",
    "报警蜂鸣器",
    "LED警示灯"
  ],
  "电源": [
    "直流电源模块",
    "交流电源模块",
    "稳压电源",
    "UPS电源",
    "24V电源模块",
    "12V电源模块",
    "5V恒流隔离电源模块",
    "开关稳压备用电源"
  ],
  "其它外设": [
    "摄像头",
    "蜂鸣器",
    "指示灯",
    "按钮开关",
    "门磁",
    "电子锁",
    "显示屏",
    "语音播报器",
    "声光报警器",
    "热敏微型打印机"
  ]
};

// 无线传感器实物图：对应招标要求的 11 类感知设备
const sensorImages: Record<string, string> = {
  无线温湿度传感器: "/images/sensors/temp-humidity.png",
  无线光照传感器: "/images/sensors/light.png",
  无线烟雾探测器: "/images/sensors/smoke.png",
  无线门磁探测器: "/images/sensors/door-magnet.png",
  无线人体传感器: "/images/sensors/human-presence.png",
  无线水浸探测器: "/images/sensors/water-immersion.png",
  无线空气质量传感器: "/images/sensors/air-quality.png",
  无线火焰传感器: "/images/sensors/flame.png",
  无线可燃气体传感器: "/images/sensors/combustible-gas.png",
  无线燃气泄漏传感器: "/images/sensors/gas-leak.png",
  无线声光报警器: "/images/sensors/sound-light-alarm.png"
};

// Generate exactly 230 devices distributed across categories
export const generateDeviceLibrary = (): DeviceLibraryItem[] => {
  const library: DeviceLibraryItem[] = [];

  categoryConfig.forEach((cat) => {
    const baselines = baselineDevices[cat.name] || [];
    const needed = cat.count;
    
    for (let i = 0; i < needed; i++) {
      let name = "";
      if (i < baselines.length) {
        name = baselines[i];
      } else {
        const indexSuffix = (i - baselines.length + 1).toString().padStart(2, "0");
        name = `${cat.name}扩展型号-${indexSuffix}`;
      }

      const indexStr = (i + 1).toString().padStart(3, "0");
      const code = `${cat.codePrefix}-${name.toUpperCase().replace(/[\-\s\d]/g, "").slice(0, 4)}-${indexStr}`;

      library.push({
        id: `lib-dev-${cat.codePrefix.toLowerCase()}-${i}`,
        name,
        category: cat.name,
        code,
        comm: i % 3 === 0 && cat.name === "网关" ? "RS485 / MQTT" : i % 2 === 1 ? cat.comm : cat.comm.split(" / ")[0],
        nodesCount: 2 + (i % 5),
        status: "可用",
        protocol: cat.protocol,
        inputs: cat.inputs,
        outputs: cat.outputs,
        scenarios: cat.scenarios,
        connectable: cat.connectable,
        image: sensorImages[name]
      });
    }
  });

  return library;
};

export const deviceLibraryData = generateDeviceLibrary();
