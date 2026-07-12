const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/retry in \(\[d\.\]\+\)s/, 'retry in ([\\\\d\\\\.]+)s');
fs.writeFileSync('server.ts', code);
