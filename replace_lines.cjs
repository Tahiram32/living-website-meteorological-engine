const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');
const lines = code.split('\n');

const newLines = `          try {
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
            await addLog("warn", \`[GENERATOR FALLBACK] Gemini generation unavailable (quota/network), falling back to deterministic sandbox resolver: \${geminiErr.message || geminiErr}\`);
          }
        } 
        
        if (!hasRealApiKey || !generatedCopy) {`.split('\n');

lines.splice(1114 - 1, 1128 - 1114 + 1, ...newLines);
fs.writeFileSync('server.ts', lines.join('\n'));
