const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.scripts.build = "vite build && esbuild server.ts --bundle --platform=node --format=esm --packages=external --sourcemap --outfile=dist/server.js";
pkg.scripts.dev = "npm run build && NODE_ENV=production SANDBOX_MODE=true node dist/server.js";
pkg.scripts.start = "node dist/server.js";

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log("Patched package.json");
