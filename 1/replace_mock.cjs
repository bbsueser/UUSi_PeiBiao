const fs = require('fs');
let txt = fs.readFileSync('src/components/TwoDDesigner.tsx', 'utf-8');

const newMockGen = `    const interval = setInterval(() => {
      setRealTimeData((prev: any) => ({
         speed: (60 + (Math.random() - 0.5) * 5).toFixed(1),
         load: Math.round(42 + (Math.random() - 0.5) * 5),
         running: "运行中",
         temperature: (48 + (Math.random() - 0.5) * 3).toFixed(1),
         current: (3.2 + (Math.random() - 0.5) * 0.2).toFixed(1),
         openRate: Math.round(75 + (Math.random() - 0.5) * 8),
         pressure: (0.42 + (Math.random() - 0.5) * 0.05).toFixed(2),
         flow: (22 + (Math.random() - 0.5) * 2).toFixed(1),
         alarm: "正常",
         lightStatus: "绿色常亮",
         action: "搬运中",
         axisAngle: Math.round(68 + (Math.random() - 0.5) * 10),
         cycleCount: Math.round(128 + Math.random() * 2),
      }));
    }, 2000);`;

const start = txt.indexOf('    const interval = setInterval(() => {');
const end = txt.indexOf('    }, 2000);', start);

if (start !== -1 && end !== -1) {
    txt = txt.substring(0, start) + newMockGen + txt.substring(end + 13);
    fs.writeFileSync('src/components/TwoDDesigner.tsx', txt);
    console.log('updated realtime mock');
} else {
    console.log('failed realtime mock');
}
