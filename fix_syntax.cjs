const fs = require('fs');
let s = fs.readFileSync('server.ts', 'utf8');

// The issue is a missing newline.
//   },const app = express();const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "nexus2026";
// let's just find and replace the whole thing.

s = s.replace('  },const app = express();const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "nexus2026";', '');
s = s.replace(/const ai = new GoogleGenAI\(\{[\s\S]*?"User-Agent": "aistudio-build",\s*\},[\s\S]*?\},const app = express\(\);const ADMIN_API_KEY = process\.env\.ADMIN_API_KEY \|\| "nexus2026";/, `const ai = new GoogleGenAI({
  apiKey: hasRealApiKey ? apiKey : "dummy-key",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  }
});
const app = express();
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "nexus2026";`);

fs.writeFileSync('server.ts', s);
console.log("Fixed syntax");
