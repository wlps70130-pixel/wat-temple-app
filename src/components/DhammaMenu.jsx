import React from 'react';
import { BookOpen, UserCircle, Mic2, PlayCircle, Headphones } from 'lucide-react';

const DHAMMA_CATEGORIES = [
  {
    id: 'tripitaka',
    title: 'พระไตรปิฎก',
    subtitle: 'เสียงอ่านพระไตรปิฎก',
    icon: BookOpen,
    color: '#3b82f6', // blue
    bgGradient: 'linear-gradient(135deg, #1e3a8a, #3b82f6)'
  },
  {
    id: 'luangpu',
    title: 'พระมงคลเทพมุนี',
    subtitle: 'หลวงปู่วัดปากน้ำ ภาษีเจริญ',
    icon: UserCircle,
    color: '#f59e0b', // amber
    bgGradient: 'linear-gradient(135deg, #b45309, #f59e0b)'
  },
  {
    id: 'luangpor-veera',
    title: 'พระราชพรหมเถร',
    subtitle: 'หลวงพ่อวีระ ธีรงฺกุโร',
    icon: Mic2,
    color: '#ec4899', // pink/magenta
    bgGradient: 'linear-gradient(135deg, #be185d, #ec4899)'
  },
  {
    id: 'luangpor-soemchai',
    title: 'พระเทพญาณมงคล',
    subtitle: 'หลวงป๋า เสริมชัย ชยมงฺคโล',
    icon: Mic2,
    color: '#8b5cf6', // purple
    bgGradient: 'linear-gradient(135deg, #5b21b6, #8b5cf6)'
  },
  {
    id: 'chanting',
    title: 'บทสวดมนต์',
    subtitle: 'เสียงนำสวด ทำวัตรเช้า-เย็น',
    icon: BookOpen,
    color: '#10b981', // emerald
    bgGradient: 'linear-gradient(135deg, #047857, #10b981)'
  }
];

export default function DhammaMenu({ onSelectCategory }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
      <h2 className="section-title" style={{ paddingLeft: '0.5rem' }}>
        <Headphones size={24} color="#f472b6" />
        หมวดหมู่เสียงธรรม
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {DHAMMA_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <div 
              key={cat.id}
              onClick={() => onSelectCategory(cat)}
              className="glass glass-card"
              style={{ 
                padding: '0', 
                overflow: 'hidden', 
                cursor: 'pointer',
                display: 'flex',
                border: 'none',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ 
                width: '100px', 
                background: cat.bgGradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <Icon size={40} strokeWidth={1.5} />
              </div>
              <div style={{ 
                flex: 1, 
                padding: '1.25rem 1rem', 
                background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                  {cat.title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {cat.subtitle}
                </p>
                <div style={{ position: 'absolute', right: '1rem', bottom: '1rem', opacity: 0.1 }}>
                  <PlayCircle size={48} color={cat.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
