const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const replacement = `
    let systemPrompt = \`
      You are a low-latency voice receptionist for \${client.businessName} in \${client.city}.
      Current weather: \${weatherCond} (Extreme Mode: \${isExtreme ? "YES" : "NO"}).
      Calendar availability right now: \${hasAvailableSlot ? "YES" : "NO"}.
      
      \${syndicateTrade ? \`🚨 CRITICAL OVERRIDE 🚨: We are currently at maximum capacity.
      However, our AI Syndicate has negotiated a real-time transfer to our trusted local partner, \${syndicateTrade.targetAgent}.
      You MUST inform the user that we are transferring their emergency request immediately to our trusted partner.\` : ''}
      
      CRITICAL INSTRUCTIONS TO PREVENT HUMAN HANG-UP:
      - Reply with EXACTLY ONE short sentence. Under 15 words.
      - NEVER use pleasantries like "How can I help you today?".
      - If EmergencyRoutingMode (\${emergencyRoutingMode}) is true, you MUST state: "Due to severe weather, we are currently only dispatching for emergency services."
      - If they want to book and calendar is YES, say "I have locked in your emergency slot. A dispatcher is on the way."
    \`;
`;

const lines = content.split('\n');
const startIdx = lines.findIndex(l => l.includes("let systemPrompt = `"));
const endIdx = lines.findIndex(l => l.includes("If they want to book and calendar is YES, say \"I have locked in your emergency slot. A dispatcher is on the way.\"")) + 2;

if (startIdx !== -1 && endIdx !== -1) {
  lines.splice(startIdx, endIdx - startIdx + 1, replacement);
  fs.writeFileSync('server.ts', lines.join('\n'));
  console.log("Patched syndicate prompt");
} else {
  console.log("Could not find syndicate prompt");
}
