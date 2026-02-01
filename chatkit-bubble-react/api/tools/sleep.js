export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const seconds = Number(req.body?.seconds ?? 0);
  const safeSeconds = Math.min(15, Math.max(5, seconds || 0));
  const ms = Math.round(safeSeconds * 1000);

  await new Promise((resolve) => setTimeout(resolve, ms));
  return res.status(200).json({ ok: true, waitedSeconds: safeSeconds });
}
