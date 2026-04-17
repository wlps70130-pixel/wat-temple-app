import React, { useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Newspaper } from 'lucide-react';

const MOCK_NEWS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1600028243685-611ac47c5df6?auto=format&fit=crop&q=80&w=800',
    tag: 'ประชาสัมพันธ์',
    title: 'ขอเชิญร่วมงานบุญทอดกฐินสามัคคี ประจำปี 2569'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1577903273180-87711ab4b914?auto=format&fit=crop&q=80&w=800',
    tag: 'กิจกรรม',
    title: 'เปิดรับสมัครผู้เข้าปฏิบัติธรรม หลักสูตร 7 วัน'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1542646452-fefc90eb8eeb?auto=format&fit=crop&q=80&w=800',
    tag: 'ข่าวสาร',
    title: 'โครงการปลูกป่าเฉลิมพระเกียรติ รอบบริเวณวัด'
  }
];

export default function NewsCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  useEffect(() => {
    if (emblaApi) {
      // Auto play roughly every 4 seconds
      const interval = setInterval(() => {
        emblaApi.scrollNext();
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [emblaApi]);

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <h2 className="section-title" style={{ paddingLeft: '0.5rem' }}>
        <Newspaper size={20} color="#eab308" />
        ข่าวประชาสัมพันธ์
      </h2>
      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {MOCK_NEWS.map((news) => (
            <div className="embla__slide" key={news.id}>
              <div className="embla__slide-card">
                <div className="embla__slide-img-wrapper">
                  <img src={news.image} alt={news.title} />
                </div>
                <div className="embla__slide-content">
                  <span className="embla__slide-tag">{news.tag}</span>
                  <h3 className="embla__slide-title">{news.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
