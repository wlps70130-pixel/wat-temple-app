    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fade-in 0.4s ease-out' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '1.25rem' }}>
          {/* Top Title Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: '800', color: theme.textMain }}>
              <span style={{ color: '#84cc16', fontSize: '1.2rem' }}>⚡</span> พลังงานอัจฉริยะ
            </div>
            <button onClick={() => setIsDarkMode(!isDarkMode)} style={{ background: 'transparent', border: 'none', color: theme.textSub, cursor: 'pointer', fontSize: '1.2rem', padding: 0 }}>
              ⚙️
            </button>
          </div>
          
          {/* Sub Title */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: theme.textMain, letterSpacing: '-0.5px' }}>วิเคราะห์ค่าไฟ (TOU)</h1>
            <div style={{ fontSize: '0.85rem', color: theme.textSub, marginTop: '0.2rem' }}>ประจำเดือน {currentMonth} {currentYear}</div>
          </div>
        </div>

        {/* Main TOU Dark Card */}
        <div style={{ background: '#2a303c', borderRadius: '16px', padding: '1.5rem', color: 'white', position: 'relative', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>ค่าไฟโดยประมาณ (TOU)</div>
            <div style={{ background: '#a3e635', color: '#166534', fontSize: '0.75rem', fontWeight: '800', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>📉 -12%</div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: 'clamp(1.8rem, 7vw, 2.5rem)', fontWeight: '800', lineHeight: 1 }}>฿{totalCost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {/* On-Peak Box */}
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem' }}>
                <span style={{color: '#fcd34d'}}>☀️</span> On-Peak
              </div>
              <div style={{ fontSize: 'clamp(0.95rem, 4vw, 1.15rem)', fontWeight: '800', marginBottom: '0.2rem' }}>฿{onPeakCost.toLocaleString('th-TH', { maximumFractionDigits: 0 })}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>{monthlyOnPeakKwh.toFixed(1)} kWh</div>
            </div>
            
            {/* Off-Peak Box */}
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem' }}>
                <span style={{color: '#cbd5e1'}}>🌙</span> Off-Peak
              </div>
              <div style={{ fontSize: 'clamp(0.95rem, 4vw, 1.15rem)', fontWeight: '800', marginBottom: '0.2rem' }}>฿{offPeakCost.toLocaleString('th-TH', { maximumFractionDigits: 0 })}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>{monthlyOffPeakKwh.toFixed(1)} kWh</div>
            </div>
          </div>
        </div>

         {/* Savings Card (White) */}
        {(() => {
           // อัตรา 6.1.3 ไม่ใช้ TOU ไม่มี Demand Charge, ค่าบริการ 20 บาท/เดือน
           const norm_first10 = Math.min(totalMonthlyKwh, 10) * 2.8013;
           const norm_above10 = Math.max(0, totalMonthlyKwh - 10) * 3.8919;
           const norm_ft = totalMonthlyKwh * PEA_RATES.ft;
           const norm_service = totalMonthlyKwh > 0 ? 20.00 : 0;
           const normalCostBeforeVat = norm_first10 + norm_above10 + norm_ft + norm_service;
           const normalCost = normalCostBeforeVat * (1 + PEA_RATES.vat);
           const savings = normalCost - totalCost;
           
           return (
              <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '1.5rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
                 <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: '800', color: theme.textMain }}>สรุปค่าไฟฟ้าเดือนนี้ (TOU 6.2.3)</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem', background: isDarkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderRadius: '12px', padding: '0.75rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                     <span style={{ color: theme.textSub }}>On-Peak {monthlyOnPeakKwh.toFixed(1)} kWh x {PEA_RATES.onPeak} บาท</span>
                     <span style={{ fontWeight: '700', color: theme.textMain }}>฿{onPeakCost.toLocaleString('th-TH', { maximumFractionDigits: 0 })}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                     <span style={{ color: theme.textSub }}>Off-Peak {monthlyOffPeakKwh.toFixed(1)} kWh x {PEA_RATES.offPeak} บาท</span>
                     <span style={{ fontWeight: '700', color: theme.textMain }}>฿{offPeakCost.toLocaleString('th-TH', { maximumFractionDigits: 0 })}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                     <span style={{ color: theme.textSub }}>Demand {peakDemandKw.toFixed(2)} kW x {PEA_RATES.demand} บาท/kW</span>
                     <span style={{ fontWeight: '700', color: '#f59e0b' }}>฿{demandCost.toLocaleString('th-TH', { maximumFractionDigits: 0 })}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                     <span style={{ color: theme.textSub }}>Ft {totalMonthlyKwh.toFixed(0)} kWh x {PEA_RATES.ft} + ค่าบริการ {PEA_RATES.service} บาท</span>
                     <span style={{ fontWeight: '700', color: theme.textMain }}>฿{(ftCost + PEA_RATES.service).toLocaleString('th-TH', { maximumFractionDigits: 0 })}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                     <span style={{ color: theme.textSub }}>VAT 7%</span>
                     <span style={{ fontWeight: '700', color: theme.textMain }}>฿{vatAmount.toLocaleString('th-TH', { maximumFractionDigits: 0 })}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${theme.border}`, paddingTop: '0.5rem', fontSize: '0.88rem' }}>
                     <span style={{ fontWeight: '800', color: theme.textMain }}>รวมทั้งสิ้น (รวม VAT)</span>
                     <span style={{ fontWeight: '800', color: theme.primary }}>฿{totalCost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                   </div>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: savings >= 0 ? '#f0fdf4' : '#fef2f2', borderRadius: '12px', padding: '0.6rem 0.75rem' }}>
                   <div>
                     <div style={{ fontSize: '0.8rem', fontWeight: '800', color: savings >= 0 ? '#166534' : '#991b1b' }}>
                       {savings >= 0 ? '🐷 ประหยัดเทียบ 6.1.3 (ไม่ใช้ TOU)' : '⚠️ TOU แพงกว่า 6.1.3 (เพราะ Demand Charge)'}
                     </div>
                     <div style={{ fontSize: '0.72rem', color: theme.textSub, marginTop: '2px' }}>6.1.3 = ฿{Math.round(normalCost).toLocaleString('th-TH')} | TOU = ฿{Math.round(totalCost).toLocaleString('th-TH')}</div>
                   </div>
                   <div style={{ fontSize: '1.2rem', fontWeight: '800', color: savings >= 0 ? '#166534' : '#991b1b' }}>
                     {savings >= 0 ? '' : '+'}฿{Math.abs(Math.round(savings)).toLocaleString('th-TH')}
                   </div>
                 </div>
              </div>
           );
        })()}

        {(() => {
          // เตรียมข้อมูลสำหรับกราฟรายชั่วโมงของวันนี้
          const todayStr = `${String(currentTime.getDate()).padStart(2, '0')}/${String(currentTime.getMonth()+1).padStart(2, '0')}/${currentTime.getFullYear()}`;
          const isWeekday = currentTime.getDay() >= 1 && currentTime.getDay() <= 5;
          const isHoliday = THAI_HOLIDAYS_2568.has(`${currentTime.getFullYear()}-${String(currentTime.getMonth()+1).padStart(2, '0')}-${String(currentTime.getDate()).padStart(2, '0')}`);
          
          let hasRealData = false;
          const hourlyData = Array(24).fill(0).map((_, i) => {
            const isPeakTime = i >= 9 && i <= 21;
            const isPeak = isWeekday && !isHoliday && isPeakTime;
            return { hour: `${String(i).padStart(2, '0')}:00`, isPeak, buildings: {} };
          });

          rawHistory.forEach(r => {
             if (!r.timestamp || r.building === 'พลังงานโซล่าเซลล์') return;
             let dPart = "", hPart = "";
             if (r.timestamp.includes('T')) {
                const match = r.timestamp.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):/);
                if (match) { dPart = `${match[3]}/${match[2]}/${match[1]}`; hPart = match[4]; }
             } else if (r.timestamp.includes('/')) {
                const parts = r.timestamp.split(' ');
                if (parts.length >= 2) {
                   const dParts = parts[0].split('/');
                   if (dParts.length === 3) { dPart = `${dParts[0].padStart(2, '0')}/${dParts[1].padStart(2, '0')}/${dParts[2]}`; hPart = parts[1].split(':')[0].padStart(2, '0'); }
                }
             }
             if (dPart === todayStr && hPart) {
                const hIdx = parseInt(hPart, 10);
                if (hIdx >= 0 && hIdx < 24) {
                   if (!hourlyData[hIdx].buildings[r.building]) {
                      hourlyData[hIdx].buildings[r.building] = { sum: 0, count: 0 };
                   }
                   hourlyData[hIdx].buildings[r.building].sum += parseFloat(r.totalKw || 0);
                   hourlyData[hIdx].buildings[r.building].count += 1;
                }
             }
          });

          let finalHourly = hourlyData.map(d => {
             let totalAvgKw = 0;
             const buildingNames = Object.keys(d.buildings);
             if (buildingNames.length > 0) {
                 hasRealData = true;
                 buildingNames.forEach(bName => {
                     const bStat = d.buildings[bName];
                     if (bStat.count > 0) {
                         totalAvgKw += (bStat.sum / bStat.count);
                     }
                 });
             }
             return {
                hour: d.hour,
                "กำลังไฟ (kW)": parseFloat(totalAvgKw.toFixed(2)),
                fill: d.isPeak ? '#facc15' : '#84cc16'
             };
          });

          // ถ้าวันนี้ยังไม่มีข้อมูลเลย ให้ใช้ Mock Data จำลองไปก่อนเพื่อให้กราฟสวยงาม
          if (!hasRealData) {
             const mock = [10,12,15,18,14,12,15,20,25,55,65,72,80,85,78,70,65,60,55,50,35,25,18,12];
             finalHourly = mock.map((val, i) => {
                const isPeakTime = i >= 9 && i <= 21;
                const isPeak = isWeekday && !isHoliday && isPeakTime;
                return {
                   hour: `${String(i).padStart(2, '0')}:00`,
                   "กำลังไฟ (kW)": val,
                   fill: isPeak ? '#facc15' : '#84cc16'
                };
             });
          }

          return (
            <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '1.5rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                     <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: theme.textMain }}>ปริมาณการใช้ไฟรายชั่วโมง (วันนี้)</h3>
                     {!hasRealData && <span style={{ fontSize: '0.75rem', color: theme.textSub, marginTop: '2px' }}>(กราฟจำลอง - กำลังรอข้อมูลจริงของวันนี้)</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: theme.textSub }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#facc15' }}></div>On-Peak</div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#84cc16' }}></div>Off-Peak</div>
                  </div>
               </div>
               
               <div style={{ width: '100%', height: 200, marginLeft: '-15px' }}>
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={finalHourly} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
                     <XAxis dataKey="hour" stroke={theme.textSub} fontSize={10} tickMargin={8} minTickGap={20} />
                     <YAxis stroke={theme.textSub} fontSize={10} tickFormatter={(val) => `${val}kW`} width={45} />
                     <Tooltip 
                       contentStyle={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '12px', color: theme.textMain, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                       itemStyle={{ color: theme.textMain, fontWeight: 'bold' }}
                       labelStyle={{ color: theme.textSub, marginBottom: '0.25rem', fontSize: '0.85rem' }}
                       cursor={{ fill: isDarkMode ? '#1e293b' : '#f1f5f9' }}
                     />
                     <Bar dataKey="กำลังไฟ (kW)" radius={[4, 4, 0, 0]} animationDuration={1500} />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </div>
          );
        })()}


        {/* Energy Distribution Card */}
        <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '1.5rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
           <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '800', color: theme.textMain }}>การกระจายพลังงาน</h3>
           <div style={{ display: 'flex', background: isDarkMode ? '#0f172a' : '#f1f5f9', borderRadius: '12px', marginBottom: '1rem' }}>
              <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', borderRight: `1px solid ${theme.border}` }}>
                 <div style={{ fontSize: '0.8rem', color: '#65a30d', fontWeight: '700' }}>🌱 พลังงานทดแทน</div>
                 <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: '800', color: theme.textMain }}>{solarKw.toFixed(1)}</span>
                    <span style={{ fontSize: '0.75rem', color: theme.textSub }}>kW</span>
                 </div>
                 <div style={{ fontSize: '0.75rem', color: '#65a30d', fontWeight: '700' }}>▲ {prodPercent.toFixed(0)}%</div>
              </div>
              <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                 <div style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: '700' }}>⚡ PEA Grid</div>
                 <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: '800', color: theme.textMain }}>{globalKw.toFixed(1)}</span>
                    <span style={{ fontSize: '0.75rem', color: theme.textSub }}>kW</span>
                 </div>
                 <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: '700' }}>▼ {(100-prodPercent).toFixed(0)}%</div>
              </div>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: `1px solid ${theme.border}`, fontSize: '0.85rem' }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                 <div style={{ fontSize: '1.2rem', color: prodPercent >= 50 ? '#65a30d' : theme.danger, fontWeight: '800' }}>{prodPercent.toFixed(1)}%</div>
                 <div style={{ fontSize: '0.7rem', color: theme.textSub, marginTop: '0.15rem' }}>พึ่งพาทดแทน</div>
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                 <div style={{ fontSize: '0.75rem', fontWeight: '600', padding: '0.15rem 0.5rem', borderRadius: '12px', border: `1px solid ${touStatus === 'ON_PEAK' ? theme.danger : theme.success}`, color: touStatus === 'ON_PEAK' ? theme.danger : theme.success, display: 'inline-block' }}>{touStatus === 'ON_PEAK' ? 'On-Peak' : 'Off-Peak'}</div>
                 <div style={{ fontSize: '0.7rem', color: theme.textSub, marginTop: '0.15rem' }}>ช่วงเวลา</div>
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                 <div style={{ fontSize: '1.2rem', color: netGrid <= 0 ? '#65a30d' : theme.danger, fontWeight: '800' }}>{netGrid > 0 ? '+' : ''}{netGrid.toFixed(1)} kW</div>
                 <div style={{ fontSize: '0.7rem', color: theme.textSub, marginTop: '0.15rem' }}>{netGrid > 0 ? 'ดึงจาก PEA' : 'ส่งออก PEA'}</div>
              </div>
           </div>
        </div>

        <AiAssistant 
          mode="energy"
          contextData={aiContextData}
          title="AI Energy Analyst"
          subtitle="ขับเคลื่อนโดย Gemini (Google AI)"
          icon="⚡"
          themeColor={isDarkMode ? '#6366f1' : '#22c55e'}
          isDarkMode={isDarkMode}
        />

        {/* Graph Section */}
        <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '1.5rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: theme.textMain, fontWeight: '700' }}>สถิติการใช้งาน</h3>
          </div>
          
          {/* Time Filter Tabs */}
          <div style={{ display: 'flex', background: isDarkMode ? '#0f172a' : '#f1f5f9', borderRadius: '12px', padding: '4px' }}>
            {['15min', '30min', '1hour', 'day'].map(filter => {
              const labels = { '15min':'15 นาที', '30min':'30 นาที', '1hour':'1 ชั่วโมง', 'day':'รายวัน' };
              const isActive = graphFilter === filter;
              return (
                <div key={filter} onClick={() => setGraphFilter(filter)} style={{ flex: 1, textAlign: 'center', padding: '0.5rem 0', borderRadius: '10px', fontSize: '0.85rem', fontWeight: isActive ? '700' : '500', cursor: 'pointer', background: isActive ? theme.cardBg : 'transparent', color: isActive ? theme.textMain : theme.textSub, boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}>
                  {labels[filter]}
                </div>
              );
            })}
          </div>

          <AmrGraph filter={graphFilter} />
        </div>

        {/* Load Profile Data Table (PEA AMR Standard) */}
        <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '1.5rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: theme.textMain, fontWeight: '700' }}>ตารางข้อมูลสถิติไฟฟ้า (PEA Load Profile)</h3>
            <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', background: isDarkMode ? '#334155' : '#e2e8f0', color: theme.textSub, fontWeight: 'bold' }}>AMR Standard</span>
          </div>
          
          <div style={{ overflowX: 'auto', maxHeight: '350px', overflowY: 'auto', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead style={{ position: 'sticky', top: 0, background: isDarkMode ? '#1e293b' : '#f8fafc', zIndex: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <tr style={{ color: theme.textSub, textAlign: 'left', whiteSpace: 'nowrap' }}>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: `2px solid ${theme.border}` }}>วัน-เวลา</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', borderBottom: `2px solid ${theme.border}` }}>กำลังไฟ (kW)</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', borderBottom: `2px solid ${theme.border}` }}>พลังงาน (kWh)</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', borderBottom: `2px solid ${theme.border}` }}>โซล่า (kWh)</th>
                  {graphFilter !== 'day' && <th style={{ padding: '0.75rem 1rem', textAlign: 'center', borderBottom: `2px solid ${theme.border}` }}>TOU</th>}
                </tr>
              </thead>
              <tbody>
                {[...historicalData].reverse().map((row, idx) => {
                  let kwh = 0;
                  let kw = 0;
                  let solarKwh = 0;
                  
                  if (graphFilter === 'day') {
                    kwh = row.totalKw;
                    kw = "-"; 
                    solarKwh = row.solarKw;
                  } else {
                    kw = row.totalKw;
                    const multiplier = graphFilter === '15min' ? 0.25 : graphFilter === '30min' ? 0.5 : 1;
                    kwh = parseFloat((row.totalKw * multiplier).toFixed(2));
                    solarKwh = parseFloat((row.solarKw * multiplier).toFixed(2));
                  }

                  let touBadge = null;
                  if (graphFilter !== 'day') {
                    // parse date+time from fullTime e.g. "24/04 09:15" or "24/04/2026 09:15"
                    const tMatch = row.fullTime.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))? (\d{2}):(\d{2})/);
                    let isPeak = false;
                    if (tMatch) {
                      const hour = parseInt(tMatch[4], 10);
                      const min  = parseInt(tMatch[5], 10);
                      const dd   = parseInt(tMatch[1], 10);
                      const mm   = parseInt(tMatch[2], 10);
                      const yyyy = tMatch[3] ? parseInt(tMatch[3], 10) : currentTime.getFullYear();
                      const dt   = new Date(yyyy, mm - 1, dd, hour, min);
                      isPeak = getTouStatus(dt) === 'ON_PEAK';
                    }
                    touBadge = isPeak ?
                      <span style={{ background: '#fef08a', color: '#854d0e', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold' }}>On-Peak</span> :
                      <span style={{ background: '#bbf7d0', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold' }}>Off-Peak</span>;
                  }

                  return (
                    <tr key={idx} style={{ borderBottom: `1px solid ${theme.border}`, background: idx % 2 === 0 ? 'transparent' : (isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)') }}>
                      <td style={{ padding: '0.75rem 1rem', color: theme.textMain, fontWeight: '600', whiteSpace: 'nowrap' }}>{row.fullTime}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: theme.textSub, fontWeight: '500' }}>{kw}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: theme.primary, fontWeight: '700' }}>{kwh}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#f59e0b', fontWeight: '600' }}>{solarKwh}</td>
                      {graphFilter !== 'day' && <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{touBadge}</td>}
                    </tr>
                  );
                })}
                {historicalData.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: theme.textSub }}>กำลังโหลดข้อมูล...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* List of Panels */}
        <div style={{ marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: theme.textMain, fontWeight: '800' }}>รายการอาคาร</h3>
            <span style={{ fontSize: '0.9rem', color: theme.textSub, fontWeight: '500' }}>ทั้งหมด {BUILDINGS.length}</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.keys(buildingData).length === 0 ? (
              // Skeleton Loaders
              [1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{ background: theme.cardBg, borderRadius: '16px', padding: '1.1rem 1.25rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: isDarkMode ? '#1e293b' : '#e2e8f0', animation: 'pulse-dot 1.5s infinite' }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: '16px', background: isDarkMode ? '#1e293b' : '#e2e8f0', borderRadius: '4px', width: '60%', marginBottom: '8px', animation: 'pulse-dot 1.5s infinite' }}></div>
                    <div style={{ height: '12px', background: isDarkMode ? '#1e293b' : '#e2e8f0', borderRadius: '4px', width: '40%', animation: 'pulse-dot 1.5s infinite' }}></div>
                  </div>
                </div>
              ))
            ) : (
            BUILDINGS.map(b => {
              const hasDevice = !!b.deviceId;
              const data = buildingData[b.id];
              const parsed = parsedBuildingData[b.id] || parseData(null);
              const isSolar = b.isSolar;
              
              let statusText = 'Pending';
              let statusColor = theme.warning;
              if (hasDevice) {
                statusText = parsed.isOnline ? 'Active' : 'Offline';
                statusColor = parsed.isOnline ? theme.success : theme.danger;
              }
              
              return (
                <div key={b.id} onClick={() => setActiveTab(b.id)} style={{ background: theme.cardBg, borderRadius: '16px', padding: '1.1rem 1.25rem', cursor: 'pointer', border: `1px solid ${theme.border}`, boxShadow: theme.shadow, display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.1s' }}>
                  
                  {/* Icon */}
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: isSolar ? (isDarkMode ? '#451a03' : '#fef3c7') : (isDarkMode ? '#1e293b' : '#f1f5f9'), border: `1px solid ${isSolar ? '#fde68a' : theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                    {isSolar ? '☀️' : '🏢'}
                  </div>
                  
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ margin: 0, fontSize: '1.05rem', color: theme.textMain, fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {b.name}
                    </div>
                    <div style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: theme.textSub, fontWeight: '500' }}>
                      Power {hasDevice && parsed.isOnline ? parsed.totalKw : '0.00'} kW
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: statusColor, marginBottom: '0.2rem' }}>
                      {statusText}
                    </div>
                    <div style={{ fontSize: '0.95rem', color: theme.textMain, fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                      <span style={{ color: theme.warning }}>⚡</span> {hasDevice && parsed.isOnline ? parseFloat(parsed.totalKwh).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '--'} <span style={{ fontSize: '0.75rem', color: theme.textSub, fontWeight: '600' }}>kWh</span>
                    </div>
                  </div>
                </div>
              );
            })
            )}
          </div>
        </div>
      </div>
    );
  };

