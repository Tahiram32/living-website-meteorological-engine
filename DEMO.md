# 🧪 Verification & Demo Guide

Every feature listed in our README is fully demonstrable. Use this guide to verify the core infrastructure of Weatherpulse.

## 30-Second Quick Demo

If you want to see Weatherpulse in action instantly:
1. Open the [Live Demo](https://weatherpulse-gray.vercel.app/).
2. Look at the **Active Tenants** sidebar to see multiple clients being managed concurrently.
3. In the **Infrastructure Demo Controls** panel, click **"❄️ Simulate Blizzard"** or **"🌡️ Simulate Heat Wave"**.
4. **Observe:**
   - The UI instantly updates the tenant's temperature and AQI metrics.
   - The Tenant statuses change to "Critical" and surge pricing multipliers increase dynamically.
   - An emergency banner is dispatched to the dashboard.
   - Behind the scenes, the `/api/simulate` endpoint processes these tasks and logs the simulation events.

---

## Complete Feature Verification Checklist

### 1. Multi-Provider Data Aggregation
- [x] **How to Verify:** Review `meteorological-sync-engine.ts`. Observe the fallback logic where alternative APIs (like Open-Meteo) are queried if the primary API fails, normalizing the payload before handing it to the worker queue.

### 2. Multi-Tenant Synchronization
- [x] **How to Verify:** Configure multiple tenants in Firebase. Send a `POST` request to `/api/pipeline/sync-weather`. Watch your Firebase Firestore console as each tenant's document is updated exclusively with their specific hyper-local weather.

### 3. Asynchronous Worker Pool
- [x] **How to Verify:** Trigger a sync with multiple tenants. Check the Node.js console logs to see the `[SIM-TASK-QUEUE]` staggering jobs concurrently (or up to the concurrency limit) to prevent event-loop starvation and API rate-limit exhaustion.

### 4. Event-Driven Alerts
- [x] **How to Verify:** Using the UI Simulation controls, trigger a **Heat Wave**. Observe the alert state triggering and the surge multiplier dynamically adjusting based on the severe weather conditions.

### 5. Secure Data Isolation
- [x] **How to Verify:** Review `firestore.rules` in the repository root. Ensure that read/write operations are strictly isolated by authentication context so Tenant A can never read Tenant B's weather data.

### 6. Sentry Telemetry
- [x] **How to Verify:** Introduce an intentional throw in `server.ts` or the React frontend. Verify the error, along with full CPU profiling data, is dispatched to your Sentry dashboard.

### 7. GitHub Actions CI/CD
- [x] **How to Verify:** Check the `.github/workflows/weather-sync.yml` file and the passing CI badge on the README. Every pull request automatically runs `npm run lint` and `vitest run` before allowing merges.
