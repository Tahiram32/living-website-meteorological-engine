const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const weeklyReceiptEndpoint = `
// 3.5.3 Cron Job: Send Weekly Value Receipts
app.post("/api/cron/weekly-value-receipt", async (req, res) => {
  try {
    const expectedSecret = process.env.TASK_WORKER_SECRET || "sec_default_task_secret";
    const authHeader = req.headers.authorization;
    const taskSecretHeader = req.headers["x-task-worker-secret"];
    
    if (authHeader !== \`Bearer \${expectedSecret}\` && taskSecretHeader !== expectedSecret) {
      console.warn("🚨 [SECURITY] Unauthorized attempt to invoke weekly-value-receipt cron.");
      return res.status(401).json({ error: "Unauthorized. Invalid secure worker token." });
    }

    console.log("📅 [CRON] Running Weekly Value Receipt job...");
    const clientsSnapshot = await db.collection("clients").get();
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
    for (const doc of clientsSnapshot.docs) {
      const client = doc.data();
      if (!client.email) continue;
        
      const domain = doc.id;
        
      const callsQuery = await db.collection("clients").doc(domain).collection("voice_logs")
        .where("timestamp", ">=", oneWeekAgo.toISOString()).get();
      const numCalls = callsQuery.size;
        
      const appointmentsQuery = await db.collection("clients").doc(domain).collection("appointments")
        .where("createdAt", ">=", oneWeekAgo.toISOString()).get();
      let revenue = 0;
      appointmentsQuery.forEach(a => { revenue += a.data().value || 150; });
        
      const syndicateQuery = await db.collection("syndicate_ledger")
        .where("sourceDomain", "==", domain)
        .where("timestamp", ">=", oneWeekAgo.toISOString()).get();
      const numTraded = syndicateQuery.size;
      let referralFees = 0;
      syndicateQuery.forEach(s => { 
        referralFees += s.data().feeEarned || 50; 
      });
        
      const resend = new Resend(process.env.RESEND_API_KEY || "dummy");
      if (!process.env.RESEND_API_KEY) {
         console.log(\`⚠️ [CRON] No RESEND_API_KEY, skipping Weekly Value Receipt email for \${client.email}\`);
         continue;
      }
        
      const htmlContent = \`
        <h2>Your Weekly Value Receipt</h2>
        <p>Here is what your AI Receptionist accomplished for \${client.businessName} this week:</p>
        <ul>
          <li>🤖 Your AI Receptionist answered \${numCalls} calls this week.</li>
          <li>💰 It secured $\${revenue} in booked appointments.</li>
          <li>🤝 It traded \${numTraded} excess lead(s) to the Syndicate, earning you a $\${referralFees} referral fee.</li>
        </ul>
        <p>Thank you for using Main Street OS!</p>
      \`;
        
      await resend.emails.send({
        from: 'Main Street OS <onboarding@resend.dev>',
        to: client.email,
        subject: \`Weekly Value Receipt for \${client.businessName}\`,
        html: htmlContent
      });
      console.log(\`✅ [CRON] Sent Weekly Value Receipt to \${client.email}\`);
    }
    res.json({ status: "success", message: "Weekly Value Receipts sent." });
  } catch (err) {
    console.error("❌ [CRON] Error sending Weekly Value Receipts:", err);
    res.status(500).json({ error: "Failed to send weekly receipts." });
  }
});

// 3.6. Trigger the Autonomous Meteorological Sync Engine (Cloud Scheduler CRON Entrypoint)
`;

code = code.replace("// 3.6. Trigger the Autonomous Meteorological Sync Engine (Cloud Scheduler CRON Entrypoint)", weeklyReceiptEndpoint.trim());

fs.writeFileSync('server.ts', code);
