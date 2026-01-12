import "dotenv/config";
import express from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const WORKFLOW_ID = process.env.WORKFLOW_ID;

app.post("/api/chatkit/session", async (req, res) => {
  try {
    if (!OPENAI_API_KEY || !WORKFLOW_ID) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY or WORKFLOW_ID in backend .env" });
    }

    const r = await fetch("https://api.openai.com/v1/chatkit/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "OpenAI-Beta": "chatkit_beta=v1",
      },
      body: JSON.stringify({
        workflow: { id: WORKFLOW_ID },
        user: "web-anon",
      }),
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);

    return res.json({ client_secret: data.client_secret });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend beží na http://localhost:${PORT}`);
});
