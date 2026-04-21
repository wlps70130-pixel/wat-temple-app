import React, { useState } from 'react';
import { BookOpen, UserCircle, Mic2, Headphones, Home, Search, Library, Bell, Clock, Settings, ChevronRight } from 'lucide-react';

const DHAMMA_CATEGORIES = [
  { id: 'tripitaka',        title: 'พระไตรปิฎก',       icon: BookOpen,    color: '#5038a0', bg: 'linear-gradient(135deg,#5038a0,#2d1b6b)' },
  { id: 'luangpu',          title: 'พระมงคลเทพมุนี',    icon: UserCircle,  color: '#c87533', bg: 'linear-gradient(135deg,#c87533,#7a4010)' },
  { id: 'luangpor-veera',   title: 'พระราชพรหมเถร',     icon: Mic2,        color: '#bc5090', bg: 'linear-gradient(135deg,#bc5090,#6a1040)' },
  { id: 'luangpor-soemchai',title: 'พระเทพญาณมงคล',     icon: Mic2,        color: '#58508d', bg: 'linear-gradient(135deg,#58508d,#2e2650)' },
  { id: 'chanting',         title: 'บทสวดมนต์',         icon: BookOpen,    color: '#1e8449', bg: 'linear-gradient(135deg,#1e8449,#0b4020)' },
  { id: 'meditation',       title: 'กัมมัฏฐาน',          icon: Headphones,  color: '#1a6b9a', bg: 'linear-gradient(135deg,#1a6b9a,#0a3050)' },
];

// Time-based greeting
const getGreeting = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'สวัสดีตอนเช้า';
  if (h >= 12 && h < 17) return 'สวัสดีตอนบ่าย';
  return 'สวัสดีตอนเย็น';
};

export default function DhammaMenu({ onSelectCategory, onBack }) {
  const [activeTab, setActiveTab] = useState('home');
  const [filter, setFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'music', label: 'ธรรมะ' },
    { id: 'chanting', label: 'บทสวด' },
  ];

  // Recent/Quick shortcuts (top 6 shown as 2-column grid)
  const shortcuts = DHAMMA_CATEGORIES.slice(0, 6);

  // "Top Mixes" for horizontal scroll section
  const mixes = [
    { id: 'mix1', title: 'Daily Dhamma Mix',     subtitle: 'หลวงปู่ หลวงพ่อ รวมธรรมะ',  color: '#e63946', bg: 'linear-gradient(145deg,#e63946,#9b1d1d)' },
    { id: 'mix2', title: 'Morning Chants',        subtitle: 'ทำวัตรเช้า สวดมนต์',          color: '#2a9d8f', bg: 'linear-gradient(145deg,#2a9d8f,#115c55)' },
    { id: 'mix3', title: 'Meditation Playlist',   subtitle: 'กัมมัฏฐาน ภาวนา',             color: '#e9c46a', bg: 'linear-gradient(145deg,#9c7a00,#e9c46a)' },
    { id: 'mix4', title: 'Tripitaka Readings',    subtitle: 'พระไตรปิฎก บาลี',             color: '#6a4c93', bg: 'linear-gradient(145deg,#6a4c93,#2d1f40)' },
  ];

  return (
    <div style={{
      background: '#121212',
      color: '#ffffff',
      margin: 'calc(-1 * var(--content-pad))',
      minHeight: '100vh',
      fontFamily: "'Circular', 'Prompt', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: '80px',
      overflowY: 'auto',
    }}>

      {/* ── Top Bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 1.2rem 0' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', margin: 0 }}>{getGreeting()}</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[Bell, Clock, Settings].map((Icon, i) => (
            <button key={i} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
              <Icon size={18} />
            </button>
          ))}
        </div>
      </div>

      {/* ── Filter Pills ── */}
      <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem 1.2rem 0', flexWrap: 'nowrap', overflowX: 'auto' }}>
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: '0.4rem 1rem', borderRadius: '20px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600', fontSize: '0.85rem', flexShrink: 0,
              background: filter === f.id ? '#1db954' : 'rgba(255,255,255,0.1)',
              color: filter === f.id ? '#000' : '#fff',
              transition: 'all 0.2s',
            }}
          >{f.label}</button>
        ))}
      </div>

      {/* ── Quick Shortcuts (2-column grid) ── */}
      <div style={{ padding: '1rem 1.2rem 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {shortcuts.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#fff',
                  overflow: 'hidden', height: '52px', transition: 'background 0.15s', textAlign: 'left',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                {/* Colored icon block (left side) */}
                <div style={{ width: '52px', height: '52px', background: cat.bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px 0 0 4px' }}>
                  <Icon size={22} color="white" />
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', lineHeight: 1.2, paddingRight: '0.5rem' }}>{cat.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Your Top Mixes ── */}
      <div style={{ padding: '1.5rem 0 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1.2rem', marginBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>มิกซ์ยอดนิยม</h2>
          <span style={{ fontSize: '0.8rem', color: '#b3b3b3', cursor: 'pointer', fontWeight: '600' }}>ดูทั้งหมด</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '0 1.2rem', scrollbarWidth: 'none' }}>
          {mixes.map(mix => (
            <div key={mix.id} style={{ flexShrink: 0, width: '155px', cursor: 'pointer' }}>
              <div style={{ width: '155px', height: '155px', borderRadius: '8px', background: mix.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', fontSize: '3rem' }}>
                🛕
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mix.title}</div>
              <div style={{ fontSize: '0.75rem', color: '#b3b3b3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mix.subtitle}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── More Categories ── */}
      <div style={{ padding: '1.5rem 0 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1.2rem', marginBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>หมวดหมู่เสียงธรรม</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0 1.2rem' }}>
          {DHAMMA_CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat)}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.65rem 0.5rem', cursor: 'pointer', borderRadius: '6px', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '6px', background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={22} color="white" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#fff', marginBottom: '2px' }}>{cat.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#b3b3b3' }}>Playlist</div>
                </div>
                <ChevronRight size={18} color="#555" />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom Nav (Spotify-style) ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 'var(--app-max-width)',
        background: '#121212', borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '0.6rem 0', paddingBottom: 'calc(0.6rem + env(safe-area-inset-bottom))',
        zIndex: 50,
      }}>
        {[
          { icon: Home,    label: 'หน้าหลัก', id: 'home', action: onBack },
          { icon: Search,  label: 'ค้นหา',   id: 'search' },
          { icon: Library, label: 'คลัง',    id: 'library' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); if (tab.action) tab.action(); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '0.25rem 1rem', color: activeTab === tab.id ? '#ffffff' : '#b3b3b3' }}
          >
            <tab.icon size={22} fill={activeTab === tab.id ? 'currentColor' : 'none'} />
            <span style={{ fontSize: '0.65rem', fontWeight: '600' }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
