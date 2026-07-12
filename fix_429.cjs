const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `          try {
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
            await addLog("warn", \`[GENERATOR FALLBACK] Gemini generation unavailable (quota/network), falling back to deterministic sandbox resolver: \${geminiErr.message || JSON.stringify(geminiErr)}\`);
          }`;

const replacement = `          let retryCount = 0;
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
                const retryMatch = errStr.match(/retry in ([\d\.]+)s/);
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

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
