const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const replacement = `
// ============================================================================
// SCI-FI ARCHITECTURE 2: THE AUTONOMOUS B2B LEAD SYNDICATE (SWARM AI)
// ============================================================================
app.post("/api/syndicate/negotiate", requireRole(["gateway", "unified"]), async (req, res) => {
  try {
    const { sourceDomain, leadData, geohash, whitelist } = req.body;
    if (!sourceDomain || !geohash || !whitelist || !Array.isArray(whitelist) || whitelist.length === 0) {
      return res.status(400).json({ error: "Missing sourceDomain, geohash, or empty whitelist" });
    }

    const geohashPrefix = geohash.substring(0, 4);
    
    // We can't do .where("syndicateEnabled", "==", true) without an index if we don't have one,
    // so let's just fetch the whitelist documents directly since we have their IDs.
    let competitors = [];
    for (const compId of whitelist) {
      // FIX: use 'clients' not 'client'
      const docRef = db.collection("clients").doc(compId);
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        const compData = docSnap.data();
        if (compData.syndicateEnabled === true && compData.geohash && String(compData.geohash).startsWith(geohashPrefix)) {
          competitors.push({ id: compId, ...compData });
        }
      }
    }

    if (competitors.length === 0) {
      return res.status(404).json({ error: "No available, trusted competitors within emergency radius." });
    }

    const targetCompetitor = competitors[0];

    const agreedReferralFeePercentage = 20;
    const platformFeePercentage = 5;
    const negotiationResult = {
      agreedReferralFeePercentage,
      platformFeePercentage,
      agentAMessage: "Capacity exceeded. Lead transferred to trusted partner.",
      agentBMessage: "Emergency lead received from syndicate. Dispatching now.",
      status: "DEAL_STRUCK"
    };

    const tradeId = \`trd_\${Date.now()}\`;
    await db.collection("syndicate_ledger").doc(tradeId).set({
      timestamp: new Date().toISOString(),
      sourceAgent: sourceDomain,
      targetAgent: targetCompetitor.id,
      leadData,
      financials: negotiationResult
    });

    return res.status(200).json({
      success: true,
      tradeId,
      targetAgent: targetCompetitor.id,
      negotiation: negotiationResult
    });
  } catch (err: any) {
    console.error("❌ [SWARM AI FAIL]", err.stack || err.message);
    res.status(500).json({ error: "Syndicate negotiation failed." });
  }
});
`;

const lines = content.split('\n');
const startIdx = lines.findIndex(l => l.includes("app.post(\"/api/syndicate/negotiate\""));
const endIdx = lines.findIndex(l => l.includes("res.status(500).json({ error: \"Syndicate negotiation failed.\" });")) + 2;

if (startIdx !== -1 && endIdx !== -1) {
  const actualStart = startIdx - 3;
  lines.splice(actualStart, endIdx - actualStart + 1, replacement);
  fs.writeFileSync('server.ts', lines.join('\n'));
  console.log("Patched syndicate hook again");
} else {
  console.log("Could not find syndicate hook");
}
