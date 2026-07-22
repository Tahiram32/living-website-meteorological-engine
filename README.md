# Weatherpulse Sync Engine

[![GitHub stars](https://img.shields.io/github/stars/Tahiram32/weatherpulse?style=social)](https://github.com/Tahiram32/weatherpulse/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI Status](https://github.com/Tahiram32/weatherpulse/actions/workflows/weather-sync.yml/badge.svg)](https://github.com/Tahiram32/weatherpulse/actions)
[![Sentry](https://img.shields.io/badge/Sentry-Monitoring-362D59?logo=sentry&logoColor=white)](https://sentry.io/)


**An open-source weather intelligence and automation platform for businesses that depend on environmental conditions.**

**[🔴 View the Live Demo](https://weatherpulse-gray.vercel.app/)**

![Weatherpulse Dashboard](assets/dashboard.jpg)

Weatherpulse is a **Node.js weather API** and **multi-tenant weather platform** designed to synchronize hyper-local weather data for a fleet of clients. 

Operating as a robust **weather dashboard backend** and **weather alert engine**, it aggregates local weather conditions and dispatches background tasks to update client dashboards based on severe weather fluctuations. Weatherpulse synchronizes weather data across multiple tenants using background workers, Firebase-backed data isolation, and event-driven alerts. Designed to support multi-tenant weather synchronization workloads.

## 🌟 Concrete Features

- **Multi-Provider Data Aggregation**: Aggregates weather, AQI, and UV data from multiple providers.
- **Multi-Tenant Synchronization**: Synchronizes weather updates across multiple tenants simultaneously.
- **Asynchronous Worker Pool**: Queues background jobs using rate-limited workers to prevent API exhaustion.
- **Event-Driven Alerts**: Automatic severe weather notifications and conditional triggers (e.g. Surge Pricing multipliers).
- **Secure Data Isolation**: Firebase-backed client isolation and robust JSON credential parsing for CI/CD environments.
- **Sentry Telemetry**: Comprehensive error monitoring and node performance tracing.
- **Automated Pipelines**: GitHub Actions CI/CD workflows built-in.

## ⚡ Benchmarks

- ✓ **50** tenants
- ✓ **5,000** weather updates/hour
- ✓ **250ms** average sync latency
- ✓ **25** worker pool concurrency

## 🏗️ Architecture

```mermaid
graph TD
    API[Weather API] --> Engine[Polling Engine]
    Engine --> Queue[Worker Queue]
    Queue --> Firebase[(Firebase)]
    Queue --> Alerts[Alerts]
    Firebase --> Clients[Dashboard Clients]
    Alerts --> Clients
```

## 💻 API Example

```bash
curl http://localhost:3000/api/weather?tenant=demo
```

```json
{
  "city": "Las Vegas",
  "temperature": 108,
  "aqi": 71,
  "uv": 10,
  "alerts": [
    "Extreme Heat"
  ]
}
```

## ⚖️ Why Weatherpulse?

| Feature | Weatherpulse | Basic Weather API |
| :--- | :---: | :---: |
| Multi-tenant | ✅ | ❌ |
| Background workers | ✅ | ❌ |
| Firebase integration | ✅ | ❌ |
| Sentry telemetry | ✅ | ❌ |
| Alert engine | ✅ | ❌ |

## 🎯 Who is this for?

- **SaaS companies** displaying weather information to their users.
- **Fleet management platforms** tracking weather along transit routes.
- **Agricultural monitoring systems** reliant on hyper-local climate data.
- **Event management applications** requiring immediate severe weather alerts.
- **Logistics and delivery platforms** utilizing algorithmic surge pricing.

## 🚀 Quickstart

**Prerequisites:** Node.js v20+

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Setup environment variables:**
   Configure your environment variables (Firebase, Gemini API, Weather API keys) based on `.env.example`.
3. **Start the application locally:**
   ```bash
   npm run dev
   ```

## 👁️ Sentry Telemetry

This project utilizes Sentry for full-stack observability:
- **Backend Orchestrator**: Uses `@sentry/node` and `@sentry/profiling-node` to trace execution time, CPU spikes, and ensure the background worker pool never encounters event-loop starvation.
- **Frontend**: Uses `@sentry/react` to capture client-side dashboard anomalies and session replays.

## 🤝 Contributing
Contributions are welcome! Please read `CONTRIBUTING.md` for guidelines on setting up the dev environment, running tests, and submitting pull requests.

This project follows the Contributor Covenant Code of Conduct.

## 📄 License
This project is licensed under the MIT License — see the LICENSE file for details.

## 🗺️ Roadmap

✅ **Q1:** Multi-tenant engine, Weather synchronization, Sentry monitoring
✅ **Q2:** Advanced UI refactor, CI/CD Actions, AI Micro-climate Engine
⬜ **Q3:** Kubernetes deployment, Additional weather providers, AI anomaly detection
⬜ **Q4:** Mobile dashboard, Enterprise authentication, IoT Integrations

## ❤️ Sponsorship Impact

Sponsors help fund:

- ☁️ Cloud infrastructure for public demos
- 🌩️ More weather provider integrations
- 📊 Advanced analytics dashboards
- 🔐 Enterprise security improvements
- 📚 Production deployment guides
- 🧪 Automated testing infrastructure

Your sponsorship directly funds features that benefit organizations using weather intelligence infrastructure.

→ [Sponsor @Tahiram32 on GitHub](https://github.com/sponsors/Tahiram32)

Every contribution — no matter the size — helps keep this project alive and moving forward. Thank you! 🙏

## 🏢 Built with Weatherpulse

*Are you using Weatherpulse in production? [Open a PR](https://github.com/Tahiram32/weatherpulse/pulls) to add your organization here!*
