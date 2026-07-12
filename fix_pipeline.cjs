const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Chunk 1: Remove early return and make synchronous
const chunk1 = `  // Return immediately to avoid blocking client
  res.json({ runId, message: "Pipeline started sequentially in background." });

  // Background Process
  (async () => {
    await addLog("info", \`Starting Webmaster Autonomous Weather-Pipeline for city: \${city}\`);`;

const rep1 = `  // Background Process / Synchronous execution for Cloud Tasks
  try {
    await addLog("info", \`Starting Webmaster Autonomous Weather-Pipeline for city: \${city}\`);`;

code = code.replace(chunk1, rep1);

// Chunk 2: Remove while loop and throw transient
const chunk2 = `          let retryCount = 0;
          let success = false;
          while (retryCount < 3 && !success) {
            try {
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
              success = true;
            } catch (geminiErr: any) {
              const errStr = geminiErr.message || JSON.stringify(geminiErr);
              const isTransient = geminiErr.status === 429 || geminiErr.status === 503 || geminiErr.code === 503 || geminiErr.status === "UNAVAILABLE" || geminiErr.error?.code === 503 || geminiErr.error?.status === "UNAVAILABLE" || geminiErr.error?.code === 429;
              
              if (isTransient && retryCount < 2) {
                retryCount++;
                let delay = 15000;
                const retryMatch = errStr.match(/retry in ([\\\\d\\\\.]+)s/);
                if (retryMatch && retryMatch[1]) {
                  delay = Math.ceil(parseFloat(retryMatch[1])) * 1000 + 2000; // Add 2s buffer
                }
                await addLog("warn", \`[TRANSIENT BACKOFF] API quota/rate limit hit. Waiting \${delay/1000}s before retry \${retryCount}/2...\`);
                await new Promise((resolve) => setTimeout(resolve, delay));
              } else {
                await addLog("warn", \`[GENERATOR FALLBACK] Gemini generation unavailable, falling back to deterministic sandbox resolver: \${errStr}\`);
                break;
              }
            }
          }`;

const rep2 = `          try {
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
              const retryMatch = errStr.match(/retry in ([\\\\d\\\\.]+)s/);
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
          }`;

code = code.replace(chunk2, rep2);

// Chunk 3: Catch client error and re-throw if transient
const chunk3 = `      } catch (clientErr: any) {
        await addLog("error", \`[TASK CRITICAL FAIL] Uncaught failure processing tenant '\${client.domain}': \${clientErr.message || clientErr}\`);
        newRun.failedClients++;
      }`;

const rep3 = `      } catch (clientErr: any) {
        if (clientErr.isTransient) {
          await addLog("warn", \`[PIPELINE YIELD] Transient API error detected. Aborting sequence and passing backoff back to Cloud Tasks (\${clientErr.retryDelay}s).\`);
          throw clientErr;
        }
        await addLog("error", \`[TASK CRITICAL FAIL] Uncaught failure processing tenant '\${client.domain}': \${clientErr.message || clientErr}\`);
        newRun.failedClients++;
      }`;

code = code.replace(chunk3, rep3);

// Chunk 4: Close try catch properly at the end
const chunk4 = `    newRun.status = "completed";
    newRun.completedAt = new Date().toISOString();
    await setDoc(runRef, newRun);
    await addLog("success", \`Autonomous Weather-Pipeline finalized. Output: \${newRun.successfulClients} success, \${newRun.failedClients} failures, \${newRun.totalClients} total.\`);
  })();
});`;

const rep4 = `    newRun.status = "completed";
    newRun.completedAt = new Date().toISOString();
    await setDoc(runRef, newRun);
    await addLog("success", \`Autonomous Weather-Pipeline finalized. Output: \${newRun.successfulClients} success, \${newRun.failedClients} failures, \${newRun.totalClients} total.\`);
    
    return res.status(200).json({ runId, message: "Pipeline finished successfully." });
  } catch (err: any) {
    if (err.isTransient) {
      return res.status(429).set('Retry-After', String(err.retryDelay || 24)).json({
        error: "Rate Limit Exceeded. Triggering Cloud Tasks Exponential Backoff.",
        delay: err.retryDelay || 24
      });
    }
    return res.status(500).json({ error: err.message });
  }
});`;

code = code.replace(chunk4, rep4);

fs.writeFileSync('server.ts', code);
