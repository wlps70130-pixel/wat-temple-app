import React, { useState } from 'react';
import { BookOpen, UserCircle, Mic2, Headphones, Home, Search, Library, Menu, Mic, ChevronRight, Book } from 'lucide-react';

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
      bg: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
      color: '#0284c7'
    },
    { 
      id: 'mix2', 
      title: 'Finding Inner Peace', 
      tag: 'DHAMMA TALK', 
      author: 'Luang Por',
      bg: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
      color: '#0ea5e9'
    },
    { 
      id: 'mix3', 
      title: 'Guided Samatha', 
      tag: 'MEDITATION', 
      author: 'Wat Luang Phor Sodh',
      bg: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
      color: '#3b82f6'
    }
  ];

  return (
    <div style={{
      background: '#f4f9fc',
      color: '#0f172a',
      margin: 'calc(-1 * var(--content-pad))',
      minHeight: '100vh',
      fontFamily: "'Prompt', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: '80px',
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>

      {/* ── Top Bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 1.2rem 0' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0f172a', display: 'flex', padding: 0 }}>
          <Menu size={28} />
        </button>
        <h1 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0ea5e9', margin: 0, letterSpacing: '0.5px' }}>Dhamma Sanctuary</h1>
        <button style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#0ea5e9', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <UserCircle size={22} />
        </button>
      </div>

      {/* ── Search Bar ── */}
      <div style={{ padding: '1.5rem 1.2rem 0' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          height: '52px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1.2rem',
          gap: '0.75rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <Search size={22} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search teachings, chants, ..." 
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#0f172a',
              outline: 'none',
              fontSize: '1rem',
              fontFamily: 'inherit'
            }}
          />
          <Mic size={22} color="#0ea5e9" />
        </div>
      </div>

      {/* ── Popular Dhamma ── */}
      <div style={{ padding: '2rem 0 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 1.2rem', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', margin: 0, color: '#0f172a' }}>Popular Dhamma</h2>
          <span style={{ fontSize: '0.8rem', color: '#0ea5e9', cursor: 'pointer', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>VIEW ALL &gt;</span>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '0 1.2rem', scrollbarWidth: 'none', paddingBottom: '1rem' }}>
          {mixes.map(mix => (
            <div key={mix.id} style={{ 
              flexShrink: 0, 
              width: '200px', 
              height: '240px', 
              borderRadius: '16px', 
              background: mix.bg, 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '1.2rem', 
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.6)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(14,165,233,0.15)'
            }}>
              {/* Fake icon to replace illustration */}
              <div style={{ position: 'absolute', top: '10%', right: '-10%', opacity: 0.1 }}>
                <UserCircle size={150} color={mix.color} />
              </div>
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: mix.color, marginBottom: '6px', letterSpacing: '1px', textTransform: 'uppercase' }}>{mix.tag}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px', lineHeight: 1.2 }}>{mix.title}</div>
                <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '500' }}>{mix.author}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Dhamma Categories ── */}
      <div style={{ padding: '1rem 0 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1.2rem', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', margin: 0, color: '#0f172a' }}>Dhamma Categories</h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: '0 1.2rem' }}>
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
                  padding: '1rem', 
                  cursor: 'pointer', 
                  borderRadius: '16px', 
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                  transition: 'transform 0.15s, box-shadow 0.15s' 
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(14,165,233,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)'; }}
              >
                <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={28} color="#0ea5e9" strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0f172a', marginBottom: '2px' }}>{cat.title}</div>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.subtitle}</div>
                </div>
                <ChevronRight size={24} color="#cbd5e1" />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom Nav ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 'var(--app-max-width)',
        background: '#ffffff', borderTop: '1px solid #e2e8f0',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '0.75rem 0', paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
        zIndex: 50,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'
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
              color: activeTab === tab.id ? '#0ea5e9' : '#94a3b8' 
            }}
          >
            <tab.icon size={26} fill={activeTab === tab.id ? 'currentColor' : 'none'} strokeWidth={activeTab === tab.id ? 2 : 1.5} />
            <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{tab.label}</span>
            {/* Active Indicator Dot */}
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: activeTab === tab.id ? '#0ea5e9' : 'transparent', marginTop: '2px' }} />
          </button>
        ))}
      </div>
    </div>
  );
}
