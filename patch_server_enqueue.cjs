const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Add tier to payload
code = code.replace(
  'async function enqueueProvisioningTask(payload: {\n  transmissionId: string | undefined;\n  event: any;\n  businessName: string;\n  zipCode: string;\n})',
  'async function enqueueProvisioningTask(payload: {\n  transmissionId: string | undefined;\n  event: any;\n  businessName: string;\n  zipCode: string;\n  tier: string;\n})'
);

code = code.replace(
  '        businessName,\n        zipCode\n      });',
  '        businessName,\n        zipCode,\n        tier\n      });'
);

code = code.replace(
  '          businessName,\n          zipCode\n        });',
  '          businessName,\n          zipCode,\n          tier\n        });'
);

fs.writeFileSync('server.ts', code);
