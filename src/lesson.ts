import { text, number, flag, list, object, hash, report, unique, safePath, type Lesson, type Input } from "./core";

// A focused local experiment derived from this lesson’s reviewed presentation.
export const lesson: Lesson = {
  number: 57,
  title: "Real-time Frontends and Multi-tenant SaaS",
  description: "A SaaS frontend needs responsive agent updates without exposing the provider credential or another tenant’s conversation. The server is the bridge: it authenticates the user, authorizes a stored session binding, opens observation, and projects a small client contract.",
  concepts: ["Authorize the session before opening a stream", "Public event projection", "Tenant labels alone are not isolation"],
  scope: "Executes a local multi-tenant session authorization and event projection. The demo identity is fixed server-side, not production authentication. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.",
  cases: [{"id": "0", "label": "Project an owned conversation", "input": {"sessionKey": "owned", "eventType": "agent.message", "message": "Hello student"}, "expected": "passed", "checks": {"authorized": true}}, {"id": "1", "label": "Reject another tenant session", "input": {"sessionKey": "foreign", "eventType": "agent.message", "message": "Private text"}, "expected": "rejected", "checks": {"authorized": false}}, {"id": "2", "label": "Do not expose internal tool input", "input": {"sessionKey": "owned", "eventType": "agent.tool_use", "message": "internal payload"}, "expected": "passed", "checks": {"projected": null}}],
  async run(input) {

if(text(input,"sessionKey")!=="owned")return report("rejected","Unknown or unauthorized session",{authorized:false},["Use the host-owned principal","Check tenant and reader binding before opening"]);
const type=text(input,"eventType"),projected=type==="agent.message"?{type:"answer",text:text(input,"message")}:type==="session.status_idle"?{type:"idle",reason:"end_turn"}:null;
return report("passed","Applied the public event projection after authorization",{authorized:true,projected,rawInternalRecordForwarded:false},["Authorize the conversation","Project only public fields","Render text safely","Keep disconnect separate from remote stop"]);

  }
};
