import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import ytdl from 'ytdl-core';
import YoutubeSearchApi from 'youtube-search-api';

function karaokeApiPlugin() {
  return {
    name: 'karaoke-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const base = `http://localhost`;
        const url = new URL(req.url, base);

        if (url.pathname === '/api/search') {
          const q = url.searchParams.get('q');
          if (!q) { res.statusCode = 400; res.end(JSON.stringify({ error: 'Missing query' })); return; }
          try {
            const results = await YoutubeSearchApi.GetListByKeyword(q, false, 12, [{ type: 'video' }]);
            const videos = (results.items || []).map((item) => ({
              id: item.id,
              title: item.title,
              thumbnail: item.thumbnail?.thumbnails?.slice(-1)[0]?.url || '',
              duration: item.length?.simpleText || '',
              channel: item.channelTitle || '',
            }));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ videos }));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Search failed: ' + err.message }));
          }
          return;
        }

        const streamMatch = url.pathname.match(/^\/api\/stream\/([^/]+)$/);
        if (streamMatch) {
          const videoId = streamMatch[1];
          const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
          try {
            const info = await ytdl.getInfo(ytUrl);
            const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });
            res.setHeader('Content-Type', 'audio/webm');
            res.setHeader('Access-Control-Allow-Origin', '*');
            const stream = ytdl(ytUrl, { format });
            stream.pipe(res);
            stream.on('error', () => { if (!res.headersSent) { res.statusCode = 500; res.end(); } });
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Cannot stream: ' + err.message }));
          }
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), karaokeApiPlugin()],
  server: { port: 3000 },
});
