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
    <div className="weather-widget glass">
      <div className="date-time">
        <span className="date-text">
          {formatThaiDate(time)}
        </span>
        <span className="time-text">
          {time.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
        </span>
      </div>
      
      <div className="weather-stats">
        <div className="stat-item">
          <span className="stat-label">อุณหภูมิ</span>
          <span className="stat-value text-white">
            <ThermometerSun size={18} color="#eab308" />
            {weather.temp}°
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">PM 2.5</span>
          <span className={`stat-value ${pmStatus.className}`}>
            <Wind size={18} />
            {weather.pm25}
          </span>
          <span style={{fontSize: '10px', color: 'var(--text-muted)'}}>{pmStatus.text}</span>
        </div>
      </div>
    </div>
  );
}
