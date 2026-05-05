import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, User, Bot, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';

// Customer Support Avatar
const CUSTOMER_SUPPORT_AVATAR = "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=200&auto=format&fit=crop";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function AIChatSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'مرحباً بك في عرب اكس أو! كيف يمكنني مساعدتك اليوم؟',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const chat = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...messages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          })),
          { role: 'user', parts: [{ text: inputValue }] }
        ],
        config: {
          systemInstruction: "أنت خبير دعم عملاء لتطبيق 'عرب اكس أو' (Arab XO). هذا التطبيق هو منصة استثمارية تتيح للمستخدمين ربح المال من أداء المهام اليومية وترقية مستويات M. هدفك هو مساعدة المستخدمين في أي استفسارات تخص الشحن، السحب، المهام، ونظام الإحالة (الفريق). كن ودوداً ومحترفاً جداً. تحدث دائماً باللغة العربية بلهجة مهذبة. إذا سأل المستخدم عن 'Zh_m02'، أخبره أنه الوكيل الرسمي والوحيد المعتمد للشحن المحلي في العراق. تذكر أن الخطة المجانية M0 تعطي ربح 0.17 سنت يومياً."
        }
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: chat.text || "عذراً، حدث خطأ ما. يرجى المحاولة لاحقاً.",
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Gemini Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "نعتذر، واجهنا صعوبة في الاتصال. يرجى التأكد من اتصالك بالإنترنت.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Support Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-24 right-5 z-[60] group"
      >
        <div className="relative">
          {/* Animated rings like in screenshot */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -inset-2 bg-primary/30 rounded-full blur-md"
          />
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary shadow-lg relative bg-[#1a1a1a]">
            <img 
              src={CUSTOMER_SUPPORT_AVATAR} 
              alt="Customer Support" 
              className="w-full h-full object-cover"
            />
          </div>
          {/* Notification Badge */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#0a0a0a] rounded-full" />
        </div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-5 sm:w-96 sm:h-[500px] bg-[#1a1a1a] z-[70] flex flex-col shadow-2xl rounded-none sm:rounded-3xl border-0 sm:border border-white/10 overflow-hidden"
            dir="rtl"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary/20 to-transparent border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/50">
                   <img src={CUSTOMER_SUPPORT_AVATAR} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">الدعم الذكي</h3>
                  <div className="flex items-center gap-1.5 ">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-white/40 font-bold uppercase">متصل الآن</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 text-white/40 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={cn(
                    "flex flex-col max-w-[80%]",
                    message.sender === 'user' ? "mr-auto items-start" : "ml-auto items-end"
                  )}
                >
                  <div className={cn(
                    "p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-sm",
                    message.sender === 'user' 
                      ? "bg-primary text-black rounded-tl-none" 
                      : "bg-white/5 text-white/90 border border-white/5 rounded-tr-none"
                  )}>
                    {message.text}
                  </div>
                  <span className="text-[9px] text-white/20 mt-1 uppercase font-bold italic tracking-widest">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              {isLoading && (
                <div className="ml-auto flex items-center gap-2 text-white/40 bg-white/5 p-3 rounded-2xl animate-pulse">
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-[10px] font-bold">المساعد يكتب حالياً...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-black/20">
              <div className="relative group">
                <input 
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="اكتب رسالتك هنا..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 pr-12 text-sm font-medium text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-white/20 group-focus-within:border-primary/20"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2.5 bg-primary text-black rounded-xl active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[9px] text-white/10 text-center mt-3 uppercase tracking-[0.2em] font-bold">
                مدعوم بواسطة الذكاء الاصطناعي - عرب اكس أو
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
