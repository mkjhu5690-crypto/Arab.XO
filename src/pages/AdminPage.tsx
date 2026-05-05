import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useBalance } from '../lib/BalanceContext';
import { useTranslation } from 'react-i18next';
import { Check, X, ArrowDownLeft, ArrowUpRight, User, Clock, Image as ImageIcon, Search, LayoutDashboard, History } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AdminPage() {
  const { transactions, approveTransaction, rejectTransaction, deleteTransaction, isAdmin } = useBalance();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [isCleaning, setIsCleaning] = useState(false);

  // Auto-cleanup on load
  useEffect(() => {
    const autoCleanup = async () => {
      if (transactions.length === 0) return;
      const now = new Date().getTime();
      const oneDay = 24 * 60 * 60 * 1000;
      const oldTxs = transactions.filter(tx => {
        try {
          const txTime = new Date(tx.date.replace(' ', 'T')).getTime();
          return (tx.status === 'completed' || tx.status === 'rejected') && (now - txTime) > oneDay;
        } catch (e) {
          return false;
        }
      });
      
      if (oldTxs.length > 0) {
        for (const tx of oldTxs) {
          deleteTransaction(tx.id);
        }
      }
    };
    autoCleanup();
  }, [transactions.length]); // Run when transactions are loaded or updated

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
            <X size={40} />
          </div>
          <h2 className="text-xl font-black text-white uppercase italic">غير مصرح لك بالدخول</h2>
          <p className="text-sm text-white/40">هذه الصفحة مخصصة للمالك فقط.</p>
          <button onClick={() => window.location.href = '/'} className="px-6 py-3 bg-primary text-black rounded-2xl font-black text-xs uppercase tracking-widest">
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  const filteredTxs = transactions.filter(tx => {
    const matchesTab = tx.status === activeTab;
    const matchesSearch = tx.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) || tx.id.includes(searchTerm);
    return matchesTab && matchesSearch;
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#0a0a0a] p-4 space-y-6 pb-24"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-black shadow-lg shadow-primary/20">
            <LayoutDashboard size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white italic tracking-tighter uppercase">لوحة التحكم</h1>
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest leading-none">المالك: akosbali5@gmail.com</p>
          </div>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#1a1a1a] p-5 rounded-[2rem] border border-white/5 space-y-1">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">إجمالي الطلبات المعلقة</p>
          <p className="text-2xl font-black text-primary tracking-tighter">
            {transactions.filter(t => t.status === 'pending').length}
          </p>
        </div>
        <div className="bg-[#1a1a1a] p-5 rounded-[2rem] border border-white/5 space-y-1">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">إجمالي العمليات اليوم</p>
          <p className="text-2xl font-black text-white tracking-tighter">
            {transactions.length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#1a1a1a] p-1 rounded-2xl border border-white/5 flex gap-1">
        {(['pending', 'completed', 'rejected'] as const).map((tab) => {
          const count = transactions.filter(t => t.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-3 px-1 text-[10px] font-black uppercase rounded-xl transition-all flex flex-col items-center gap-1",
                activeTab === tab ? "bg-primary text-black" : "text-white/40"
              )}
            >
              <span>{tab === 'pending' ? 'قيد الانتظار' : tab === 'completed' ? 'تمت الموافقة' : 'مرفوض'}</span>
              {count > 0 && (
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[8px] font-bold",
                  activeTab === tab ? "bg-black/10 text-black" : "bg-primary/20 text-primary"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative group flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث عن مستخدم أو رقم عملية..."
            className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl py-4 pr-12 pl-6 text-sm text-white focus:border-primary/20 outline-none transition-all"
          />
        </div>
        <button 
          onClick={async () => {
            if (confirm('هل أنت متأكد من تنظيف السجلات القديمة؟ سيتم حذف جميع السجلات المكتملة أو المرفوضة.')) {
               const oldTxs = transactions.filter(t => t.status === 'completed' || t.status === 'rejected');
               for (const tx of oldTxs) {
                 // We need to add deleteTransaction to BalanceContext
                 deleteTransaction(tx.id);
               }
               alert('تم تنظيف ' + oldTxs.length + ' سجل');
            }
          }}
          className="bg-primary/10 text-primary p-4 rounded-2xl border border-primary/10 hover:bg-primary/20 transition-all"
          title="تنظيف السجلات"
        >
          <History size={20} />
        </button>
        <button 
          onClick={() => {
            if (confirm('هل أنت متأكد من حذف جميع السجلات؟')) {
              localStorage.setItem('all_global_transactions', '[]'); // Fallback
              // For firestore we'd have to loop, but let's just use the maintenance button above for specific cleanup
              alert('يرجى استخدام زر التنظيف لحذف السجلات المنتهية.');
            }
          }}
          className="bg-red-500/10 text-red-500 p-4 rounded-2xl border border-red-500/10 hover:bg-red-500/20 transition-all"
          title="حذف الكل"
        >
          <Clock size={20} />
        </button>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredTxs.map((tx) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={tx.id}
              className="bg-[#1a1a1a] rounded-3xl border border-white/5 overflow-hidden shadow-xl"
            >
              <div className="p-5 flex justify-between items-start">
                <div className="flex gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                    tx.type === 'deposit' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {tx.type === 'deposit' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-black text-white uppercase tracking-tight">{tx.type === 'deposit' ? 'طلب إيداع' : 'طلب سحب'}</span>
                       <span className="text-[9px] font-bold text-white/20">#{tx.id}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/60">
                      <User size={12} className="text-primary" />
                      <span className="text-[10px] font-bold truncate max-w-[120px]">{tx.userEmail}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/30">
                      <Clock size={12} />
                      <span className="text-[10px] font-bold">{tx.date}</span>
                    </div>
                    {tx.address && (
                      <div className="pt-2 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                           <span className="text-[9px] font-black text-primary uppercase">الوسيلة:</span>
                           <span className="text-[9px] font-bold text-white/60">{tx.method}</span>
                        </div>
                        <div className="flex items-start gap-2">
                           <span className="text-[9px] font-black text-primary uppercase">العنوان:</span>
                           <span className="text-[9px] font-bold text-white/40 break-all">{tx.address}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-left">
                  <p className={cn(
                    "text-xl font-black tracking-tighter",
                    tx.type === 'deposit' ? "text-green-500" : "text-red-500"
                  )}>
                    {tx.type === 'deposit' ? '+' : '-'} {tx.amount.toFixed(2)}
                  </p>
                  <p className="text-[9px] font-black text-white/20 uppercase">USDT</p>
                </div>
              </div>

              {tx.proof && (
                <div className="px-5 pb-5">
                   <div 
                     onClick={() => setSelectedReceipt(tx.proof || null)}
                     className="p-3 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between group cursor-pointer hover:border-primary/20 transition-all"
                   >
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-primary">
                            <ImageIcon size={20} />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-white uppercase">إيصال الدفع</p>
                            <p className="text-[9px] text-white/20">انقر للعرض</p>
                         </div>
                      </div>
                      <LayoutDashboard size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                </div>
              )}

              {tx.status === 'pending' && (
                <div className="flex border-t border-white/5">
                  <button 
                    onClick={() => approveTransaction(tx.id)}
                    className="flex-1 py-4 bg-green-500/10 hover:bg-green-500/20 text-green-500 text-xs font-black uppercase flex items-center justify-center gap-2 transition-all border-l border-white/5"
                  >
                    <Check size={16} strokeWidth={3} />
                    موافقة
                  </button>
                  <button 
                    onClick={() => rejectTransaction(tx.id)}
                    className="flex-1 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-black uppercase flex items-center justify-center gap-2 transition-all"
                  >
                    <X size={16} strokeWidth={3} />
                    رفض
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTxs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 opacity-20 text-white">
            <LayoutDashboard size={64} strokeWidth={1} />
            <p className="text-xs font-black uppercase mt-4 tracking-widest">لا توجد طلبات في هذا القسم</p>
          </div>
        )}
      </div>

      {/* Receipt Image Modal */}
      <AnimatePresence>
        {selectedReceipt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReceipt(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#161616] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-4 flex justify-between items-center bg-[#1a1a1a] border-b border-white/5">
                 <h3 className="text-xs font-black text-white uppercase tracking-widest italic">تفاصيل إيصال الدفع</h3>
                 <button 
                   onClick={() => setSelectedReceipt(null)}
                   className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/40 hover:bg-white/10 transition-colors"
                 >
                   <X size={20} />
                 </button>
              </div>
              
              <div className="p-2 bg-black/50 flex-1 flex items-center justify-center min-h-[300px] max-h-[70vh] overflow-auto">
                 <img 
                   src={selectedReceipt} 
                   alt="Deposit Receipt" 
                   className="max-w-full h-auto rounded-xl shadow-2xl"
                   onError={(e) => {
                     (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1554224155-169641357599?auto=format&fit=crop&q=80&w=800';
                   }}
                 />
              </div>

              <div className="p-6 bg-[#1a1a1a] border-t border-white/5 space-y-4">
                 <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-2xl border border-primary/10">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                       <LayoutDashboard size={20} />
                    </div>
                    <p className="text-[11px] font-bold text-white/60 leading-relaxed italic">
                      يرجى مراجعة تفاصيل الحوالة (رقم العملية والمبلغ والتوقيت) في الصورة أعلاه قبل اتخاذ قرار الموافقة أو الرفض.
                    </p>
                 </div>
                 <button 
                   onClick={() => setSelectedReceipt(null)}
                   className="w-full py-4 bg-white text-black font-black rounded-2xl text-[10px] uppercase tracking-widest active:scale-[0.98] transition-all"
                 >
                    إغلاق العرض
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
