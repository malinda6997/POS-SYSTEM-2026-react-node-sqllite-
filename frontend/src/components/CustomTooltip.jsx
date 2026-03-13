import React from 'react';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div 
        style={{
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15 }}
          style={{
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            border: '1px solid rgba(148, 163, 184, 0.4)',
            padding: '10px 14px',
            margin: '0',
            borderRadius: '8px',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            whiteSpace: 'nowrap',
          }}
        >
          {label && (
            <p style={{
              color: '#e5e7eb',
              margin: '0 0 4px 0',
              padding: '0',
              fontSize: '13px',
              fontWeight: '700',
            }}>
              {label}
            </p>
          )}
          {payload.map((entry, index) => (
            <p
              key={`item-${index}`}
              style={{
                color: entry.color || '#e5e7eb',
                margin: '2px 0',
                padding: '0',
                fontSize: '13px',
                fontWeight: '500',
              }}
            >
              <span style={{ color: 'rgba(229, 231, 235, 0.7)' }}>{entry.name}:</span> <span style={{ fontWeight: 'bold', color: entry.color || '#fff' }}>{formatter ? formatter(entry.value) : entry.value}</span>
            </p>
          ))}
        </motion.div>
      </div>
    );
  }

  return null;
};

export default CustomTooltip;
