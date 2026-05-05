import { X, Smartphone, Send, ExternalLink, Upload, ShieldCheck, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, ChangeEvent } from 'react';
import { cn } from '../lib/utils';
import { useBalance } from '../lib/BalanceContext';

export function DepositModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { addTransaction } = useBalance();
  const [proof, setProof] = useState<string | null>(null);
  const [method, setMethod] = useState<'usdt' | 'local'>('usdt');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('يرجى اختيار ملف صورة صالح (JPG, PNG)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('حجم الصورة كبير جداً (الحد الأقصى 5 ميجابايت)');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProof(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinish = () => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('يرجى إدخال مبلغ صالح');
      return;
    }

    if (proof) {
      addTransaction({ 
        amount: numAmount, 
        type: 'deposit',
        proof: proof
      });
      onClose();
    } else {
      setError('يرجى رفع إثبات الدفع');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-[#1a1a1a] rounded-[2.5rem] w-full max-w-md p-8 space-y-6 transition-colors shadow-2xl overflow-y-auto max-h-[90vh] border border-white/10"
      >
        <div className="flex justify-between items-center text-right" dir="rtl">
          <h3 className="text-xl font-black text-white italic tracking-tight uppercase">إيداع رصيد</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 text-white/40 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl" dir="rtl">
          <button 
            onClick={() => setMethod('usdt')}
            className={cn(
              "flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all",
              method === 'usdt' ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-white/40"
            )}
          >
            USDT (TRC20)
          </button>
          <button 
            onClick={() => setMethod('local')}
            className={cn(
              "flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all",
              method === 'local' ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-white/40"
            )}
          >
            تعبئة محلية (Iraq)
          </button>
        </div>
        
        <div className="space-y-5 text-right" dir="rtl">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-white/40 mr-2 uppercase tracking-widest">المبلغ المراد شحنه</label>
            <div className="relative group">
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00" 
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 px-6 text-2xl font-black tracking-tighter text-white transition-all focus:ring-2 focus:ring-primary/20 outline-none group-focus-within:border-primary/20 font-mono" 
              />
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-sm font-black text-primary uppercase">USDT</span>
            </div>
          </div>

          {method === 'usdt' ? (
            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent" />
              <p className="text-[10px] text-white/30 mb-3 font-black uppercase tracking-widest">عنوان المحفظة الخاص بنا (TRC20)</p>
              <div className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5 group-hover:border-primary/20 transition-all">
                <span className="text-xs font-mono truncate mr-2 text-white/60">TX2GzHPm27LutkfCEHPxRxaHui2kRY9q5a</span>
                <button 
                  onClick={() => navigator.clipboard.writeText('TX2GzHPm27LutkfCEHPxRxaHui2kRY9q5a')}
                  className="bg-primary text-black text-[10px] font-black px-5 py-2.5 rounded-xl shrink-0 active:scale-95 transition-all shadow-lg shadow-primary/10"
                >
                  نسخ العنوان
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-white font-black text-sm">التعبئة عبر الوكيل (العراق)</h4>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[8px] font-black bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full uppercase">Zain Cash</span>
                    <span className="text-[8px] font-black bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded-full uppercase">Super Key</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Smartphone size={24} />
                </div>
              </div>
              
              <div className="h-px bg-white/5" />
              
              <div className="flex flex-col gap-3">
                <p className="text-[10px] text-white/40 leading-relaxed font-bold italic">
                  * يرجى كتابة المبلغ أعلاه أولاً، ثم التواصل مع الوكيل الرسمي لإرسال المبلغ واستلام تأكيد الإيداع:
                </p>
                <div className="relative">
                  <button 
                    onClick={() => {
                        const message = `مرحباً، أود شحن مبلغ ${amount || '...'} USDT في حسابي.`;
                        window.open(`https://t.me/Zh_m02?text=${encodeURIComponent(message)}`, '_blank');
                    }}
                    className="w-full flex items-center justify-between p-6 bg-primary text-black rounded-3xl group hover:shadow-2xl hover:shadow-primary/20 active:scale-95 transition-all text-right shadow-lg shadow-primary/10"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-primary shadow-lg group-hover:scale-110 transition-transform">
                        <Send size={22} />
                      </div>
                      <div>
                        <span className="text-base font-black block leading-none">تواصل مع الوكيل الآن</span>
                        <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">المعرف: @Zh_m02</span>
                      </div>
                    </div>
                    <ExternalLink size={20} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-primary/20 rounded-3xl -z-10 blur-xl px-2"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1 px-1">
              <CheckCircle size={14} className="text-primary" />
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                {method === 'usdt' ? 'تأكيد طريقة الدفع: USDT (TRC20)' : 'تأكيد طريقة الدفع: تعبئة محلية'}
              </p>
            </div>
            <p className="text-[10px] font-black text-white/40 mr-1 uppercase tracking-widest">إثبات الدفع (رفع صورة الإيصال)</p>
            <div className="relative group">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
              />
              <div className={cn(
                "w-full h-48 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center gap-3 transition-all overflow-hidden relative",
                proof ? "border-primary bg-primary/5" : "border-white/10 bg-white/5 hover:bg-white/10",
                error && "border-red-500/50 bg-red-500/5 shadow-inner"
              )}>
                {proof ? (
                  <img src={proof} alt="Proof" className="w-full h-full object-contain p-4" />
                ) : (
                  <>
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-primary border border-white/5 group-hover:scale-110 transition-transform">
                      <Upload size={32} />
                    </div>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">انقر لرفع صورة الإيصال</p>
                  </>
                )}
              </div>
            </div>
            {error && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <p className="text-[10px] font-black text-red-500 uppercase">{error}</p>
              </motion.div>
            )}
          </div>

          <div className="bg-red-500/5 p-5 rounded-2xl border border-red-500/10">
            <p className="text-[10px] text-red-500/80 leading-relaxed font-bold italic">
              {method === 'usdt' 
                ? "* تنبيه أمني: يرجى إيداع USDT عبر شبكة TRC20 حصراً. أي خطأ في الشبكة قد يؤدي لفقدان الأموال. المراجعة تستغرق 5-15 دقيقة."
                : "* تنبيه: للمدفوعات المحلية (زين كاش / سوبر كي)، يرجى التأكد من إرسال صورة الإيصال الواضحة لتسريع عملية المراجعة."}
            </p>
          </div>
        </div>

        <button 
          onClick={handleFinish} 
          disabled={!proof}
          className="w-full bg-primary text-black font-black py-5 rounded-2xl shadow-xl shadow-primary/10 disabled:opacity-30 disabled:grayscale transition-all active:scale-95 text-sm uppercase tracking-widest"
        >
          تأكيد طلب الشحن
        </button>
      </motion.div>
    </motion.div>
  );
}

export function WithdrawModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { balance, addTransaction, updateBalance } = useBalance();
  const [step, setStep] = useState<'input' | 'confirm' | 'success'>('input');
  const [method, setMethod] = useState<'usdt' | 'local'>('usdt');
  const [localType, setLocalType] = useState<'zain' | 'super'>('zain');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const DAILY_LIMIT = 100;

  if (!isOpen) return null;

  const handleNext = () => {
    setError(null);
    const numAmount = parseFloat(amount);
    
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('يرجى إدخال مبلغ سحب صالح');
      return;
    }
    if (numAmount < 10) {
      setError('الحد الأدنى للسحب هو 10 USDT');
      return;
    }
    if (numAmount > balance) {
      setError(`الرصيد المتاح غير كافٍ (رصيدك: ${balance.toFixed(2)} USDT)`);
      return;
    }
    if (numAmount > DAILY_LIMIT) {
      setError(`لقد تجاوزت الحد اليومي المسموح به للسحب (${DAILY_LIMIT} USDT)`);
      return;
    }
    if (method === 'usdt' && (!address || address.length < 20)) {
      setError('عنوان المحفظة TRC20 غير صحيح، يرجى التأكد من العنوان');
      return;
    }
    if (method === 'local' && (!address || address.length < 10)) {
      setError('رقم المحفظة المحلية يجب أن يكون 10 أرقام على الأقل');
      return;
    }
    if (!password) {
      setError('يرجى إدخال كلمة مرور الصندوق للمتابعة');
      return;
    }
    if (password !== '123456') { // Mock check
      setError('كلمة مرور الصندوق غير صحيحة');
      return;
    }

    setStep('confirm');
  };

  const handleConfirm = () => {
    const numAmount = parseFloat(amount);
    addTransaction({ 
      amount: numAmount, 
      type: 'withdrawal',
      method: method === 'usdt' ? 'USDT (TRC20)' : (localType === 'zain' ? 'Zain Cash' : 'Super Key'),
      address: address
    });
    setStep('success');
  };

  const resetAndClose = () => {
    setStep('input');
    setMethod('usdt');
    setAmount('');
    setAddress('');
    setPassword('');
    setError(null);
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
    >
      <AnimatePresence mode="wait">
        {step === 'input' && (
          <motion.div 
            key="input"
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#1a1a1a] rounded-[2.5rem] w-full max-w-md p-8 space-y-6 shadow-2xl border border-white/10"
          >
            <div className="flex justify-between items-center text-right" dir="rtl">
              <h3 className="text-xl font-black text-white italic tracking-tight uppercase">سحب الأموال</h3>
              <button onClick={resetAndClose} className="p-2 hover:bg-white/5 rounded-full text-white/40 transition-colors"><X size={24} /></button>
            </div>

            <div className="flex gap-2 p-1 bg-white/5 rounded-2xl" dir="rtl">
              <button 
                onClick={() => setMethod('usdt')}
                className={cn(
                  "flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all",
                  method === 'usdt' ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-white/40"
                )}
              >
                USDT (TRC20)
              </button>
              <button 
                onClick={() => setMethod('local')}
                className={cn(
                  "flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all",
                  method === 'local' ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-white/40"
                )}
              >
                سحب محلي (العراق)
              </button>
            </div>
            
            <div className="space-y-5 text-right" dir="rtl">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/40 mr-2 uppercase tracking-widest">المبلغ المراد سحبه</label>
                <div className="relative group">
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00" 
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 px-6 text-2xl font-black tracking-tighter text-white transition-all focus:ring-2 focus:ring-primary/20 outline-none group-focus-within:border-primary/20 font-mono" 
                  />
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-sm font-black text-primary uppercase">USDT</span>
                </div>
              </div>

              {method === 'usdt' ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/40 mr-2 uppercase tracking-widest">عنوان المحفظة (TRC20)</label>
                  <input 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="أدخل عنوان USDT-TRC20" 
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 px-6 text-sm font-bold tracking-tight text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-white/10" 
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-white/40 mr-2 uppercase tracking-widest">طريقة السحب المحلية</label>
                    <div className="grid grid-cols-2 gap-2">
                       <button 
                         onClick={() => setLocalType('zain')}
                         className={cn(
                           "py-4 rounded-2xl border text-[10px] font-black uppercase transition-all",
                           localType === 'zain' ? "border-primary bg-primary/10 text-primary" : "border-white/5 bg-white/5 text-white/40"
                         )}
                       >
                         Zain Cash
                       </button>
                       <button 
                         onClick={() => setLocalType('super')}
                         className={cn(
                           "py-4 rounded-2xl border text-[10px] font-black uppercase transition-all",
                           localType === 'super' ? "border-primary bg-primary/10 text-primary" : "border-white/5 bg-white/5 text-white/40"
                         )}
                       >
                         Super Key
                       </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-white/40 mr-2 uppercase tracking-widest">رقم المحفظة / الهاتف</label>
                    <input 
                      type="text" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="07XXXXXXXX" 
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 px-6 text-sm font-bold tracking-tight text-white focus:ring-2 focus:ring-primary/20 outline-none" 
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/40 mr-2 uppercase tracking-widest">كلمة مرور الصندوق</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••" 
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 px-6 text-sm tracking-[0.5em] text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-white/10" 
                />
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                   <p className="text-[10px] font-black text-red-500 uppercase">{error}</p>
                </motion.div>
              )}

              <div className="flex justify-between items-center px-2">
                <p className="text-[10px] text-white/40">الرصيد المتاح: <span className="font-black text-primary ml-1">{balance.toFixed(2)} USDT</span></p>
                <p className="text-[10px] text-red-500 font-bold italic">الحد الأدنى للسحب: 10 USDT</p>
              </div>
            </div>

            <button 
              onClick={handleNext} 
              className="w-full bg-primary text-black font-black py-5 rounded-2xl shadow-xl shadow-primary/10 active:scale-95 transition-all text-sm uppercase tracking-[0.2em]"
            >
              مراجعة السحب
            </button>
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div 
            key="confirm"
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#1a1a1a] rounded-[2.5rem] w-full max-w-sm p-8 space-y-8 shadow-2xl relative overflow-hidden border border-white/10"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
            
            <div className="text-center space-y-2 relative z-10">
              <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter">تأكيد السحب</h3>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">يرجى مراجعة التفاصيل قبل التأكيد</p>
            </div>

            <div className="bg-white/5 rounded-[2.5rem] p-8 space-y-5 relative z-10 border border-white/5" dir="rtl">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">المبلغ المستلم</span>
                <span className="text-2xl font-black tracking-tighter text-primary">{amount} USDT</span>
              </div>
              <div className="h-px bg-white/5" />
              <div className="space-y-1">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                  {method === 'usdt' ? 'إرسال إلى المحفظة (TRC20)' : `سحب عبر ${localType === 'zain' ? 'Zain Cash' : 'Super Key'}`}
                </span>
                <p className="text-[10px] font-mono break-all bg-black/40 p-4 rounded-2xl border border-white/5 text-white/60 leading-relaxed">{address}</p>
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">رسوم العملية</span>
                <span className="text-xs font-black text-green-500 uppercase tracking-widest">0.00 USDT (مجاني)</span>
              </div>
            </div>

            <div className="space-y-3 relative z-10">
              <button 
                onClick={handleConfirm} 
                className="w-full bg-primary text-black font-black py-5 rounded-2xl shadow-xl shadow-primary/10 active:scale-95 transition-all text-sm uppercase tracking-[0.2em]"
              >
                تأكيد العملية الآن
              </button>
              <button 
                onClick={() => setStep('input')} 
                className="w-full py-2 text-[10px] text-white/20 font-black uppercase tracking-widest hover:text-white transition-colors"
              >
                رجوع للتعديل
              </button>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div 
            key="success"
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
            className="bg-[#1a1a1a] rounded-[2.5rem] w-full max-w-sm p-8 space-y-8 text-center shadow-2xl border border-white/10"
          >
            <div className="relative">
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                className="w-24 h-24 bg-primary text-black rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-primary/20 relative z-10"
              >
                <ShieldCheck size={48} strokeWidth={2.5} />
              </motion.div>
              <motion.div 
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }} 
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-primary rounded-[2.5rem] -z-10 blur-2xl" 
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-black italic uppercase text-white tracking-tight">تم إرسال الطلب</h3>
              <p className="text-white/40 text-[11px] leading-relaxed px-4 font-medium italic">
                لقد تم استلام طلب السحب الخاص بك بنجاح. سيتم تدقيقه من قبل النظام والموافقة عليه قريباً. شكراً لصبرك.
              </p>
            </div>

            <button 
              onClick={resetAndClose} 
              className="w-full bg-white text-black font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
              العودة للملف الشخصي
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
