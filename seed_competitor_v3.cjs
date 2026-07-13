const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

const configPath = './firebase-applet-config.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Initialize with both projectId and databaseId
const app = initializeApp({ projectId: config.projectId });
const db = getFirestore(app, config.firestoreDatabaseId || "(default)");

async function run() {
  try {
      await db.collection('clients').doc('competitor.com').set({
        businessName: 'Trusted Competitor',
        syndicateEnabled: true,
        geohash: '9q5c1234'
      }, { merge: true });
      
      await db.collection('clients').doc('test.com').set({
        businessName: 'Test HVAC',
        syndicateEnabled: true,
        geohash: '9q5c5678',
        syndicateWhitelist: ['competitor.com']
      }, { merge: true });
      
      console.log("Seeded competitor.com and test.com successfully!");
  } catch(e) {
      console.error(e.message);
  }
}
run();
