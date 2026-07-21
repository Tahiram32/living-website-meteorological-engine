const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// 1. Update negotiate endpoint
let targetNegotiate = `
    return res.status(200).json({
      success: true,
      tradeId,
      targetAgent: targetCompetitor.id,
      negotiation: negotiationResult
    });
`;
let replaceNegotiate = `
    console.log(\`🚀 [TWILIO SMS DISPATCH] URGENT: \${sourceDomain} just transferred a high-ticket emergency lead to you. Phone: \${leadData.callerNumber || 'Unknown'}. You owe a \${agreedReferralFeePercentage}% referral fee upon completion.\`);

    return res.status(200).json({
      success: true,
      tradeId,
      targetAgent: targetCompetitor.id,
      targetAgentName: targetCompetitor.businessName,
      negotiation: negotiationResult
    });
`;
content = content.replace(targetNegotiate, replaceNegotiate);

// 2. Update Voice Webhook to handle business_type
let targetVoiceStart = `    // -------------------------------------------------------------
    // SWARM AI LEAD SYNDICATE INJECTION
    // -------------------------------------------------------------
    let syndicateTrade = null;
    if (!hasAvailableSlot && client.syndicateEnabled) {`;

let replaceVoiceStart = `    // -------------------------------------------------------------
    // SWARM AI LEAD SYNDICATE INJECTION
    // -------------------------------------------------------------
    let syndicateTrade = null;
    // Strictly ban retail/hospitality from syndicate routing
    const isFieldService = client.business_type === "FIELD_SERVICE" || client.vertical?.toLowerCase().includes("hvac") || client.vertical?.toLowerCase().includes("plumbing");
    
    if (!hasAvailableSlot && client.syndicateEnabled && isFieldService) {`;
content = content.replace(targetVoiceStart, replaceVoiceStart);

let targetPrompt = `    let systemPrompt = \`
      You are a low-latency voice receptionist for \${client.businessName} in \${client.city}.
      Current weather: \${weatherCond} (Extreme Mode: \${isExtreme ? "YES" : "NO"}).
      Calendar availability right now: \${hasAvailableSlot ? "YES" : "NO"}.
      
      \${syndicateTrade ? \\\`🚨 CRITICAL OVERRIDE 🚨: We are currently at maximum capacity.
      However, our AI Syndicate has negotiated a real-time transfer to our trusted local partner, \${syndicateTrade.targetAgent}.
      You MUST inform the user that we are transferring their emergency request immediately to our trusted partner.\\\` : ''}
      
      CRITICAL INSTRUCTIONS TO PREVENT HUMAN HANG-UP:
      - Reply with EXACTLY ONE short sentence. Under 15 words.
      - NEVER use pleasantries like "How can I help you today?".
      - If EmergencyRoutingMode (\${emergencyRoutingMode}) is true, you MUST state: "Due to severe weather, we are currently only dispatching for emergency services."
      - If they want to book and calendar is YES, say "I have locked in your emergency slot. A dispatcher is on the way."
    \`;`;

let replacePrompt = `    let baseInstructions = "";
    if (client.business_type === "RETAIL_HOSPITALITY") {
      baseInstructions = \`
      - You are a fast-food/retail cashier. Answer menu questions, state opening hours, and take to-go orders.
      - NEVER mention dispatching or emergency slots.
      \`;
    } else if (client.business_type === "APPOINTMENT_BASED") {
      baseInstructions = \`
      - You are a receptionist for an appointment-based business (like a salon or accountant).
      - Help the user book calendar slots or handle cancellations.
      \`;
    } else {
      baseInstructions = \`
      - You are a field service dispatcher.
      - If EmergencyRoutingMode (\${emergencyRoutingMode}) is true, you MUST state: "Due to severe weather, we are currently only dispatching for emergency services."
      - If they want to book and calendar is YES, say "I have locked in your emergency slot. A dispatcher is on the way."
      \`;
    }

    let systemPrompt = \`
      You are a low-latency voice receptionist for \${client.businessName} in \${client.city}.
      Current weather: \${weatherCond} (Extreme Mode: \${isExtreme ? "YES" : "NO"}).
      Calendar availability right now: \${hasAvailableSlot ? "YES" : "NO"}.
      
      \${syndicateTrade ? \\\`🚨 CRITICAL OVERRIDE 🚨: We are currently at maximum capacity.
      However, our AI Syndicate has negotiated a real-time transfer to our trusted local partner, \${syndicateTrade.targetAgentName}.
      You MUST inform the user: "\${client.businessName} is currently at full capacity, but because this is an emergency, I have immediately dispatched our trusted partner, \${syndicateTrade.targetAgentName}, to your location. They will text you in 60 seconds."\\\` : ''}
      
      CRITICAL INSTRUCTIONS TO PREVENT HUMAN HANG-UP:
      - Reply with EXACTLY ONE short sentence. Under 15 words.
      - NEVER use pleasantries like "How can I help you today?".
      \${baseInstructions}
    \`;`;

content = content.replace(targetPrompt, replacePrompt);

fs.writeFileSync('server.ts', content);
console.log("Patched syndicate logic successfully.");
