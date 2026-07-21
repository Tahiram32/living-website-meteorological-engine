const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');
content = content.replace('syndicateEnabled?: boolean;', 'syndicateEnabled?: boolean;\n  syndicateWhitelist?: string[]; // Array of trusted domain IDs\n  geohash?: string;');
fs.writeFileSync('src/types.ts', content);
console.log("Patched types.ts");
