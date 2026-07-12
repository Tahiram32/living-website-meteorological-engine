const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'async function generateTenantProfileAndBaseline(rawBusinessName: string, zipCode: string) {',
  'async function generateTenantProfileAndBaseline(rawBusinessName: string, zipCode: string, tier: string = "ai-adaptive") {'
);

code = code.replace(
  'const clientData = await generateTenantProfileAndBaseline(businessName, zipCode);',
  'const clientData = await generateTenantProfileAndBaseline(businessName, zipCode, tier);'
);

code = code.replace(
  '        Generate the complete onboarding configuration profile according to the provided schema.',
  '        Generate the complete onboarding configuration profile according to the provided schema.\n        \n        Tier context: The user has purchased the "${tier}" tier. If the tier is "static", provide a baseline, simple profile. If "ai-adaptive", make it extremely dynamic and highly specific.'
);

fs.writeFileSync('server.ts', code);
