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

  console.log('Forwarding to GAS:', gasUrl.slice(0, 60) + '...');
  console.log('Payload:', payload);

  try {
    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      redirect: 'follow',
    });

    console.log('GAS response status:', response.status);

    // GAS は 200 か、リダイレクト後の 200 を返す
    // 5xx 以外はすべて成功とみなす
    if (response.status < 500) {
      return res.status(200).json({ ok: true });
    }

    const text = await response.text();
    console.error('GAS error body:', text);
    throw new Error(`GAS responded with status ${response.status}`);
  } catch (err) {
    console.error('GAS forwarding error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
