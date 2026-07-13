const fs = require('fs');
let code = fs.readFileSync('scripts/weather-sync-orchestrator.ts', 'utf8');

const target = `    adminApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: projectId
    });`;

const replacement = `    adminApp = getApps().length === 0 ? initializeApp({
      credential: cert(serviceAccount),
      projectId: projectId
    }) : getApps()[0];`;

code = code.replace(target, replacement);
fs.writeFileSync('scripts/weather-sync-orchestrator.ts', code);
console.log("Patched orchestrator 2");
