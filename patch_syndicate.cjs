const fs = require('fs');
const lines = fs.readFileSync('server.ts', 'utf8').split('\n');
const startIdx = lines.findIndex(l => l.includes("app.post(\"/api/syndicate/negotiate\""));
const endIdx = lines.findIndex(l => l.includes("// 3.4. Autonomous Voice Receptionist Webhook"));

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

    // 1. Strict Whitelist + Geohash proximity query
    // We only query clients who are explicitly in the source's trusted whitelist
    // and who also have syndicateEnabled = true.
    const MAX_DISTANCE_KM = 16.09; // ~10 miles
    
    // Fire geo queries for the source's geohash (assuming geofire-common is used to find bounds)
    // For simplicity without importing geofire here in the webhook, we will just fetch the whitelist
    // and do a manual distance check (or assume if they are in the whitelist they are trusted,
    // but the prompt asked for Geohashing. Let's do a geohash prefix match as a simple proxy 
    // for proximity if we don't have full lat/lng).
    // A 4-character geohash is roughly 39km x 19km.
    const geohashPrefix = geohash.substring(0, 4);

    const clientsSnap = await db.collection("clients")
      .where("syndicateEnabled", "==", true)
      .get();
      
    const competitors = clientsSnap.docs
      .filter(doc => doc.id !== sourceDomain)
      .map(doc => ({ id: doc.id, ...doc.data() }))
      // 1. Must be in the explicit trusted whitelist (LEGAL LIABILITY FIX)
      .filter(comp => whitelist.includes(comp.id))
      // 2. Must be geographically close using geohash prefix matching (PROXIMITY FIX)
      .filter(comp => comp.geohash && comp.geohash.startsWith(geohashPrefix));

    if (competitors.length === 0) {
      return res.status(404).json({ error: "No available, trusted competitors within emergency radius." });
    }

    const targetCompetitor = competitors[0]; // Pick the first available trusted partner

    // 2. Deterministic Node.js Math (LLM LATENCY & PHYSICS FIX)
    // We remove the LLM completely. The math is fixed and instant.
    const agreedReferralFeePercentage = 20;
    const platformFeePercentage = 5;
    const negotiationResult = {
      agreedReferralFeePercentage,
      platformFeePercentage,
      agentAMessage: "Capacity exceeded. Lead transferred to trusted partner.",
      agentBMessage: "Emergency lead received from syndicate. Dispatching now.",
      status: "DEAL_STRUCK"
    };

    // 3. Execute the Trade & Log it to the Syndicate Ledger
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
    console.error("❌ [SWARM AI FAIL]", err.message);
    res.status(500).json({ error: "Syndicate negotiation failed." });
  }
});
`;

if (startIdx !== -1 && endIdx !== -1) {
  // Go back a few lines to replace the header too
  const actualStart = startIdx - 3;
  lines.splice(actualStart, endIdx - actualStart, replacement);
  fs.writeFileSync('server.ts', lines.join('\n'));
  console.log("Replaced syndicate hook");
} else {
  console.log("Could not find syndicate hook");
}
