import React from 'react';
import { BookOpen, UserCircle, Mic2, PlayCircle, Headphones, ChevronLeft } from 'lucide-react';

const DHAMMA_CATEGORIES = [
  {
    id: 'tripitaka',
    title: 'พระไตรปิฎก',
    subtitle: 'เสียงอ่านพระไตรปิฎก',
    icon: BookOpen,
    color: '#3b82f6', // blue
    bgGradient: 'linear-gradient(135deg, #1e3a8a, #0f172a)'
  },
  {
    id: 'luangpu',
    title: 'พระมงคลเทพมุนี',
    subtitle: 'หลวงปู่วัดปากน้ำ ภาษีเจริญ',
    icon: UserCircle,
    color: '#f59e0b', // amber
    bgGradient: 'linear-gradient(135deg, #b45309, #451a03)'
  },
  {
    id: 'luangpor-veera',
    title: 'พระราชพรหมเถร',
    subtitle: 'หลวงพ่อวีระ ธีรงฺกุโร',
    icon: Mic2,
    color: '#ec4899', // pink
    bgGradient: 'linear-gradient(135deg, #9d174d, #4c0519)'
  },
  {
    id: 'luangpor-soemchai',
    title: 'พระเทพญาณมงคล',
    subtitle: 'หลวงป๋า เสริมชัย ชยมงฺคโล',
    icon: Mic2,
    color: '#8b5cf6', // purple
    bgGradient: 'linear-gradient(135deg, #5b21b6, #2e1065)'
  },
  {
    id: 'chanting',
    title: 'บทสวดมนต์',
    subtitle: 'ทำวัตรเช้า-เย็น',
    icon: BookOpen,
    color: '#10b981', // emerald
    bgGradient: 'linear-gradient(135deg, #047857, #022c22)'
  }
];

export default function DhammaMenu({ onSelectCategory, onBack }) {
  return (
    <div style={{
      background: '#030303', // YTM Dark pitch black
      color: '#ffffff',
      margin: 'calc(-1 * var(--content-pad))',
      padding: 'var(--content-pad)',
      paddingTop: '3rem',
      minHeight: '100vh',
      fontFamily: "'Roboto', 'Prompt', sans-serif",
      paddingBottom: '100px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        {onBack && (
          <button 
            onClick={onBack}
            style={{
              background: 'transparent', border: 'none', color: 'white',
              cursor: 'pointer', display: 'flex', alignItems: 'center'
            }}
          >
            <ChevronLeft size={28} />
          </button>
        )}
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
          <Headphones size={28} color="#f472b6" />
          ฟังธรรม
        </h2>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '1rem'
      }}>
        {DHAMMA_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <div 
              key={cat.id}
              onClick={() => onSelectCategory(cat)}
              style={{ 
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ 
                width: '100%',
                aspectRatio: '1',
                borderRadius: '8px',
                background: cat.bgGradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <Icon size={64} strokeWidth={1} opacity={0.9} />
                <div style={{ 
                  position: 'absolute', right: '8px', bottom: '8px', 
                  background: 'rgba(0,0,0,0.4)', borderRadius: '50%', padding: '4px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <PlayCircle size={20} color="white" />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '2px', lineHeight: 1.2 }}>
                  {cat.title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#aaaaaa', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {cat.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
