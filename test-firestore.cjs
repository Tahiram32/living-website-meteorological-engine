async function run() {
  const res = await fetch("http://127.0.0.1:3000/api/webhooks/mock-paypal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event_type: "BILLING.SUBSCRIPTION.ACTIVATED" })
  });
  console.log(await res.text());
}
run();
