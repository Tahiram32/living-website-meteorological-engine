const resource = { subscriber: { email_address: "test@example.com" } };
const customerEmail = resource.subscriber?.email_address || resource.payer?.email_address || "support@example.com";
console.log(customerEmail);
