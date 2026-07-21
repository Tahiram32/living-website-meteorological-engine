I have fully addressed the uncaught 503 API error by implementing enterprise-grade, resilient circuit breaking for the background worker. 

- **Transient Error Inspection**: The Gemini invocation within the background worker now explicitly inspects the error object (checking for 429, 503, or `UNAVAILABLE` status codes).
- **Graceful Queue Backoff**: Rather than crashing or marking the database record as `failed`, the worker leaves the Firestore transaction state open and safely throws the error to the Express route.
- **Cloud Tasks Integration**: The route intercepts the transient exception and returns a deliberate `503 Service Unavailable` to Cloud Tasks. This correctly signals the queue to hold the payload and trigger its native exponential backoff algorithms.
- **Seamless Retry Re-Entry**: Once the temporary load spike subsides, Cloud Tasks will replay the payload with the `x-cloudtasks-taskretrycount` header, allowing the worker to bypass the idempotency lock and successfully provision the tenant without any data loss or customer impact.

The system is now capable of weathering upstream model unavailability gracefully.
