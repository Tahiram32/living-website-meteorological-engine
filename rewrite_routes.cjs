const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Extract the OIDC verification logic from /api/webhooks/paypal/process into a middleware

const oidcMiddleware = `
const verifyGoogleOidcToken = async (req: any, res: any, next: any) => {
  const isProd = process.env.NODE_ENV === "production";
  const expectedSecret = process.env.TASK_WORKER_SECRET || "sec_default_task_secret";
  
  const taskSecret = req.headers["x-task-worker-secret"];
  if (!taskSecret || taskSecret !== expectedSecret) {
    console.warn("🚨 [SECURITY LAYER 1 SHIELD] Rejected unauthorized request: Missing or invalid X-Task-Worker-Secret");
    return res.status(401).json({ error: "Unauthorized. Invalid queue credentials." });
  }

  const authorization = req.headers.authorization;
  if (isProd) {
    if (!authorization || !authorization.startsWith("Bearer ")) {
      console.warn("🚨 [SECURITY RUNTIME FAILURE] Unauthorized attempt: Missing Bearer token in Production");
      return res.status(401).json({ error: "Unauthorized. Missing Google OIDC token." });
    }
    const token = authorization.substring(7);
    
    let payload;
    try {
      const ticket = await oAuth2Client.verifyIdToken({
        idToken: token,
        audience: process.env.PRIVATE_WORKER_URL,
      });
      payload = ticket.getPayload();
    } catch (err: any) {
      console.warn("🚨 [SECURITY LATERAL ATTEMPT] Cryptographic OIDC token verification failed:", err.message);
      return res.status(401).json({ error: "Unauthorized. Forged or invalid token." });
    }
    
    const expectedEmail = process.env.GCP_SERVICE_ACCOUNT_EMAIL;
    
    if (!payload) {
      return res.status(401).json({ error: "Unauthorized. Invalid token payload." });
    }
    
    const email = payload.email;
    if (!email) {
      return res.status(401).json({ error: "Unauthorized. Email claim missing." });
    }
    
    const incomingEmail = req.headers["x-goog-authenticated-user-email"];
    
    if (expectedEmail && email !== expectedEmail) {
      return res.status(403).json({ error: \`Forbidden. Service account '\${email}' is not authorized to invoke this worker.\` });
    }
  } else {
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized. Missing bearer token." });
    }
    const token = authorization.substring(7);
    if (token !== expectedSecret) {
      return res.status(401).json({ error: "Unauthorized. Invalid bearer token." });
    }
  }
  next();
};
`;

code = code.replace(
  'const oAuth2Client = new OAuth2Client();',
  'const oAuth2Client = new OAuth2Client();\n' + oidcMiddleware
);

// Remove the inline verification from /api/webhooks/paypal/process
const processStart = code.indexOf('app.post("/api/webhooks/paypal/process", requireRole(["worker", "unified"]), async (req, res) => {');
const processBodyStart = code.indexOf('    // 3. Header Trust:', processStart);
if (processStart > -1 && processBodyStart > -1) {
  const inlineLogic = code.substring(code.indexOf('{', processStart) + 1, processBodyStart);
  code = code.replace(inlineLogic, '\n  try {\n');
  code = code.replace(
    'app.post("/api/webhooks/paypal/process", requireRole(["worker", "unified"]), async (req, res) => {',
    'app.post("/api/webhooks/paypal/process", requireRole(["worker", "unified"]), verifyGoogleOidcToken, async (req, res) => {'
  );
}

// Modify /api/webhooks/paypal
const paypalRouteStart = code.indexOf('app.post("/api/webhooks/paypal", requireRole(["gateway", "unified"]), async (req, res) => {');
if (paypalRouteStart > -1) {
  code = code.replace(
    'app.post("/api/webhooks/paypal", requireRole(["gateway", "unified"]), async (req, res) => {',
    'app.post("/api/webhooks/paypal", requireRole(["gateway", "unified"]), verifyPayPalSignatureMiddleware, async (req, res) => {'
  );
  
  // Remove the inline verifyPayPalSignature check
  const sigCheckStart = code.indexOf('const sigResult = await verifyPayPalSignature(req);', paypalRouteStart);
  if (sigCheckStart > -1) {
    const sigCheckEnd = code.indexOf('console.log(`[SECURITY PASSED]', sigCheckStart);
    if (sigCheckEnd > -1) {
      const fullSigCheckStr = code.substring(sigCheckStart, sigCheckEnd);
      // Let's just remove the first 15 lines after sigCheckStart? No, let's use regex
      const sigCheckBlock = code.match(/const sigResult = await verifyPayPalSignature[\s\S]*?console\.log\(`\[SECURITY PASSED\] PayPal webhook signature verified: \${sigResult.reason}`\);/);
      if (sigCheckBlock) {
        code = code.replace(sigCheckBlock[0], '');
      }
    }
  }
}

// Do the same for mock-paypal
const mockPaypalRouteStart = code.indexOf('app.post("/api/webhooks/mock-paypal", requireRole(["gateway", "unified"]), async (req, res) => {');
if (mockPaypalRouteStart > -1) {
  // Wait, mock-paypal doesn't verify the signature, because it's a mock. 
  // Wait, let's check what mock-paypal does.
}

fs.writeFileSync('server.ts', code);
