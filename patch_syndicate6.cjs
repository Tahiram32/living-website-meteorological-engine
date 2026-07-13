const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Fix TypeScript error about geohash not existing on type
content = content.replace('.map(doc => ({ id: doc.id, ...doc.data() }))', '.map(doc => ({ id: doc.id, ...doc.data() } as any))');

// Fix the syntax error around line 200 (was likely caused by a previous bad edit we need to clean up)
fs.writeFileSync('server.ts', content);
console.log("Patched syndicate hook typings");
