 
import { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { CalendarDays, RefreshCw, MapPin } from 'lucide-react';

const FALLBACK_IMAGE = '/logo.png';

function EventImage({ src, title }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="embla__slide-img-wrapper">
      <img
        src={failed ? FALLBACK_IMAGE : (src || FALLBACK_IMAGE)}
        alt={title}
        loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={(event) => {
          if (!failed) {
            setFailed(true);
          } else {
            event.currentTarget.style.display = 'none';
          }
        }}
      />
    </div>
  );
}

export default function NewsCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start'
  });

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [now, setNow] = useState(Date.now());

  async function loadEvents() {
    setLoading(true);
    setError(false);

    try {
      const response = await fetch('/api/news');

      if (!response.ok) {
        throw new Error('Cannot load events');
      }

      const result = await response.json();

      const items = Array.isArray(result.items)
        ? result.items
        : [];

      setEvents(items.filter(item => item.type === 'event'));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();

    const timer = setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const currentEvents = events
    .filter(event => {
      if (!event.startsAt) return false;

      const start = Date.parse(event.startsAt);
      const end = event.endsAt
        ? Date.parse(event.endsAt)
        : start;

      return Number.isFinite(start) &&
        Number.isFinite(end) &&
        end >= now;
    })
    .sort((a, b) =>
      Date.parse(a.startsAt) - Date.parse(b.startsAt)
    );

  function formatDate(date) {
    if (!date) return '';

    return new Intl.DateTimeFormat('th-TH', {
      timeZone: 'Asia/Bangkok',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  return (
    <section style={{ marginTop: '0.5rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h2 className="section-title">
          <CalendarDays size={20} color="#eab308" />
          กิจกรรมของวัด
        </h2>

        <button
          type="button"
          onClick={loadEvents}
          disabled={loading}
          aria-label="โหลดกิจกรรมใหม่"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {loading && events.length === 0 && (
        <p>กำลังโหลดกิจกรรม...</p>
      )}

      {error && (
        <p style={{ color: '#b45309' }}>
          ไม่สามารถอัปเดตกิจกรรมจาก Facebook ได้ในขณะนี้
        </p>
      )}

      {!loading && currentEvents.length === 0 && (
        <p style={{
          textAlign: 'center',
          padding: '2rem',
          color: '#64748b'
        }}>
          ขณะนี้ยังไม่มีกิจกรรมที่กำลังจัดหรือกำลังจะมาถึง
        </p>
      )}

      {currentEvents.length > 0 && (
        <>
          <div className="embla" ref={emblaRef}>
            <div className="embla__container">
              {currentEvents.map(item => (
                <div className="embla__slide" key={item.id}>
                  <article className="embla__slide-card">
                    <EventImage
                      key={item.imageUrl}
                      src={item.imageUrl}
                      title={item.title}
                    />

                    <div className="embla__slide-content">
                      <span className="embla__slide-tag">
                        กิจกรรม
                      </span>

                      <h3 className="embla__slide-title">
                        {item.title}
                      </h3>

                      <p style={{ fontSize: '0.85rem' }}>
                        <CalendarDays size={14} style={{ display: 'inline' }} />
                        {' '}{formatDate(item.startsAt)} น.
                      </p>

                      {item.location && (
                        <p style={{ fontSize: '0.8rem' }}>
                          <MapPin size={14} style={{ display: 'inline' }} />
                          {' '}{item.location}
                        </p>
                      )}

                      {item.summary && (
                        <p style={{
                          fontSize: '0.82rem',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-line',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 3
                        }}>
                          {item.summary}
                        </p>
                      )}

                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#2563eb' }}
                        >
                          ดูรายละเอียดกิจกรรมบน Facebook
                        </a>
                      )}
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>

          {currentEvents.length > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              marginTop: '1rem'
            }}>
              <button type="button" onClick={() => emblaApi?.scrollPrev()}>
                ก่อนหน้า
              </button>
              <button type="button" onClick={() => emblaApi?.scrollNext()}>
                ถัดไป
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
