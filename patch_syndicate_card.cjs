const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetStr = `    console.log(\`🚀 [TWILIO SMS DISPATCH] URGENT: \${sourceDomain} just transferred a high-ticket emergency lead to you. Phone: \${leadData.callerNumber || 'Unknown'}. You owe a \${agreedReferralFeePercentage}% referral fee upon completion.\`);

    return res.status(200).json({`;

const replaceStr = `    // CARD ON FILE PRE-AUTHORIZATION
    console.log(\`💳 [STRIPE PRE-AUTH] Executing $50 flat lead-generation fee on partner \${targetCompetitor.id}'s card on file...\`);
    const preAuthSuccess = true; // Simulated Stripe API call
    if (!preAuthSuccess) {
      return res.status(402).json({ error: "Partner payment method declined." });
    }

    console.log(\`🚀 [TWILIO SMS DISPATCH] URGENT: \${sourceDomain} just transferred a high-ticket emergency lead to you. Phone: \${leadData.callerNumber || 'Unknown'}. A $50 flat lead-generation fee has been successfully charged to your card on file.\`);

    return res.status(200).json({`;

content = content.replace(targetStr, replaceStr);

fs.writeFileSync('server.ts', content);
console.log("Patched syndicate card on file");
