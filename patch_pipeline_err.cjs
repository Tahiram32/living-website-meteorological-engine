const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /geminiErr\.message \|\| geminiErr/g;
const replacement = `geminiErr.message || JSON.stringify(geminiErr)`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
