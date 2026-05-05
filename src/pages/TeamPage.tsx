import { Copy, Share2, Twitter, Facebook, Send, Linkedin, MessageCircle, Instagram, Video, Search, Filter, SortAsc, SortDesc, Info, Wallet, TrendingUp, Users, Gift, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import { useBalance } from '../lib/BalanceContext';

const SOCIAL_ICONS = [
  { icon: Twitter, color: 'bg-[#1DA1F2]' },
  { icon: Facebook, color: 'bg-[#4267B2]' },
  { icon: Send, color: 'bg-[#0088cc]' },
  { icon: Linkedin, color: 'bg-[#0077b5]' },
  { icon: MessageCircle, color: 'bg-[#25D366]' },
  { icon: Instagram, color: 'bg-[#E1306C]' },
  { icon: Video, color: 'bg-[#ff0000]' },
];

export default function TeamPage() {
  const { t } = useTranslation();
  const { teamEarnings, collectTeamEarnings, balance, referralCode, subscriptions, setQuotaExceeded } = useBalance();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'activity' | 'date'>('activity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showDetails, setShowDetails] = useState<number | null>(null);
  const [isCollecting, setIsCollecting] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const invitationCode = referralCode || "......";
  const referralLink = `${window.location.origin}/register?ref=${invitationCode}`;

  const hasActiveSubscription = useMemo(() => {
    return subscriptions.length > 0 && subscriptions.some(s => s.level !== 'M0');
  }, [subscriptions]);

  const levelStats = useMemo(() => {
    return [
      { 
        level: 1, 
        rate: '12%', 
        count: `${teamMembers.filter(m => m.level === 1).length}`, 
        income: (teamMembers.filter(m => m.level === 1).length * 1).toFixed(2), 
        bonus: '1.00$ لكل دعوة' 
      },
      { 
        level: 2, 
        rate: '3%', 
        count: `${teamMembers.filter(m => m.level === 2).length}`, 
        income: '0.00', 
        bonus: '0.00$ دعوة غير مباشرة' 
      },
      { 
        level: 3, 
        rate: '1%', 
        count: `${teamMembers.filter(m => m.level === 3).length}`, 
        income: '0.00', 
        bonus: '0.00$ دعوة غير مباشرة' 
      },
    ];
  }, [teamMembers]);

  const handleCollect = async () => {
    if (teamEarnings <= 0) return;
    
    if (!hasActiveSubscription) {
      setErrorStatus('يجب عليك الاشتراك أولاً لتتمكن من جمع الأرباح.');
      return;
    }

    setIsCollecting(true);
    setErrorStatus(null);
    
    try {
      await collectTeamEarnings();
    } catch (err: any) {
      setErrorStatus(err.message);
    } finally {
      setIsCollecting(false);
    }
  };

  // Fetch real team members
  useEffect(() => {
    async function fetchTeam() {
      if (!referralCode) return;
      setLoading(true);
      try {
        const usersRef = collection(db, 'users');
        
        // Level 1
        const q1 = query(usersRef, where('referredBy', '==', referralCode));
        const snap1 = await getDocs(q1);
        const l1Members = snap1.docs.map(d => ({ ...(d.data() as any), id: d.id, level: 1 }));

        let allMembers = [...l1Members];

        // Level 2
        if (l1Members.length > 0) {
          const l1Codes = l1Members.map((m: any) => m.referralCode).filter(Boolean);
          if (l1Codes.length > 0) {
            const q2 = query(usersRef, where('referredBy', 'in', l1Codes.slice(0, 30)));
            const snap2 = await getDocs(q2);
            const l2Members = snap2.docs.map(d => ({ ...(d.data() as any), id: d.id, level: 2 }));
            allMembers = [...allMembers, ...l2Members];

            // Level 3
            if (l2Members.length > 0) {
              const l2Codes = l2Members.map((m: any) => m.referralCode).filter(Boolean);
              if (l2Codes.length > 0) {
                const q3 = query(usersRef, where('referredBy', 'in', l2Codes.slice(0, 30)));
                const snap3 = await getDocs(q3);
                const l3Members = snap3.docs.map(d => ({ ...(d.data() as any), id: d.id, level: 3 }));
                allMembers = [...allMembers, ...l3Members];
              }
            }
          }
        }

        setTeamMembers(allMembers.map((m: any) => ({
          id: m.id,
          name: m.email ? m.email.split('@')[0] : 'عضو جديد',
          level: m.level,
          vipLevel: m.vipLevel,
          activity: 100,
          regDate: m.createdAt ? m.createdAt.substring(0, 10) : '2026-05-01',
          status: 'نشط'
        })));
      } catch (err: any) {
        console.error("Error fetching team:", err);
        if (err.message?.includes('Quota limit exceeded') || err.code === 'resource-exhausted') {
          setQuotaExceeded(true);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchTeam();
  }, [referralCode]);

  const filteredMembers = useMemo(() => {
    return teamMembers
      .filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterLevel === 'all' || member.level === filterLevel;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        const valA = sortBy === 'activity' ? a.activity : new Date(a.regDate).getTime();
        const valB = sortBy === 'activity' ? b.activity : new Date(b.regDate).getTime();
        return sortOrder === 'desc' ? valB - valA : valA - valB;
      });
  }, [teamMembers, searchQuery, filterLevel, sortBy, sortOrder]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 space-y-6 max-w-md mx-auto mb-20 text-right"
      dir="rtl"
    >
      <div className="flex justify-center flex-col items-center gap-2">
        <h2 className="text-xl font-bold text-white uppercase tracking-[0.2em]">{t('home.companyName')}</h2>
      </div>

      {/* Referral Section */}
      <div className="bg-primary/10 backdrop-blur-md rounded-3xl p-6 space-y-4 border border-primary/20 shadow-[0_0_20px_rgba(212,175,55,0.05)]">
        <div className="space-y-2">
          <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">شفرة الدعوة :</p>
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-black text-primary tracking-widest">{invitationCode}</h3>
            <button 
              onClick={() => navigator.clipboard.writeText(invitationCode)}
              className="bg-primary text-black px-4 py-1.5 rounded-full text-xs font-black hover:bg-accent active:scale-95 transition-all shadow-lg shadow-primary/20"
            >
              ينسخ
            </button>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-white/5">
          <p className="text-white/40 text-[10px] leading-relaxed">شارك رابط الإحالة الخاص بك واحصل على $1 لكل صديق ينضم!</p>
          <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
            <span className="text-white/40 text-[10px] truncate flex-1">{referralLink}</span>
            <button 
              onClick={() => navigator.clipboard.writeText(referralLink)}
              className="bg-white/10 text-white px-3 py-1 rounded-full text-[10px] font-bold active:scale-95 transition-all"
            >
              ينسخ
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 justify-center">
          {SOCIAL_ICONS.map((social, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.1, y: -2 }}
              className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white cursor-pointer shadow-sm", social.color)}
            >
              <social.icon size={14} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Team Stats & Collect */}
      <div className="bg-[#1a1a1a] rounded-[2.5rem] p-6 border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <p className="text-[10px] text-white/40 font-black uppercase tracking-widest leading-none">أرباح الفريق القابلة للجمع</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-primary italic">USDT {teamEarnings.toFixed(2)}</span>
            </div>
            {errorStatus && (
              <p className="text-[9px] text-red-500 font-bold animate-pulse">{errorStatus}</p>
            )}
          </div>
          <motion.button 
            disabled={teamEarnings <= 0 || isCollecting}
            onClick={handleCollect}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center gap-2",
              teamEarnings > 0 
                ? "bg-primary text-black shadow-primary/20" 
                : "bg-white/5 text-white/10 border border-white/5 cursor-not-allowed"
            )}
          >
            {isCollecting ? (
              <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <>أجمع <Wallet size={16} /></>
            )}
          </motion.button>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
          <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
            <div className="flex items-center gap-2 text-white/30 mb-1">
              <Users size={12} />
              <span className="text-[9px] font-black uppercase tracking-widest">إجمالي الفريق</span>
            </div>
            <p className="text-xl font-black text-white">{teamMembers.length}</p>
          </div>
          <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
            <div className="flex items-center gap-2 text-white/30 mb-1">
              <TrendingUp size={12} />
              <span className="text-[9px] font-black uppercase tracking-widest">حجم التداول</span>
            </div>
            <p className="text-xl font-black text-white">$1,240</p>
          </div>
        </div>
      </div>

      {/* Advanced Team Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-lg font-black text-white tracking-tight italic uppercase">إدارة الفريق</h3>
          <div className="bg-primary/20 text-primary text-[10px] font-black px-3 py-1 rounded-full border border-primary/20">
            أرباح نشطة
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text"
              placeholder="ابحث عن عضو..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/5 rounded-[1.5rem] py-4 pr-12 pl-4 text-sm text-white focus:border-primary/50 focus:outline-none transition-all shadow-sm"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['all', 1, 2, 3].map(lvl => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl as any)}
                className={cn(
                  "whitespace-nowrap px-6 py-2.5 rounded-xl text-xs font-black transition-all border uppercase tracking-widest",
                  filterLevel === lvl ? "bg-primary text-black border-primary shadow-lg shadow-primary/20" : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"
                )}
              >
                {lvl === 'all' ? 'الكل' : `مستوى ${lvl}`}
              </button>
            ))}
          </div>
        </div>

        {/* Members List */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredMembers.map(member => (
              <motion.div 
                key={member.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#1a1a1a] rounded-[2rem] p-5 flex justify-between items-center shadow-sm border border-white/5 group hover:border-primary/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-black font-black text-xs shadow-inner transition-colors", 
                    member.level === 1 ? "bg-primary" : member.level === 2 ? "bg-primary/80" : "bg-primary/60"
                  )}>
                    L{member.level}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-white group-hover:text-primary transition-colors">{member.name}</h4>
                      <span className="bg-primary/20 text-primary text-[8px] px-1.5 py-0.5 rounded-md font-black italic">
                        {(member.vipLevel || 'M0').replace('VIP ', 'M')}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-tighter">انضم: {member.regDate}</p>
                  </div>
                </div>
                <div className="text-left">
                  <div className="bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    <span className={cn("text-[10px] font-black italic uppercase tracking-widest", 
                      member.status === 'نشط' ? "text-green-500" : "text-white/20"
                    )}>
                      {member.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredMembers.length === 0 && (
            <div className="text-center py-10 opacity-30 text-sm text-white font-bold italic">لا يوجد أعضاء يطابقون بحثك</div>
          )}
        </div>
      </div>

      {/* Level Overview */}
      <div className="grid grid-cols-1 gap-4 pt-6">
        <h3 className="text-lg font-black text-white px-1 text-right tracking-tight italic uppercase">نظرة عامة على المستويات</h3>
        {levelStats.map((team) => (
          <div 
            key={team.level}
            className="bg-[#111] p-6 rounded-[2.5rem] border border-white/5 relative overflow-hidden group hover:border-primary/30 transition-all"
          >
            <div className="flex justify-between items-start z-10 relative">
              <div className="space-y-4 flex-1">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center bg-white/5 p-3 rounded-2xl border border-white/5">
                    <p className="text-[9px] text-white/20 font-black uppercase tracking-widest mb-1 leading-none">مؤهلين</p>
                    <p className="text-sm font-black text-white italic">{team.count}</p>
                  </div>
                  <div className="text-center bg-white/5 p-3 rounded-2xl border border-white/5">
                    <p className="text-[9px] text-white/20 font-black uppercase tracking-widest mb-1 leading-none">العمولة</p>
                    <p className="text-sm font-black text-primary italic">{team.rate}</p>
                  </div>
                  <div className="text-center bg-white/5 p-3 rounded-2xl border border-white/5">
                    <p className="text-[9px] text-white/20 font-black uppercase tracking-widest mb-1 leading-none">الدخل</p>
                    <p className="text-sm font-black text-white italic">{team.income}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center z-10 relative pt-4 mt-2 border-t border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Gift size={16} />
                </div>
                <span className="text-lg font-black italic text-white uppercase">مستوى {team.level}</span>
              </div>
              <button 
                onClick={() => setShowDetails(team.level)}
                className="bg-white/5 hover:bg-primary hover:text-black text-white/40 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 hover:border-transparent"
              >
                تفاصيل
              </button>
            </div>

            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/5 rounded-full blur-[60px] group-hover:bg-primary/10 transition-all" />
          </div>
        ))}
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetails !== null && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetails(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full max-w-md bg-[#161616] rounded-t-[3rem] sm:rounded-[3rem] border-t sm:border border-white/10 p-8 pt-10 z-10 overflow-hidden relative"
            >
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/10 rounded-full" />
              
              <div className="space-y-8">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest italic leading-none">تفاصيل الأرباح</p>
                    <h3 className="text-2xl font-black text-white italic">مستوى {showDetails}</h3>
                  </div>
                  <button onClick={() => setShowDetails(null)} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/40 ring-1 ring-white/10">
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                    <p className="text-[10px] text-white/30 font-black mb-1 uppercase tracking-widest">نسبة العائد</p>
                    <p className="text-2xl font-black text-primary italic">{levelStats[showDetails-1].rate}</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                    <p className="text-[10px] text-white/30 font-black mb-1 uppercase tracking-widest">مكافأة الانضمام</p>
                    <p className="text-lg font-black text-green-500 italic">{levelStats[showDetails-1].bonus}</p>
                  </div>
                </div>

                <div className="bg-primary/5 p-6 rounded-[2.5rem] border border-primary/10 flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                    <Info size={24} />
                  </div>
                  <p className="text-[11px] font-bold text-white/60 leading-relaxed">
                    {showDetails === 1 
                      ? "تحصل على 12% من قيمة كل شحن يقوم به أعضاء فريقك المباشرين، بالإضافة إلى 1$ مكافأة فورية عند التسجيل."
                      : showDetails === 2
                      ? "تحصل على 3% من قيمة شحن أعضاء المستوى الثاني (الذين تمت دعوتهم بواسطة فريقك المباشر)."
                      : "تحصل على 1% من قيمة شحن أعضاء المستوى الثالث في فريقك."}
                  </p>
                </div>

                <button 
                  onClick={() => setShowDetails(null)}
                  className="w-full py-5 bg-white text-black font-black rounded-3xl text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  فهمت ذلك
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
