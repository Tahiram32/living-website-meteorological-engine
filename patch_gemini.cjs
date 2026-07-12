const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Update generateTenantProfileAndBaseline to throw transient errors
code = code.replace(
  '    } catch (err: any) {\n      console.log("ℹ️ [GENERATOR FALLBACK] Gemini onboarding generation unavailable (quota/network), falling back to deterministic sandbox resolver.");\n    }',
  '    } catch (err: any) {\n      const isTransient = err.status === 429 || err.status === 503 || err.code === 503 || err.status === "UNAVAILABLE";\n      if (isTransient) {\n        console.warn(`⚠️ [TRANSIENT BACKOFF] Upstream load detected during provisioning for ${businessName}. Throwing to trigger Cloud Tasks backoff.`);\n        throw err;\n      }\n      console.log("ℹ️ [GENERATOR FALLBACK] Gemini onboarding generation unavailable (permanent error), falling back to deterministic sandbox resolver.");\n    }'
);

fs.writeFileSync('server.ts', code);
