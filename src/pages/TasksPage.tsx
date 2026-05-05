import { Clock, CheckCircle2, RefreshCw, DollarSign, TrendingUp, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo, useEffect } from 'react';
import { cn } from '../lib/utils';
import { useBalance } from '../lib/BalanceContext';
import { useNotifications } from '../lib/NotificationContext';

function TaskCountdown({ nextAvailable, onFinish }: { nextAvailable: number; onFinish: () => void }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const diff = nextAvailable - now;
      
      if (diff <= 0) {
        onFinish();
        return '00:00:00';
      }
      
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const timer = setInterval(() => {
      const time = calculateTime();
      setTimeLeft(time);
    }, 1000);

    setTimeLeft(calculateTime());
    return () => clearInterval(timer);
  }, [nextAvailable, onFinish]);

  return (
    <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
      <Clock size={14} className="text-primary animate-pulse" />
      <span className="text-lg font-mono font-black text-primary tracking-wider">{timeLeft}</span>
    </div>
  );
}

export default function TasksPage() {
  const { collectSubscriptions, vipLevel, subscriptions, balance } = useBalance();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'collect' | 'completed'>('collect');
  const [isCollecting, setIsCollecting] = useState(false);
  
  // Calculate what's collectible today
  const collectibleInfo = useMemo(() => {
    const now = new Date().toDateString();
    let total = 0;
    let collectibleCount = 0;
    
    // Standard M rewards mapping - we use dailyProfit from sub if available, otherwise fallback
    const rewards: Record<string, number> = {
      'M1': 3.00,
      'M2': 9.00,
      'M3': 28.00,
      'M4': 80.00,
      'M5': 225.00,
      'M6': 600.00
    };

    subscriptions.forEach((sub: any) => {
      const lastCollect = sub.lastCollectDate ? new Date(sub.lastCollectDate).toDateString() : '';
      if (lastCollect !== now) {
        total += parseFloat(sub.dailyProfit || rewards[sub.level] || 0);
        collectibleCount++;
      }
    });

    return { total, count: collectibleCount, allCollected: subscriptions.length > 0 && collectibleCount === 0 };
  }, [subscriptions]);

  const { total: totalToCollect, count: activeToCollect, allCollected } = collectibleInfo;

  // Sync tab with collection status
  useEffect(() => {
    if (allCollected) {
      setActiveTab('completed');
    } else {
      setActiveTab('collect');
    }
  }, [allCollected]);

  const handleCollect = async () => {
    if (isCollecting) return;

    if (subscriptions.length === 0) {
      addNotification({
        title: 'اشتراك مطلوب',
        message: 'يجب عليك الاشتراك في أحد المستويات (M1 - M6) لتتمكن من جمع الأرباح.',
        type: 'error'
      });
      return;
    }

    if (allCollected || totalToCollect <= 0) return;

    setIsCollecting(true);
    
    try {
      const rewardAmount = await collectSubscriptions();

      if (rewardAmount > 0) {
        const newTotalBalance = (parseFloat(balance.toString()) + rewardAmount).toFixed(2);
        addNotification({
          title: 'لقد أكملت المهمة بنجاح',
          message: `تمت إضافة ${rewardAmount.toFixed(2)} USDT. رصيدك الآن: ${newTotalBalance} USDT`,
          type: 'success'
        });
        setActiveTab('completed');
      }
    } catch (err) {
      console.error(err);
      addNotification({
        title: 'فشل الجمع',
        message: 'حدث خطأ أثناء محاولة جمع الأرباح',
        type: 'error'
      });
    } finally {
      setIsCollecting(false);
    }
  };

  const totalActiveRewards = useMemo(() => {
    const rewards: Record<string, number> = {
      'M1': 3.00, 'M2': 9.00, 'M3': 28.00, 'M4': 80.00, 'M5': 225.00, 'M6': 600.00
    };
    return subscriptions.reduce((acc: number, sub: any) => acc + parseFloat(sub.dailyProfit || rewards[sub.level] || 0), 0);
  }, [subscriptions]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 space-y-6 max-w-md mx-auto mb-20 relative min-h-[80vh]"
      dir="rtl"
    >
      <div className="flex justify-center flex-col items-center gap-2 mb-8">
        <h2 className="text-2xl font-black text-white italic tracking-widest uppercase">عرب اكس أو</h2>
        <div className="bg-primary/20 text-primary text-[10px] font-black px-4 py-1 rounded-full border border-primary/20">
          نظام جمع الأرباح الآلي
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#1a1a1a] p-1 rounded-2xl flex border border-white/5 shadow-inner">
        <button 
          onClick={() => setActiveTab('collect')}
          className={cn(
            "flex-1 py-4 text-xs font-black rounded-xl transition-all duration-300 uppercase tracking-widest",
            activeTab === 'collect' ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-white/40"
          )}
        >
          اجمع الأرباح
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={cn(
            "flex-1 py-4 text-xs font-black rounded-xl transition-all duration-300 uppercase tracking-widest",
            activeTab === 'completed' ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-white/40"
          )}
        >
          مكتمل الجمع
        </button>
      </div>

      <div className="pt-10">
        <AnimatePresence mode="wait">
          {activeTab === 'collect' ? (
            <motion.div 
              key="collect-tab"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center space-y-12"
            >
              <div className="relative">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute inset-0 bg-primary/20 rounded-full blur-3xl -z-10"
                />
                <div className="w-56 h-56 rounded-full border-8 border-white/5 flex items-center justify-center p-4">
                  <div className="w-full h-full rounded-full border-4 border-primary/30 border-dashed animate-[spin_20s_linear_infinite] absolute" />
                  <button 
                    disabled={isCollecting || (subscriptions.length > 0 && (allCollected || totalToCollect <= 0))}
                    onClick={handleCollect}
                    className={cn(
                      "w-44 h-44 rounded-full flex flex-col items-center justify-center gap-2 transition-all shadow-2xl relative z-10",
                      (subscriptions.length > 0 && (allCollected || totalToCollect <= 0))
                        ? "bg-white/5 text-white/20 border border-white/10 cursor-not-allowed"
                        : "bg-gradient-to-br from-primary via-accent to-primary text-black hover:scale-105 active:scale-95 shadow-primary/30"
                    )}
                  >
                    {isCollecting ? (
                      <RefreshCw size={48} className="animate-spin" />
                    ) : (
                      <>
                        <DollarSign size={48} strokeWidth={3} />
                        <span className="font-black text-sm uppercase tracking-widest">{allCollected ? "مكتمل" : "إجمع الآن"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="w-full space-y-4">
                <div className="bg-[#1a1a1a] rounded-[2rem] p-6 border border-white/5 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">حالة المستويات اليومية</p>
                    <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-lg border border-primary/20">
                      <TrendingUp size={12} className="text-primary" />
                      <span className="text-[8px] font-black text-primary">{activeToCollect} جاهز</span>
                    </div>
                  </div>
                  
                  {/* Levels Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {[
                      { id: 'M1', reward: 3.00 },
                      { id: 'M2', reward: 9.00 },
                      { id: 'M3', reward: 28.00 },
                      { id: 'M4', reward: 80.00 },
                      { id: 'M5', reward: 225.00 },
                      { id: 'M6', reward: 600.00 }
                    ].map((lvl) => {
                      const sub = subscriptions.find((s: any) => s.level === lvl.id);
                      const isSubscribed = !!sub;
                      const now = new Date().toDateString();
                      const isCollected = sub?.lastCollectDate ? new Date(sub.lastCollectDate).toDateString() === now : false;
                      const canCollect = isSubscribed && !isCollected;

                      return (
                        <div 
                          key={lvl.id}
                          className={cn(
                            "p-3 rounded-2xl border transition-all flex flex-col gap-1 relative overflow-hidden",
                            canCollect
                              ? "bg-primary/5 border-primary/30 shadow-lg shadow-primary/5" 
                              : isSubscribed 
                                ? "bg-green-500/5 border-green-500/20 opacity-60"
                                : "bg-white/5 border-white/5 opacity-20"
                          )}
                        >
                          {canCollect && <div className="absolute top-0 right-0 w-8 h-8 bg-primary/20 rounded-full blur-xl -mr-4 -mt-4 text-primary" />}
                          <div className="flex justify-between items-center">
                            <span className={cn("text-[10px] font-black italic", canCollect ? "text-primary" : "text-white/40")}>{lvl.id}</span>
                            {canCollect ? (
                              <CheckCircle2 size={12} className="text-primary" />
                            ) : isSubscribed ? (
                              <CheckCircle2 size={12} className="text-green-500" />
                            ) : (
                              <Lock size={12} className="text-white/20" />
                            )}
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs font-black text-white">{lvl.reward.toFixed(2)}</span>
                            <span className="text-[8px] text-white/30">USDT</span>
                          </div>
                          <p className={cn(
                            "text-[7px] font-bold uppercase tracking-tighter",
                            canCollect ? "text-primary" : isSubscribed ? "text-green-500" : "text-white/20"
                          )}>
                            {canCollect ? 'جاهز للجمع' : isSubscribed ? 'تم الجمع اليوم' : 'غير مشترك'}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <div className="flex justify-between items-end mb-1">
                      <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">إجمالي الأرباح المستحقة</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-white italic">USDT {totalToCollect.toFixed(2)}</span>
                    </div>
                  </div>

                  <p className="text-[9px] text-white/20 mt-4 leading-relaxed font-bold text-center">
                    سيتم إضافة أرباح جميع المستويات النشطة دفعة واحدة.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="completed-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center space-y-8"
            >
              <div className="w-48 h-48 bg-green-500/10 rounded-full flex items-center justify-center relative overflow-hidden border border-green-500/20">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-green-500"
                >
                  <CheckCircle2 size={84} strokeWidth={3} />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-white italic uppercase">تم الجمع بنجاح</h3>
                <p className="text-white/40 text-sm font-bold">لقد قمت بجمع أرباح اليوم بالكامل</p>
              </div>

              <div className="w-full bg-[#1a1a1a] rounded-[2rem] p-6 border border-white/5 text-right">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <Clock size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest leading-none mb-1">الجمع القادم</p>
                    <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full border border-primary/20 mt-1">
                      <CheckCircle2 size={14} className="text-primary" />
                      <span className="text-lg font-mono font-black text-primary tracking-wider">غداً</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-xs text-white/40 font-bold">إجمالي أرباح اليوم</span>
                    <span className="text-sm font-black text-green-500">{totalActiveRewards.toFixed(2)} USDT</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-xs text-white/40 font-bold">الحالة</span>
                    <span className="text-xs font-black text-green-500">مكتمل</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-xs text-white/40 font-bold">المستوى</span>
                    <span className="text-xs font-black text-primary italic uppercase">{vipLevel}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setActiveTab('collect')}
                className="text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:text-accent transition-colors"
              >
                العودة لصفحة الجمع
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
