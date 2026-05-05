import { useState } from 'react';
import { Eye, EyeOff, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useBalance } from '../lib/BalanceContext';

export default function LoginPage({ onLogin }: { onLogin: (email?: string) => void }) {
  const [tab, setTab] = useState<'email' | 'phone'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setAsAdmin } = useBalance();

  const handleLogin = () => {
    const normalizedEmail = email.toLowerCase().trim();
    setError('');
    if (normalizedEmail === 'akosbali5@gmail.com' && password === 'ali6565ali') {
      setAsAdmin(true);
      onLogin(normalizedEmail);
    } else if (normalizedEmail && password) {
      setAsAdmin(false);
      onLogin(normalizedEmail);
    } else {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
    }
  };

  const calculateStrength = (pwd: string) => {
    if (pwd.length < 4) return 1;
    if (pwd.length < 8) return 2;
    const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    return hasSymbols ? 3 : 2;
  };

  const strength = calculateStrength(password);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 relative overflow-hidden"
    >
      {/* Premium Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />

      {/* Language Switcher */}
      <div className="absolute top-6 right-6">
        <button className="flex items-center gap-1 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full text-white/60 text-xs border border-white/10 hover:border-primary/30 transition-colors">
          <Globe size={14} className="text-primary" />
          <span>عربي</span>
        </button>
      </div>

      {/* Hero Section */}
      <div className="space-y-4 mb-10 text-center relative z-10">
        <div className="w-20 h-20 bg-primary/10 backdrop-blur-md rounded-[1.8rem] mx-auto flex items-center justify-center p-4 border border-primary/20 shadow-[0_0_30px_rgba(212,175,55,0.15)] relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-full h-full border-2 border-primary/40 rounded-xl flex items-center justify-center relative z-10">
            <span className="text-2xl text-primary font-black italic">XO</span>
          </div>
        </div>
        <h1 className="text-4xl font-black text-white tracking-widest uppercase italic">عرب اكس أو</h1>
        <p className="text-primary/60 font-bold text-[10px] tracking-[0.4em] uppercase">Premium Investment</p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-sm bg-[#161616]/80 backdrop-blur-2xl rounded-[3rem] p-8 space-y-8 relative border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {/* Customer Service Avatar */}
        <div className="absolute -top-4 -right-4 w-16 h-16 rounded-[1.5rem] border-2 border-primary/30 overflow-hidden shadow-2xl z-20 group">
          <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500&auto=format&fit=crop&q=60" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
          <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 border-2 border-[#161616] rounded-full" />
        </div>

        {/* Tabs */}
        <div className="flex bg-black/40 p-1.5 rounded-[1.5rem] relative border border-white/5">
          <button 
            onClick={() => setTab('email')}
            className={cn(
              "flex-1 py-3.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 z-10",
              tab === 'email' ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-white/30"
            )}
          >
            بالبريد الإلكتروني
          </button>
          <button 
            onClick={() => setTab('phone')}
            className={cn(
              "flex-1 py-3.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 z-10",
              tab === 'phone' ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-white/30"
            )}
          >
            عبر الهاتف
          </button>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mx-4">{tab === 'email' ? 'بريد إلكتروني' : 'رقم التليفون'}</label>
            <div className="relative group">
              <input 
                type={tab === 'email' ? 'email' : 'tel'} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={tab === 'email' ? 'example@mail.com' : '7XXXXXXXX'}
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4.5 px-6 text-sm text-white placeholder:text-white/10 focus:border-primary/30 focus:bg-black/60 outline-none transition-all shadow-inner"
              />
              {tab === 'phone' && (
                <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center pr-4 border-r border-white/10">
                  <span className="text-primary font-black text-xs">+964</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mx-4">كلمة المرور</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4.5 px-6 text-sm text-white placeholder:text-white/10 focus:border-primary/30 focus:bg-black/60 outline-none transition-all shadow-inner"
              />
              <button 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error && <p className="text-[10px] text-red-500 font-bold px-4">{error}</p>}
            {password && (
              <div className="px-4 pt-1 flex flex-col gap-2">
                <div className="flex gap-1.5">
                  {[1, 2, 3].map((level) => (
                    <div 
                      key={level} 
                      className={cn(
                        "h-1 flex-1 rounded-full bg-white/5 transition-colors",
                        strength >= level && (strength === 1 ? "bg-red-500/50" : strength === 2 ? "bg-primary/50" : "bg-green-500/50")
                      )} 
                    />
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-between px-4 mt-1">
               <button className="text-[9px] text-white/20 font-black uppercase tracking-widest hover:text-primary/60 transition-colors">هل نسيت كلمة المرور؟</button>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button 
              onClick={handleLogin}
              className="w-full bg-primary text-black font-black py-4.5 rounded-[1.5rem] shadow-xl shadow-primary/10 active:scale-[0.98] transition-all text-xs uppercase tracking-[0.2em]"
            >
              تسجيل الدخول
            </button>

            <button 
              onClick={() => window.location.href = '/register'}
              className="w-full bg-transparent text-primary border border-primary/20 font-black py-4.5 rounded-[1.5rem] active:scale-[0.98] transition-all text-xs uppercase tracking-[0.2em] hover:bg-primary/5"
            >
              إنشاء حساب جديد
            </button>
          </div>
        </div>
      </div>
    </motion.div>

  );
}
