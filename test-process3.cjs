const fetch = require("node-fetch");
async function run() {
  const start = Date.now();
  const expectedSecret = process.env.TASK_WORKER_SECRET || "sec_default_task_secret";
  const res = await fetch("http://127.0.0.1:3000/api/webhooks/paypal/process", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${expectedSecret}`,
      "X-Task-Worker-Secret": expectedSecret
    },
    body: JSON.stringify({
      transmissionId: "test_tx_125",
      businessName: "Direct Test 3",
      zipCode: "75201"
    })
  });
  console.log("Status:", res.status, "Time:", Date.now() - start);
  console.log("Body:", await res.text());
}
run();
