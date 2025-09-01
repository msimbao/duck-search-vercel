export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Missing search query ?q=" });
  }

  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json`;
    const response = await fetch(url);
    const data = await response.json();

    let firstResult = null;

    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      const rt = data.RelatedTopics.find(r => r.FirstURL);
      if (rt) {
        firstResult = {
          title: rt.Text,
          url: rt.FirstURL,
          description: data.AbstractText || rt.Text
        };
      }
    }

    if (!firstResult && data.AbstractURL) {
      firstResult = {
        title: data.Heading,
        url: data.AbstractURL,
        description: data.AbstractText
      };
    }

    if (!firstResult) {
      return res.status(404).json({ error: "No results found" });
    }

    res.status(200).json({ query: q, ...firstResult });
  } catch (err) {
    res.status(500).json({ error: "Search failed", details: err.message });
  }
}
