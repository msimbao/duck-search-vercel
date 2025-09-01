export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Missing search query ?q=" });
  }

  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json`;
  const response = await fetch(url);
  const data = await response.json();

  const rt = data.RelatedTopics?.find(r => r.FirstURL);
  const result = rt
    ? { title: rt.Text, url: rt.FirstURL, description: data.AbstractText || rt.Text }
    : { title: data.Heading, url: data.AbstractURL, description: data.AbstractText };

  res.status(200).json({ query: q, ...result });
}
