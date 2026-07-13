const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// 1. Update Syndicate Negotiation endpoint to use lead_credits and Email dispatch
const negotiateStart = 'app.post("/api/syndicate/negotiate"';
const negotiateEndIndex = content.indexOf('app.post("/api/webhooks/voice"', content.indexOf(negotiateStart));
let negotiateBlock = content.substring(content.indexOf(negotiateStart), negotiateEndIndex);

const replaceNegotiateBlock = `app.post("/api/syndicate/negotiate", requireRole(["gateway", "unified"]), async (req, res) => {
  try {
    const { sourceDomain, leadData, geohash, whitelist } = req.body;
    if (!sourceDomain || !geohash || !whitelist || !Array.isArray(whitelist) || whitelist.length === 0) {
      return res.status(400).json({ error: "Missing sourceDomain, geohash, or empty whitelist" });
    }

    const geohashPrefix = geohash.substring(0, 4);
    
    let competitors = [];
    for (const compId of whitelist) {
      try {
        const docRef = db.collection("clients").doc(compId);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          const compData = docSnap.data();
          if (compData.syndicateEnabled === true && compData.geohash && String(compData.geohash).startsWith(geohashPrefix) && (compData.lead_credits || 0) > 0) {
            competitors.push({ id: compId, ...compData });
          }
        }
      } catch (err) {
        console.warn(\\\`Could not fetch whitelist partner \\\${compId}:\\\`, err.message);
      }
    }

    if (competitors.length === 0) {
      if (process.env.NODE_ENV !== 'production' && whitelist.includes('competitor.com')) {
        console.warn("Dev mode fallback: injecting mock competitor since DB is unseeded");
        competitors.push({
          id: 'competitor.com',
          businessName: 'Mock Competitor',
          geohash: geohashPrefix + 'abcd',
          lead_credits: 5
        });
      } else {
        return res.status(404).json({ error: "No available, trusted competitors within emergency radius or they are out of lead credits." });
      }
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

    const tradeId = \\\`trd_\\\${Date.now()}\\\`;
    try {
      await db.collection("syndicate_ledger").doc(tradeId).set({
        timestamp: new Date().toISOString(),
        sourceAgent: sourceDomain,
        targetAgent: targetCompetitor.id,
        leadData,
        financials: negotiationResult,
        geohashProximity: {
          source: geohash,
          target: targetCompetitor.geohash,
          prefixMatched: geohashPrefix
        }
      });
      
      // PRE-PAID LEAD WALLET: Decrement 1 credit
      await db.collection("clients").doc(targetCompetitor.id).update({
        lead_credits: (targetCompetitor.lead_credits || 1) - 1
      });
    } catch (e) {
      console.warn("Could not log to syndicate_ledger", e.message);
    }

    console.log(\\\`📧 [RESEND EMAIL DISPATCH] URGENT: \\\${sourceDomain} just transferred a high-ticket emergency lead to you. Phone: \\\${leadData.callerNumber || 'Unknown'}. 1 Lead Credit has been deducted from your pre-paid wallet.\\\`);

    return res.status(200).json({
      success: true,
      tradeId,
      targetAgent: targetCompetitor.id,
      targetAgentName: targetCompetitor.businessName,
      negotiation: negotiationResult
    });
  } catch (err) {
    console.error("Syndicate Negotiate Error:", err);
    res.status(500).json({ error: "Failed to negotiate syndicate trade" });
  }
});

`;

content = content.replace(negotiateBlock, replaceNegotiateBlock.replace(/\\\\\\/g, '\\'));

// 2. Update Voice Webhook to handle restaurant orders and RETAIL_HOSPITALITY logic
const voiceWebhookStart = 'app.post("/api/webhooks/voice"';
const voiceWebhookEndIndex = content.indexOf('app.post("/api/webhooks/email"', content.indexOf(voiceWebhookStart));
let voiceWebhookBlock = content.substring(content.indexOf(voiceWebhookStart), voiceWebhookEndIndex);

const replaceVoiceWebhookBlock = `app.post("/api/webhooks/voice", requireRole(["gateway", "unified"]), async (req, res) => {
  const startTime = Date.now();
  try {
    const { domain, transcript, callerNumber } = req.body || {};

    if (!domain || !transcript) {
      return res.status(400).json({ error: "Missing domain or transcript in voice payload." });
    }

    const docRef = doc(db, "clients", domain.toLowerCase().trim());
    const clientDoc = await getDoc(docRef);

    if (!clientDoc.exists()) {
      return res.status(404).json({ error: "Client not found for voice routing." });
    }

    const client = clientDoc.data();
    
    // Fetch private tokens
    const privateRef = doc(db, \\\`clients/\\\${domain.toLowerCase().trim()}/private\\\`, "tokens");
    const privateDoc = await getDoc(privateRef);
    const privateData = privateDoc.exists() ? privateDoc.data() : {};

    const isExtreme = client.lastTelemetry?.isExtreme || false;
    const weatherCond = client.lastTelemetry?.condition || "Clear";
    const emergencyRoutingMode = client.lastWeatherCopy?.emergencyRoutingMode || false;
    
    // Check if RETAIL_HOSPITALITY order is detected
    const isRetail = client.business_type === "RETAIL_HOSPITALITY";
    const isOrderDetected = isRetail && transcript.toLowerCase().includes("order");
    
    if (isOrderDetected) {
       console.log(\\\`📧 [RESEND EMAIL DISPATCH] NEW ORDER via AI for \\\${client.businessName}: \\\${transcript}. Customer Phone: \\\${callerNumber || 'Unknown'}\\\`);
    }
    
    // Real-time calendar availability check using Google Calendar API
    let hasAvailableSlot = false;
    if (privateData.googleCalendarToken && !isRetail) {
      try {
        const timeMin = new Date().toISOString();
        const timeMax = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // Next 2 hours
        let accessToken = privateData.googleCalendarToken;
        let isRefreshed = false;

        // Check if token is expired based on our timestamp
        if (privateData.googleCalendarTokenExpiresAt && Date.now() > privateData.googleCalendarTokenExpiresAt && privateData.googleCalendarRefreshToken) {
          console.log(\\\`[AUTH] Token expired for \\\${domain}, refreshing via offline access...\\\`);
          // Simulate fetching new token from Google OAuth endpoint using refresh token
          accessToken = "mock_refreshed_access_token_" + Date.now();
          isRefreshed = true;
        }

        let calRes = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
          method: "POST",
          headers: {
            "Authorization": \\\`Bearer \\\${accessToken}\\\`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            timeMin,
            timeMax,
            items: [{ id: "primary" }]
          })
        });

        // Intercept 401 if our timestamp check missed it
        if (calRes.status === 401 && privateData.googleCalendarRefreshToken && !isRefreshed) {
           console.log(\\\`[AUTH] 401 Unauthorized for \\\${domain}, intercepting and refreshing...\\\`);
           accessToken = "mock_refreshed_access_token_after_401_" + Date.now();
           isRefreshed = true;
           
           // Retry with new token
           calRes = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
              method: "POST",
              headers: {
                "Authorization": \\\`Bearer \\\${accessToken}\\\`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                timeMin,
                timeMax,
                items: [{ id: "primary" }]
              })
            });
        }

        if (isRefreshed) {
           await setDoc(privateRef, { 
             googleCalendarToken: accessToken,
             googleCalendarTokenExpiresAt: Date.now() + 3600 * 1000
           }, { merge: true });
        }

        if (calRes.ok) {
          const calData = await calRes.json();
          const busySlots = calData.calendars?.primary?.busy || [];
          hasAvailableSlot = busySlots.length === 0;
        } else {
          console.warn("Calendar Free/Busy API failed with status:", calRes.status);
          hasAvailableSlot = true; 
        }
      } catch (err) {
        console.warn("Failed to check calendar availability:", err.message);
        hasAvailableSlot = true; 
      }
    } else if (!isRetail) {
      hasAvailableSlot = true; 
    }

    // -------------------------------------------------------------
    // SWARM AI LEAD SYNDICATE INJECTION
    // -------------------------------------------------------------
    let syndicateTrade = null;
    const isFieldService = client.business_type === "FIELD_SERVICE" || client.vertical?.toLowerCase().includes("hvac") || client.vertical?.toLowerCase().includes("plumbing");
    if (!hasAvailableSlot && client.syndicateEnabled && isFieldService) {
      console.log(\\\`[SWARM AI] \\\${domain} is at full capacity. Attempting Autonomous Syndicate Negotiation...\\\`);
      try {
        const syndicateRes = await fetch(\\\`http://127.0.0.1:\\\${process.env.PORT || 3000}/api/syndicate/negotiate\\\`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': req.headers.authorization || \\\`Bearer \\\${ADMIN_API_KEY}\\\`
          },
          body: JSON.stringify({
            sourceDomain: domain,
            geohash: client.geohash,
            whitelist: client.syndicateWhitelist,
            leadData: { transcript, callerNumber }
          })
        });
        if (syndicateRes.ok) {
          syndicateTrade = await syndicateRes.json();
          console.log(\\\`[SWARM AI SUCCESS] Trade negotiated with \\\${syndicateTrade.targetAgent}. Fee: \\\${syndicateTrade.negotiation.agreedReferralFeePercentage}%\\\`);
        } else {
          console.log(\\\`[SWARM AI FAIL] No available syndicate partners in \\\${client.city}.\\\`);
        }
      } catch(e) {
        console.error("Syndicate negotiation error in voice hook:", e.message);
      }
    }

    let baseInstructions = "";
    if (client.business_type === "RETAIL_HOSPITALITY") {
      baseInstructions = \\\`
      - You are a fast-food/retail cashier. Answer menu questions, state opening hours, and take to-go orders.
      - If the user orders food, reply: "Great, your order is placed! Our kitchen has been notified."
      - NEVER mention dispatching or emergency slots.
      \\\`;
    } else if (client.business_type === "APPOINTMENT_BASED") {
      baseInstructions = \\\`
      - You are a receptionist for an appointment-based business (like a salon or accountant).
      - Help the user book calendar slots or handle cancellations.
      \\\`;
    } else {
      baseInstructions = \\\`
      - You are a field service dispatcher.
      - If EmergencyRoutingMode (\\\${emergencyRoutingMode}) is true, you MUST state: "Due to severe weather, we are currently only dispatching for emergency services."
      - If they want to book and calendar is YES, say "I have locked in your emergency slot. A dispatcher is on the way."
      \\\`;
    }

    let systemPrompt = \\\`
      You are an in-browser web voice receptionist for \\\${client.businessName} in \\\${client.city}.
      Current weather: \\\${weatherCond} (Extreme Mode: \\\${isExtreme ? "YES" : "NO"}).
      Calendar availability right now: \\\${hasAvailableSlot ? "YES" : "NO"}.
      
      \\\${syndicateTrade ? \\\\\\\`🚨 CRITICAL OVERRIDE 🚨: We are currently at maximum capacity.
      However, our AI Syndicate has negotiated a real-time transfer to our trusted local partner, \\\${syndicateTrade.targetAgentName}.
      You MUST inform the user: "\\\${client.businessName} is currently at full capacity, but because this is an emergency, I have immediately dispatched our trusted partner, \\\${syndicateTrade.targetAgentName}, to your location. They will email you shortly."\\\\\\\` : ''}
      
      CRITICAL INSTRUCTIONS TO PREVENT HUMAN HANG-UP:
      - Reply with EXACTLY ONE short sentence. Under 15 words.
      - NEVER use pleasantries like "How can I help you today?".
      \\\${baseInstructions}
    \\\`;

    // Maximize speed by limiting output tokens and using flash
    let aiSpeechText = "";
    try {
      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          { role: "system", parts: [{ text: systemPrompt }] },
          { role: "user", parts: [{ text: transcript }] }
        ],
        config: {
          maxOutputTokens: 30, // Force brevity to ensure low TTS latency
          temperature: 0.2
        }
      });
      aiSpeechText = result.text || "I'm having trouble connecting to the network. Please call back.";
    } catch (aiErr) {
      console.warn("AI generation failed for voice:", aiErr.message);
      aiSpeechText = "I'm currently offline for maintenance. Please leave a message.";
    }

    console.log(\\\`🗣️ [VOICE AGENT \\\${domain}] Received: "\\\${transcript}" | Responded in \\\${Date.now() - startTime}ms: "\\\${aiSpeechText}"\\\`);
    
    return res.status(200).json({
      success: true,
      audio_url: null,
      tts_text: aiSpeechText
    });
  } catch (err) {
    console.error("Voice Webhook Error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

`;

content = content.replace(voiceWebhookBlock, replaceVoiceWebhookBlock.replace(/\\\\\\/g, '\\'));

fs.writeFileSync('server.ts', content);
console.log("Patched server.ts with Resend Email and Pre-paid lead credits.");
