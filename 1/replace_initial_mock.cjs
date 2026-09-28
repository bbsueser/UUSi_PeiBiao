const fs = require('fs');
let txt = fs.readFileSync('src/components/TwoDDesigner.tsx', 'utf-8');

const newInitialState = `  const [realTimeData, setRealTimeData] = useState<any>({
     speed: 60,
     load: 42,
     running: "运行中",
     temperature: 48,
     current: 3.2,
     openRate: 75,
     pressure: 0.42,
     flow: 22,
     alarm: "正常",
     lightStatus: "绿色常亮",
     action: "搬运中",
     axisAngle: 68,
     cycleCount: 128
  });`;

const start = txt.indexOf('  const [realTimeData, setRealTimeData] = useState<any>({');
const end = txt.indexOf('});', start);

if (start !== -1 && end !== -1) {
    txt = txt.substring(0, start) + newInitialState + txt.substring(end + 3);
    fs.writeFileSync('src/components/TwoDDesigner.tsx', txt);
    console.log('updated initial realtime mock');
}
