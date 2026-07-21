const fs = require('fs');
const lines = fs.readFileSync('server.ts', 'utf8').split('\n');

const startIdx = lines.findIndex(l => l.includes("sourceDomain: domain,"));
const endIdx = lines.findIndex(l => l.includes("leadData: { transcript, callerNumber }"));

if (startIdx !== -1 && endIdx !== -1) {
  lines.splice(startIdx, endIdx - startIdx + 1, `            sourceDomain: domain,
            geohash: client.geohash,
            whitelist: client.syndicateWhitelist,
            leadData: { transcript, callerNumber }`);
  fs.writeFileSync('server.ts', lines.join('\n'));
  console.log("Patched voice hook trade payload");
} else {
  console.log("Could not find voice hook payload");
}
