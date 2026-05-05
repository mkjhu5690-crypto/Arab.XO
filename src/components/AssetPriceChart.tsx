import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', price: 98.5 },
  { name: 'Tue', price: 99.2 },
  { name: 'Wed', price: 98.8 },
  { name: 'Thu', price: 100.5 },
  { name: 'Fri', price: 101.2 },
  { name: 'Sat', price: 100.8 },
  { name: 'Sun', price: 102.5 },
];

export default function AssetPriceChart() {
  return (
    <div className="w-full h-48 bg-[#1a1a1a] rounded-3xl p-4 border border-white/5 shadow-inner">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest">USDT/USD Trend</h4>
        <div className="flex items-center gap-1 text-green-500 font-bold text-[10px]">
          <span>+4.2%</span>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} 
          />
          <YAxis 
            domain={['dataMin - 1', 'dataMax + 1']} 
            hide 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
            itemStyle={{ color: '#d4af37' }}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#d4af37" 
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
