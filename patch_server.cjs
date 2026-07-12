const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Add verifyPayPalSignatureMiddleware
const middlewareCode = `
const verifyPayPalSignatureMiddleware = async (req: any, res: any, next: any) => {
  const sigResult = await verifyPayPalSignature(req);
  if (!sigResult.verified) {
    console.error(\`[SECURITY BLOCKED] Unauthorized PayPal webhook callback rejected: \${sigResult.reason}\`);
    return res.status(401).json({
      status: "unauthorized",
      error: "Cryptographic signature validation failed",
      reason: sigResult.reason
    });
  }
  console.log(\`[SECURITY PASSED] PayPal webhook signature verified: \${sigResult.reason}\`);
  next();
};
`;

code = code.replace(
  'async function verifyPayPalSignature(req: any): Promise<{ verified: boolean; reason: string }> {',
  middlewareCode + '\nasync function verifyPayPalSignature(req: any): Promise<{ verified: boolean; reason: string }> {'
);

fs.writeFileSync('server.ts', code);
