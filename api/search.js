import duckduckgo from "duck-duck-scrape";

export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Missing search query ?q=" });
  }

  try {
    const results = await duckduckgo.search(q);

    if (!results.results.length) {
      return res.status(404).json({ error: "No results found" });
    }

    const first = results.results[0];

    res.status(200).json({
      query: q,
      title: first.title,
      url: first.url,
      description: first.description
    });
  } catch (err) {
    res.status(500).json({ error: "Search failed", details: err.message });
  }
}
