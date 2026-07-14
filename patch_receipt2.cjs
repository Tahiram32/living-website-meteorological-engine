const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const targetDateLogic = `    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const dateOptions = { timeZone: 'UTC', month: 'short', day: 'numeric' };
    const dateString = \`\${oneWeekAgo.toLocaleDateString('en-US', dateOptions)} - \${now.toLocaleDateString('en-US', dateOptions)}\`;`;

const replacementDateLogic = `    const now = Timestamp.now().toDate();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const dateOptions = { timeZone: 'UTC', month: 'short', day: 'numeric' };
    const dateString = \`\${oneWeekAgo.toLocaleDateString('en-US', dateOptions)} - \${now.toLocaleDateString('en-US', dateOptions)}\`;`;

code = code.replace(targetDateLogic, replacementDateLogic);
fs.writeFileSync('server.ts', code);
