const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const paypalTarget = `      const customIdStr = resource.custom_id || resource.custom || "";`;

const paypalReplacement = `      const customIdStr = resource.custom_id || resource.custom || "";
      
      // PRE-PAID LEAD WALLET TOP-UP
      if (customIdStr) {
        try {
          const parsedCustom = JSON.parse(customIdStr);
          if (parsedCustom.action === "buy_credits" && parsedCustom.domain) {
            const domain = parsedCustom.domain.toLowerCase().trim();
            const creditsToBuy = parsedCustom.credits || 2; 
            
            console.log(\`[PAYPAL WALLET TOP-UP] Adding \${creditsToBuy} lead credits to \${domain}\`);
            const clientRef = db.collection("clients").doc(domain);
            
            const clientDoc = await clientRef.get();
            if (clientDoc.exists) {
               const currentCredits = clientDoc.data().lead_credits || 0;
               await clientRef.update({
                 lead_credits: currentCredits + creditsToBuy
               });
               
               if (transmissionId) {
                  await db.collection("paypal_transactions").doc(String(transmissionId)).set({
                    processedAt: new Date().toISOString(),
                    domain: domain,
                    eventType: event?.event_type || "UNKNOWN",
                    status: "completed",
                    type: "lead_credit_topup"
                  }, { merge: true });
               }
               return res.status(200).json({ status: "success", action: "wallet_topup", domain });
            } else {
               console.warn(\`[PAYPAL WALLET TOP-UP] Domain \${domain} not found!\`);
               return res.status(404).json({ error: "Domain not found for top-up" });
            }
          }
        } catch(e) {}
      }`;

content = content.replace(paypalTarget, paypalReplacement);
fs.writeFileSync('server.ts', content);
console.log("Patched paypal logic");
