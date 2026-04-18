import React from 'react';
import { ChevronLeft } from 'lucide-react';

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
        <img src="/logo.png" alt="โลโก้วัดหลวงพ่อสด" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)' }} />
      </div>
      <div className="header-text">
        <h1>วัดหลวงพ่อสด<br/>ธรรมกายาราม</h1>
        <p>สำนักปฏิบัติธรรมประจำจังหวัดราชบุรี แห่งที่ 1</p>
      </div>
    </header>
  );
}
