export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const gasUrl = process.env.GAS_URL;
  if (!gasUrl) {
    return res.status(500).json({ error: 'GAS_URL is not configured' });
  }

  try {
    // GAS Web App は POST を受け取ると 302 リダイレクトを返す。
    // redirect:'manual' で止め、302 も成功とみなす。
    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      redirect: 'manual',
    });

    // 200 または 302 (GAS の正常レスポンス) を成功とする
    if (response.status === 200 || response.status === 302) {
      return res.status(200).json({ ok: true });
    }

    throw new Error(`GAS responded with status ${response.status}`);
  } catch (err) {
    console.error('GAS forwarding error:', err);
    return res.status(500).json({ error: 'Failed to submit form data' });
  }
}
