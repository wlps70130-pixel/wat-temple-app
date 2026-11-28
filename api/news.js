
const PAGE_ID = '143385195862661';
const GRAPH_VERSION = 'v27.0';
const FALLBACK_IMAGE = '/logo.png';

function normalizeEvent(event) {
  if (!event?.id || !event?.start_time || event.is_canceled) {
    return null;
  }

  const start = Date.parse(event.start_time);
  const end = event.end_time
    ? Date.parse(event.end_time)
    : start;

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return null;
  }

  // Hide events that have already finished.
  if (end < Date.now()) return null;

  return {
    id: `facebook:event:${event.id}`,
    type: 'event',
    source: 'facebook',
    title: event.name || 'กิจกรรมของวัด',
    summary: event.description || '',
    imageUrl: event.cover?.source || FALLBACK_IMAGE,
    url: `https://www.facebook.com/events/${event.id}`,
    startsAt: new Date(start).toISOString(),
    endsAt: event.end_time ? new Date(end).toISOString() : null,
    location: event.place?.name || null
  };
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!token) {
    return res.status(503).json({
      items: [],
      error: 'Facebook token not configured'
    });
  }

  try {
    const url = new URL(
      `https://graph.facebook.com/${GRAPH_VERSION}/${PAGE_ID}/events`
    );

    url.searchParams.set(
      'fields',
      'id,name,start_time,end_time,place,description,cover,is_canceled'
    );
    url.searchParams.set('limit', '100');

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000)
    });

    
if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  const fbError = errorData.error || {};

  console.error('Facebook Graph API error', {
    httpStatus: response.status,
    code: fbError.code,
    subcode: fbError.error_subcode,
    type: fbError.type,
    message: fbError.message
  });

  throw new Error('Facebook API unavailable');
}


    const data = await response.json();

    if (!Array.isArray(data.data)) {
      throw new Error('Invalid Facebook response');
    }

    const items = data.data
      .map(normalizeEvent)
      .filter(Boolean)
      .sort((a, b) =>
        Date.parse(a.startsAt) - Date.parse(b.startsAt)
      );

    res.setHeader(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=600'
    );

    return res.status(200).json({
      items,
      updatedAt: new Date().toISOString()
    });
  
} catch (error) {
  console.error('Facebook events request failed', {
    message: error.message,
    name: error.name
  });

      return res.status(503).json({
      items: [],
      error: 'Unable to load Facebook events'
    });
  }
}
