import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import config from "../firebase-applet-config.json";

export const firebaseApp = initializeApp(config);
export const db = getFirestore(firebaseApp, config.firestoreDatabaseId || "(default)");
