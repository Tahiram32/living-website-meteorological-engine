const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// We just need to wrap the Gemini call in a try/catch and fallback
const target = `const result = await ai.models.generateContent({
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
        } else {
          // Robust Sandbox Mode Template Builder`;

const replacement = `let geminiSuccess = false;
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
            geminiSuccess = true;
          } catch (geminiErr: any) {
            await addLog("warn", \`[GENERATOR FALLBACK] Gemini generation unavailable (quota/network), falling back to deterministic sandbox resolver: \${geminiErr.message || geminiErr}\`);
          }
        }
        
        if (!hasRealApiKey || !generatedCopy) {
          // Robust Sandbox Mode Template Builder`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
