exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const params = new URLSearchParams(event.body);
    const first_name = params.get('first_name') || 'Unknown';
    const phone      = params.get('phone')      || 'Not provided';
    const service    = params.get('service')    || 'Not specified';
    const message    = params.get('message')    || '';

    const serviceLabels = {
      infidelity:  'Suspected Infidelity / Relationship Investigation',
      surveillance:'Covert Surveillance',
      background:  'Background Investigation',
      litigation:  'Litigation Support',
      other:       'Other / Not Sure Yet',
    };

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Empire Investigation <noreply@areyoususpicious.com>',
        to:   ['bobbytaylorwellness@gmail.com'],
        subject: `🔔 New Lead: ${first_name} — ${serviceLabels[service] || service}`,
        html: `
          <div style="font-family:sans-serif;max-width:540px;margin:0 auto;border:1px solid #e2c070;border-radius:4px;overflow:hidden;">
            <div style="background:#0a0a0a;padding:20px 28px;">
              <p style="margin:0;color:#c9a84c;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">Empire Investigation</p>
              <h2 style="margin:8px 0 0;color:#ffffff;font-size:20px;font-weight:400;">New Consultation Request</h2>
            </div>
            <div style="padding:28px;background:#ffffff;">
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;width:130px;">Name</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#111;font-size:15px;">${first_name}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Phone</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#111;font-size:15px;"><a href="tel:${phone}" style="color:#c9a84c;">${phone}</a></td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Service</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#111;font-size:15px;">${serviceLabels[service] || service}</td>
                </tr>
                ${message ? `
                <tr>
                  <td style="padding:10px 0;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;vertical-align:top;">Notes</td>
                  <td style="padding:10px 0;color:#111;font-size:15px;line-height:1.6;">${message}</td>
                </tr>` : ''}
              </table>
            </div>
            <div style="background:#f9f9f9;padding:16px 28px;border-top:1px solid #f0f0f0;">
              <p style="margin:0;font-size:12px;color:#999;">Submitted via <strong>go.areyoususpicious.com</strong> · Discreet PI landing page</p>
            </div>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      return { statusCode: 500, body: JSON.stringify({ error: 'Email failed' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true }),
    };

  } catch (err) {
    console.error('Submit function error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
