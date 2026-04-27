import React, { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle2, Clock, Calendar, User, Search, Filter, MoreHorizontal, Plus, Loader2 } from 'lucide-react';
import Papa from 'papaparse';

// TODO: นำลิงก์ CSV ของ Google Sheets ที่คุณสร้างใหม่มาใส่ตรงนี้
// วิธีทำ: เปิด Google Sheet -> ไฟล์ -> แชร์ -> เผยแพร่ไปยังเว็บ -> เลือกเป็น "ค่าที่คั่นด้วยจุลภาค (.csv)"
const SHEET_URL = ''; // ปล่อยว่างไว้ระบบจะใช้ข้อมูลจำลอง (Mock Data) ด้านล่างแทนชั่วคราว


const MOCK_TASKS_DATA = [
  {
    id: 1,
    title: 'ซ่อมแซมหลังคาศาลาการเปรียญ',
    description: 'เปลี่ยนกระเบื้องที่แตกหักและตรวจสอบรอยรั่วบริเวณปีกขวา',
    status: 'in-progress',
    priority: 'high',
    assignee: 'พระสมชาย',
    dueDate: '2026-05-10',
    progress: 60,
  },
  {
    id: 2,
    title: 'จัดเตรียมสถานที่งานบุญประจำปี',
    description: 'กางเต็นท์ จัดเก้าอี้ และเตรียมเครื่องเสียงสำหรับวันพรุ่งนี้',
    status: 'todo',
    priority: 'medium',
    assignee: 'พระวิชัย',
    dueDate: '2026-05-15',
    progress: 0,
  },
  {
    id: 3,
    title: 'ตรวจสอบระบบไฟฟ้ารอบวัด',
    description: 'เปลี่ยนหลอดไฟที่เสียและเช็คสายไฟบริเวณทางเดิน',
    status: 'done',
    priority: 'low',
    assignee: 'ลุงช่างไฟ',
    dueDate: '2026-04-20',
    progress: 100,
  },
  {
    id: 4,
    title: 'อัปเดตข้อมูลพระภิกษุในระบบ',
    description: 'เพิ่มข้อมูลพระภิกษุที่บวชใหม่ในเดือนนี้ลงในฐานข้อมูล',
    status: 'in-progress',
    priority: 'medium',
    assignee: 'แอดมิน',
    dueDate: '2026-04-30',
    progress: 30,
  }
];

export default function TaskTracker() {
  const [activeTab, setActiveTab] = useState('all');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ถ้ายัไม่มี URL ให้ใช้ Mock Data ไปก่อน
    if (!SHEET_URL) {
      setTasks(MOCK_TASKS_DATA);
      setLoading(false);
      return;
    }

    Papa.parse(SHEET_URL, {
      download: true,
      header: true,
      complete: (results) => {
        const fetchedTasks = results.data
          .filter(row => row.title) // กรองแถวว่างทิ้ง
          .map((row, index) => ({
            id: row.id || index + 1,
            title: row.title,
            description: row.description || '',
            status: row.status || 'todo', // todo, in-progress, done
            priority: row.priority || 'medium', // low, medium, high
            assignee: row.assignee || 'ไม่ระบุ',
            dueDate: row.dueDate || '-',
            progress: parseInt(row.progress) || 0,
          }));
        
        // ถ้าดึงมาแล้วไม่มีข้อมูล ให้ใช้ข้อมูลจำลองแทน
        setTasks(fetchedTasks.length > 0 ? fetchedTasks : MOCK_TASKS_DATA);
        setLoading(false);
      },
      error: (error) => {
        console.error("Error fetching tasks:", error);
        setTasks(MOCK_TASKS_DATA); // Fallback กรณีดึงข้อมูลล้มเหลว
        setLoading(false);
      }
    });
  }, []);
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'todo': return { bg: '#fef3c7', text: '#d97706', label: 'รอดำเนินการ' };
      case 'in-progress': return { bg: '#dbeafe', text: '#2563eb', label: 'กำลังดำเนินการ' };
      case 'done': return { bg: '#dcfce7', text: '#16a34a', label: 'เสร็จสิ้น' };
      default: return { bg: '#f1f5f9', text: '#64748b', label: 'ไม่ทราบ' };
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#94a3b8';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'all') return true;
    return task.status === activeTab;
  });

  return (
    <div className="task-tracker-container" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '80px', fontFamily: '"Prompt", "Inter", sans-serif', marginLeft: 'calc(-1 * var(--content-pad))', marginRight: 'calc(-1 * var(--content-pad))' }}>
      <div style={{ padding: '1.25rem var(--content-pad)', display:'flex', flexDirection:'column', gap:'1rem' }}>
        
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '16px', padding: '1.5rem', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ClipboardList size={28} /> ติดตามงาน
                </h1>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', opacity: 0.9 }}>ระบบจัดการและติดตามความคืบหน้างานภายในวัด</p>
              </div>
              {loading && <Loader2 size={24} className="spin-animation" style={{ opacity: 0.8 }} />}
            </div>
          </div>
          <div style={{ position: 'absolute', right: '-10px', top: '-20px', opacity: 0.15, transform: 'rotate(15deg)' }}>
            <ClipboardList size={140} />
          </div>
        </div>

        {/* Action Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <div style={{ flex: 1, background: 'white', borderRadius: '12px', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Search size={18} color="#94a3b8" />
            <input type="text" placeholder="ค้นหางาน..." style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem', background: 'transparent', fontFamily: 'inherit' }} />
          </div>
          <button style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', width: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
            <Filter size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="hide-scrollbar" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', margin: '0.5rem 0' }}>
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'todo', label: 'รอดำเนินการ' },
            { id: 'in-progress', label: 'กำลังทำ' },
            { id: 'done', label: 'เสร็จสิ้น' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '20px',
                border: activeTab === tab.id ? '1px solid #10b981' : '1px solid transparent',
                background: activeTab === tab.id ? '#10b981' : 'white',
                color: activeTab === tab.id ? 'white' : '#64748b',
                fontSize: '0.85rem',
                fontWeight: activeTab === tab.id ? '700' : '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: activeTab === tab.id ? '0 4px 6px -1px rgba(16, 185, 129, 0.3)' : '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'all 0.2s',
                fontFamily: 'inherit'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredTasks.map(task => {
            const statusStyle = getStatusColor(task.status);
            return (
              <div key={task.id} className="task-card" style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px', background: getPriorityColor(task.priority) }}></div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', paddingLeft: '8px' }}>
                  <div style={{ background: statusStyle.bg, color: statusStyle.text, padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '700' }}>
                    {statusStyle.label}
                  </div>
                  <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                <div style={{ paddingLeft: '8px' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: '#1e293b', fontWeight: '700', lineHeight: 1.4 }}>{task.title}</h3>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>{task.description}</p>

                  {/* Progress Bar */}
                  {task.status === 'in-progress' && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.35rem' }}>
                        <span>ความคืบหน้า</span>
                        <span style={{ fontWeight: '700', color: '#2563eb' }}>{task.progress}%</span>
                      </div>
                      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${task.progress}%`, background: 'linear-gradient(90deg, #3b82f6, #2563eb)', borderRadius: '3px', transition: 'width 0.5s ease' }}></div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: task.status === 'in-progress' ? '0' : '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.75rem', fontWeight: '500' }}>
                      <Calendar size={14} color="#94a3b8" />
                      <span>{task.dueDate}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '600' }}>{task.assignee}</div>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', border: '1px solid #e2e8f0' }}>
                        <User size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Add Button */}
        <button className="fab-button" style={{ position: 'fixed', bottom: '90px', right: '20px', width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>
          <Plus size={28} />
        </button>

      </div>
      <style>{`
        .task-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .task-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08);
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .fab-button {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .fab-button:active {
          transform: scale(0.95);
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
