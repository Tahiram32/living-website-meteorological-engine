const fs = require('fs');
let s = fs.readFileSync('server.ts', 'utf8');
const searchStr = `const ai = new GoogleGenAI({
  apiKey: hasRealApiKey ? apiKey : "dummy-key",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },const app = express();const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "nexus2026";`;

const replacementStr = `const ai = new GoogleGenAI({
  apiKey: hasRealApiKey ? apiKey : "dummy-key",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  }
});
const app = express();
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "nexus2026";`;

if (s.includes(searchStr)) {
  s = s.replace(searchStr, replacementStr);
  fs.writeFileSync('server.ts', s);
  console.log("Fixed manually");
} else {
  console.log("Could not find exact string. Let's try indexOf");
  const idx = s.indexOf('const app = express();const ADMIN_API_KEY');
  if(idx !== -1) {
    s = s.substring(0, idx) + '});\n' + s.substring(idx).replace('const app = express();const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "nexus2026";', 'const app = express();\nconst ADMIN_API_KEY = process.env.ADMIN_API_KEY || "nexus2026";');
    // Also remove the extra },
    s = s.replace('    },\n  },});', '    }\n  }\n});');
    fs.writeFileSync('server.ts', s);
    console.log("Fixed via indexOf");
  }
}
