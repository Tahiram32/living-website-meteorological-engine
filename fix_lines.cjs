const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `} else {
          // Robust Sandbox Mode Template Builder
          await addLog("warn", \`Operating in local sandbox mode. Instantiating high-fidelity template generator.\`);`,
  `
          // Robust Sandbox Mode Template Builder
          await addLog("warn", \`Operating in local sandbox mode. Instantiating high-fidelity template generator.\`);`
);

code = code.replace(
  `        if (!hasRealApiKey || !generatedCopy) {
          await addLog("success", \`Gemini response schema validated successfully. Token consumption complete.\`);`,
  `        if (!hasRealApiKey || !generatedCopy) {`
);

fs.writeFileSync('server.ts', code);
