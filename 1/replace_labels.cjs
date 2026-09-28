const fs = require('fs');
let txt = fs.readFileSync('src/components/TwoDDesigner.tsx', 'utf-8');

txt = txt.replace(/<label className="text-xs font-bold text-zinc-400 mb-1 block">选择设备<\/label>/, '<label className="text-xs font-bold text-zinc-400 mb-1 block">选择仿真设备</label>');
txt = txt.replace(/<label className="text-xs font-bold text-zinc-400 mb-1 block">数据点<\/label>/, '<label className="text-xs font-bold text-zinc-400 mb-1 block">选择数据点</label>');
txt = txt.replace(/>绑定动态数据<\/button>/, '>绑定到组件</button>');

fs.writeFileSync('src/components/TwoDDesigner.tsx', txt);
console.log('labels done');
