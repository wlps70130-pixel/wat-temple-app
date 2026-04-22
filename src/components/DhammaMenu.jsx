import React, { useState } from 'react';
import { BookOpen, UserCircle, Mic2, Headphones, Home, Search, Library, Menu, Mic, ChevronRight, Sun, Book } from 'lucide-react';

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
      bg: 'linear-gradient(to bottom, #4a3424, #1a120c)'
    },
    { 
      id: 'mix2', 
      title: 'Finding Inner Peace', 
      tag: 'DHAMMA TALK', 
      author: 'Luang Por',
      bg: 'linear-gradient(to bottom, #2b3a42, #0d1215)'
    },
    { 
      id: 'mix3', 
      title: 'Guided Samatha', 
      tag: 'MEDITATION', 
      author: 'Wat Luang Phor Sodh',
      bg: 'linear-gradient(to bottom, #402c44, #130d14)'
    }
  ];

  return (
    <div style={{
      background: '#0f0f0f',
      color: '#ffffff',
      margin: 'calc(-1 * var(--content-pad))',
      minHeight: '100vh',
      fontFamily: "'Inter', 'Prompt', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: '80px',
      overflowY: 'auto',
    }}>

      {/* ── Top Bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 1.2rem 0' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e2bb53', display: 'flex', padding: 0 }}>
          <Menu size={24} />
        </button>
        <h1 style={{ fontSize: '1.1rem', fontWeight: '500', color: '#e2bb53', margin: 0, letterSpacing: '0.5px' }}>Dhamma Sanctuary</h1>
        <button style={{ background: '#1c1c1e', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#e2bb53' }}>
          <UserCircle size={20} />
        </button>
      </div>

      {/* ── Search Bar ── */}
      <div style={{ padding: '1.5rem 1.2rem 0' }}>
        <div style={{
          background: '#1c1c1e',
          borderRadius: '24px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1rem',
          gap: '0.75rem',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <Search size={20} color="#8e8e93" />
          <input 
            type="text" 
            placeholder="Search teachings, chants, ..." 
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#fff',
              outline: 'none',
              fontSize: '0.95rem',
              fontFamily: 'inherit'
            }}
          />
          <Mic size={20} color="#8e8e93" />
        </div>
      </div>

      {/* ── Popular Dhamma ── */}
      <div style={{ padding: '2rem 0 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 1.2rem', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '600', margin: 0 }}>Popular Dhamma</h2>
          <span style={{ fontSize: '0.7rem', color: '#e2bb53', cursor: 'pointer', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>VIEW ALL &gt;</span>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '0 1.2rem', scrollbarWidth: 'none' }}>
          {mixes.map(mix => (
            <div key={mix.id} style={{ 
              flexShrink: 0, 
              width: '180px', 
              height: '220px', 
              borderRadius: '12px', 
              background: mix.bg, 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '1rem', 
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Fake icon to replace illustration */}
              <div style={{ position: 'absolute', top: '10%', right: '-10%', opacity: 0.1 }}>
                <UserCircle size={150} color="#fff" />
              </div>
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#e2bb53', marginBottom: '4px', letterSpacing: '1px', textTransform: 'uppercase' }}>{mix.tag}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#fff', marginBottom: '4px', lineHeight: 1.2 }}>{mix.title}</div>
                <div style={{ fontSize: '0.8rem', color: '#999' }}>{mix.author}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Dhamma Categories ── */}
      <div style={{ padding: '2rem 0 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1.2rem', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '600', margin: 0 }}>Dhamma Categories</h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0 1.2rem' }}>
          {DHAMMA_CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem', 
                  padding: '0.75rem', 
                  cursor: 'pointer', 
                  borderRadius: '12px', 
                  background: '#1c1c1e',
                  border: '1px solid rgba(255,255,255,0.03)',
                  transition: 'background 0.15s' 
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#252528'}
                onMouseLeave={e => e.currentTarget.style.background = '#1c1c1e'}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={24} color="#e2bb53" strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '1rem', fontWeight: '500', color: '#fff', marginBottom: '2px' }}>{cat.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.subtitle}</div>
                </div>
                <ChevronRight size={20} color="#555" />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom Nav ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 'var(--app-max-width)',
        background: '#121212', borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '0.75rem 0', paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
        zIndex: 50,
      }}>
        {[
          { icon: Home,    label: 'Home', id: 'home', action: onBack },
          { icon: Search,  label: 'Search',   id: 'search' },
          { icon: Library, label: 'Library',    id: 'library' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); if (tab.action) tab.action(); }}
            style={{ 
              background: 'none', border: 'none', cursor: 'pointer', 
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', 
              padding: '0 1rem', 
              color: activeTab === tab.id ? '#e2bb53' : '#666' 
            }}
          >
            <tab.icon size={24} fill={activeTab === tab.id ? 'currentColor' : 'none'} strokeWidth={activeTab === tab.id ? 2 : 1.5} />
            <span style={{ fontSize: '0.65rem', fontWeight: '500' }}>{tab.label}</span>
            {/* Active Indicator Dot */}
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: activeTab === tab.id ? '#e2bb53' : 'transparent', marginTop: '2px' }} />
          </button>
        ))}
      </div>
    </div>
  );
}

