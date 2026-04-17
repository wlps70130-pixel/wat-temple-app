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
      <div className="header-logo" style={{ marginLeft: onBack ? '2.5rem' : '0', transition: 'margin 0.3s ease' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 14 4-4"/>
          <path d="M3.34 19a10 10 0 1 1 17.32 0"/>
          <path d="m14 12-4-4"/>
          <path d="M12 20v-8"/>
          <path d="m8 12 4-4"/>
        </svg>
      </div>
      <div className="header-text">
        <h1>วัดหลวงพ่อสด<br/>ธรรมกายาราม</h1>
        <p>สำนักปฏิบัติธรรมประจำจังหวัดราชบุรี แห่งที่ 1</p>
      </div>
    </header>
  );
}
