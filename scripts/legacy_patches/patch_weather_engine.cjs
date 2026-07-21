const fs = require('fs');
let content = fs.readFileSync('meteorological-sync-engine.ts', 'utf8');

const targetPrompt = `        const prompt = \`
          As "The Living Website" autonomous AI Webmaster, analyze the current meteorological environment and mutate the landing page copy for "\${client.businessName}", operating in the "\${vertical}" vertical.`;

const replacePrompt = `        let businessTypeInstructions = "";
        if (client.business_type === "RETAIL_HOSPITALITY") {
          businessTypeInstructions = \`
          - You are running a retail/fast-food business.
          - If the weather is bad (like rain), autonomously change the headline to offer comfort (e.g. "Escape the rain! Get 10% off a warm coffee today").
          - NEVER set emergencyRoutingMode to true for retail/hospitality.
          \`;
        } else if (client.business_type === "APPOINTMENT_BASED") {
          businessTypeInstructions = \`
          - You are running an appointment-based business. Focus on safe, comfortable booking.
          - NEVER set emergencyRoutingMode to true unless it's a severe natural disaster.
          \`;
        } else {
          businessTypeInstructions = \`
          - You are running a field service business.
          - If the weather is bad (rain, storm, heatwave), you MUST switch to Emergency Routing Mode.
          - Set emergencyRoutingMode to true and adjust 'promotions' to feature high-margin emergency packages (e.g., 'Emergency Diagnostic Dispatch', 'Priority Water Extraction').
          \`;
        }

        const prompt = \`
          As "The Living Website" autonomous AI Webmaster, analyze the current meteorological environment and mutate the landing page copy for "\${client.businessName}", operating in the "\${vertical}" vertical.
          
          BUSINESS CLASSIFICATION RULES:
          \${businessTypeInstructions}
`;

content = content.replace(targetPrompt, replacePrompt);

// Also remove the old rule 4 that conflicted with this
const targetRule4 = `4. NEVER raise prices during an emergency (price gouging is illegal). Instead, if Extreme Alert Active is YES, set emergencyRoutingMode to true and adjust the 'promotions' array to ONLY feature high-margin emergency packages (e.g., 'Emergency Diagnostic Dispatch', 'Priority Water Extraction') and remove low-margin routine services. If normal weather, emergencyRoutingMode is false.`;
const replaceRule4 = `4. NEVER raise prices during an emergency (price gouging is illegal). Follow the BUSINESS CLASSIFICATION RULES for setting emergencyRoutingMode.`;
content = content.replace(targetRule4, replaceRule4);

fs.writeFileSync('meteorological-sync-engine.ts', content);
console.log("Patched weather engine.");
