import React, { useState } from 'react';
import { BookOpen, UserCircle, Mic2, Headphones, Home, Search, Library, Menu, Mic, ChevronRight, Book, ChevronLeft } from 'lucide-react';

const DHAMMA_CATEGORIES = [
  { id: 'tripitaka',        title: 'Tripitaka Core',        subtitle: 'พระไตรปิฎก และคัมภีร์สำคัญ',         icon: BookOpen },
  { id: 'luangpu',          title: 'Luangpu Teachings',     subtitle: 'พระมงคลเทพมุนี (สด จนฺทสโร)',        icon: UserCircle },
  { id: 'luangpor-soemchai',title: 'Advanced Practice',     subtitle: 'พระเทพญาณมงคล (เสริมชัย ชยมงฺคโล)',    icon: Mic2 },
  { id: 'luangpor-veera',   title: 'Dhamma Talks',          subtitle: 'พระราชพรหมเถร (วีระ คณุตฺตโม)',        icon: Mic2 },
  { id: 'meditation',       title: 'Meditation Practice',   subtitle: 'กัมมัฏฐาน วิชชาธรรมกาย',              icon: Headphones },
  { id: 'chanting',         title: 'Daily Chanting',        subtitle: 'บทสวดมนต์ ทำวัตรเช้า-เย็น',            icon: Book },
];

export default function DhammaMenu({ onSelectCategory, onBack }) {
  const [activeTab, setActiveTab] = useState('home');

  const mixes = [
    { 
      id: 'mix1', 
      title: 'Metta Sutta Recitation', 
      tag: 'MORNING CHANT', 
      author: 'Ven. Ajahn Chah',
      bg: 'linear-gradient(135deg, #fef3c7, #fde68a)',
      color: '#d97706'
    },
    { 
      id: 'mix2', 
      title: 'Finding Inner Peace', 
      tag: 'DHAMMA TALK', 
      author: 'Luang Por',
      bg: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
      color: '#0284c7'
    },
    { 
      id: 'mix3', 
      title: 'Guided Samatha', 
      tag: 'MEDITATION', 
      author: 'Wat Luang Phor Sodh',
      bg: 'linear-gradient(135deg, #ffedd5, #fed7aa)',
      color: '#c2410c'
    }
  ];

  return (
    <div style={{
      color: 'var(--text-main)',
      minHeight: '100vh',
      fontFamily: "'Prompt', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: '80px',
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>

      {/* ── Top Bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.5rem 0.5rem', marginBottom: '0.5rem' }}>
        <button onClick={onBack} className="glass" style={{ border: '1px solid var(--glass-border)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--primary-dark)', padding: 0 }}>
          <ChevronLeft size={24} />
        </button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary-dark)', margin: 0, letterSpacing: '0.5px' }}>Dhamma Sanctuary</h1>
        <button className="glass" style={{ border: '1px solid var(--glass-border)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--primary-dark)' }}>
          <UserCircle size={24} />
        </button>
      </div>

      {/* ── Search Bar ── */}
      <div style={{ padding: '0 0.5rem' }}>
        <div className="glass" style={{
          height: '52px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1.2rem',
          gap: '0.75rem',
          borderRadius: '26px'
        }}>
          <Search size={22} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="ค้นหาเสียงธรรม..." 
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              outline: 'none',
              fontSize: '1rem',
              fontFamily: 'inherit'
            }}
          />
          <Mic size={22} color="var(--primary-dark)" />
        </div>
      </div>

      {/* ── Popular Dhamma ── */}
      <div style={{ padding: '1.5rem 0 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 0.5rem', marginBottom: '0.75rem' }}>
          <h2 className="section-title" style={{ margin: 0, color: 'var(--text-main)' }}>ยอดนิยม</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--primary-dark)', cursor: 'pointer', fontWeight: '600', letterSpacing: '0.5px' }}>ทั้งหมด &gt;</span>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '0 0.5rem', scrollbarWidth: 'none', paddingBottom: '1rem' }}>
          {mixes.map(mix => (
            <div key={mix.id} style={{ 
              flexShrink: 0, 
              width: '200px', 
              height: '240px', 
              borderRadius: 'var(--card-radius)', 
              background: mix.bg, 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '1.2rem', 
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.6)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'var(--glass-shadow)'
            }}>
              <div style={{ position: 'absolute', top: '10%', right: '-10%', opacity: 0.1 }}>
                <UserCircle size={150} color={mix.color} />
              </div>
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: mix.color, marginBottom: '6px', letterSpacing: '1px' }}>{mix.tag}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px', lineHeight: 1.2 }}>{mix.title}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>{mix.author}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Dhamma Categories ── */}
      <div style={{ padding: '1rem 0 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem', marginBottom: '0.75rem' }}>
          <h2 className="section-title" style={{ margin: 0, color: 'var(--text-main)' }}>หมวดหมู่เสียงธรรม</h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: '0 0.5rem' }}>
          {DHAMMA_CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat)}
                className="glass"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem', 
                  padding: '1rem', 
                  cursor: 'pointer', 
                  transition: 'transform 0.15s' 
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(234, 179, 8, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={26} color="var(--primary-dark)" strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '2px' }}>{cat.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.subtitle}</div>
                </div>
                <ChevronRight size={24} color="var(--text-muted)" style={{ opacity: 0.5 }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom Nav ── */}
      <div className="glass" style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 'var(--app-max-width)',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '0.75rem 0', paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
        zIndex: 50,
        borderRadius: '20px 20px 0 0',
      }}>
        {[
          { icon: Home,    label: 'หน้าแรก', id: 'home', action: onBack },
          { icon: Search,  label: 'ค้นหา',   id: 'search' },
          { icon: Library, label: 'คลังสื่อ',    id: 'library' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); if (tab.action) tab.action(); }}
            style={{ 
              background: 'none', border: 'none', cursor: 'pointer', 
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', 
              padding: '0 1rem', 
              color: activeTab === tab.id ? 'var(--primary-dark)' : 'var(--text-muted)' 
            }}
          >
            <tab.icon size={26} fill={activeTab === tab.id ? 'currentColor' : 'none'} strokeWidth={activeTab === tab.id ? 2 : 1.5} />
            <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{tab.label}</span>
            {/* Active Indicator Dot */}
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: activeTab === tab.id ? 'var(--primary-dark)' : 'transparent', marginTop: '2px' }} />
          </button>
        ))}
      </div>
    </div>
  );
}
