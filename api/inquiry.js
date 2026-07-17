module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    name, email, company, website, businessType,
    needs, tools, revenue, timeline, language, message, hp,
  } = req.body || {};

  // honeypot: silently accept bots
  if (hp) return res.status(200).json({ success: true });

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const list = v => (Array.isArray(v) ? v.join(', ') : v || '');
  const summaryLines = [
    company ? `Company: ${company}` : null,
    website ? `Website: ${website}` : null,
    businessType ? `Business type: ${businessType}` : null,
    list(needs) ? `Needs: ${list(needs)}` : null,
    list(tools) ? `Current tools: ${list(tools)}` : null,
    revenue ? `Monthly revenue: ${revenue}` : null,
    timeline ? `Timeline: ${timeline}` : null,
    language ? `Preferred language: ${language}` : null,
    message ? `Message: ${message}` : null,
  ].filter(Boolean);
  const summary = summaryLines.join('\n');

  const errors = [];

  // ── Notion (same database as /api/submit; details packed into Message) ──
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
          Name: { title: [{ text: { content: name } }] },
          Email: { email },
          'Store URL': { url: website && website.trim() ? website.trim() : null },
          Message: { rich_text: [{ text: { content: summary.slice(0, 1900) } }] },
          Submitted: { date: { start: new Date().toISOString() } },
          Status: { select: { name: 'New' } },
        },
      }),
    });
    if (!notionRes.ok) {
      console.error('Notion error:', notionRes.status, await notionRes.text());
      errors.push('notion');
    }
  } catch (err) {
    console.error('Notion fetch error:', err);
    errors.push('notion');
  }

  // ── Slack ──
  try {
    const fields = [
      { type: 'mrkdwn', text: `*Name*\n${name}` },
      { type: 'mrkdwn', text: `*Email*\n${email}` },
      { type: 'mrkdwn', text: `*Company*\n${company || 'Not provided'}` },
      { type: 'mrkdwn', text: `*Website*\n${website || 'Not provided'}` },
      { type: 'mrkdwn', text: `*Business type*\n${businessType || 'Not specified'}` },
      { type: 'mrkdwn', text: `*Timeline*\n${timeline || 'Not specified'}` },
      { type: 'mrkdwn', text: `*Revenue*\n${revenue || 'Not specified'}` },
      { type: 'mrkdwn', text: `*Language*\n${language || 'Not specified'}` },
    ];
    const blocks = [
      { type: 'header', text: { type: 'plain_text', text: 'New inquiry · hanjo.ai/contact' } },
      { type: 'section', fields: fields.slice(0, 8) },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Needs*\n${list(needs) || 'Not specified'}\n*Current tools*\n${list(tools) || 'Not specified'}`,
        },
      },
    ];
    if (message) {
      blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `*Message*\n${message}` } });
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

  if (errors.length === 2) {
    return res.status(500).json({ error: 'Submission failed' });
  }
  return res.status(200).json({ success: true });
};
