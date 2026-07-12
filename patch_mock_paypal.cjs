const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Find the section in mock-paypal where it acquires the lock and remove it
const matchStr = `        // Acquire simulated idempotency lock in database and set status as processing
        if (transmissionId) {
          try {
            await setDoc(doc(db, "paypal_transactions", String(transmissionId)), {
              status: "processing",
              queuedAt: new Date().toISOString(),
              eventType: event.event_type,
              businessName,
              zipCode
            });
            console.log(\`[MOCK PAYPAL IDEMPOTENCY LOCK] Acquired processing lock for Transmission ID: '\${transmissionId}'\`);
          } catch (lockErr: any) {
            console.error("Failed to acquire mock idempotency lock in database:", lockErr);
            return res.status(500).json({
              status: "error",
              error: lockErr.message
            });
          }
        }`;

code = code.replace(matchStr, '');

fs.writeFileSync('server.ts', code);
