const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetWorkerError = `  } catch (err: any) {
    console.error(\`❌ [BACKGROUND WORKER FAILURE] Failed to provision tenant for "\${businessName}":\`, err);
    if (transmissionId) {
      try {
        await setDoc(doc(db, "paypal_transactions", String(transmissionId)), {
          failedAt: new Date().toISOString(),
          error: err.message,
          status: "failed"
        }, { merge: true });
      } catch (e: any) {
        console.error("Failed to write failure log to Firestore:", e.message);
      }
    }
  }`;

const replacementWorkerError = `  } catch (err: any) {
    console.error(\`❌ [BACKGROUND WORKER FAILURE] Failed to provision tenant for "\${businessName}":\`, err);
    
    const isTransient = err.status === 429 || err.status === 503 || err.code === 503 || err.status === "UNAVAILABLE";
    
    if (isTransient) {
      // DO NOT mark the database as failed. Throw the error to be caught by the Express handler
      // which will return a 503 to Cloud Tasks to trigger exponential backoff.
      throw err;
    }
    
    // For permanent errors, fail-closed cleanly
    if (transmissionId) {
      try {
        await setDoc(doc(db, "paypal_transactions", String(transmissionId)), {
          failedAt: new Date().toISOString(),
          error: err.message,
          status: "pending_reconciliation"
        }, { merge: true });
      } catch (e: any) {
        console.error("Failed to write failure log to Firestore:", e.message);
      }
    }
    
    throw err;
  }`;

code = code.replace(targetWorkerError, replacementWorkerError);
fs.writeFileSync('server.ts', code);
