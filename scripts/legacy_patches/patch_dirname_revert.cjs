const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  const targetRegex = /const _filename_local = typeof __filename !== "undefined" \? __filename : \(typeof import.meta !== "undefined" && import.meta.url \? fileURLToPath\(import.meta.url\) : ""\);\nconst _dirname_local = typeof __dirname !== "undefined" \? __dirname : \(typeof import.meta !== "undefined" && import.meta.url \? path.dirname\(fileURLToPath\(import.meta.url\)\) : process.cwd\(\)\);/g;
  
  const replacement = `const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);`;

  code = code.replace(targetRegex, replacement);
  code = code.replace(/_dirname_local/g, '__dirname');
  code = code.replace(/_filename_local/g, '__filename');
  
  fs.writeFileSync(file, code);
  console.log("Reverted " + file);
}

patchFile('server.ts');
patchFile('scripts/weather-sync-orchestrator.ts');
patchFile('meteorological-sync-engine.ts');

