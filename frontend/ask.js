// Vercel serverless function: forwards chat requests to the n8n webhook.
// Set N8N_WEBHOOK_URL in Vercel > Project Settings > Environment Variables.
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  const url = process.env.N8N_WEBHOOK_URL;
  if (!url) return res.status(500).json({ error: 'N8N_WEBHOOK_URL is not set' });

  const { question, employeeName, employeeEmail } = req.body || {};
  if (typeof question !== 'string' || !question.trim() || question.length > 500) {
    return res.status(400).json({ error: 'Question must be 1-500 characters' });
  }

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: question.trim(),
        employeeName: String(employeeName || '').slice(0, 80),
        employeeEmail: String(employeeEmail || '').slice(0, 120)
      }),
      signal: AbortSignal.timeout(25000)
    });
    const text = await upstream.text();
    let data = {};
    try { data = JSON.parse(text); } catch (e) {}
    if (!upstream.ok || !data.answer) return res.status(502).json({ error: 'Upstream failed' });
    return res.status(200).json({ answer: data.answer });
  } catch (e) {
    return res.status(504).json({ error: 'n8n unreachable or timed out' });
  }
};
