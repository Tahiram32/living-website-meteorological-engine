const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'const isSuccessEvent = event?.event_type === "BILLING.SUBSCRIPTION.ACTIVATED" || \n                           event?.event_type === "PAYMENT.SALE.COMPLETED" ||\n                           event?.event_type === "BILLING.SUBSCRIPTION.CREATED";',
  'const isSuccessEvent = event?.event_type === "BILLING.SUBSCRIPTION.ACTIVATED" || \n                           event?.event_type === "PAYMENT.SALE.COMPLETED" ||\n                           event?.event_type === "CHECKOUT.ORDER.APPROVED" ||\n                           event?.event_type === "BILLING.SUBSCRIPTION.CREATED";'
);

code = code.replace(
  'const isSuccessEvent = event?.event_type === "BILLING.SUBSCRIPTION.ACTIVATED" || \n                             event?.event_type === "PAYMENT.SALE.COMPLETED" ||\n                             event?.event_type === "BILLING.SUBSCRIPTION.CREATED";',
  'const isSuccessEvent = event?.event_type === "BILLING.SUBSCRIPTION.ACTIVATED" || \n                             event?.event_type === "PAYMENT.SALE.COMPLETED" ||\n                             event?.event_type === "CHECKOUT.ORDER.APPROVED" ||\n                             event?.event_type === "BILLING.SUBSCRIPTION.CREATED";'
);

fs.writeFileSync('server.ts', code);
