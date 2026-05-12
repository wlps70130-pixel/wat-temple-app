import React, { useMemo, useState } from 'react';
import {
  Book,
  BookOpen,
  ChevronLeft,
  Headphones,
  Home,
  Library,
  Mic,
  Mic2,
  Music2,
  Play,
  Radio,
  Search,
  UserCircle,
} from 'lucide-react';

const DHAMMA_CATEGORIES = [
  {
    id: 'tripitaka',
    title: 'พระไตรปิฎกและคัมภีร์',
    subtitle: 'แก่นคำสอนจากพระไตรปิฎกและคัมภีร์สำคัญ',
    icon: BookOpen,
    color: '#38bdf8',
    bgGradient: 'linear-gradient(135deg, #0ea5e9, #1d4ed8)',
  },
  {
    id: 'luangpu',
    title: 'หลวงปู่สด',
    subtitle: 'พระมงคลเทพมุนี (สด จนฺทสโร)',
    icon: UserCircle,
    color: '#facc15',
    bgGradient: 'linear-gradient(135deg, #f59e0b, #b45309)',
  },
  {
    id: 'luangpor-soemchai',
    title: 'ภาคปฏิบัติขั้นสูง',
    subtitle: 'พระเทพญาณมงคล (เสริมชัย ชยมงฺคโล)',
    icon: Mic2,
    color: '#34d399',
    bgGradient: 'linear-gradient(135deg, #10b981, #047857)',
  },
  {
    id: 'luangpor-veera',
    title: 'พระธรรมเทศนา',
    subtitle: 'พระราชพรหมเถร (วีระ คณุตฺตโม)',
    icon: Mic2,
    color: '#a78bfa',
    bgGradient: 'linear-gradient(135deg, #8b5cf6, #5b21b6)',
  },
  {
    id: 'meditation',
    title: 'เจริญภาวนา',
    subtitle: 'กัมมัฏฐาน วิชชาธรรมกาย และแนวปฏิบัติ',
    icon: Headphones,
    color: '#fb7185',
    bgGradient: 'linear-gradient(135deg, #f43f5e, #be123c)',
  },
  {
    id: 'chanting',
    title: 'บทสวดมนต์',
    subtitle: 'ทำวัตรเช้า ทำวัตรเย็น และบทสวดประจำวัน',
    icon: Book,
    color: '#22c55e',
    bgGradient: 'linear-gradient(135deg, #22c55e, #15803d)',
  },
];

const FEATURED_MIXES = [
  {
    categoryId: 'chanting',
    title: 'ทำวัตรเช้า',
    tag: 'สวดมนต์',
    desc: 'เปิดฟังต่อเนื่องช่วงเช้า',
    icon: Radio,
  },
  {
    categoryId: 'luangpu',
    title: 'คำสอนหลวงปู่สด',
    tag: 'ยอดนิยม',
    desc: 'รวมเสียงธรรมที่เปิดฟังบ่อย',
    icon: UserCircle,
  },
  {
    categoryId: 'meditation',
    title: 'นั่งสมาธิ',
    tag: 'ภาวนา',
    desc: 'เสียงนำใจให้สงบ ใช้ฟังก่อนปฏิบัติ',
    icon: Headphones,
  },
];

export default function DhammaMenu({ onSelectCategory, onBack }) {
  const [activeTab, setActiveTab] = useState('home');
  const [query, setQuery] = useState('');

  const filteredCategories = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return DHAMMA_CATEGORIES;
    return DHAMMA_CATEGORIES.filter((cat) =>
      `${cat.title} ${cat.subtitle}`.toLowerCase().includes(keyword)
    );
  }, [query]);

  const openFeatured = (mix) => {
    const category = DHAMMA_CATEGORIES.find((cat) => cat.id === mix.categoryId);
    if (category) onSelectCategory(category);
  };

  return (
    <div className="dh-page dh-home-page">
      <div className="dh-topbar">
        <button onClick={onBack} className="dh-icon-btn" aria-label="กลับหน้าหลัก">
          <ChevronLeft size={24} />
        </button>
        <div className="dh-topbar-title">
          <span>คลังเสียงธรรม</span>
          <small>ฟังต่อเนื่อง ไม่มีโฆษณา</small>
        </div>
        <button className="dh-icon-btn" aria-label="คลังรายการโปรด">
          <Library size={23} />
        </button>
      </div>

      <section className="dh-listen-hero">
        <div className="dh-hero-copy">
          <span className="dh-kicker">Wat Luang Phor Sodh</span>
          <h1>ฟังธรรมได้ง่าย เหมือนเปิดเพลง</h1>
          <p>เลือกหมวด กดเล่น แล้วฟังต่อเนื่องได้ทันที พร้อมแถบเล่นด้านล่างและคิวรายการถัดไป</p>
        </div>
        <div className="dh-hero-artwork" aria-hidden="true">
          <Music2 size={54} />
        </div>
      </section>

      <label className="dh-glass dh-search-bar">
        <Search size={21} color="var(--dh-text-muted)" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ค้นหาหมวดเสียงธรรม..."
          className="dh-search-input"
        />
        <Mic size={21} color="var(--dh-primary)" />
      </label>

      <section>
        <div className="dh-section-header">
          <div>
            <span className="dh-subheading">แนะนำ</span>
            <h2 className="dh-heading">เริ่มฟังเร็ว</h2>
          </div>
        </div>

        <div className="dh-popular-row">
          {FEATURED_MIXES.map((mix) => {
            const category = DHAMMA_CATEGORIES.find((cat) => cat.id === mix.categoryId);
            const Icon = mix.icon;
            return (
              <button
                key={mix.title}
                type="button"
                onClick={() => openFeatured(mix)}
                className="dh-feature-card"
                style={{ '--mix-gradient': category?.bgGradient, '--mix-color': category?.color }}
              >
                <span className="dh-feature-tag">{mix.tag}</span>
                <Icon size={34} />
                <strong>{mix.title}</strong>
                <small>{mix.desc}</small>
                <span className="dh-feature-play">
                  <Play size={16} fill="currentColor" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="dh-section-header">
          <div>
            <span className="dh-subheading">Library</span>
            <h2 className="dh-heading">หมวดหมู่เสียงธรรม</h2>
          </div>
          <span className="dh-count-pill">{filteredCategories.length} หมวด</span>
        </div>

        <div className="dh-category-grid">
          {filteredCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className="dh-glass dh-cat-card"
                style={{ '--cat-color': cat.color }}
              >
                <span className="dh-cat-icon">
                  <Icon size={24} strokeWidth={1.8} />
                </span>
                <span className="dh-cat-copy">
                  <strong className="dh-cat-title">{cat.title}</strong>
                  <small className="dh-cat-subtitle">{cat.subtitle}</small>
                </span>
                <Play size={18} fill="currentColor" className="dh-cat-play" />
              </button>
            );
          })}
        </div>
      </section>

      <div className="dh-bottom-nav">
        {[
          { icon: Home, label: 'หน้าแรก', id: 'home', action: onBack },
          { icon: Search, label: 'ค้นหา', id: 'search' },
          { icon: Library, label: 'คลังเสียง', id: 'library' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.action) tab.action();
            }}
            className={`dh-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
          >
            <tab.icon size={24} strokeWidth={activeTab === tab.id ? 2.4 : 1.8} />
            <span className="dh-nav-text">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
