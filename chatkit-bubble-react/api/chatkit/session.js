import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const workflowId = process.env.WORKFLOW_ID;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!workflowId || !apiKey) {
    return res.status(500).json({ error: "Missing env vars (WORKFLOW_ID / OPENAI_API_KEY)" });
  }

  const user = `web-${crypto.randomUUID()}`;

  const r = await fetch("https://api.openai.com/v1/chatkit/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "OpenAI-Beta": "chatkit_beta=v1",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      workflow: { id: workflowId },
      user,
    }),
  });

  const data = await r.json();
  return res.status(r.status).json(data);
}
