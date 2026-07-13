const fs = require('fs');
let s = fs.readFileSync('server.ts', 'utf8');
const searchString = "  },const app = express();const ADMIN_API_KEY = process.env.ADMIN_API_KEY || \"nexus2026\";";
console.log(s.includes(searchString));
