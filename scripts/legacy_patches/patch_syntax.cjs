const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Wait what is around line 195?
// "    },  },const app = express();const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "nexus2026";"
// It looks like the firestore-admin initialization block got corrupted

const replacement = `    },
  }
});
const app = express();
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "nexus2026";
`;
content = content.replace('    },  },const app = express();const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "nexus2026";', replacement);
fs.writeFileSync('server.ts', content);
console.log("Patched syntax error");
