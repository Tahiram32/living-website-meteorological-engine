const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Remove early res.json and IIFE
code = code.replace(
  `  // Return immediately to avoid blocking client
  res.json({ runId, message: "Pipeline started sequentially in background." });

  // Background Process
  (async () => {
    await addLog("info", \`Starting Webmaster Autonomous Weather-Pipeline for city: \${city}\`);`,
  `  // Background Process / Synchronous execution for Cloud Tasks
  try {
    await addLog("info", \`Starting Webmaster Autonomous Weather-Pipeline for city: \${city}\`);`
);

// We'll replace lines directly using arrays to be safe
let lines = code.split('\n');

let startIndex = -1;
let endIndex = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('let retryCount = 0;')) {
    startIndex = i;
  }
  if (startIndex !== -1 && lines[i].includes('if (!hasRealApiKey || !generatedCopy) {')) {
    endIndex = i - 1; // The line before
    break;
  }
}

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `          try {
            const result = await ai.models.generateContent({
              model: "gemini-3.5-flash",
              contents: prompt,
              config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.7,
              },
            });
            const rawText = result.text;
            if (!rawText) throw new Error("Received empty content response from Gemini.");
            
            generatedCopy = JSON.parse(rawText.trim());
            await addLog("success", \`Gemini response schema validated successfully. Token consumption complete.\`);
          } catch (geminiErr: any) {
            const errStr = geminiErr.message || JSON.stringify(geminiErr);
            const isTransient = geminiErr.status === 429 || geminiErr.status === 503 || geminiErr.code === 503 || geminiErr.status === "UNAVAILABLE" || geminiErr.error?.code === 503 || geminiErr.error?.status === "UNAVAILABLE" || geminiErr.error?.code === 429;
            
            if (isTransient) {
              let delaySeconds = 24;
              const retryMatch = errStr.match(/retry in ([\\d\\.]+)s/);
              if (retryMatch && retryMatch[1]) {
                delaySeconds = Math.ceil(parseFloat(retryMatch[1])) + 2;
              }
              const transientErr: any = new Error(errStr);
              transientErr.isTransient = true;
              transientErr.retryDelay = delaySeconds;
              throw transientErr;
            } else {
              await addLog("warn", \`[GENERATOR FALLBACK] Gemini generation unavailable, falling back to deterministic sandbox resolver: \${errStr}\`);
            }
          }
        }`;
  
  lines.splice(startIndex, endIndex - startIndex + 1, ...replacement.split('\\n'));
}

let cErrStart = -1;
let cErrEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('catch (clientErr: any) {') && lines[i].includes('} catch (clientErr: any) {')) {
    cErrStart = i;
  }
  if (cErrStart !== -1 && lines[i].includes('newRun.processedClients++;')) {
    cErrEnd = i - 1;
    break;
  }
}

if (cErrStart !== -1 && cErrEnd !== -1) {
  const replacement = \`      } catch (clientErr: any) {
        if (clientErr.isTransient) {
          await addLog("warn", \\\`[PIPELINE YIELD] Transient API error detected. Aborting sequence and passing backoff back to Cloud Tasks (\${clientErr.retryDelay}s).\\\`);
          throw clientErr;
        }
        await addLog("error", \\\`[TASK CRITICAL FAIL] Uncaught failure processing tenant '\${client.domain}': \${clientErr.message || clientErr}\\\`);
        newRun.failedClients++;
      }\`;
  lines.splice(cErrStart, cErrEnd - cErrStart + 1, ...replacement.split('\\n'));
}

let endIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('newRun.status = "completed";')) {
    // Look ahead to find the end of IIFE
    for (let j = i; j < lines.length && j < i + 10; j++) {
      if (lines[j].includes('})();')) {
        endIdx = j;
        break;
      }
    }
  }
}

if (endIdx !== -1) {
  const replacement = \`    newRun.status = "completed";
    newRun.completedAt = new Date().toISOString();
    await setDoc(runRef, newRun);
    await addLog("success", \\\`Autonomous Weather-Pipeline finalized. Output: \${newRun.successfulClients} success, \${newRun.failedClients} failures, \${newRun.totalClients} total.\\\`);
    
    return res.status(200).json({ runId, message: "Pipeline finished successfully." });
  } catch (err: any) {
    if (err.isTransient) {
      return res.status(429).set('Retry-After', String(err.retryDelay)).json({
        error: "Rate Limit Exceeded. Triggering Cloud Tasks Exponential Backoff.",
        delay: err.retryDelay
      });
    }
    return res.status(500).json({ error: err.message });
  }
});\`;
  
  // Replace the closing lines of the IIFE
  // Find where newRun.status = "completed"; starts
  for (let i = endIdx; i >= 0; i--) {
    if (lines[i].includes('newRun.status = "completed";')) {
      lines.splice(i, endIdx - i + 2, ...replacement.split('\\n')); // Remove until });
      break;
    }
  }
}

fs.writeFileSync('server.ts', lines.join('\\n'));
