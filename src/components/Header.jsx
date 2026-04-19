import React from 'react';
import { ChevronLeft } from 'lucide-react';

// ฟอนต์หรูสำหรับชื่อวัด
const elegantFontLink = "https://fonts.googleapis.com/css2?family=Sarabun:wght@500;700&family=Prompt:wght@600&display=swap";

export default function Header({ onBack }) {
  return (
    <header className="header glass glass-card" style={{ position: 'relative' }}>
      {onBack && (
        <button 
          onClick={onBack}
          style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255, 255, 255, 0.6)',
            border: '1px solid rgba(255,255,255,1)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 10
          }}
        >
          <ChevronLeft size={20} color="var(--primary-dark)" />
        </button>
      )}
      <div className="header-logo" style={{ marginLeft: onBack ? '2.5rem' : '0', transition: 'margin 0.3s ease', display: 'flex', alignItems: 'center' }}>
        <img
          src="/logo.png"
          alt="โลโก้วัดหลวงพ่อสด"
          loading="lazy"
          decoding="async"
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
          onError={(e) => { 
            e.currentTarget.onerror = null; 
            e.currentTarget.src = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='100%25' height='100%25' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='24' fill='%2394a3b8' text-anchor='middle' dy='.3em'%3Eไม่มีรูปภาพ%3C/text%3E%3C/svg%3E"; 
            e.currentTarget.nextSibling.style.display = 'flex'; 
          }}
        />
        <span style={{ display: 'none', fontSize: '1.6rem', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>🛕</span>
      </div>
      <div className="header-text">
        <link rel="stylesheet" href={elegantFontLink} />
        <h1 style={{
          fontFamily: "'Sarabun', 'Prompt', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(0.95rem, 3.5vw, 1.35rem)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          letterSpacing: '0.02em',
          lineHeight: 1.2,
          color: 'var(--primary-dark)'
        }}>วัดหลวงพ่อสดธรรมกายาราม</h1>
        <p style={{
          fontFamily: "'Sarabun', sans-serif",
          fontWeight: 500,
          fontSize: 'clamp(0.68rem, 2.2vw, 0.85rem)',
          letterSpacing: '0.01em',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>สำนักปฏิบัติธรรมประจำจังหวัดราชบุรี แห่งที่ 1</p>
      </div>
    </header>
  );
}
