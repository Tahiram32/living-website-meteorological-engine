const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  const targetRegex = /const __filename = fileURLToPath\(import\.meta\.url\);\nconst __dirname = path\.dirname\(__filename\);/g;
  const replacement = `const _filename_local = typeof __filename !== "undefined" ? __filename : (typeof import.meta !== "undefined" && import.meta.url ? fileURLToPath(import.meta.url) : "");
const _dirname_local = typeof __dirname !== "undefined" ? __dirname : (typeof import.meta !== "undefined" && import.meta.url ? path.dirname(fileURLToPath(import.meta.url)) : process.cwd());`;

  code = code.replace(targetRegex, replacement);
  code = code.replace(/__dirname/g, '_dirname_local');
  code = code.replace(/__filename/g, '_filename_local');
  
  // Need to fix the typeof check which got replaced
  code = code.replace(/typeof _dirname_local !== "undefined" \? _dirname_local :/g, 'typeof __dirname !== "undefined" ? __dirname :');
  code = code.replace(/typeof _filename_local !== "undefined" \? _filename_local :/g, 'typeof __filename !== "undefined" ? __filename :');

  fs.writeFileSync(file, code);
  console.log("Patched " + file);
}

patchFile('server.ts');
patchFile('scripts/weather-sync-orchestrator.ts');
patchFile('meteorological-sync-engine.ts');

