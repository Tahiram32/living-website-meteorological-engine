# Weatherpulse Sync Engine

Weatherpulse is a multi-tenant application that synchronizes weather data for a fleet of clients. 

It queries local weather conditions and dispatches background tasks to update client dashboards based on severe weather fluctuations.

## Features
- **Multi-Tenant Architecture**: Safely isolates data across independent clients.
- **Asynchronous Dispatcher**: Polling-based background jobs with rate limiting.
- **Sentry Integration**: Error tracking and performance monitoring.

## Quickstart

**Prerequisites:** Node.js v20+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Setup environment variables:
   Configure your environment variables (Firebase, Gemini API, Weather API keys) based on `.env.example`.
3. Start the application locally:
   ```bash
   npm run dev
   ```

## Sentry Telemetry 👁️

This project utilizes Sentry for full-stack observability:
- **Backend Orchestrator**: Uses `@sentry/node` and `@sentry/profiling-node` to trace execution time, CPU spikes, and ensure the background worker pool never encounters event-loop starvation.
- **Frontend**: Uses `@sentry/react` to capture client-side dashboard anomalies and session replays.
