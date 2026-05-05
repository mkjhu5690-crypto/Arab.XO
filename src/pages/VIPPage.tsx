import { Crown, X, CheckCircle2, Lock, Sparkles, TrendingUp, Zap, Gift, ShieldCheck, Headset, Gem, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo } from 'react';
import { cn } from '../lib/utils';
import { useBalance } from '../lib/BalanceContext';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../lib/NotificationContext';

const VIP_LEVELS = [
  { 
    id: 1, 
    level: 'M1', 
    price: '110.00', 
    dailyReturn: '2.73%', 
    dailyIncome: '3.00', 
    monthlyIncome: '90.00', 
    annualIncome: '1095.00',
    description: 'المستوى الأول: يوفر عائداً مستقراً للمبتدئين في المنصة.'
  },
  { 
    id: 2, 
    level: 'M2', 
    price: '300.00', 
    dailyReturn: '3.00%', 
    dailyIncome: '9.00', 
    monthlyIncome: '270.00', 
    annualIncome: '3285.00',
    description: 'المستوى الثاني: أرباح أعلى مع مزايا سحب أسرع.'
  },
  { 
    id: 3, 
    level: 'M3', 
    price: '800.00', 
    dailyReturn: '3.50%', 
    dailyIncome: '28.00', 
    monthlyIncome: '840.00', 
    annualIncome: '10220.00',
    description: 'المستوى الثالث: دخول عالم المحترفين مع دعم مخصص.'
  },
  { 
    id: 4, 
    level: 'M4', 
    price: '2000.00', 
    dailyReturn: '4.00%', 
    dailyIncome: '80.00', 
    monthlyIncome: '2400.00', 
    annualIncome: '29200.00',
    description: 'المستوى الرابع: عائد استثماري استثنائي ومكافآت إضافية.'
  },
  { 
    id: 5, 
    level: 'M5', 
    price: '5000.00', 
    dailyReturn: '4.50%', 
    dailyIncome: '225.00', 
    monthlyIncome: '6750.00', 
    annualIncome: '82125.00',
    description: 'المستوى الخامس: نخبة المستثمرين مع أولوية قصوى.'
  },
  { 
    id: 6, 
    level: 'M6', 
    price: '12000.00', 
    dailyReturn: '5.00%', 
    dailyIncome: '600.00', 
    monthlyIncome: '18000.00', 
    annualIncome: '219000.00',
    description: 'المستوى السادس: أعلى مستوى متاح بأقصى قدرات ربحية.'
  },
];

export default function VIPPage() {
  const { balance, vipLevel, purchaseVIP, subscriptions } = useBalance();
  const { addNotification } = useNotifications();
  const { t } = useTranslation();
  
  const [selectedVIP, setSelectedVIP] = useState<typeof VIP_LEVELS[0] | null>(null);
  const [activeStep, setActiveStep] = useState<'idle' | 'details' | 'confirm'>('idle');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = (vip: typeof VIP_LEVELS[0]) => {
    setSelectedVIP(vip);
    setActiveStep('details');
    setError(null);
  };

  const handleClose = () => {
    if (isSubscribing) return;
    setActiveStep('idle');
    setTimeout(() => {
      setSelectedVIP(null);
      setError(null);
    }, 300);
  };

  const handleConfirm = async () => {
    if (!selectedVIP) return;
    const price = parseFloat(selectedVIP.price);
    
    if (balance < price) {
      setError("رصيدك غير كافٍ. يرجى شحن الرصيد أولاً.");
      return;
    }

    setIsSubscribing(true);
    try {
      const success = await purchaseVIP(price, selectedVIP.level, parseFloat(selectedVIP.dailyIncome));
      if (success) {
        addNotification({
          title: 'تم الاشتراك بنجاح',
          message: `مبروك! لقد تم تفعيل باقة ${selectedVIP.level}`,
          type: 'success'
        });
        setActiveStep('idle');
      } else {
        setError("فشل الاشتراك. يرجى مراجعة الدعم.");
      }
    } catch (err) {
      setError("حدث خطأ تقني. حاول لاحقاً.");
    } finally {
      setIsSubscribing(false);
    }
  };

  const myActiveSubs = useMemo(() => {
    return (subscriptions || []).filter((s: any) => s.level !== 'M0');
  }, [subscriptions]);

  return (
    <div className="min-h-screen bg-[#050505] pb-32 selection:bg-primary/20">
      {/* Header */}
      <div className="bg-[#111] p-6 pt-8 pb-10 border-b border-primary/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
        <div className="flex justify-between items-center relative z-10">
          <h1 className="text-3xl font-black italic text-primary tracking-tighter">قاعة كبار الشخصيات</h1>
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 text-primary">
            <Crown size={24} />
          </div>
        </div>
      </div>

      {/* Balance Bar */}
      <div className="px-6 -mt-6 relative z-20">
        <div className="bg-[#1a1a1a] p-5 rounded-[2.5rem] border border-primary/20 shadow-2xl flex justify-between items-center backdrop-blur-xl">
          <div className="text-right" dir="rtl">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">رصيدك الحالي</p>
            <p className="text-2xl font-black text-white italic">{balance.toFixed(2)} <span className="text-primary text-xs not-italic">USDT</span></p>
          </div>
          <div className="bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20 text-right">
            <p className="text-[9px] font-black text-primary uppercase">مواصفات الحساب</p>
            <p className="text-sm font-black text-white italic">{vipLevel}</p>
          </div>
        </div>
      </div>

      {/* Active Subscriptions Section */}
      {myActiveSubs.length > 0 && (
        <div className="px-6 py-10" dir="rtl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
              <CheckCircle2 size={18} />
            </div>
            <h3 className="text-lg font-black text-white italic">اشتراكاتك النشطة</h3>
          </div>
          <div className="space-y-4">
            {myActiveSubs.map((sub, i) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                key={i} 
                className="bg-white/5 border border-white/5 rounded-[2rem] p-5 flex justify-between items-center"
              >
                <div>
                  <p className="text-xl font-black text-white italic">{sub.level}</p>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">تم التفعيل: {new Date(sub.purchaseDate).toLocaleDateString()}</p>
                </div>
                <div className="text-left">
                  <p className="text-green-500 font-black text-lg">+{sub.dailyProfit} <span className="text-[10px]">USDT/Day</span></p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* VIP Tiers Listing */}
      <div className="px-6 py-8" dir="rtl">
        <h3 className="text-lg font-black text-white italic mb-8 px-2 uppercase tracking-tight">باقات الترقية المتاحة</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {VIP_LEVELS.map((v) => {
            const ownedCount = myActiveSubs.filter((s: any) => s.level === v.level).length;
            const isOwned = ownedCount > 0;
            
            return (
              <motion.div
                key={v.level}
                whileHover={{ y: -5 }}
                className={cn(
                  "bg-[#161616] rounded-[2.5rem] p-6 border transition-all duration-500 relative overflow-hidden group",
                  ownedCount > 0 ? "border-primary/50 shadow-lg shadow-primary/10" : "border-white/5 hover:border-primary/30"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/10">
                    <Gem size={28} />
                  </div>
                  {ownedCount > 0 && (
                    <div className="bg-primary text-black px-4 py-1.5 rounded-full font-black text-[10px] uppercase shadow-lg shadow-primary/20">
                      {ownedCount}x نشط
                    </div>
                  )}
                </div>

                <div className="mb-8 relative z-10">
                  <h4 className="text-3xl font-black text-white italic mb-1 tracking-tighter">{v.level}</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-primary italic leading-none">{v.price}</span>
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">USDT</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8 relative z-10">
                  <div className="bg-black/40 rounded-2xl p-4 border border-white/5 flex justify-between items-center group-hover:border-primary/20 transition-all">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest text-right">الدخل اليومي</span>
                    <span className="text-lg font-black text-green-500 italic">+{v.dailyIncome} <span className="text-[8px] not-italic text-white/40">USDT</span></span>
                  </div>
                </div>

                <button
                  disabled={isSubscribing}
                  onClick={() => handleOpen(v)}
                  className="w-full py-5 bg-gradient-to-br from-primary via-[#f1d275] to-primary text-black font-black rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 text-xs uppercase tracking-widest relative z-10"
                >
                  {isOwned ? 'ترقية إضافية' : 'اشترك الآن'}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Subscription Modal Container */}
      <AnimatePresence>
        {activeStep !== 'idle' && selectedVIP && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
          >
            {/* Backdrop */}
            <div 
              onClick={handleClose}
              className="absolute inset-0 bg-black/95 backdrop-blur-3xl"
            />
            
            {/* Modal Content */}
            <motion.div 
              key={activeStep}
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#111] w-full max-w-[340px] sm:max-w-sm rounded-[3.5rem] p-8 border border-primary/20 shadow-2xl relative overflow-hidden flex flex-col items-center text-center z-10"
            >
              <button 
                onClick={handleClose}
                className="absolute top-8 right-8 w-11 h-11 rounded-full bg-white/5 flex items-center justify-center text-white/40 border border-white/5 active:scale-90 transition-all z-20"
              >
                <X size={20} />
              </button>

              {activeStep === 'details' ? (
                <>
                  <div className="w-22 h-22 bg-gradient-to-br from-primary/20 to-primary/5 rounded-[2.5rem] flex items-center justify-center mb-8 text-primary border border-primary/10 shadow-inner relative">
                    <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />
                    <Gem size={44} className="animate-pulse relative" />
                  </div>
                  
                  <h3 className="text-3xl font-black text-white italic mb-3 tracking-tighter">تفاصيل {selectedVIP.level}</h3>
                  <p className="text-white/40 text-sm font-medium leading-relaxed px-2 mb-10 text-right" dir="rtl">
                    {selectedVIP.description}
                  </p>

                  <div className="w-full space-y-3 mb-10 text-right" dir="rtl">
                    <div className="bg-white/5 rounded-3xl p-5 border border-white/5 flex justify-between items-center">
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-widest text-right">تكلفة الترقية</span>
                      <span className="text-xl font-black text-primary italic">{selectedVIP.price} <span className="text-[10px] not-italic opacity-40 text-white ml-2">USDT</span></span>
                    </div>
                    <div className="bg-white/5 rounded-3xl p-5 border border-white/5 flex justify-between items-center">
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-widest text-right">العائد اليومي</span>
                      <span className="text-xl font-black text-green-500 italic">{selectedVIP.dailyIncome} <span className="text-[10px] not-italic opacity-40 text-white ml-2">USDT</span></span>
                    </div>
                    <div className="bg-white/5 rounded-3xl p-5 border border-white/5 flex justify-between items-center">
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-widest text-right">العائد السنوي</span>
                      <span className="text-xl font-black text-primary/80 italic">{selectedVIP.annualIncome} <span className="text-[10px] not-italic opacity-40 text-white ml-2">USDT</span></span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveStep('confirm')}
                    className="w-full py-6 bg-gradient-to-br from-primary via-[#f1d275] to-primary text-black font-black rounded-[2rem] shadow-[0_10px_30px_rgba(212,175,55,0.3)] flex items-center justify-center gap-3 active:scale-95 transition-all text-sm uppercase tracking-[0.2em] border-t border-white/40"
                  >
                    اشترك الآن
                  </button>
                </>
              ) : (
                <>
                  <div className="w-22 h-22 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mb-8 text-primary border border-primary/20 shadow-lg relative">
                    <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
                    <ShieldCheck size={44} className={cn("relative", isSubscribing && "animate-bounce")} />
                  </div>

                  <h3 className="text-3xl font-black text-white italic mb-3">تأكيد الدفع</h3>
                  <p className="text-white/40 text-sm font-bold mb-10 px-4 leading-relaxed" dir="rtl">
                    هل توافق على خصم <span className="text-primary text-lg">{selectedVIP.price} USDT</span> من رصيد حسابك لتفعيل باقة <span className="text-white text-lg">{selectedVIP.level}</span>؟
                  </p>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full bg-red-500/10 border border-red-500/20 p-5 rounded-[1.5rem] mb-10 flex items-center gap-4 text-right"
                    >
                      <AlertCircle className="text-red-500 shrink-0" size={20} />
                      <p className="text-[11px] font-black text-red-500 leading-relaxed uppercase">{error}</p>
                    </motion.div>
                  )}

                  <div className="w-full flex flex-col gap-4">
                    <button 
                      disabled={isSubscribing}
                      onClick={handleConfirm}
                      className="w-full py-5 bg-primary text-black font-black rounded-[1.8rem] shadow-[0_10px_20px_rgba(212,175,55,0.2)] flex items-center justify-center gap-3 active:scale-95 transition-all text-xs uppercase tracking-[0.25em] disabled:opacity-50"
                    >
                      {isSubscribing ? (
                        <>
                          <RefreshCw className="animate-spin" size={18} />
                          جاري معالجة الدفع...
                        </>
                      ) : "تأكيد الدفع الآن"}
                    </button>
                    {!isSubscribing && (
                      <button 
                        onClick={() => setActiveStep('details')}
                        className="w-full py-5 bg-white/5 text-white/50 font-black rounded-[1.8rem] border border-white/5 hover:bg-white/10 active:scale-95 transition-all text-xs uppercase tracking-[0.25em]"
                      >
                        الرجوع للخلف
                      </button>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Footer Features */}
      <div className="px-6 pb-20 mt-12 space-y-6">
        <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Zap, label: 'سحب فوري' },
            { icon: ShieldCheck, label: 'أمان عالي' },
            { icon: Headset, label: 'دعم 24/7' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary/40">
                <item.icon size={18} />
              </div>
              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
