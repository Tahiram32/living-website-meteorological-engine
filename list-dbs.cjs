const { google } = require('googleapis');
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

const auth = new google.auth.JWT(
  serviceAccount.client_email,
  null,
  serviceAccount.private_key,
  ['https://www.googleapis.com/auth/cloud-platform']
);

const firestore = google.firestore({ version: 'v1', auth });

async function run() {
  try {
    const res = await firestore.projects.databases.list({
      parent: `projects/${process.env.GCP_PROJECT_ID}`
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch(e) {
    console.error("Error listing databases:", e.message);
  }
}
run();
