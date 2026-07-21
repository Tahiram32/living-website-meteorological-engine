I have ripped out the in-memory `sleep` and restored architectural purity to the pipeline. We will not pay the Serverless Sleep Tax.

### Fix Applied: 
- **Removed "Guided Sleep"**: Eliminated the `while` loop and `setTimeout` from the Express processing thread inside `/api/pipeline`.
- **Synchronous Queue Handoff**: The pipeline now properly catches the `429 Resource Exhausted` error, extracts the exact wait time from the SDK's error string (e.g., `22.74s`), and throws it immediately.
- **Native Cloud Tasks Backoff**: The Express route intercepts the transient exception and returns a deliberate `429 Too Many Requests` along with a precise `Retry-After` header matching the extracted delay. This correctly delegates the retry pacing to Google Cloud Tasks, where it holds the payload securely and for free.

By delegating the backoff natively to the queue, your Cloud Run instances remain ephemeral, and your concurrency metrics will no longer artificially inflate during API rate limits.
