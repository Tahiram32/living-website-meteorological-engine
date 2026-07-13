const fs = require('fs');
let code = fs.readFileSync('scripts/weather-sync-orchestrator.ts', 'utf8');

const target = `    let cleanedKey = serviceAccountKey.trim();
    const firstBrace = cleanedKey.indexOf('{');
    const lastBrace = cleanedKey.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanedKey = cleanedKey.substring(firstBrace, lastBrace + 1);
    }
    const serviceAccount = JSON.parse(cleanedKey);`;

const replacement = `    let cleanedKey = serviceAccountKey.trim();
    const firstBrace = cleanedKey.indexOf('{');
    if (firstBrace !== -1) {
      let depth = 0;
      let lastBrace = -1;
      let insideString = false;
      let escapeNext = false;
      for (let i = firstBrace; i < cleanedKey.length; i++) {
        const char = cleanedKey[i];
        if (escapeNext) {
          escapeNext = false;
          continue;
        }
        if (char === '\\\\') {
          escapeNext = true;
          continue;
        }
        if (char === '"') {
          insideString = !insideString;
          continue;
        }
        if (!insideString) {
          if (char === '{') depth++;
          else if (char === '}') {
            depth--;
            if (depth === 0) {
              lastBrace = i;
              break;
            }
          }
        }
      }
      if (lastBrace !== -1) {
        cleanedKey = cleanedKey.substring(firstBrace, lastBrace + 1);
      }
    }
    const serviceAccount = JSON.parse(cleanedKey);`;

code = code.replace(target, replacement);
fs.writeFileSync('scripts/weather-sync-orchestrator.ts', code);
console.log("Patched orchestrator");
