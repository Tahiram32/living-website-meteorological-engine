const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetRouteError = `  } catch (err: any) {
    console.error("❌ [DECOUPLED LOOPBACK WORKER ERROR]:", err.message);
    return res.status(500).json({ error: err.message });
  }`;

const replacementRouteError = `  } catch (err: any) {
    console.error(\`🚨 [GEMINI API FAILURE] Processing failed for \${req.body.businessName}\`, err);
    
    // 1. Inspect if the error is an upstream rate-limit or demand spike (429 or 503)
    const isTransient = err.status === 429 || err.status === 503 || err.code === 503 || err.status === "UNAVAILABLE";
    
    if (isTransient) {
      // 2. DO NOT mark the database as failed. Keep the door open for the next queue retry.
      console.warn(\`⚠️ [TRANSIENT BACKOFF] Upstream load detected. Signaling Cloud Tasks queue to execute backoff.\`);
      
      // 3. Return a clean 429/503 to Cloud Tasks to trigger native exponential backoff
      return res.status(503).json({
        error: "Upstream AI model unavailable, retrying payload execution dynamically."
      });
    }

    // 4. Permanent error handled in runBackgroundTenantProvisioning
    return res.status(200).json({ error: "Permanent payload error caught. Deflected to Dead-Letter state." });
  }`;

code = code.replace(targetRouteError, replacementRouteError);
fs.writeFileSync('server.ts', code);
