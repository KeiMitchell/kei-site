module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, storeUrl, role, subscribers, message } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const errors = [];

  // ── Notion ──
  try {
    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_DATABASE_ID },
        properties: {
          Name: {
            title: [{ text: { content: name } }],
          },
          Email: { email },
          'Store URL': {
            url: storeUrl && storeUrl.trim() ? storeUrl.trim() : null,
          },
          Role: role ? { select: { name: role } } : { select: null },
          Subscribers: subscribers
            ? { select: { name: subscribers } }
            : { select: null },
          Message: {
            rich_text: [{ text: { content: message || '' } }],
          },
          Submitted: {
            date: { start: new Date().toISOString() },
          },
          Status: { select: { name: 'New' } },
        },
      }),
    });

    if (!notionRes.ok) {
      const body = await notionRes.text();
      console.error('Notion error:', notionRes.status, body);
      errors.push('notion');
    }
  } catch (err) {
    console.error('Notion fetch error:', err);
    errors.push('notion');
  }

  // ── Slack ──
  try {
    const blocks = [
      {
        type: 'header',
        text: { type: 'plain_text', text: '📬 New lead · kei.gethanjo.com' },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Name*\n${name}` },
          { type: 'mrkdwn', text: `*Email*\n${email}` },
          {
            type: 'mrkdwn',
            text: `*Store URL*\n${storeUrl || 'Not provided'}`,
          },
          { type: 'mrkdwn', text: `*Role*\n${role || 'Not specified'}` },
          {
            type: 'mrkdwn',
            text: `*Active subscribers*\n${subscribers || 'Not specified'}`,
          },
        ],
      },
    ];

    if (message) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*What they want help with*\n${message}`,
        },
      });
    }

    const slackRes = await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    });

    if (!slackRes.ok) {
      console.error('Slack error:', slackRes.status);
      errors.push('slack');
    }
  } catch (err) {
    console.error('Slack fetch error:', err);
    errors.push('slack');
  }

  // If both failed, return error. If one succeeded, still return success.
  if (errors.length === 2) {
    return res.status(500).json({ error: 'Submission failed' });
  }

  return res.status(200).json({ success: true });
};
