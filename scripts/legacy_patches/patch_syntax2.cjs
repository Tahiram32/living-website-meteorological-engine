const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const replacement = `const ai = new GoogleGenAI({
  apiKey: hasRealApiKey ? apiKey : "dummy-key",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  }
});
const app = express();
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "nexus2026";`;

content = content.replace(/const ai = new GoogleGenAI\(\{.*?const app = express\(\);const ADMIN_API_KEY = process\.env\.ADMIN_API_KEY \|\| "nexus2026";/s, replacement);
fs.writeFileSync('server.ts', content);
console.log("Patched syntax error");
