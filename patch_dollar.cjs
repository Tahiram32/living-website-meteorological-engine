const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const target1 = "<li>💰 It secured ${revenue} in Potential Pipeline Revenue from new bookings.</li>";
const replacement1 = "<li>💰 It secured $${revenue} in Potential Pipeline Revenue from new bookings.</li>";
code = code.replace(target1, replacement1);

const target2 = "earning you a ${referralFees} referral fee.</li>";
const replacement2 = "earning you a $${referralFees} referral fee.</li>";
code = code.replace(target2, replacement2);

fs.writeFileSync('server.ts', code);
