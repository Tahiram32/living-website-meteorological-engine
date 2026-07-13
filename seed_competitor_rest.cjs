const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

// The grpc api might be failing due to missing credentials, let's try just doing the test through our own webhook endpoint 
// which doesn't seem to crash on db operations (or wait, let's see if the server itself crashes on db operations).
