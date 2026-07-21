const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const targetHtml = `It secured \${revenue} in Potential Pipeline Revenue from new bookings.`;
const replacementHtml = `It secured $\${revenue} in Potential Pipeline Revenue from new bookings.`;
code = code.replace(targetHtml, replacementHtml);

const targetHtml2 = `earning you a \${referralFees} referral fee.`;
const replacementHtml2 = `earning you a $\${referralFees} referral fee.`;
code = code.replace(targetHtml2, replacementHtml2);

fs.writeFileSync('server.ts', code);
