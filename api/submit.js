export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const gasUrl = process.env.GAS_URL;
  if (!gasUrl) {
    console.error('GAS_URL is not set');
    return res.status(500).json({ error: 'GAS_URL is not configured' });
  }

  const payload = typeof req.body === 'string'
    ? req.body
    : JSON.stringify(req.body);

  console.log('Payload:', payload);

  try {
    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      redirect: 'follow',
    });

    const responseText = await response.text();
    console.log('GAS status:', response.status);
    console.log('GAS body (first 200):', responseText.slice(0, 200));

    if (response.status === 200) {
      return res.status(200).json({ ok: true });
    }

    // 302 フォロー後に 200 以外が返った場合もエラーとして記録
    console.error(`GAS unexpected status: ${response.status}`);
    return res.status(502).json({
      error: `GAS responded with ${response.status}`,
      hint: response.status === 405
        ? 'GAS Web App may not be deployed or access is restricted'
        : 'Check GAS deployment settings',
    });
  } catch (err) {
    console.error('GAS forwarding error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
