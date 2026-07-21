const fs = require('fs');

function cleanFile(path) {
  let code = fs.readFileSync(path, 'utf8');

  const targetRegex = /let cleanedKey = serviceAccountKey\.trim\(\);[\s\S]*?const serviceAccount = JSON\.parse\(cleanedKey\);/g;
  code = code.replace(targetRegex, "const serviceAccount = JSON.parse(serviceAccountKey.trim());");

  fs.writeFileSync(path, code);
  console.log("Cleaned " + path);
}

cleanFile('server.ts');
cleanFile('scripts/weather-sync-orchestrator.ts');
