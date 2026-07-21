fetch("http://127.0.0.1:3000/api/syndicate/negotiate", {
  method: "POST",
  headers: { "Content-Type": "application/json", "Authorization": "Bearer nexus2026" },
  body: JSON.stringify({
    sourceDomain: "test.com",
    geohash: "9q5c",
    whitelist: ["competitor.com"],
    leadData: { transcript: "Help", callerNumber: "+15551234567" }
  })
}).then(r => r.json()).then(console.log).catch(console.error);
