import React from 'react';

const TrendCard = () => {
  const trendData = [
    { id: 1, label: 'Sốt siêu vi / Cúm A', current: 145, previous: 120, severity: 'high' },
    { id: 2, label: 'Viêm đường hô hấp cấp', current: 98, previous: 90, severity: 'medium' },
    { id: 3, label: 'Dị ứng thời tiết', current: 65, previous: 72, severity: 'low' },
    { id: 4, label: 'Rối loạn tiêu hóa', current: 42, previous: 50, severity: 'low' }
  ];

  const maxVal = Math.max(...trendData.map(d => d.current), 1);

  return (
    <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)', padding: '24px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📈 Xu hướng dịch bệnh & Ca nhiễm
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>
            Biểu đồ rà soát tình hình bệnh nhân đến khám trong tháng.
          </p>
        </div>
        <span style={{ padding: '6px 14px', background: '#eff6ff', color: '#0f6eff', borderRadius: '30px', fontWeight: '700', fontSize: '0.8rem', border: '1px solid #bfdbfe' }}>
          🗓️ Thống kê Tháng 4
        </span>
      </div>

      {/* TREND CHART BARS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>
        {trendData.map(item => {
          const change = item.current - item.previous;
          const pct = Math.round((change / (item.previous || 1)) * 100);
          const fillPct = Math.round((item.current / maxVal) * 100);
          const isUp = change > 0;

          // Gradient màu sắc phân loại mức độ nguy hiểm
          let barGradient = 'linear-gradient(90deg, #0f6eff, #60a5fa)';
          let badgeBg = '#eff6ff';
          let badgeColor = '#1d4ed8';

          if (item.severity === 'high') {
            barGradient = 'linear-gradient(90deg, #ef4444 0%, #fb7185 100%)';
            badgeBg = '#fef2f2';
            badgeColor = '#b91c1c';
          } else if (item.severity === 'medium') {
            barGradient = 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)';
            badgeBg = '#fff7ed';
            badgeColor = '#c2410c';
          }

          return (
            <div key={item.id} style={{ width: '100%' }}>
              {/* TOP ROW: LABEL + COUNT + DELTA */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>{item.label}</span>
                  <span style={{ padding: '2px 8px', background: '#f1f5f9', color: '#334155', borderRadius: '6px', fontWeight: '700', fontSize: '0.8rem' }}>
                    {item.current} ca
                  </span>
                </div>

                <span style={{ padding: '3px 10px', background: badgeBg, color: badgeColor, borderRadius: '20px', fontWeight: '700', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {isUp ? `▲ +${pct}%` : `▼ ${Math.abs(pct)}%`}
                </span>
              </div>

              {/* BAR BACKGROUND & FILL (FULL WIDTH KÉO DÀI SANG SÁT LỀ PHẢI) */}
              <div style={{ width: '100%', height: '14px', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${fillPct}%`, 
                    height: '100%', 
                    borderRadius: '8px', 
                    background: barGradient,
                    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
                  }} 
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER NOTE */}
      <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px dashed #e2e8f0', fontSize: '0.825rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>📌 Thanh màu đỏ/cam biểu thị dịch bệnh gia tăng nhanh cần chú ý kê đơn.</span>
        <span style={{ color: '#0f6eff', fontWeight: '600' }}>Cập nhật liên tục</span>
      </div>

    </div>
  );
};

export default TrendCard;