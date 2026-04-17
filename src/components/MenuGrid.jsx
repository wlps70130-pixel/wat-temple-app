import React from 'react';
import { UserPlus, Headphones, Gift, HeartHandshake, Library, Zap, Wrench, CalendarSync, Car, Stethoscope, HardHat, Users } from 'lucide-react';

const MENU_ITEMS = [
  { id: 1, label: 'ทำบุญ', icon: HeartHandshake, color: '#4ade80' },
  { id: 2, label: 'ฟังธรรม', icon: Headphones, color: '#f472b6' },
  { id: 3, label: 'พระของขวัญ', icon: Gift, color: '#facc15' },
  { id: 4, label: 'กิจนิมนต์', icon: CalendarSync, color: '#f87171' },
  { id: 5, label: 'คณะสงฆ์', icon: Users, color: '#d97706' },
  { id: 6, label: 'ห้องสมุด', icon: Library, color: '#a78bfa' },
  { id: 7, label: 'แจ้งป่วย', icon: Stethoscope, color: '#ef4444' },
  { id: 8, label: 'จองรถ', icon: Car, color: '#2dd4bf' },
  { id: 9, label: 'งานก่อสร้าง', icon: HardHat, color: '#f59e0b' },
  { id: 10, label: 'ซ่อมบำรุง', icon: Wrench, color: '#9ca3af' },
  { id: 11, label: 'ค่าพลังงาน', icon: Zap, color: '#fb923c' }
];

export default function MenuGrid({ onMenuClick }) {
  return (
    <div className="menu-grid">
      {MENU_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <button 
            key={item.id} 
            className="menu-item"
            onClick={() => {
              if (onMenuClick) {
                if (item.id === 5) onMenuClick('sangha');
                if (item.id === 2) onMenuClick('dhamma');
                if (item.id === 11) onMenuClick('energy');
              }
            }}
          >
            <div className="menu-icon-wrapper">
              <Icon size={24} color={item.color} />
            </div>
            <span className="menu-text">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
