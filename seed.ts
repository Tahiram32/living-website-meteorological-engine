import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = __dirname;

let firebaseConfig: any = {};
try {
  const firebaseConfigPath = path.join(rootDir, "firebase-applet-config.json");
  if (fs.existsSync(firebaseConfigPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
  }
} catch (configErr: any) {
  console.error("⚠️ Failed to read firebase-applet-config.json:", configErr.message);
}

const isProduction = (process.env.NODE_ENV === "production" || !!process.env.K_SERVICE || !!process.env.K_REVISION) && !process.env.APPLET_ID;
let adminApp;

if (isProduction) {
  adminApp = getApps().length === 0 ? initializeApp({
    projectId: firebaseConfig.projectId
  }) : getApp();
} else {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey && serviceAccountKey.trim() !== "") {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      adminApp = getApps().length === 0 ? initializeApp({
        credential: cert(serviceAccount),
        projectId: firebaseConfig.projectId
      }) : getApp();
    } catch (err: any) {
      console.error(`⚠️ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY: ${err.message}`);
      adminApp = getApps().length === 0 ? initializeApp({
        projectId: firebaseConfig.projectId
      }) : getApp();
    }
  } else {
    adminApp = getApps().length === 0 ? initializeApp({
      projectId: firebaseConfig.projectId
    }) : getApp();
  }
}

const db = getFirestore(adminApp, firebaseConfig.firestoreDatabaseId || "(default)");

const defaultClients = [
  {
    domain: "hendersonhvac.com",
    businessName: "Henderson HVAC & Air Quality",
    vertical: "HVAC",
    trigger_type: "Thermal_Thresholds",
    primary_triggers: ["temp >= 95", "temp <= 32"],
    emergencyCopyFocus: "Emergency cooling and heating dispatch",
    themeColor: "amber",
    icon: "snowflake",
    city: "Dallas",
    phone: "(214) 555-0192",
    isrUrl: "https://hendersonhvac.com/api/revalidate",
    isrSecret: "sec_dallas_9837a",
    lastUpdated: new Date().toISOString(),
    lastWeatherCopy: {
      heroTitle: "Scorching 102°F Dallas Heat: 24/7 Same-Day AC Repair!",
      heroSubtitle: "Keep your family safe. High-efficiency cooling tune-ups starting at $49. Emergency dispatch units ready.",
      alertBanner: "CRITICAL HEAT ADVISORY: Double dispatch active across Dallas County today.",
      seoHeading: "How to Avoid AC Evaporator Coil Freeze-Ups in Texas Summers",
      seoArticle: "With temperatures climbing above 100°F, residential AC units run continuously. To prevent freeze-ups and motor burnout, replace your air filters monthly, keep vents open, and schedule a professional coil clean. Henderson HVAC stands ready with immediate emergency scheduling to keep you cool.",
      promotions: ["$49 Heatwave AC Tune-up", "Free Air Filter with any Repair", "15% Off Condenser Fan Motor Replacement"],
      cacheTags: ["weather", "homepage", "dallas-deals"]
    }
  },
  {
    domain: "desertbreeze-cooling.com",
    businessName: "Desert Breeze Climate Repair",
    vertical: "HVAC",
    trigger_type: "Thermal_Thresholds",
    primary_triggers: ["temp >= 100"],
    emergencyCopyFocus: "Extreme heat AC repair and compressor restoration",
    themeColor: "orange",
    icon: "flame",
    city: "Phoenix",
    phone: "(602) 555-8811",
    isrUrl: "https://desertbreeze-cooling.com/api/revalidate",
    isrSecret: "sec_phoenix_0091x",
    lastUpdated: new Date().toISOString(),
    lastWeatherCopy: {
      heroTitle: "Extreme Phoenix Sun: Urgent AC Restorations & Inspections",
      heroSubtitle: "When it's 114°F, your AC is a safety system. Speak to a live dispatcher. Same-hour service available.",
      alertBanner: "EXTREME HEAT WARNING: Priority service provided to households with children, seniors, or pets.",
      seoHeading: "Phoenix Homeowners Guide: Maintaining AC Efficiency During a Heat Dome",
      seoArticle: "In Maricopa County, air conditioners face some of the highest thermal stresses in the country. Desert Breeze Climate Repair recommends rinsing outdoor condenser coils weekly to remove dust blockages, enabling thermostat fan modes, and pre-cooling homes. Our technicians are deployed in fully-stocked vehicles to address compressor failures instantly.",
      promotions: ["No Service Call Fee with Repair", "Same-Day Compressor Replacements", "10% Senior & Military Discount"],
      cacheTags: ["weather", "home", "phoenix-services"]
    }
  },
  {
    domain: "windycityheating.com",
    businessName: "Windy City Heating & Furnace",
    vertical: "HVAC",
    trigger_type: "Thermal_Thresholds",
    primary_triggers: ["temp <= 32"],
    emergencyCopyFocus: "Furnace lockout prevention and frozen pipe protection",
    themeColor: "blue",
    icon: "wind",
    city: "Chicago",
    phone: "(312) 555-3240",
    isrUrl: "https://windycityheating.com/api/revalidate",
    isrSecret: "sec_chicago_5521b",
    lastUpdated: new Date().toISOString(),
    lastWeatherCopy: {
      heroTitle: "Bracing 28°F Chicago Winter: Prevent Frozen Pipes Now!",
      heroSubtitle: "Ensure your home stays warm. Urgent 24/7 heating emergencies. $50 off furnace diagnostics.",
      alertBanner: "WINTER FREEZE WATCH: Fast furnace inspections and pipe freeze protection services.",
      seoHeading: "Preventing Catastrophic Pipe Freezes in Chicago Sub-Zero Temperatures",
      seoArticle: "When cold sweeps through the Midwest, a failing furnace can cause severe plumbing leaks within hours. Keep your indoor temperatures above 62°F, open vanity doors under sinks, and let faucets drip. Windy City Heating provides rapid furnace diagnostics to make sure your heat remains consistent throughout the night.",
      promotions: ["$50 Off Furnace Tune-Up", "Free Carbon Monoxide Safety Sweep", "$500 Off New Heating System Installs"],
      cacheTags: ["weather", "homepage", "chicago-heating"]
    }
  },
  {
    domain: "cascadeclimate.com",
    businessName: "Cascade Climate Systems",
    vertical: "HVAC",
    trigger_type: "Humidity_Thresholds",
    primary_triggers: ["humidity >= 75"],
    emergencyCopyFocus: "Dehumidification audit and heat pump efficiency optimization",
    themeColor: "emerald",
    icon: "droplets",
    city: "Seattle",
    phone: "(206) 555-7744",
    isrUrl: "https://cascadeclimate.com/api/revalidate",
    isrSecret: "sec_seattle_9988q",
    lastUpdated: new Date().toISOString(),
    lastWeatherCopy: {
      heroTitle: "Damp 45°F Seattle Spring: Stay Warm and Dehumidified",
      heroSubtitle: "Heat pump tune-ups & indoor air filtration. Beat the humidity. Schedule your service online.",
      alertBanner: "",
      seoHeading: "Controlling Indoor Humidity and Spores During Northwest Rain Seasons",
      seoArticle: "Seattle's persistent moisture increases relative humidity indoors, accelerating air filter clogs and mildew growth in air ducts. Cascade Climate Systems offers specialized high-efficiency air purifiers and heat pump maintenance to regulate indoor air quality and maintain comfortable warmth all year round.",
      promotions: ["10% Off Air Quality Audits", "$100 Rebate on Whole-House Dehumidifiers", "Duct Inspection Only $29"],
      cacheTags: ["weather", "home", "seattle-humidity"]
    }
  }
];

async function runSeed() {
  console.log("🌱 Starting Firestore database seeding script...");
  
  const lockRef = db.collection("system_metadata").doc("seeding_lock");
  
  try {
    // Attempt atomic exclusive creation which guarantees database-level mutual exclusion and prevents TOCTOU races
    await lockRef.create({ seeded: true, timestamp: new Date().toISOString() });
    console.log("🔒 [LOCK] Acquired atomic seeding lock.");
  } catch (err: any) {
    // Firestore Code 6 is ALREADY_EXISTS
    if (err.code === 6 || err.message?.includes("already exists") || err.message?.includes("ALREADY_EXISTS")) {
      console.log("🔒 [LOCK] Seeding is already locked in this environment. Skipping seeding to prevent concurrency collisions.");
      process.exit(0);
    }
    throw err;
  }

  const clientsCol = db.collection("clients");
  const snapshot = await clientsCol.get();
  
  if (snapshot.empty) {
    console.log("Database 'clients' collection is empty. Seeding HVAC default tenants...");
    for (const client of defaultClients) {
      await clientsCol.doc(client.domain).set(client);
      console.log(`✅ Seeded client: ${client.domain}`);
    }
    console.log("🎉 Seeding completed successfully and locked in Firestore!");
  } else {
    console.log("⚠️ Database already has records in 'clients' collection. Lock is set.");
  }
  process.exit(0);
}

runSeed().catch(err => {
  console.error("❌ Seeding failed with error:", err);
  process.exit(1);
});
