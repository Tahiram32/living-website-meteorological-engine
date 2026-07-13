const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace('const { sourceDomain, leadData, zipCode } = req.body;', 'const { sourceDomain, leadData, zipCode, geohash, whitelist } = req.body;');
content = content.replace('if (!sourceDomain || !zipCode) {', 'if (!sourceDomain || !geohash || !whitelist || !Array.isArray(whitelist) || whitelist.length === 0) {');

fs.writeFileSync('server.ts', content);
console.log("Patched syndicate hook validation");
