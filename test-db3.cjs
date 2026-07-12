const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: process.env.GCP_PROJECT_ID
});
const db = getFirestore(app, "ai-studio-livingwebsitecon-f47edfac-93af-42be-be38-3cb2085e5901");
async function run() {
  try {
    const snap = await db.collection("system_metadata").get();
    console.log("Success! Docs:", snap.docs.length);
  } catch(e) {
    console.error("Named DB Error:", e.message);
  }
}
run();
