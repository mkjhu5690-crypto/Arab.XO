import { useState, useEffect } from 'react';
import { Eye, EyeOff, Globe, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function RegisterPage({ onRegister }: { onRegister: (email: string) => void }) {
  const [tab, setTab] = useState<'email' | 'phone'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('code');
    if (ref) setInvitationCode(ref);
  }, []);
  const [countdown, setCountdown] = useState(0);
  const [showCodeToast, setShowCodeToast] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendCode = () => {
    if (countdown > 0) return;
    
    // Simple validation
    if (tab === 'email' && !email.includes('@')) {
      alert('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }
    if (tab === 'phone' && phone.length < 8) {
      alert('يرجى إدخال رقم هاتف صحيح');
      return;
    }

    setIsSending(true);
    
    // Simulate API call
    setTimeout(() => {
      const newCode = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedCode(newCode);
      setIsSending(false);
      setCountdown(60);
      setShowCodeToast(true);
      
      // Auto hide toast after 10 seconds
      setTimeout(() => setShowCodeToast(false), 10000);
    }, 1500);
  };

  const handleRegister = () => {
    if (!code || code !== generatedCode) {
      alert('رمز التحقق غير صحيح');
      return;
    }
    if (password.length < 6) {
      alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    const identifier = tab === 'email' ? email.toLowerCase().trim() : phone.trim();
    // Success simulation
    localStorage.setItem('currentUserEmail', identifier);
    if (invitationCode) {
      localStorage.setItem('referredBy', invitationCode);
    }
    onRegister(identifier);
  };

  const calculateStrength = (pwd: string) => {
    if (pwd.length < 4) return 1;
    if (pwd.length < 8) return 2;
    const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    if (hasSymbols && hasNumbers) return 3;
    return 2;
  };

  const strength = calculateStrength(password);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 relative overflow-hidden"
    >
      {/* Code Toast Simulation */}
      <AnimatePresence>
        {showCodeToast && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xs"
          >
            <div className="bg-green-500/10 border border-green-500/20 backdrop-blur-xl p-4 rounded-3xl flex items-center gap-3 shadow-2xl">
              <div className="w-10 h-10 bg-green-500 rounded-2xl flex items-center justify-center text-black shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">تم إرسال الرمز بنجاح</p>
                <p className="text-sm font-black text-white">رمز التحقق الخاص بك هو: <span className="text-primary">{generatedCode}</span></p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />

      <div className="absolute top-6 right-6">
        <button className="flex items-center gap-1 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full text-white/60 text-xs border border-white/10">
          <Globe size={14} className="text-primary" />
          <span>عربي</span>
        </button>
      </div>

      <div className="space-y-4 mb-10 text-center relative z-10">
        <div className="w-20 h-20 bg-primary/10 backdrop-blur-md rounded-[1.8rem] mx-auto flex items-center justify-center p-4 border border-primary/20 shadow-[0_0_30px_rgba(212,175,55,0.15)] relative">
          <div className="w-full h-full border-2 border-primary/40 rounded-xl flex items-center justify-center">
             <span className="text-2xl text-primary font-black italic">XO</span>
          </div>
        </div>
        <h1 className="text-4xl font-black text-white tracking-widest uppercase italic">عرب اكس أو</h1>
        <p className="text-primary/60 font-bold text-[10px] tracking-[0.4em] uppercase">Premium Investment</p>
      </div>

      <div className="w-full max-w-sm bg-[#161616]/80 backdrop-blur-2xl rounded-[3rem] p-8 space-y-6 relative border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="absolute -top-4 -right-4 w-16 h-16 rounded-[1.5rem] border-2 border-primary/30 overflow-hidden shadow-2xl z-20">
          <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500&auto=format&fit=crop&q=60" className="w-full h-full object-cover" />
        </div>

        <div className="flex bg-black/40 p-1.5 rounded-[1.5rem] relative border border-white/5">
          <button 
            onClick={() => setTab('email')}
            className={cn(
              "flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all duration-300 z-10",
              tab === 'email' ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-white/30"
            )}
          >
            بالبريد الإلكتروني
          </button>
          <button 
            onClick={() => setTab('phone')}
            className={cn(
              "flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all duration-300 z-10",
              tab === 'phone' ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-white/30"
            )}
          >
            عن طريق الهاتف
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mx-4">{tab === 'email' ? 'بريد إلكتروني' : 'رقم التليفون'}</label>
            <input 
              type={tab === 'email' ? 'email' : 'tel'} 
              value={tab === 'email' ? email : phone}
              onChange={(e) => tab === 'email' ? setEmail(e.target.value) : setPhone(e.target.value)}
              placeholder={tab === 'email' ? 'example@mail.com' : '7XXXXXXXX'}
              className="w-full bg-black/40 border border-white/5 rounded-2xl py-3.5 px-6 text-sm text-white focus:border-primary/30 outline-none transition-all shadow-inner"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mx-4"> رمز التحقق</label>
            <div className="relative">
              <input 
                type="text" 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="0000"
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-3.5 px-6 text-sm text-white focus:border-primary/30 outline-none transition-all shadow-inner"
              />
              <button 
                onClick={handleSendCode}
                disabled={isSending || countdown > 0}
                className={cn(
                  "absolute left-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  (isSending || countdown > 0) ? "bg-white/5 text-white/20" : "bg-primary text-black"
                )}
              >
                {isSending ? <Loader2 size={14} className="animate-spin" /> : countdown > 0 ? `${countdown}s` : 'إرسال'}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mx-4">كلمة المرور</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-3.5 px-6 text-sm text-white focus:border-primary/30 outline-none transition-all shadow-inner"
              />
              <button 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mx-4"> شفرة الدعوة </label>
            <input 
              type="text" 
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-2xl py-3.5 px-6 text-sm text-primary font-black tracking-widest outline-none shadow-inner"
            />
          </div>

          <div className="space-y-3 pt-4">
             <button 
                onClick={handleRegister}
                className="w-full bg-primary text-black font-black py-4.5 rounded-[1.5rem] shadow-xl shadow-primary/10 active:scale-[0.98] transition-all text-xs uppercase tracking-[0.2em]"
             >
                إنشاء حساب
             </button>

             <button 
                onClick={() => window.location.href = '/login'}
                className="w-full bg-transparent text-primary border border-primary/20 font-black py-4.5 rounded-[1.5rem] active:scale-[0.98] transition-all text-xs uppercase tracking-[0.2em] hover:bg-primary/5"
             >
                تسجيل الدخول
             </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
