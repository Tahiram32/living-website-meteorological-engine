const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace custom_id parsing in both real and mock webhooks
code = code.replace(
  '          businessName = parsedCustom.businessName || "";\n          zipCode = parsedCustom.zipCode || "";',
  '          businessName = parsedCustom.businessName || "";\n          zipCode = parsedCustom.zipCode || "";\n          tier = parsedCustom.tier || "ai-adaptive";'
);
code = code.replace(
  '          businessName = parsedCustom.businessName || "";\n            zipCode = parsedCustom.zipCode || "";',
  '          businessName = parsedCustom.businessName || "";\n            zipCode = parsedCustom.zipCode || "";\n            tier = parsedCustom.tier || "ai-adaptive";'
);
// Also need to declare `let tier = "";`
code = code.replace(
  '      let zipCode = "";\n      if (customIdStr) {',
  '      let zipCode = "";\n      let tier = "ai-adaptive";\n      if (customIdStr) {'
);
code = code.replace(
  '        let zipCode = "";\n        if (customIdStr) {',
  '        let zipCode = "";\n        let tier = "ai-adaptive";\n        if (customIdStr) {'
);

fs.writeFileSync('server.ts', code);
