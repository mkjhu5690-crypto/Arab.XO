
import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useBalance } from '../lib/BalanceContext';

export default function QuotaBanner() {
  const { quotaExceeded } = useBalance();

  return (
    <AnimatePresence>
      {quotaExceeded && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-red-500 text-white p-4 text-center shadow-lg flex items-center justify-center gap-3 backdrop-blur-md"
        >
          <div className="bg-white/20 p-2 rounded-full">
            <AlertTriangle size={20} className="text-white" />
          </div>
          <div className="flex flex-col items-center">
            <h3 className="font-black text-sm uppercase tracking-wider">Quota Limit Hit / وصلنا للحد الأقصى اليومي</h3>
            <p className="text-[10px] font-bold opacity-90 mt-1">
              لقد وصلنا إلى الحد الأقصى لقراءات البيانات اليومية (Free Tier). يرجى العودة غداً للمزيد من الأرباح والعمليات.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
