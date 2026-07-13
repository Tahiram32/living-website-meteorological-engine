const fs = require('fs');

const file = 'src/firebase.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'apiKey: import.meta.env.VITE_FIREBASE_API_KEY || config.apiKey,',
  'apiKey: import.meta.env.VITE_FIREBASE_API_KEY || config.apiKey || "AIzaSyDummyKeyDummyKeyDummyKeyDummyKeyD",'
);
code = code.replace(
  'projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || config.projectId,',
  'projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || config.projectId || "dummy-project",'
);
code = code.replace(
  'appId: import.meta.env.VITE_FIREBASE_APP_ID || config.appId,',
  'appId: import.meta.env.VITE_FIREBASE_APP_ID || config.appId || "1:1234567890:web:dummy",'
);

fs.writeFileSync(file, code);
