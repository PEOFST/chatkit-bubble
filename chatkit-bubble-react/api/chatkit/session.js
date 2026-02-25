export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const workflowId = process.env.WORKFLOW_ID;
  const apiKey = process.env.OPENAI_API_KEY;
  const greeting =
    process.env.CHATKIT_GREETING ||
    "are you looking for a new kayak or just exploring options ?";

  if (!workflowId || !apiKey) {
    return res.status(500).json({ error: "Missing env vars (WORKFLOW_ID / OPENAI_API_KEY)" });
  }

  const r = await fetch("https://api.openai.com/v1/chatkit/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "OpenAI-Beta": "chatkit_beta=v1",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      workflow: { id: workflowId },
      user: "web-anon",
    }),
  });

  const data = await r.json();

  // Best-effort preseeded thread with an assistant greeting so the first visible
  // message comes from the agent (not the user).
  let threadId = null;
  try {
    const threadRes = await fetch("https://api.openai.com/v1/chatkit/threads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "OpenAI-Beta": "chatkit_beta=v1",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ user: "web-anon" }),
    });

    if (threadRes.ok) {
      const threadJson = await threadRes.json();
      threadId = threadJson.id || null;

      if (threadId) {
        await fetch(`https://api.openai.com/v1/chatkit/threads/${threadId}/items`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "OpenAI-Beta": "chatkit_beta=v1",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            type: "assistant_message",
            content: [
              {
                type: "output_text",
                text: greeting,
              },
            ],
          }),
        });
      }
    }
  } catch (err) {
    console.error("Failed to seed greeting thread", err);
  }

  return res.status(r.status).json({ ...data, thread_id: threadId });
}
