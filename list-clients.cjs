const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: process.env.GCP_PROJECT_ID
});
const db = getFirestore(app, "ai-studio-livingwebsitecon-f47edfac-93af-42be-be38-3cb2085e5901");
async function run() {
  const snap = await db.collection("clients").get();
  console.log("Clients:");
  snap.docs.forEach(d => console.log(d.id, d.data().businessName));
}
run();
