import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, Info, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { useNotifications } from '../lib/NotificationContext';
import { cn } from '../lib/utils';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const { notifications, markAsRead, clearAll } = useNotifications();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-[#0a0a0a] z-[200] border-l border-white/5 shadow-2xl flex flex-col"
          >
            <div className="p-6 flex justify-between items-center border-b border-white/5 bg-[#1a1a1a]/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Bell size={20} />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">الإشعارات</h3>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full text-white/40 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide" dir="rtl">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <motion.div
                    key={n.id}
                    layout
                    onClick={() => {
                        markAsRead(n.id).catch(console.error);
                    }}
                    className={cn(
                      "p-4 rounded-3xl border transition-all cursor-pointer group",
                      n.read ? "bg-white/5 border-white/5 opacity-60" : "bg-white/10 border-primary/20 shadow-lg shadow-primary/5"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0",
                        n.type === 'success' ? "bg-green-500/10 text-green-500" :
                        n.type === 'warning' ? "bg-yellow-500/10 text-yellow-500" :
                        n.type === 'error' ? "bg-red-500/10 text-red-500" :
                        "bg-primary/10 text-primary"
                      )}>
                        {n.type === 'success' && <CheckCircle size={18} />}
                        {n.type === 'warning' && <AlertTriangle size={18} />}
                        {n.type === 'error' && <Trash2 size={18} />}
                        {n.type === 'info' && <Info size={18} />}
                      </div>
                      <div className="flex-1 text-right">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">{n.title}</h4>
                          {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                        </div>
                        <p className="text-[11px] text-white/50 leading-relaxed">{n.message}</p>
                        <p className="text-[9px] text-white/20 font-mono mt-2 uppercase tracking-tighter">
                          {new Date(n.timestamp).toLocaleString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-20 text-white">
                  <Bell size={64} strokeWidth={1} />
                  <p className="text-xs font-black uppercase mt-4 tracking-widest">لا توجد إشعارات</p>
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-4 bg-[#1a1a1a]/50 border-t border-white/5">
                <button 
                  onClick={clearAll}
                  className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-red-500/60 hover:text-red-500 rounded-2xl transition-colors border border-red-500/10 hover:bg-red-500/5"
                >
                  مسح جميع التنبيهات
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
