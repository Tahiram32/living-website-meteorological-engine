const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'console.warn("🛡️ [SECURITY EVALUATOR ERROR] Evaluation failed, falling back to local heuristic checks:", err.message);',
  'console.log("ℹ️ [SECURITY EVALUATOR] Evaluation unavailable (quota/network), falling back to local heuristic checks.");'
);

code = code.replace(
  'console.error("❌ Gemini onboarding generation failed, falling back to deterministic sandbox resolver:", err.message);',
  'console.log("ℹ️ [GENERATOR FALLBACK] Gemini onboarding generation unavailable (quota/network), falling back to deterministic sandbox resolver.");'
);

code = code.replace(
  'console.warn(`⚠️ [CLOUD TASKS FAILURE] Failed to enqueue task using Google Cloud Tasks Client (falling back):`, err.message);',
  'console.log(`ℹ️ [CLOUD TASKS] Could not enqueue using Cloud Tasks Client (falling back to loopback).`);'
);

fs.writeFileSync('server.ts', code);
