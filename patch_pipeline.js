const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Remove early res.json and IIFE
code = code.replace(
  `  // Return immediately to avoid blocking client
  res.json({ runId, message: "Pipeline started sequentially in background." });

  // Background Process
  (async () => {
    await addLog("info", \`Starting Webmaster Autonomous Weather-Pipeline for city: \${city}\`);`,
  `  // Background Process / Synchronous execution for Cloud Tasks
  try {
    await addLog("info", \`Starting Webmaster Autonomous Weather-Pipeline for city: \${city}\`);`
);

// 2. Remove the while loop
code = code.replace(
  /let retryCount = 0;\s*let success = false;\s*while\s*\(retryCount < 3 && !success\)\s*\{/g,
  `try {` // actually there was already a try inside, so let's be careful.
);
fs.writeFileSync('server.ts', code);
