import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

export const AndroidStatusBar: React.FC = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900 text-white text-xs select-none tracking-tight font-medium shrink-0 z-30">
      <div className="flex items-center gap-1.5">
        <span className="font-semibold text-[11px]">{time || '12:00'}</span>
      </div>
      <div className="flex items-center gap-2 text-slate-300">
        <Signal className="w-3.5 h-3.5" />
        <Wifi className="w-3.5 h-3.5" />
        <div className="flex items-center gap-0.5">
          <span className="text-[10px]">98%</span>
          <BatteryMedium className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
