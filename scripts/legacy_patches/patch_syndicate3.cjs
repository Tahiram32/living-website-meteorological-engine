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

    // 1. Strict Whitelist + Geohash proximity query
    // We only query clients who are explicitly in the source's trusted whitelist
    // and who also have syndicateEnabled = true.
    const MAX_DISTANCE_KM = 16.09; // ~10 miles
    
    // Use geohash matching. We require the competitor's geohash to share a prefix.
    // A 4-character geohash prefix match is a fast, indexable proxy for proximity.
    const geohashPrefix = geohash.substring(0, 4);

    // Fetch competitors by checking if they are in the whitelist array
    // Firestore "in" queries are limited to 10 elements, but for a trusted whitelist
    // that's usually sufficient. If > 10, chunking is needed, but we assume < 10 here.
    const whitelistChunks = [];
    for (let i = 0; i < whitelist.length; i += 10) {
      whitelistChunks.push(whitelist.slice(i, i + 10));
    }

    let competitors = [];
    for (const chunk of whitelistChunks) {
       const clientsSnap = await db.collection("clients")
        .where("syndicateEnabled", "==", true)
        // Note: Using document ID directly in 'in' requires FieldPath.documentId(),
        // so we'll fetch them all in the chunk instead.
        .get();
        
       const chunkCompetitors = clientsSnap.docs
        .filter(doc => chunk.includes(doc.id))
        .map(doc => ({ id: doc.id, ...doc.data() }))
        // Geohash proximity check
        .filter(comp => comp.geohash && comp.geohash.startsWith(geohashPrefix));
        
       competitors.push(...chunkCompetitors);
    }

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

const lines = content.split('\n');
const startIdx = lines.findIndex(l => l.includes("app.post(\"/api/syndicate/negotiate\""));
const endIdx = lines.findIndex(l => l.includes("console.error(\"❌ [SWARM AI FAIL]\", err.message);")) + 3;

if (startIdx !== -1 && endIdx !== -1) {
  const actualStart = startIdx - 3;
  lines.splice(actualStart, endIdx - actualStart, replacement);
  fs.writeFileSync('server.ts', lines.join('\n'));
  console.log("Patched syndicate hook again");
} else {
  console.log("Could not find syndicate hook");
}
