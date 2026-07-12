const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: process.env.GCP_PROJECT_ID
});
const db = getFirestore(app);
async function run() {
  try {
    const snap = await db.collection("test").get();
    console.log("Success! Docs:", snap.docs.length);
  } catch(e) {
    console.error("Default DB Error:", e.message);
  }
}
run();
