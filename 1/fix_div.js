import fs from 'fs';
const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

const targetStr = '<td colSpan={6} className="p-4 text-center text-zinc-600">暂无配置记录</td></tr>';
const idx = txt.indexOf(targetStr);

if (idx !== -1) {
    const nextCode = txt.substring(idx, idx + 500);
    console.log("Found at", idx, "\\nSnippet:", nextCode);
} else {
    console.log("Could not find the target string.");
}
