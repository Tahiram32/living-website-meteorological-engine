const fs = require('fs');
let s = fs.readFileSync('server.ts', 'utf8');

// The line is exactly "  },const app = express();const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "nexus2026";"
s = s.replace(/  },const app = express\(\);const ADMIN_API_KEY = process\.env\.ADMIN_API_KEY \|\| "nexus2026";/g, `  }
});
const app = express();
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "nexus2026";`);

fs.writeFileSync('server.ts', s);
