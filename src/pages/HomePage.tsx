import { Bell, Mail, Globe, PlusCircle, ArrowUpCircle, FileText, Share2, ChevronLeft, ChevronRight, X, AlertCircle, CheckCircle, Search, Crown, Gift, Zap, Sparkles, TrendingUp, ShieldCheck, Gem } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import WithdrawalFeed from '../components/WithdrawalFeed';

import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';
import AssetPriceChart from '../components/AssetPriceChart';
import NotificationDrawer from '../components/NotificationDrawer';
import { useNotifications } from '../lib/NotificationContext';
import { DepositModal, WithdrawModal } from '../components/FinancialModals';
import OnboardingTour from '../components/OnboardingTour';

const BANNER_IMAGE = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop";

function ConfirmModal({ action, onConfirm, onCancel }: { action: 'deposit' | 'withdraw' | null, onConfirm: () => void, onCancel: () => void }) {
  const { t } = useTranslation();
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-[#1a1a1a] rounded-[2.5rem] w-full max-w-sm p-8 space-y-6 text-center border border-white/10 shadow-2xl"
      >
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto border border-primary/20">
          <AlertCircle size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-white uppercase tracking-tight">تأكيد العملية</h3>
          <p className="text-sm text-white/40 leading-relaxed">
            {action === 'deposit' ? 'هل أنت متأكد أنك تريد بدء عملية شحن الرصيد؟' : 'هل أنت متأكد أنك تريد بدء عملية سحب الأموال؟'}
          </p>
        </div>
        <div className="space-y-3">
          <button 
            onClick={onConfirm}
            className="w-full py-5 bg-primary text-black font-black rounded-2xl shadow-xl shadow-primary/10 active:scale-95 transition-all text-sm uppercase tracking-widest"
          >
            تأكيد ومتابعة
          </button>
          <button onClick={onCancel} className="w-full py-2 text-xs text-white/20 font-black uppercase tracking-widest hover:text-white transition-colors">إلغاء</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AnnouncementModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-[#1a1a1a] rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl flex flex-col border border-white/5"
      >
        <div className="bg-primary p-6 text-center relative">
          <h2 className="text-black text-2xl font-black">{t('home.announcement')}</h2>
          <div className="absolute -bottom-1 left-0 right-0 h-4 bg-white/20 blur-md" />
        </div>
        
        <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-hide text-right" dir="rtl">
          <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
            <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">
              {t('home.announcementText')}
            </p>
          </div>
        </div>

        <div className="p-6 flex gap-3 border-t border-white/5">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-white/5 text-gray-400 font-bold rounded-2xl text-sm hover:bg-white/10 transition-colors"
          >
            {t('home.confirm')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function HomePage() {
  const { t } = useTranslation();
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const [processingAction, setProcessingAction] = useState<'deposit' | 'withdraw' | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'deposit' | 'withdraw' | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');

  const ACTIONS = [
    { id: 1, labelKey: 'home.recharge', icon: PlusCircle, color: 'bg-primary' },
    { id: 2, labelKey: 'home.withdraw', icon: ArrowUpCircle, color: 'bg-primary' },
    { id: 3, labelKey: 'home.app', icon: FileText, color: 'bg-primary' },
    { id: 4, labelKey: 'home.companyProfile', icon: Share2, color: 'bg-primary' },
    { id: 5, labelKey: 'home.invite', icon: Share2, color: 'bg-primary', path: '/team' },
    { id: 6, labelKey: 'home.agency', icon: Globe, color: 'bg-primary' },
  ];

  const handleActionClick = (actionId: number) => {
    if (actionId === 1) { // Recharge
      setPendingAction('deposit');
      setShowConfirmModal(true);
    } else if (actionId === 2) { // Withdraw
      setPendingAction('withdraw');
      setShowConfirmModal(true);
    } else {
      const action = ACTIONS.find(a => a.id === actionId);
      if (action?.path) navigate(action.path);
    }
  };

  const confirmAction = () => {
    if (!pendingAction) return;
    setShowConfirmModal(false);
    setProcessingAction(pendingAction);
    
    // Simulate processing
    setTimeout(() => {
      setProcessingAction(null);
      if (pendingAction === 'deposit') setShowDepositModal(true);
      if (pendingAction === 'withdraw') setShowWithdrawModal(true);
      setPendingAction(null);
    }, 2000);
  };

  useEffect(() => {
    if (!inviteCode) {
      setInviteStatus('idle');
      return;
    }
    setInviteStatus('validating');
    const timer = setTimeout(() => {
      // Mock validation: codes starting with 'XO' are valid
      if (inviteCode.toUpperCase().startsWith('XO') && inviteCode.length >= 6) {
        setInviteStatus('valid');
      } else {
        setInviteStatus('invalid');
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [inviteCode]);

  useEffect(() => {
    const timer = setTimeout(() => setShowAnnouncement(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 space-y-6 max-w-md mx-auto relative"
    >
      {processingAction && (
        <div className="fixed top-0 left-0 right-0 h-1.5 z-[200] overflow-hidden bg-white/5">
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: '0%' }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="h-full bg-primary shadow-[0_0_15px_rgba(212,175,55,0.8)]"
          />
        </div>
      )}

      <AnimatePresence>
        {showAnnouncement && <AnnouncementModal onClose={() => setShowAnnouncement(false)} />}
        {showConfirmModal && <ConfirmModal action={pendingAction} onConfirm={confirmAction} onCancel={() => setShowConfirmModal(false)} />}
      </AnimatePresence>
      <NotificationDrawer isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
      <DepositModal isOpen={showDepositModal} onClose={() => setShowDepositModal(false)} />
      <WithdrawModal isOpen={showWithdrawModal} onClose={() => setShowWithdrawModal(false)} />
      <OnboardingTour />

      {/* Header */}
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            <span className="text-sm text-black font-black">XO</span>
          </div>
          <span className="text-2xl font-black text-white tracking-tight">{t('home.companyName')}</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowNotifications(true)}
            className="text-white/60 hover:text-primary transition-colors relative group"
          >
            <motion.div
              animate={unreadCount > 0 ? {
                rotate: [0, -10, 10, -10, 10, 0],
                scale: [1, 1.1, 1]
              } : {}}
              transition={{
                duration: 0.5,
                repeat: unreadCount > 0 ? Infinity : 0,
                repeatDelay: 2
              }}
            >
              <Bell size={24} />
            </motion.div>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-[#0a0a0a]">
                {unreadCount}
              </span>
            )}
          </button>
          <LanguageSelector />
        </div>
      </div>

      {/* Scrolling News Marquee */}
      <div className="bg-primary/10 border-y border-primary/10 py-2 -mx-4 overflow-hidden flex items-center gap-4">
        <div className="bg-primary text-black text-[9px] font-black px-3 py-1 rounded-r-full shrink-0 z-10 shadow-lg">
          أخبار عاجلة
        </div>
        <motion.div 
          animate={{ x: [400, -1200] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="whitespace-nowrap text-[10px] font-bold text-primary/80 flex gap-12"
        >
          <span>🚀 انضم أكثر من 24 عضو جديد اليوم في مستويات M!</span>
          <span>💎 باقة M6 الماسية تمنحك أرباحاً تصل إلى 600 USDT يومياً!</span>
          <span>💰 تم سداد أكثر من 3,500 دولار كأرباح للمشتركين الجدد في آخر 24 ساعة</span>
          <span>🔒 أرباحك مضمونة 100% مع نظام التشغيل الذكي لمستويات M</span>
          <span>🌐 أصبحنا ندعم أكثر من 6 لغات لتسهيل تجربة المستثمرين العرب</span>
        </motion.div>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[1.8/1] border-2 border-primary/20">
        <img 
          src={BANNER_IMAGE} 
          alt="عرب اكس أو" 
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-8">
          <h2 className="text-primary text-3xl font-black tracking-tighter drop-shadow-lg">{t('home.companyName')}</h2>
          <p className="text-white/60 text-sm font-bold tracking-widest uppercase">{t('home.slogan')}</p>
        </div>
      </div>

      {/* Trust Stats Bar */}
      <div className="flex gap-4 px-1" dir="rtl">
        <div className="flex-1 bg-[#1a1a1a] p-4 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center space-y-1">
           <span className="text-primary font-black text-xl italic tracking-tighter">1,248+</span>
           <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest leading-none">مستثمر نشط</span>
        </div>
        <div className="flex-1 bg-[#1a1a1a] p-4 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center space-y-1">
           <span className="text-primary font-black text-xl italic tracking-tighter">$12,850+</span>
           <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest leading-none">إجمالي السحوبات</span>
        </div>
      </div>

      {/* Promotion / Benefits Section */}
      <div className="bg-gradient-to-br from-primary/20 to-transparent p-6 rounded-[2.5rem] border border-primary/10 space-y-4" dir="rtl">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-black">
               <Crown size={20} strokeWidth={2.5} />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-tight italic">لماذا تشترك في مستويات VIP؟</h3>
         </div>
         <ul className="space-y-3">
            {[
              "أرباح يومية تصل إلى 25% من قيمة الاشتراك",
              "عملية سحب فورية وبدون قيود",
              "دعم فني خاص على مدار الساعة",
              "عمولات فريق مضاعفة لكل مستوى VIP"
            ].map((text, i) => (
              <li key={i} className="flex items-center gap-3 text-white/60">
                 <div className="w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle size={12} />
                 </div>
                 <span className="text-[11px] font-bold tracking-tight">{text}</span>
              </li>
            ))}
         </ul>
         <button 
           onClick={() => navigate('/vip')}
           className="w-full py-4 bg-primary text-black font-black rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-[11px] uppercase tracking-widest mt-2"
         >
            ترقية حسابك الآن
         </button>
      </div>

      {/* Detailed VIP Tiers Section */}
      <div className="space-y-6" dir="rtl">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-lg font-black text-white italic uppercase tracking-tight">باقات الاستثمار المتاحة</h3>
          <button onClick={() => navigate('/vip')} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">عرض الكل</button>
        </div>
        
        <div className="flex overflow-x-auto gap-4 pb-4 px-1 scrollbar-hide snap-x">
          {[
            { level: 'M1', price: '110', daily: '3.00', desc: 'خطوة ذكية للمبتدئين برأس مال بسيط وأرباح مستقرة.', icon: Zap },
            { level: 'M2', price: '300', daily: '9.00', desc: 'ضاعف دخلك اليومي واحصل على أولوية في السحب.', icon: Sparkles },
            { level: 'M3', price: '800', daily: '28.00', desc: 'الباقة الأكثر شعبية للمستثمرين الجادين بعوائد ممتازة.', icon: TrendingUp },
            { level: 'M4', price: '2000', daily: '80.00', desc: 'دخول لعالم المحترفين مع مدير حساب خاص وعمولات ضخمة.', icon: Crown },
            { level: 'M5', price: '5000', daily: '225.00', desc: 'النخبة: أقصى مستويات الربح والمزايا الملكية الحصرية.', icon: ShieldCheck },
            { level: 'M6', price: '12000', daily: '600.00', desc: 'أعلى مستوى متاح بأقصى قدرات ربحية لمستويات كبار المستثمرين.', icon: Gem }
          ].map((v, i) => (
            <div key={i} className="min-w-[280px] bg-[#161616] rounded-3xl p-6 border border-white/5 flex flex-col space-y-4 snap-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/10 transition-colors" />
              
              <div className="flex justify-between items-start z-10">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
                  <v.icon size={24} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">المستوى</span>
                  <p className="text-xl font-black text-white leading-tight italic">{v.level}</p>
                </div>
              </div>

              <div className="space-y-1 z-10">
                 <p className="text-[11px] font-bold text-white/60 leading-relaxed min-h-[44px]">
                   {v.desc}
                 </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 z-10">
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-tighter">سعر الباقة</p>
                    <p className="text-sm font-black text-primary">{v.price} USDT</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-tighter">الربح اليومي</p>
                    <p className="text-sm font-black text-green-500">{v.daily} USDT</p>
                  </div>
              </div>
              
              <button 
                onClick={() => navigate('/vip')}
                className="w-full py-3 bg-white/5 hover:bg-primary hover:text-black text-white/60 font-black rounded-xl text-[10px] uppercase tracking-widest transition-all mt-2 border border-white/5 hover:border-transparent"
              >
                شراء هذه الباقة
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Asset Price Trends */}
      <AssetPriceChart />

      {/* Invitation Code Validator */}
      <div className="bg-[#1a1a1a] p-6 rounded-[2.5rem] border border-white/5 space-y-4 shadow-xl" dir="rtl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Search size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-tight">تحقق من الكود</h3>
            <p className="text-[10px] text-white/40">تأكد من صلاحية كود الدعوة قبل البدء</p>
          </div>
        </div>
        
        <div className="relative group">
          <input 
            type="text" 
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="أدخل كود الدعوة (مثال: XO1234)" 
            className={cn(
              "w-full bg-black/40 border rounded-2xl py-4 px-5 text-sm font-bold tracking-widest transition-all outline-none",
              inviteStatus === 'valid' ? "border-green-500/50 text-green-500" : 
              inviteStatus === 'invalid' ? "border-red-500/50 text-red-500" : 
              inviteStatus === 'validating' ? "border-primary/50 text-primary" : 
              "border-white/5 text-white/60 focus:border-primary/30"
            )}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {inviteStatus === 'validating' && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
            {inviteStatus === 'valid' && <CheckCircle size={18} className="text-green-500" />}
            {inviteStatus === 'invalid' && <AlertCircle size={18} className="text-red-500" />}
          </div>
        </div>

        {inviteStatus === 'valid' && (
          <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-bold text-green-500 mr-2 italic">
            * كود صالح! يمكنك الآن التسجيل والحصول على مكافأة الترحيب.
          </motion.p>
        )}
        {inviteStatus === 'invalid' && (
          <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-bold text-red-500 mr-2 italic">
            * كود غير صالح أو منتهي الصلاحية. يرجى التأكد من الكود.
          </motion.p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        {ACTIONS.map((action) => (
          <button 
            key={action.id}
            onClick={() => handleActionClick(action.id)}
            className="bg-[#1a1a1a] p-4 rounded-3xl flex items-center justify-between shadow-sm border border-white/5 active:scale-95 transition-all group hover:border-primary/30"
          >
            <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{t(action.labelKey)}</span>
            <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-black", "bg-primary")}>
              <action.icon size={20} />
            </div>
          </button>
        ))}
      </div>

      {/* Activities / Tasks Section (Preview) */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white px-1">الأنشطة</h3>
        <div className="bg-[#1a1a1a] rounded-3xl p-4 shadow-sm border border-white/5 transition-colors">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-white/80">Join Telegram مكافآت قناة</span>
            </div>
            <span className="text-primary font-bold">+ 0.20 USDT</span>
          </div>
        </div>
      </div>

      {/* Membership List (Live Feed) */}
      <div className="pb-4">
        <WithdrawalFeed />
      </div>

      {/* Footer Certificates */}
      <div className="space-y-4 py-4">
        <h3 className="text-lg font-bold text-white px-1 text-center">هيئة التنظيم</h3>
        <div className="grid grid-cols-2 gap-3 text-right" dir="rtl">
          {['FMA', 'ASIC', 'Finra', 'FCA'].map((name) => (
            <div key={name} className="bg-[#1a1a1a] rounded-xl p-4 flex items-center justify-center shadow-sm h-16 border border-white/5 transition-colors group hover:border-primary/20">
              <span className="font-black text-white/30 tracking-tighter text-sm italic group-hover:text-primary transition-colors">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
