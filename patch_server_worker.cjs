const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'async function runBackgroundTenantProvisioning(transmissionId: string | undefined, event: any, businessName: string, zipCode: string) {',
  'async function runBackgroundTenantProvisioning(transmissionId: string | undefined, event: any, businessName: string, zipCode: string, tier: string = "ai-adaptive") {'
);

code = code.replace(
  '    await runBackgroundTenantProvisioning(transmissionId, event, businessName, zipCode);',
  '    const tier = req.body.tier || "ai-adaptive";\n    await runBackgroundTenantProvisioning(transmissionId, event, businessName, zipCode, tier);'
);

code = code.replace(
  '        let businessName = eventPayload.businessName;\n        let zipCode = eventPayload.zipCode;',
  '        let businessName = eventPayload.businessName;\n        let zipCode = eventPayload.zipCode;\n        let tier = eventPayload.tier || "ai-adaptive";'
);

code = code.replace(
  '          await runBackgroundTenantProvisioning(transmissionId, event, businessName, zipCode);',
  '          await runBackgroundTenantProvisioning(transmissionId, event, businessName, zipCode, tier);'
);

code = code.replace(
  'const { businessName, zipCode } = req.body;',
  'const { businessName, zipCode, tier } = req.body;'
);

code = code.replace(
  'const systemPrompt = `You are an expert web development AI designed to generate specialized, conversion-optimized landing pages for local home service businesses.',
  'const systemPrompt = `You are an expert web development AI designed to generate specialized, conversion-optimized landing pages for local home service businesses. The selected tier is: ${tier}. If the tier is "static", you should provide a simple, clean, basic template without too many advanced features. If the tier is "ai-adaptive", you should generate highly dynamic, AI-driven, vertical-specific content.'
);

fs.writeFileSync('server.ts', code);
