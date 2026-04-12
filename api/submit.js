export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const gasUrl = process.env.GAS_URL;
  if (!gasUrl) {
    return res.status(500).json({ error: 'GAS_URL is not configured' });
  }

  try {
    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`GAS responded with status ${response.status}`);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('GAS forwarding error:', err);
    return res.status(500).json({ error: 'Failed to submit form data' });
  }
}
