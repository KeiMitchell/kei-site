// Returns the visitor's country (from Vercel's edge geolocation) so pages can
// decide whether to show the language switch. Nothing is stored or logged.
module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.status(200).json({ country: String(req.headers['x-vercel-ip-country'] || '') });
};
