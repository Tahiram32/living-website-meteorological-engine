const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const targetDateLogic = `    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);`;
const replacementDateLogic = `    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const dateOptions = { timeZone: 'UTC', month: 'short', day: 'numeric' };
    const dateString = \`\${oneWeekAgo.toLocaleDateString('en-US', dateOptions)} - \${now.toLocaleDateString('en-US', dateOptions)}\`;`;
code = code.replace(targetDateLogic, replacementDateLogic);

const targetHtml = `      const htmlContent = \`
        <h2>Your Weekly Value Receipt</h2>
        <p>Here is what your AI Receptionist accomplished for \${client.businessName} this week:</p>
        <ul>
          <li>🤖 Your AI Receptionist answered \${numCalls} calls this week.</li>
          <li>💰 It secured \${revenue} in booked appointments.</li>
          <li>🤝 It traded \${numTraded} excess lead(s) to the Syndicate, earning you a \${referralFees} referral fee.</li>
        </ul>
        <p>Thank you for using Main Street OS!</p>
      \`;`;
const replacementHtml = `      const htmlContent = \`
        <h2>Your Weekly Value Receipt (\${dateString})</h2>
        <p>Here is what your AI Receptionist accomplished for \${client.businessName} this week:</p>
        <ul>
          <li>🤖 Your AI Receptionist answered \${numCalls} calls this week.</li>
          <li>💰 It secured $\${revenue} in Potential Pipeline Revenue from new bookings.</li>
          <li>🤝 It traded \${numTraded} excess lead(s) to the Syndicate, earning you a $\${referralFees} referral fee.</li>
        </ul>
        <p>Thank you for using Main Street OS!</p>
      \`;`;
code = code.replace(targetHtml, replacementHtml);

fs.writeFileSync('server.ts', code);
