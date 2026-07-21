const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const lines = content.split('\n');
const errIdx = lines.findIndex(l => l.includes("});") && lines[l+1] && lines[l+1].includes("// 3.4. Autonomous Voice Receptionist Webhook"));

// actually lines 1047-1048
if(lines[1046] === '});' && lines[1048] === '// 3.4. Autonomous Voice Receptionist Webhook (Low-Latency Optimized)') {
  lines.splice(1046, 2);
  fs.writeFileSync('server.ts', lines.join('\n'));
  console.log("Patched syndicate hook again");
} else {
  // Let's just find and replace the double '});'
  content = content.replace('  }\n});\n\n});\n\n// 3.4. Autonomous', '  }\n});\n\n// 3.4. Autonomous');
  fs.writeFileSync('server.ts', content);
  console.log("Patched syndicate hook again (regex)");
}
