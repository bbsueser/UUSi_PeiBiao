const fs = require('fs');

let txt = fs.readFileSync('src/components/TwoDDesigner.tsx', 'utf-8');

txt = txt.replace(/>模型数据配置日志<\/button>/, '><Cloud className="w-3.5 h-3.5"/>仿真数据同步记录</button>');
txt = txt.replace(/>模型数据绑定关系<\/button>/, '><Link className="w-3.5 h-3.5"/>仿真设备绑定关系</button>');

fs.writeFileSync('src/components/TwoDDesigner.tsx', txt);
console.log('Replacing tab names done.');
