const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

// Initialize with the standard database config (just to make sure connection is fine)
const app = initializeApp({ projectId: config.projectId });
const db = getFirestore(app); // Note: server.ts doesn't pass config.firestoreDatabaseId!

async function run() {
  try {
     const docRef = db.collection("clients").doc("competitor.com");
     const docSnap = await docRef.get();
     console.log("Exists:", docSnap.exists);
  } catch (err) {
     console.error(err);
  }
}
run();
