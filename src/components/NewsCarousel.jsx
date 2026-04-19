import React, { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Newspaper, Loader2, RefreshCw } from 'lucide-react';
import Papa from 'papaparse';

// ── Google Sheet (แท็บ "news") ─────────────────────────────────
// คอลัมน์ที่ต้องมีใน Sheet: title | tag | image | date | link
// เผยแพร่ Sheet → File → Share → Publish to web → CSV แล้วนำ URL มาวาง
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPZers8pjFy5zTEaUJlKc0-uG3o0DHxWsHhxI91Q4ZUMkhNAXCiURxF1jNEdgycnXEvB-y_QZIAfCY/pub?gid=1313998691&single=true&output=csv';

// Fallback ถ้า Sheet ยังไม่มีข้อมูล
const FALLBACK_NEWS = [
  { id: 1, image: 'https://images.unsplash.com/photo-1600028243685-611ac47c5df6?auto=format&fit=crop&q=80&w=800', tag: 'ประชาสัมพันธ์', title: 'ขอเชิญร่วมงานบุญทอดกฐินสามัคคี ประจำปี 2569', date: '', link: '' },
  { id: 2, image: 'https://images.unsplash.com/photo-1577903273180-87711ab4b914?auto=format&fit=crop&q=80&w=800', tag: 'กิจกรรม',      title: 'เปิดรับสมัครผู้เข้าปฏิบัติธรรม หลักสูตร 7 วัน', date: '', link: '' },
  { id: 3, image: 'https://images.unsplash.com/photo-1542646452-fefc90eb8eeb?auto=format&fit=crop&q=80&w=800', tag: 'ข่าวสาร',      title: 'โครงการปลูกป่าเฉลิมพระเกียรติ รอบบริเวณวัด', date: '', link: '' },
];

const TAG_COLORS = {
  'ประชาสัมพันธ์': '#eab308',
  'กิจกรรม':       '#f472b6',
  'ข่าวสาร':        '#0ea5e9',
  'ธรรมะ':          '#a78bfa',
  'นิมนต์':         '#f87171',
};
const tagColor = (tag) => TAG_COLORS[tag] || '#eab308';

export default function NewsCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  const fetchNews = () => {
    setLoading(true);
    Papa.parse(SHEET_URL, {
      download: true,
      header: true,
      complete: (r) => {
        const rows = r.data
          .filter(row => row.title && row.title.trim())
          .map((row, i) => ({
            id: i + 1,
            title: row.title?.trim() || '',
            tag:   row.tag?.trim()   || 'ประชาสัมพันธ์',
            image: row.image?.trim() || '',
            date:  row.date?.trim()  || '',
            link:  row.link?.trim()  || '',
          }));

        if (rows.length > 0) {
          setNews(rows);
          setUsingFallback(false);
        } else {
          setNews(FALLBACK_NEWS);
          setUsingFallback(true);
        }
        setLoading(false);
      },
      error: () => {
        setNews(FALLBACK_NEWS);
        setUsingFallback(true);
        setLoading(false);
      },
    });
  };

  useEffect(() => { fetchNews(); }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (!emblaApi || news.length <= 1) return;
    const interval = setInterval(() => emblaApi.scrollNext(), 4500);
    return () => clearInterval(interval);
  }, [emblaApi, news]);

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '0.5rem', marginBottom: '0.75rem' }}>
        <h2 className="section-title" style={{ margin: 0 }}>
          <Newspaper size={20} color="#eab308" />
          ข่าวประชาสัมพันธ์
        </h2>
        <button onClick={fetchNews} title="โหลดใหม่"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
          <RefreshCw size={15} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 0', gap: '0.5rem' }}>
          <Loader2 size={22} color="#eab308" style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>กำลังโหลดข่าว...</span>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : (
        <>
          <div className="embla" ref={emblaRef}>
            <div className="embla__container">
              {news.map((item) => (
                <div className="embla__slide" key={item.id}>
                  <div className="embla__slide-card"
                    onClick={() => item.link && window.open(item.link, '_blank')}
                    style={{ cursor: item.link ? 'pointer' : 'default' }}>
                    <div className="embla__slide-img-wrapper">
                      {item.image ? (
                        <img 
                          src={item.image.startsWith('http://') ? item.image.replace('http://', 'https://') : item.image} 
                          alt={item.title || "ข่าวประชาสัมพันธ์"}
                          loading="lazy"
                          decoding="async"
                          crossOrigin="anonymous"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}
                          onError={(e) => { 
                            e.currentTarget.onerror = null; 
                            e.currentTarget.src = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='100%25' height='100%25' fill='%23fef3c7'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='40' fill='%23d97706' text-anchor='middle' dy='.3em'%3E🛕%3C/text%3E%3C/svg%3E"; 
                            e.currentTarget.parentElement.style.background = '#fef3c7'; 
                          }} 
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#fef3c7,#fde68a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                          🛕
                        </div>
                      )}
                    </div>
                    <div className="embla__slide-content">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span className="embla__slide-tag" style={{ background: tagColor(item.tag) }}>
                          {item.tag}
                        </span>
                        {item.date && (
                          <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: '500' }}>{item.date}</span>
                        )}
                      </div>
                      <h3 className="embla__slide-title">{item.title}</h3>
                      {item.link && (
                        <span style={{ fontSize: '0.72rem', color: '#3b82f6', fontWeight: '600', marginTop: '0.25rem', display: 'block' }}>
                          อ่านเพิ่มเติม →
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dot indicators */}
          {news.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '0.75rem' }}>
              {news.map((_, i) => (
                <div key={i} onClick={() => emblaApi?.scrollTo(i)}
                  style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#eab308', opacity: 0.4, cursor: 'pointer', transition: 'opacity 0.2s' }}
                  onMouseEnter={e => e.target.style.opacity = 1}
                  onMouseLeave={e => e.target.style.opacity = 0.4}
                />
              ))}
            </div>
          )}

          {usingFallback && (
            <p style={{ textAlign: 'center', fontSize: '0.65rem', color: '#cbd5e1', marginTop: '0.5rem' }}>
              * กำลังแสดงข้อมูลตัวอย่าง — เพิ่มข้อมูลใน Google Sheets เพื่อแสดงข่าวจริง
            </p>
          )}
        </>
      )}
    </div>
  );
}
