const UPLOADS_PLAYLIST_ID = 'UUsZvCHD_VtE2nx-fIdrKvDg';
const YT_API = 'https://www.googleapis.com/youtube/v3/playlistItems';

interface PlaylistItem {
  snippet: {
    title: string;
    description: string;
    resourceId: { videoId: string };
  };
  contentDetails: {
    videoId: string;
    videoPublishedAt: string;
  };
}

interface PlaylistResponse {
  items: PlaylistItem[];
  nextPageToken?: string;
}

export interface SyncResult {
  scanned: number;
  inserted: number;
  skipped: number;
  errors: string[];
}

async function fetchPage(apiKey: string, pageToken?: string): Promise<PlaylistResponse> {
  const params = new URLSearchParams({
    part: 'snippet,contentDetails',
    playlistId: UPLOADS_PLAYLIST_ID,
    maxResults: '50',
    key: apiKey,
  });
  if (pageToken) params.set('pageToken', pageToken);

  const res = await fetch(`${YT_API}?${params.toString()}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<PlaylistResponse>;
}

export async function syncYouTubeVideos(
  db: any,
  apiKey: string,
  options: { fullBackfill?: boolean } = {}
): Promise<SyncResult> {
  const result: SyncResult = { scanned: 0, inserted: 0, skipped: 0, errors: [] };
  let pageToken: string | undefined;

  do {
    const page = await fetchPage(apiKey, pageToken);

    for (const item of page.items) {
      result.scanned++;
      const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
      const title = item.snippet?.title;
      const description = item.snippet?.description ?? '';
      const publishedAt = item.contentDetails?.videoPublishedAt;
      if (!videoId || !title || !publishedAt) {
        result.errors.push(`Missing fields for item: ${JSON.stringify(item).slice(0, 100)}`);
        continue;
      }

      const existing = await db
        .prepare('SELECT title, description FROM youtube_videos WHERE video_id = ?')
        .bind(videoId)
        .first();

      if (!existing) {
        await db
          .prepare(
            'INSERT INTO youtube_videos (video_id, title, description, published_at) VALUES (?, ?, ?, ?)'
          )
          .bind(videoId, title, description, publishedAt)
          .run();
        result.inserted++;
      } else {
        if (existing.title !== title || existing.description !== description) {
          await db
            .prepare('UPDATE youtube_videos SET title = ?, description = ? WHERE video_id = ?')
            .bind(title, description, videoId)
            .run();
        }
        result.skipped++;
      }
    }

    pageToken = page.nextPageToken;
    if (!options.fullBackfill && result.inserted === 0 && result.scanned >= 50) {
      break;
    }
  } while (pageToken);

  return result;
}
