// Minimal Vercel serverless function (ESM)
export default async function handler(req, res) {
try {
const q = (req.query && req.query.q) || (new URL(req.url, `http://${req.headers.host}`)).searchParams.get('q');


if (!q) {
return res.status(400).json({ error: 'Missing search query. Use ?q=your+query' });
}


const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&no_redirect=1`;
const r = await fetch(ddgUrl);


if (!r.ok) {
return res.status(502).json({ error: 'DuckDuckGo API returned non-OK status', status: r.status });
}


const data = await r.json();


// Helper to recursively find a FirstURL inside RelatedTopics
function findFirst(topics) {
for (const t of topics) {
if (t.FirstURL) {
return { title: t.Text || t.Name || data.Heading || '', url: t.FirstURL, description: data.AbstractText || t.Text || '' };
}
if (t.Topics && t.Topics.length) {
const found = findFirst(t.Topics);
if (found) return found;
}
}
return null;
}


let firstResult = null;


if (Array.isArray(data.RelatedTopics) && data.RelatedTopics.length) {
firstResult = findFirst(data.RelatedTopics);
}


if (!firstResult && data.AbstractURL) {
firstResult = { title: data.Heading || '', url: data.AbstractURL, description: data.AbstractText || '' };
}


if (!firstResult) {
return res.status(404).json({ error: 'No results found' });
}


return res.status(200).json({ query: q, ...firstResult });
} catch (err) {
return res.status(500).json({ error: 'Search failed', details: err.message });
}
}