const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const lines = content.split('\n');
const errIdx = lines.findIndex((l, i) => l === '});' && lines[i+1] === '');

if(errIdx !== -1) {
  lines.splice(errIdx, 1);
  fs.writeFileSync('server.ts', lines.join('\n'));
  console.log("Patched syntax error");
} else {
  // Let's just remove the first extra }); we find before 3.4
  content = content.replace('  }\n});\n\n});\n\n// 3.4. Autonomous', '  }\n});\n\n// 3.4. Autonomous');
  fs.writeFileSync('server.ts', content);
  console.log("Patched syntax error via replace");
}
