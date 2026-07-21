const { initializeApp, getApps, getApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require('fs');

const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = getApps().length === 0 ? initializeApp({
  projectId: firebaseConfig.projectId
}) : getApp();

const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

async function migrate() {
    const oldCol = db.collection("hvac-clients");
    const newCol = db.collection("tenant-clients");

    const snapshot = await oldCol.get();
    if (snapshot.empty) {
        console.log("No documents found in 'hvac-clients'.");
        return;
    }

    console.log(`Found ${snapshot.size} documents in 'hvac-clients'. Migrating to 'tenant-clients'...`);
    const batch = db.batch();
    
    let count = 0;
    for (const doc of snapshot.docs) {
        newCol.doc(doc.id).set(doc.data());
        oldCol.doc(doc.id).delete();
        count++;
        console.log(`Migrated: ${doc.id}`);
    }

    console.log(`Migration completed. Migrated ${count} documents.`);
}

migrate().catch(console.error);
