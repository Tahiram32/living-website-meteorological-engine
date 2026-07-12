const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /const isTransient = err\.status === 429 \|\| err\.status === 503 \|\| err\.code === 503 \|\| err\.status === "UNAVAILABLE";/g;
const replacement = `const isTransient = err.status === 429 || err.status === 503 || err.code === 503 || err.status === "UNAVAILABLE" || err.error?.code === 503 || err.error?.status === "UNAVAILABLE" || err.error?.code === 429;`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
