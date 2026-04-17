import React from 'react';
import { CalendarDays } from 'lucide-react';

export default function DailyActivities() {
  const activities = [
    { time: '04:30', title: 'ทำวัตรเช้า', desc: 'ณ พระอุโบสถ' },
    { time: '06:00', title: 'บิณฑบาต', desc: 'สายหน้าวัดและชุมชน' },
    { time: '08:00', title: 'ปาติโมกข์', desc: 'พระภิกษุสงฆ์ลงปาติโมกข์' },
    { time: '17:30', title: 'ทำวัตรเย็น / นั่งสมาธิ', desc: 'ณ ศาลาปฏิบัติธรรม' }
  ];

  return (
    <div className="glass glass-card" style={{ padding: '1.25rem' }}>
      <h2 className="section-title">
        <CalendarDays size={20} color="#eab308" />
        ตารางกิจกรรมวันนี้
      </h2>
      <div className="activity-list">
        {activities.map((act, idx) => (
          <div key={idx} className="activity-item">
            <div className="activity-time">{act.time}</div>
            <div className="activity-details">
              <h3>{act.title}</h3>
              <p>{act.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <a 
        href="https://calendar.google.com/calendar/u/0/r/month" 
        target="_blank" 
        rel="noreferrer"
        style={{
          display: 'block', 
          marginTop: '1rem', 
          textAlign: 'center', 
          color: 'var(--primary-color)', 
          fontSize: '0.85rem',
          textDecoration: 'none'
        }}
      >
        ดูปฏิทินทั้งหมดบน Google Calendar &rarr;
      </a>
    </div>
  );
}
