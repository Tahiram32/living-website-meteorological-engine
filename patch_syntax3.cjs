const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace('  },const app = express();const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "nexus2026";', '  }\n});\n\nconst app = express();\nconst ADMIN_API_KEY = process.env.ADMIN_API_KEY || "nexus2026";');
fs.writeFileSync('server.ts', content);
console.log("Patched syntax error");
