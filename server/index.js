const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const YoutubeSearchApi = require('youtube-search-api');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query' });

  try {
    const results = await YoutubeSearchApi.GetListByKeyword(q, false, 12, [{ type: 'video' }]);
    const videos = (results.items || []).map((item) => ({
      id: item.id,
      title: item.title,
      thumbnail: item.thumbnail?.thumbnails?.slice(-1)[0]?.url || '',
      duration: item.length?.simpleText || '',
      channel: item.channelTitle || '',
    }));
    res.json({ videos });
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

app.get('/api/stream/:videoId', async (req, res) => {
  const { videoId } = req.params;
  const url = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });

    res.setHeader('Content-Type', 'audio/webm');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const stream = ytdl(url, { format });
    stream.pipe(res);
    stream.on('error', (err) => {
      console.error('Stream error:', err.message);
      if (!res.headersSent) res.status(500).end();
    });
  } catch (err) {
    console.error('Stream setup error:', err.message);
    res.status(500).json({ error: 'Cannot stream video' });
  }
});

app.get('/api/info/:videoId', async (req, res) => {
  const { videoId } = req.params;
  try {
    const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`);
    res.json({
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails.slice(-1)[0]?.url,
      channel: info.videoDetails.author.name,
      duration: info.videoDetails.lengthSeconds,
    });
  } catch (err) {
    res.status(500).json({ error: 'Cannot get video info' });
  }
});

app.listen(PORT, () => console.log(`Karaoke server running on http://localhost:${PORT}`));
