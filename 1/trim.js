import fs from 'fs';
const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

const endOfFile = `
    </div>
  );
}`;

const endOfFileIndex = txt.lastIndexOf(endOfFile);
if (endOfFileIndex !== -1) {
    txt = txt.substring(0, endOfFileIndex + endOfFile.length);
}

fs.writeFileSync(file, txt);
console.log("Trimmed file to real component end.");
