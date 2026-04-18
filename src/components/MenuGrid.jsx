import React from 'react';
import { UserPlus, Headphones, Gift, HeartHandshake, Library, Zap, Wrench, CalendarSync, Car, Stethoscope, HardHat, Users } from 'lucide-react';

const MENU_ITEMS = [
  // Active Modules (Top Priority)
  { id: 2, label: 'ฟังธรรม', icon: Headphones, color: '#f472b6', isActive: true, target: 'dhamma' },
  { id: 11, label: 'ค่าพลังงาน', icon: Zap, color: '#fb923c', isActive: true, target: 'energy' },
  { id: 5, label: 'คณะสงฆ์', icon: Users, color: '#d97706', isActive: true, target: 'sangha' },
  // Inactive Modules (Waiting for update)
  { id: 1, label: 'ทำบุญ', icon: HeartHandshake, color: '#4ade80', isActive: false },
  { id: 3, label: 'พระของขวัญ', icon: Gift, color: '#facc15', isActive: true, target: 'amulet' },
  { id: 4, label: 'กิจนิมนต์', icon: CalendarSync, color: '#f87171', isActive: false },
  { id: 6, label: 'ห้องสมุด', icon: Library, color: '#a78bfa', isActive: false },
  { id: 7, label: 'แจ้งป่วย', icon: Stethoscope, color: '#ef4444', isActive: false },
  { id: 8, label: 'จองรถ', icon: Car, color: '#2dd4bf', isActive: false },
  { id: 9, label: 'งานก่อสร้าง', icon: HardHat, color: '#f59e0b', isActive: false },
  { id: 10, label: 'ซ่อมบำรุง', icon: Wrench, color: '#9ca3af', isActive: false }
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
            style={{ opacity: item.isActive ? 1 : 0.6 }}
            onClick={() => {
              if (onMenuClick && item.isActive) {
                onMenuClick(item.target);
              }
            }}
          >
            <div className="menu-icon-wrapper" style={{ filter: item.isActive ? 'none' : 'grayscale(100%)' }}>
              <Icon size={24} color={item.isActive ? item.color : '#9ca3af'} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <span className="menu-text" style={{ color: item.isActive ? 'inherit' : '#9ca3af' }}>{item.label}</span>
               {!item.isActive && <span style={{ fontSize: '0.55rem', color: '#9ca3af', marginTop: '2px', fontWeight: 'bold' }}>รออัปเดต</span>}
            </div>
          </button>
        );
      })}
    </div>
  );
}
