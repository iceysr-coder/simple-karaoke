import YoutubeSearchApi from 'youtube-search-api';

export default async function handler(req, res) {
  const q = req.query?.q || new URL(req.url, 'http://localhost').searchParams.get('q');
  if (!q) {
    res.status(400).json({ error: 'Missing query' });
    return;
  }
  try {
    const results = await YoutubeSearchApi.GetListByKeyword(q, false, 12, [{ type: 'video' }]);
    const videos = (results.items || []).map((item) => ({
      id: item.id,
      title: item.title,
      thumbnail: item.thumbnail?.thumbnails?.slice(-1)[0]?.url || '',
      duration: item.length?.simpleText || '',
      channel: item.channelTitle || '',
    }));
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ videos });
  } catch (err) {
    res.status(500).json({ error: 'Search failed: ' + err.message });
  }
}
