import React from 'react';
import { motion } from 'framer-motion';

export const HUDLabel = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono font-medium">
      {label}
    </span>
    {value && (
      <span className="text-[11px] uppercase tracking-wider text-white/80 font-mono">{value}</span>
    )}
  </div>
);

export const LEDIndicator = ({ active = true }) => (
  <motion.div
    animate={{ opacity: active ? [0.4, 1, 0.4] : 0.2 }}
    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
    className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[#17E1FF] shadow-[0_0_8px_#17E1FF]' : 'bg-white/20'}`}
  />
);
