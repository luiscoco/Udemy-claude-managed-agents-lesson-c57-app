# C57 · Real-time Frontends and Multi-tenant SaaS

Executes a local multi-tenant session authorization and event projection. The demo identity is fixed server-side, not production authentication. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.

## Concepts students will learn

- Authorize the session before opening a stream
- Public event projection
- Tenant labels alone are not isolation

## Configure and run

Use Node.js 24 or later. In PowerShell, from this repository's folder:

```powershell
node --version
npm ci
Copy-Item .env.example .env
notepad .env
```

No API key is required for the local experiment. Optional live commentary requires your own API key, agent ID and environment ID. It explains the local result; it does not activate the integration discussed in the lesson.

For the optional live path, set your API key, then run npm run setup if you do not already have resource IDs. The script creates the environment before a text-only agent, saves each ID immediately, and reuses IDs already configured. It uses CLAUDE_MODEL or the source default; choose a model available to your account. An uncertain network failure may have created a resource: inspect your account before retrying.

```powershell
npm start
```

Open `http://127.0.0.1:3057`. Navigation leads to `/guide.html#learning`, `/guide.html#run-guide`, `/architecture.html`, and the application lab. If you change `PORT`, use the configured port. Keep the terminal running; stop with Ctrl+C. `npm run dev` also starts the web application.

Select the first scenario, inspect its editable fields, press Run experiment, and compare the outcome and evidence with the table above. Select another scenario to investigate the boundary condition.

## Create your .env file

Copy `.env.example` to `.env` and enter your own values. Do not commit the real file. Restart the server after editing it. The example contains safe placeholders; optional settings may be left blank to use source defaults. Resource IDs and keys stay on the server.

```dotenv
ANTHROPIC_API_KEY=your_api_key
CLAUDE_MANAGED_AGENT_ID=your_agent_id
CLAUDE_MANAGED_ENVIRONMENT_ID=your_environment_id
PORT=3057
```

## How the app was build

### 1. Authorize before preparing a public stream view

Only the seeded owned session key is admitted. In a real frontend, the host must derive the principal and reader binding from authenticated state before opening the stream.

Source: [src/lesson.ts](src/lesson.ts#L13)

```typescript
if (text(input, "sessionKey") !== "owned")
  return report(
    "rejected",
    "Unknown or unauthorized session",
    { authorized: false },
    [
      "Use the host-owned principal",
      "Check tenant and reader binding before opening",
    ],
  );
```

### 2. Project public fields instead of raw provider records

Message events become answer text, idle becomes a public lifecycle record, and other types are omitted. rawInternalRecordForwarded is false; this reducer models projection rather than serving a multi-tenant SSE endpoint.

Source: [src/lesson.ts](src/lesson.ts#L14) · selected statements

```typescript
const type = text(input, "eventType"),
  projected =
    type === "agent.message"
      ? { type: "answer", text: text(input, "message") }
      : type === "session.status_idle"
        ? { type: "idle", reason: "end_turn" }
        : null;

return report(
  "passed",
  "Applied the public event projection after authorization",
  { authorized: true, projected, rawInternalRecordForwarded: false },
  [
    "Authorize the conversation",
    "Project only public fields",
    "Render text safely",
    "Keep disconnect separate from remote stop",
  ],
);
```

### Check your understanding

Run **Project an owned conversation** in the application. Compare the result with these scenario expectations:

```json
{
  "input": {
    "sessionKey": "owned",
    "eventType": "agent.message",
    "message": "Hello student"
  },
  "expectedOutcome": "passed",
  "checkEvidence": {
    "authorized": true
  }
}
```

Then try **Reject another tenant session**. Its expected outcome is `rejected`; identify the condition or evidence field that explains the difference.

## Validation

```powershell
npm test
python scripts/verify-walkthrough.py
```

The source hash check detects when walkthrough excerpts need refreshing. Browser verification covers page navigation, readable text, mobile layout, dark mode, diagram and image routes. Local scenarios and live provider calls are recorded separately in the workspace verification report; local success is not evidence of a live provider operation.

## Repository contents

Application sources, student web pages, safe configuration example and documentation images are included. `node_modules`, `presentation`, `output`, `reviewed`, `v3`, `teaching-material`, build output, local journals, credentials and local resource files are ignored. Existing teaching videos and presentations remain in the original workspace.
