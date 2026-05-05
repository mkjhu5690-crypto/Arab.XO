import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const FAKE_EMAILS = [
  'leu******@gmail.com', 'jkr******@sinosig.com', 'kmi******@icloud.com', 
  'lje******@icloud.com', 'mqu******@sina.com', 'abc******@yahoo.com',
  'xyz******@outlook.com', 'pqr******@gmail.com', 'mom******@sina.com'
];

const VIP_LEVELS = ['VIP1', 'VIP2', 'VIP3', 'VIP4', 'VIP5', 'VIP6', 'VIP7'];

interface WithdrawalRecord {
  id: number;
  email: string;
  amount: string;
  vip: string;
}

export default function WithdrawalFeed() {
  const [records, setRecords] = useState<WithdrawalRecord[]>([]);

  useEffect(() => {
    // Initial 5 records
    const initialRecords = Array.from({ length: 5 }).map((_, i) => ({
      id: Date.now() - i * 1000,
      email: FAKE_EMAILS[Math.floor(Math.random() * FAKE_EMAILS.length)],
      amount: (Math.random() * 2000 + 2).toFixed(2),
      vip: VIP_LEVELS[Math.floor(Math.random() * VIP_LEVELS.length)],
    }));
    setRecords(initialRecords);

    const interval = setInterval(() => {
      const newRecord = {
        id: Date.now(),
        email: FAKE_EMAILS[Math.floor(Math.random() * FAKE_EMAILS.length)],
        amount: (Math.random() * 2000 + 2).toFixed(2),
        vip: VIP_LEVELS[Math.floor(Math.random() * VIP_LEVELS.length)],
      };

      setRecords(prev => {
        const next = [newRecord, ...prev];
        return next.slice(0, 5); // Keep only 5
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-3 px-1 overflow-hidden" dir="ltr">
      <div className="flex justify-between items-center mb-4 px-2" dir="rtl">
        <h3 className="text-sm font-bold text-gray-800 dark:text-white">قائمة الأعضاء</h3>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
      </div>
      <div className="flex flex-col-reverse gap-3 transition-all duration-500">
        <AnimatePresence initial={false} mode="popLayout">
          {records.map((record) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-[#161616]/60 backdrop-blur-md rounded-2xl p-4 flex justify-between items-center shadow-sm border border-white/5"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-primary">${record.amount} +</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-white/40 font-mono italic">{record.email}</span>
                <span className={cn(
                  "text-[9px] font-black px-2.5 py-1 rounded-lg uppercase italic tracking-tighter",
                  "bg-primary text-black shadow-[0_0_10px_rgba(212,175,55,0.2)]"
                )}>
                  {record.vip}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
