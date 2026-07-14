import { initializeApp, getApps, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = getApps().length === 0 ? initializeApp({
  projectId: firebaseConfig.projectId
}) : getApp();

const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

async function check() {
  const c1 = await db.collection("clients").get();
  console.log("clients size:", c1.size);
  const c2 = await db.collection("tenant-clients").get();
  console.log("tenant-clients size:", c2.size);
}

check().catch(console.error);
