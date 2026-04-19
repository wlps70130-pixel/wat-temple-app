import React, { useState, useEffect } from 'react';
import { Cloud, Droplets, Wind, ThermometerSun } from 'lucide-react';

export default function DateTimeWeather() {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState({ temp: '--', pm25: '--', loading: true });

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => setTime(new Date()), 60000);
    
    // Fetch Weather & PM2.5 (Open-Meteo)
    const fetchWeatherAndAirQuality = async () => {
      try {
        const lat = 13.609690;
        const lon = 99.950873;
        
        // Parallel requests using fetch
        const [weatherRes, aqiRes] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`),
          fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5`)
        ]);

        const weatherData = await weatherRes.json();
        const aqiData = await aqiRes.json();

        setWeather({
          temp: weatherData?.current_weather?.temperature || '--',
          pm25: aqiData?.current?.pm2_5 || '--',
          loading: false
        });
      } catch (error) {
        console.error("Failed to fetch weather data", error);
        setWeather({ temp: '--', pm25: '--', loading: false });
      }
    };

    fetchWeatherAndAirQuality();
    return () => clearInterval(timer);
  }, []);

  const formatThaiDate = (dateToFormat) => {
    const thaiMonths = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    const day = dateToFormat.getDate();
    const month = thaiMonths[dateToFormat.getMonth()];
    const year = dateToFormat.getFullYear() + 543; // Buddhist Era
    return `${dateToFormat.toLocaleDateString('th-TH', { weekday: 'long' })}ที่ ${day} ${month} พ.ศ. ${year}`;
  };


  const getPMStatus = (pm) => {
    if (pm === '--') return { className: '', text: 'กำลังโหลด' };
    if (pm < 25) return { className: 'pm-status-good', text: 'ดีมาก' };
    if (pm < 50) return { className: 'pm-status-mod', text: 'ปานกลาง' };
    return { className: 'pm-status-bad', text: 'เริ่มมีผลกระทบ' };
  };

  const pmStatus = getPMStatus(weather.pm25);

  return (
    <div className="weather-widget glass" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 0 }}>
      {/* วันที่ */}
      <div className="date-text" style={{ fontSize: 'clamp(0.8rem, 3vw, 0.9rem)', color: 'var(--primary-color)', marginBottom: '0.5rem', fontWeight: '500' }}>
        {formatThaiDate(time)}
      </div>

      {/* แถวล่าง: เวลา + อากาศ */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* ซ้าย: เวลา */}
        <div style={{ flex: 1 }}>
          <div className="time-text" style={{ color: 'var(--text-main)', lineHeight: '1.1' }}>
            {time.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
          </div>
        </div>

        {/* ขวา: อุณหภูมิ + PM2.5 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <div style={{ fontSize: 'clamp(1rem, 4vw, 1.15rem)', color: '#f59e0b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ThermometerSun size={18} /> {weather.temp}°
          </div>
          <div className={pmStatus.className} style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1rem)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Wind size={18} /> {weather.pm25} <span style={{fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-muted)'}}>{pmStatus.text}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
