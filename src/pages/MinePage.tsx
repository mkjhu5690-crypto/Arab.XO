import { Bell, Wallet, LogOut, ChevronRight, Calculator, FileClock, ShieldCheck, Key, Camera, X, Shield, History, ArrowDownLeft, ArrowUpRight, SortAsc, SortDesc, Smartphone, Monitor, Globe, Moon, Sun, ToggleLeft, ToggleRight, Settings, Upload, Image as ImageIcon, ReceiptText, Crown, AlertCircle, Send, ExternalLink, LayoutDashboard, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, ChangeEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useBalance } from '../lib/BalanceContext';
import { useTranslation } from 'react-i18next';
import { DepositModal, WithdrawModal } from '../components/FinancialModals';

function DeactivateAccountModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-[2rem] w-full max-w-sm p-8 space-y-6 text-center transition-colors"
      >
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldCheck size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold dark:text-white">إغلاق الحساب</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
            هل أنت متأكد أنك تريد إغلاق حسابك؟ هذا الإجراء نهائي ولا يمكن التراجع عنه. ستفقد جميع أرصدتك وبياناتك.
          </p>
        </div>
        <div className="space-y-3">
          <button 
            onClick={() => { setConfirming(true); setTimeout(() => onClose(), 2000); }}
            className={cn(
              "w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg",
              confirming ? "bg-gray-400" : "bg-red-500 shadow-red-500/20"
            )}
          >
            {confirming ? "جاري الإغلاق..." : "تأكيد إغلاق الحساب"}
          </button>
          <button onClick={onClose} className="w-full py-2 text-sm text-gray-500 font-bold">إلغاء</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function RechargeHistoryModal({ isOpen, onClose }: any) {
  if (!isOpen) return null;
  // This would ideally fetch from BalanceContext or API
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-[2rem] w-full max-w-md p-8 space-y-6 max-h-[85vh] flex flex-col"
      >
        <div className="flex justify-between items-center text-right" dir="rtl">
          <h3 className="text-xl font-bold">تاريخ الشحن</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
        </div>
        <div className="flex-1 overflow-y-auto pt-4 space-y-4 pr-2 text-right scrollbar-hide" dir="rtl">
           <p className="text-xs text-gray-400 text-center py-10">لا توجد سجلات شحن حالياً</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

const AVATARS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=500&auto=format&fit=crop&q=60",
];

function ProfileEditModal({ isOpen, onClose, user, onSave }: any) {
  const [formData, setFormData] = useState(user);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-[#1a1a1a] rounded-[2.5rem] w-full max-w-sm p-8 space-y-6 border border-white/10 shadow-2xl"
      >
        <div className="flex justify-between items-center text-right" dir="rtl">
          <h3 className="text-xl font-black text-white uppercase tracking-tight">تعديل الملف الشخصي</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/40"><X size={24} /></button>
        </div>
        <div className="flex flex-col items-center gap-6" dir="rtl">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl">
              <img src={formData.avatar} className="w-full h-full object-cover" />
            </div>
            <button 
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="absolute bottom-0 right-0 bg-primary text-black p-2.5 rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all"
            >
              <Camera size={18} strokeWidth={2.5} />
            </button>
            
            <AnimatePresence>
              {showAvatarPicker && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: 10 }}
                  className="absolute top-full mt-4 bg-white/10 backdrop-blur-xl border border-white/20 p-3 rounded-[2rem] flex gap-2 z-50 shadow-2xl shadow-black"
                >
                  {AVATARS.map((url, i) => (
                    <button 
                      key={i} 
                      onClick={() => { setFormData({...formData, avatar: url}); setShowAvatarPicker(false); }}
                      className="w-12 h-12 rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-all active:scale-90"
                    >
                      <img src={url} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-full space-y-4 text-right">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mr-2">الاسم المستعار</label>
              <input 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm text-right text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mr-2">النبذة الشخصية (Bio)</label>
              <textarea 
                value={formData.bio || ''} 
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="أخبرنا المزيد عنك..."
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm text-right text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[100px] resize-none"
              />
            </div>
          </div>
        </div>
        <button 
          onClick={() => { onSave(formData); onClose(); }}
          className="w-full bg-primary text-black font-black py-5 rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all text-sm uppercase tracking-widest"
        >
          حفظ التغييرات
        </button>
      </motion.div>
    </motion.div>
  );
}

function FinancialRecordsModal({ isOpen, onClose }: any) {
  const { t } = useTranslation();
  const { transactions } = useBalance();
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'vip_purchase' | 'task_reward'>('all');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const currentUserEmail = localStorage.getItem('currentUserEmail') || 'guest';

  if (!isOpen) return null;

  const filteredTxs = transactions
    .filter(tx => tx.userEmail === currentUserEmail)
    .filter(tx => filter === 'all' || tx.type === filter)
    .sort((a, b) => {
      let valA, valB;
      if (sortField === 'date') {
        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
      } else {
        valA = a.amount;
        valB = b.amount;
      }
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });

  const getTxTypeLabel = (type: string) => {
    switch(type) {
      case 'deposit': return 'إيداع';
      case 'withdrawal': return 'سحب';
      case 'vip_purchase': return 'ترقية VIP';
      case 'task_reward': return 'مكافأة مهمة';
      default: return type;
    }
  };

  const getTxIcon = (type: string) => {
    switch(type) {
      case 'deposit': return ArrowDownLeft;
      case 'withdrawal': return ArrowUpRight;
      case 'vip_purchase': return Crown;
      case 'task_reward': return CheckCircle2;
      default: return ReceiptText;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-[#1a1a1a] rounded-[2.5rem] w-full max-w-md p-8 space-y-6 max-h-[85vh] flex flex-col border border-white/10 shadow-2xl"
      >
        <div className="flex justify-between items-center text-right" dir="rtl">
          <h3 className="text-xl font-black text-white uppercase tracking-tight">{t('mine.financialRecords')}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 text-white/50 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <div className="space-y-4" dir="rtl">
          <div className="flex gap-2 p-1 bg-white/5 rounded-2xl overflow-x-auto scrollbar-hide">
            {(['all', 'deposit', 'withdrawal', 'vip_purchase', 'task_reward'] as const).map((tType) => (
              <button
                key={tType}
                onClick={() => setFilter(tType)}
                className={cn(
                  "flex-1 min-w-[70px] py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap",
                  filter === tType ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-white/40 hover:text-white/60"
                )}
              >
                {tType === 'all' ? 'الكل' : tType === 'deposit' ? 'إيداع' : tType === 'withdrawal' ? 'سحب' : tType === 'vip_purchase' ? 'VIP' : 'مهام'}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => { setSortField('date'); setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc'); }}
              className={cn(
                "flex justify-between items-center bg-white/5 p-4 rounded-2xl border transition-all",
                sortField === 'date' ? "border-primary/50 text-white" : "border-white/5 text-white/40"
              )}
            >
               <span className="text-[10px] font-black uppercase">التاريخ</span>
               {sortOrder === 'desc' ? <SortDesc size={14} /> : <SortAsc size={14} />}
            </button>
            <button 
              onClick={() => { setSortField('amount'); setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc'); }}
              className={cn(
                "flex justify-between items-center bg-white/5 p-4 rounded-2xl border transition-all",
                sortField === 'amount' ? "border-primary/50 text-white" : "border-white/5 text-white/40"
              )}
            >
               <span className="text-[10px] font-black uppercase">المبلغ</span>
               {sortOrder === 'desc' ? <SortDesc size={14} /> : <SortAsc size={14} />}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-right scrollbar-hide" dir="rtl">
          {filteredTxs.length > 0 ? filteredTxs.map(tx => {
            const Icon = getTxIcon(tx.type);
            return (
              <motion.div 
                layout
                key={tx.id} 
                className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                    (tx.type === 'deposit' || tx.type === 'task_reward') ? "bg-green-500/10 text-green-500" : 
                    tx.type === 'withdrawal' ? "bg-red-500/10 text-red-500" :
                    "bg-primary/10 text-primary"
                  )}>
                    <Icon size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">{getTxTypeLabel(tx.type)}</p>
                    <p className="text-[10px] font-bold text-white/30 font-mono tracking-tighter mt-0.5">{tx.date}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className={cn(
                    "text-lg font-black tracking-tighter",
                    (tx.type === 'deposit' || tx.type === 'task_reward') ? "text-green-500" : 
                    tx.type === 'withdrawal' ? "text-red-500" :
                    "text-primary"
                  )}>
                    {(tx.type === 'deposit' || tx.type === 'task_reward') ? '+' : '-'} {tx.amount.toFixed(2)}
                  </p>
                  <span className="text-[9px] font-black uppercase opacity-20">{tx.status}</span>
                </div>
              </motion.div>
            );
          }) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-20 text-white">
              <FileClock size={64} strokeWidth={1} />
              <p className="text-xs font-black uppercase mt-4 tracking-widest">لا توجد سجلات حالياً</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function SecurityModal({ isOpen, onClose, onDeactivate }: any) {
  if (!isOpen) return null;
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-[#1a1a1a] rounded-[2.5rem] w-full max-w-md p-8 space-y-6 border border-white/10 shadow-2xl"
      >
        <div className="flex justify-between items-center text-right" dir="rtl">
          <h3 className="text-xl font-black text-white italic tracking-tight uppercase">إعدادات الأمان</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 text-white/40 rounded-full transition-colors"><X size={24} /></button>
        </div>
        <div className="space-y-4" dir="rtl">
          <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
             <div className="flex items-center gap-3 text-primary">
                <Shield size={24} />
                <p className="text-sm font-black uppercase tracking-tight">حماية الحساب</p>
             </div>
             <p className="text-[11px] text-white/40 leading-relaxed">يمكنك التحكم في مستوى أمان حسابك من هنا. يرجى الحذر عند اتخاذ قرارات مصيرية.</p>
          </div>
          <button 
            onClick={onDeactivate} 
            className="w-full p-5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl font-black text-sm text-right transition-all border border-red-500/20 group flex items-center justify-between"
          >
            <span>إغلاق الحساب نهائياً</span>
            <AlertCircle size={20} className="opacity-40 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function WithdrawHistoryModal({ isOpen, onClose }: any) {
  const { t } = useTranslation();
  const { transactions } = useBalance();
  const currentUserEmail = localStorage.getItem('currentUserEmail') || 'guest';
  const withdrawals = transactions.filter(tx => tx.type === 'withdrawal' && tx.userEmail === currentUserEmail);

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-[#1a1a1a] rounded-[2.5rem] w-full max-w-md p-8 space-y-6 max-h-[85vh] flex flex-col border border-white/10 shadow-2xl"
      >
        <div className="flex justify-between items-center text-right" dir="rtl">
          <h3 className="text-xl font-black text-white uppercase tracking-tight">سجل السحوبات</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 text-white/50 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-right scrollbar-hide" dir="rtl">
          {withdrawals.length > 0 ? withdrawals.map(tx => (
            <div key={tx.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
                  <ArrowUpRight size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-black text-white">سحب USDT</p>
                  <p className="text-[10px] font-bold text-white/30 font-mono tracking-tighter mt-0.5">{tx.date}</p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-lg font-black tracking-tighter text-red-500">
                  - {tx.amount.toFixed(2)}
                </p>
                <div className="flex items-center justify-end gap-1.5">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full animate-pulse",
                    tx.status === 'completed' ? "bg-green-500" : "bg-yellow-500"
                  )} />
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest",
                    tx.status === 'completed' ? "text-green-500" : "text-yellow-500"
                  )}>{tx.status === 'completed' ? 'ناجح' : 'قيد الانتظار'}</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-20 text-white">
              <History size={64} strokeWidth={1} />
              <p className="text-xs font-black uppercase mt-4 tracking-widest">لا توجد سجلات سحب</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function WithdrawLimitsModal({ isOpen, onClose }: any) {
  const [limits, setLimits] = useState({ daily: 100, monthly: 5000 });
  if (!isOpen) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#1a1a1a] rounded-[2.5rem] w-full max-w-sm p-8 space-y-6 shadow-2xl border border-white/10">
        <div className="flex justify-between items-center text-right" dir="rtl">
          <h3 className="text-xl font-black text-white italic tracking-tight uppercase">حدود السحب</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 text-white/40 rounded-full transition-colors"><X size={24} /></button>
        </div>
        <div className="space-y-4" dir="rtl">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 mr-2 uppercase tracking-widest">الحد اليومي (USDT)</label>
            <input type="number" value={limits.daily} onChange={(e) => setLimits({...limits, daily: Number(e.target.value)})} className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 mr-2 uppercase tracking-widest">الحد الشهري (USDT)</label>
            <input type="number" value={limits.monthly} onChange={(e) => setLimits({...limits, monthly: Number(e.target.value)})} className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
          </div>
        </div>
        <button onClick={onClose} className="w-full bg-primary text-black font-black py-5 rounded-2xl shadow-xl shadow-primary/10 active:scale-95 transition-all text-sm uppercase tracking-widest">حفظ الحدود</button>
      </motion.div>
    </motion.div>
  );
}

function NotificationSettingsModal({ isOpen, onClose }: any) {
  const [settings, setSettings] = useState({ promotions: true, tasks: true, security: true });
  if (!isOpen) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#1a1a1a] rounded-[2.5rem] w-full max-w-sm p-8 space-y-6 shadow-2xl border border-white/10">
        <div className="flex justify-between items-center text-right" dir="rtl">
          <h3 className="text-xl font-black text-white italic tracking-tight uppercase">ضبط التنبيهات</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 text-white/40 rounded-full transition-colors"><X size={24} /></button>
        </div>
        <div className="space-y-3" dir="rtl">
          {[
            { id: 'promotions', label: 'العروض والمكافآت', desc: 'تنبيهات حول الفرص الاستثمارية الجديدة' },
            { id: 'tasks', label: 'تحديثات المهام', desc: 'إشعار عند قبول أو انتهاء صلاحية المهمة' },
            { id: 'security', label: 'تحذيرات الأمان', desc: 'تنبيهات الدخول والنشاط على الحساب' }
          ].map((item) => (
            <div key={item.id} className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
              <div className="text-right">
                <p className="text-[11px] font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">{item.label}</p>
                <p className="text-[9px] text-white/30 font-bold mt-0.5">{item.desc}</p>
              </div>
              <button 
                onClick={() => setSettings({...settings, [item.id]: !settings[item.id as keyof typeof settings]})}
                className={cn(
                  "w-12 h-6 rounded-full relative transition-all duration-500", 
                  settings[item.id as keyof typeof settings] ? "bg-primary shadow-lg shadow-primary/20" : "bg-white/10"
                )}
              >
                <motion.div 
                  animate={{ x: settings[item.id as keyof typeof settings] ? 24 : 4 }} 
                  className={cn(
                    "absolute top-1 left-0 w-4 h-4 rounded-full shadow-sm transition-colors",
                    settings[item.id as keyof typeof settings] ? "bg-black" : "bg-white/40"
                  )} 
                />
              </button>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="w-full bg-primary text-black font-black py-5 rounded-2xl shadow-xl shadow-primary/10 active:scale-95 transition-all text-sm uppercase tracking-widest">تحديث الإعدادات</button>
      </motion.div>
    </motion.div>
  );
}

export default function MinePage() {
  const { t } = useTranslation();
  const location = useLocation();
  const { balance, vipLevel, isAdmin, currentUserEmail } = useBalance();
  const [user, setUser] = useState({
    email: currentUserEmail,
    avatar: isAdmin ? "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=500&auto=format&fit=crop" : "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60",
    bio: isAdmin ? "مدير النظام | Arab XO Owner" : "متطلع دائماً لأفضل الفرص الاستثمارية 🚀"
  });

  useEffect(() => {
    setUser(prev => ({ ...prev, email: currentUserEmail }));
  }, [currentUserEmail]);

  const [modals, setModals] = useState({
    profile: false,
    records: false,
    security: false,
    recharge: false,
    deactivate: false,
    deposit: false,
    withdraw: false,
    withdrawHistory: false,
    notifications: false
  });

  const navigate = useNavigate();

  const ACTIONS_USER = [
    { id: 1, labelKey: 'mine.recharge', icon: Wallet, color: 'bg-primary', action: () => setModals(m => ({ ...m, deposit: true })) },
    { id: 2, labelKey: 'mine.withdraw', icon: ShieldCheck, color: 'bg-primary', action: () => setModals(m => ({ ...m, withdraw: true })) },
    { id: 3, labelKey: 'mine.financialRecords', icon: FileClock, color: 'bg-primary', action: () => setModals(m => ({ ...m, records: true })) },
  ];

  if (isAdmin) {
    ACTIONS_USER.unshift({ 
        id: 0, 
        labelKey: 'Dashboard', 
        icon: LayoutDashboard, 
        color: 'bg-primary', 
        action: () => navigate('/admin') 
    });
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get('action');
    if (action === 'deposit') {
      setModals(m => ({ ...m, deposit: true }));
    } else if (action === 'withdraw') {
      setModals(m => ({ ...m, withdraw: true }));
    }
  }, [location]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 space-y-6 max-w-md mx-auto mb-20"
    >
      <AnimatePresence mode="wait">
        {modals.profile && (
          <ProfileEditModal 
            isOpen={modals.profile} 
            onClose={() => setModals({...modals, profile: false})}
            user={{ ...user, vip: vipLevel }}
            onSave={setUser}
          />
        )}
        {modals.records && (
          <FinancialRecordsModal 
            isOpen={modals.records} 
            onClose={() => setModals({...modals, records: false})} 
          />
        )}
        {modals.security && (
          <SecurityModal 
            isOpen={modals.security} 
            onClose={() => setModals({...modals, security: false})}
            onDeactivate={() => setModals({...modals, security: false, deactivate: true})}
          />
        )}
        {modals.recharge && (
          <RechargeHistoryModal 
            isOpen={modals.recharge} 
            onClose={() => setModals({...modals, recharge: false})} 
          />
        )}
        {modals.deactivate && (
          <DeactivateAccountModal 
            isOpen={modals.deactivate} 
            onClose={() => setModals({...modals, deactivate: false})} 
          />
        )}
        {modals.deposit && (
          <DepositModal 
            isOpen={modals.deposit} 
            onClose={() => setModals({...modals, deposit: false})} 
          />
        )}
        {modals.withdraw && (
          <WithdrawModal 
            isOpen={modals.withdraw} 
            onClose={() => setModals({...modals, withdraw: false})} 
          />
        )}
        {modals.withdrawHistory && (
          <WithdrawHistoryModal 
            isOpen={modals.withdrawHistory} 
            onClose={() => setModals({...modals, withdrawHistory: false})} 
          />
        )}
        {modals.limits && (
          <WithdrawLimitsModal 
            isOpen={modals.limits} 
            onClose={() => setModals({...modals, limits: false})} 
          />
        )}
        {modals.notifications && (
          <NotificationSettingsModal 
            isOpen={modals.notifications} 
            onClose={() => setModals({...modals, notifications: false})} 
          />
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center text-white px-2">
        <button className="bg-white/5 p-3 rounded-2xl border border-white/5 backdrop-blur-md">
          <Bell size={20} />
        </button>
        <span className="text-xl font-black tracking-widest uppercase">{t('home.companyName')}</span>
        <div className="w-10 h-10" />
      </div>

      <div className="bg-[#1a1a1a] text-white rounded-[2.5rem] p-8 space-y-10 relative overflow-hidden shadow-2xl border border-white/5">
        {/* Glow Effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-[80px]" />
        
        <div className="flex justify-between items-start relative z-10" dir="rtl">
          <div className="flex items-center gap-4">
             <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setModals({...modals, profile: true})}
              className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 relative group overflow-hidden shadow-xl"
            >
               <img src={user.avatar} className="w-full h-full rounded-2xl object-cover transition-transform group-hover:scale-110" />
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Camera size={16} />
               </div>
            </motion.button>
            <div className="space-y-1">
              <h3 className="text-lg font-black tracking-tight truncate max-w-[150px]">{user.email}</h3>
              <div className="flex items-center gap-2">
                 <span className="bg-primary text-black px-3 py-0.5 rounded-lg text-[9px] font-black italic shadow-lg shadow-primary/20">
                   {vipLevel.replace('VIP ', 'M')}
                 </span>
                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              </div>
              <p className="text-[10px] text-white/40 italic line-clamp-1">{user.bio}</p>
            </div>
          </div>
          <button onClick={() => setModals({...modals, security: true})} className="text-white/20 hover:text-primary transition-colors">
            <Settings size={22} />
          </button>
        </div>

        <div className="space-y-4 relative z-10" dir="rtl">
           <div className="flex justify-between items-end">
              <div>
                 <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">الرصيد المتاح</p>
                 <motion.h4 
                   key={balance}
                   initial={{ scale: 1.1, color: '#fdd835' }}
                   animate={{ scale: 1, color: '#fff' }}
                   className="text-4xl font-black tracking-tighter"
                 >
                   {balance.toFixed(2)} <span className="text-sm text-primary">USDT</span>
                 </motion.h4>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-left">
                 <p className="text-[10px] font-bold text-white/20 mb-0.5">الدخل التراكمي</p>
                 <p className="text-sm font-black text-green-500">+12.45</p>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setModals({...modals, deposit: true})}
                className="bg-primary text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary/10 active:scale-95 transition-all"
              >
                <ArrowDownLeft size={20} strokeWidth={3} />
                تعبئة رصيد
              </button>
              <button 
                onClick={() => setModals({...modals, withdraw: true})}
                className="bg-white/5 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 border border-white/10 active:scale-95 transition-all"
              >
                <ArrowUpRight size={20} strokeWidth={3} />
                ينسحب
              </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {ACTIONS_USER.map((action) => (
          <button 
            key={action.id}
            onClick={() => action.action && action.action()}
            className="bg-[#1a1a1a] p-4 rounded-3xl flex flex-col items-center gap-2 border border-white/5 shadow-sm hover:border-primary/20 transition-all group"
          >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-primary shrink-0 bg-white/5 group-hover:bg-primary group-hover:text-black transition-colors")}>
              <action.icon size={20} />
            </div>
            <span className="text-[10px] font-black uppercase text-white/60 tracking-tighter text-center">{t(action.labelKey)}</span>
          </button>
        ))}
      </div>

      <div className="bg-[#1a1a1a] rounded-[2.5rem] overflow-hidden shadow-sm border border-white/5">
        {[
          { id: 'withdrawHistory', label: 'سجل السحوبات', icon: History, modal: 'withdrawHistory' },
          { id: 'limits', label: 'mine.withdrawLimits', icon: Settings, modal: 'limits' },
          { id: 'notifications', label: 'mine.notifications', icon: Bell, modal: 'notifications' },
          { id: 'security', label: 'mine.security', icon: Shield, modal: 'security' },
          { id: 'profile', label: 'mine.changePassword', icon: Key, modal: 'profile' },
        ].map((item, idx, arr) => (
          <div key={item.id}>
            <button 
              onClick={() => setModals(m => ({ ...m, [item.modal as keyof typeof modals]: true }))}
              className="w-full p-6 flex justify-between items-center hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/5 text-primary p-2.5 rounded-xl border border-white/5 group-hover:bg-primary group-hover:text-black transition-colors">
                  <item.icon size={18} />
                </div>
                <span className="text-sm font-black text-white/80 group-hover:text-white transition-colors">{t(item.label)}</span>
              </div>
              <ChevronRight size={18} className="text-white/20 group-hover:translate-x-1 transition-all" />
            </button>
            {idx < arr.length - 1 && <div className="h-px bg-white/5 mx-6" />}
          </div>
        ))}
      </div>

      <button 
        onClick={() => {
          const email = localStorage.getItem('currentUserEmail') || 'guest';
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem(`${email}_isAdmin`);
          localStorage.removeItem('currentUserEmail');
          window.location.href = '/login';
        }} 
        className="w-full py-4 text-red-500 font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 bg-red-500/5 rounded-2xl border border-red-500/10 hover:bg-red-500/10 transition-colors"
      >
        <LogOut size={16} />
        {t('mine.logout')}
      </button>
    </motion.div>
  );
}
