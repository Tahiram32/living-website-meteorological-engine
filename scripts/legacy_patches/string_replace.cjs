const fs = require('fs');
let s = fs.readFileSync('server.ts', 'utf8');

const targetRegex = /const ai = new GoogleGenAI\(\{\n\s*apiKey: hasRealApiKey \? apiKey : "dummy-key",\n\s*httpOptions: \{\n\s*headers: \{\n\s*"User-Agent": "aistudio-build",\n\s*\},(?:[\n\s]*)?\},(?:[\n\s]*)?const app = express\(\);/s;

console.log("Matching regex?", targetRegex.test(s));

s = s.replace(targetRegex, `const ai = new GoogleGenAI({
  apiKey: hasRealApiKey ? apiKey : "dummy-key",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  }
});

const app = express();`);

fs.writeFileSync('server.ts', s);
console.log("Fixed manually via regex");
