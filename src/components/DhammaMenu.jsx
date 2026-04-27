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
    <div className="dh-page">
      {/* ── Top Bar ── */}
      <div className="dh-topbar">
        <button onClick={onBack} className="dh-icon-btn">
          <ChevronLeft size={24} />
        </button>
        <h1 className="dh-heading" style={{ fontSize: '1.25rem' }}>Dhamma Sanctuary</h1>
        <button className="dh-icon-btn">
          <UserCircle size={24} />
        </button>
      </div>

      {/* ── Search Bar ── */}
      <div className="dh-glass dh-search-bar">
        <Search size={22} color="var(--dh-text-muted)" />
        <input 
          type="text" 
          placeholder="ค้นหาเสียงธรรม..." 
          className="dh-search-input"
        />
        <Mic size={22} color="var(--dh-primary)" />
      </div>

      {/* ── Popular Dhamma ── */}
      <div>
        <div className="dh-section-header">
          <h2 className="dh-heading">ยอดนิยม</h2>
          <span className="dh-subheading" style={{ cursor: 'pointer', marginBottom: 0 }}>ทั้งหมด &gt;</span>
        </div>
        
        <div className="dh-popular-row">
          {mixes.map(mix => (
            <div key={mix.id} className="dh-glass dh-popular-card" style={{ background: mix.bg }}>
              <div style={{ position: 'absolute', top: '10%', right: '-10%', opacity: 0.1 }}>
                <UserCircle size={100} color={mix.color} />
              </div>
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '0.65rem', fontWeight: '700', color: mix.color, marginBottom: '4px', letterSpacing: '0.5px' }}>{mix.tag}</div>
                <div className="dh-cat-title" style={{ color: 'var(--dh-text-main)', marginBottom: '4px' }}>{mix.title}</div>
                <div className="dh-cat-subtitle" style={{ color: 'var(--dh-text-muted)' }}>{mix.author}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Dhamma Categories ── */}
      <div>
        <div className="dh-section-header">
          <h2 className="dh-heading">หมวดหมู่เสียงธรรม</h2>
        </div>
        
        <div className="dh-category-grid">
          {DHAMMA_CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <div key={cat.id} onClick={() => onSelectCategory(cat)} className="dh-glass dh-cat-card">
                <Icon size={24} color="var(--dh-primary)" strokeWidth={1.5} />
                <div className="dh-cat-title">{cat.title}</div>
                <div className="dh-cat-subtitle">{cat.subtitle}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom Nav ── */}
      <div className="dh-bottom-nav">
        {[
          { icon: Home,    label: 'หน้าแรก', id: 'home', action: onBack },
          { icon: Search,  label: 'ค้นหา',   id: 'search' },
          { icon: Library, label: 'คลังสื่อ',    id: 'library' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); if (tab.action) tab.action(); }}
            className={`dh-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
          >
            <tab.icon size={26} fill={activeTab === tab.id ? 'currentColor' : 'none'} strokeWidth={activeTab === tab.id ? 2 : 1.5} />
            <span className="dh-nav-text">{tab.label}</span>
            <div className="dh-nav-dot" style={{ background: activeTab === tab.id ? 'var(--dh-primary)' : 'transparent' }} />
          </button>
        ))}
      </div>
    </div>
  );
}
