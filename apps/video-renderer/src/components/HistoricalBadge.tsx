import React from 'react';

interface HistoricalBadgeProps {
  sourceText: string;
}

export const HistoricalBadge: React.FC<HistoricalBadgeProps> = ({ sourceText }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '80px',
        left: '60px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(16, 11, 7, 0.85)',
        backdropFilter: 'blur(10px)',
        border: '1.5px solid rgba(232, 169, 58, 0.6)',
        borderRadius: '30px',
        padding: '10px 24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7)',
        zIndex: 40
      }}
    >
      <div
        style={{
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          backgroundColor: '#e63946',
          boxShadow: '0 0 10px #e63946'
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontFamily: "'Segoe UI', Roboto, sans-serif",
            fontSize: '16px',
            fontWeight: 800,
            color: '#ffd166',
            letterSpacing: '1.5px',
            textTransform: 'uppercase'
          }}
        >
          Sử Liệu Xác Thực
        </span>
        <span
          style={{
            fontFamily: "'Segoe UI', Roboto, sans-serif",
            fontSize: '18px',
            color: '#f8fafc',
            fontWeight: 500,
            maxWidth: '500px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {sourceText}
        </span>
      </div>
    </div>
  );
};
