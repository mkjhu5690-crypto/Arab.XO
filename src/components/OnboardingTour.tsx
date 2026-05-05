import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronRight, Rocket, Crown, Users, Sparkles, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface Step {
  title: string;
  description: string;
  icon: any;
  color: string;
}

const STEPS: Step[] = [
  {
    title: 'مرحباً بك في عرب اكس أو',
    description: 'أكبر منصة استثمارية ذكية في المنطقة. ابدأ رحلتك المالية اليوم وحقق مكاسب حقيقية من خلال المهام اليومية البسيطة.',
    icon: Rocket,
    color: 'bg-primary'
  },
  {
    title: 'المهام اليومية',
    description: 'كل ما عليك فعله هو إكمال مجموعة من المهام السهلة كل 24 ساعة. كل مهمة تزيد من رصيدك في المحفظة بشكل فوري.',
    icon: Sparkles,
    color: 'bg-primary'
  },
  {
    title: 'مستويات VIP الحصرية',
    description: 'قم بترقية مستواك لفتح مهام ذات عوائد أعلى. كل مستوى يمنحك امتيازات أكبر وسرعة أكبر في تحقيق الأرباح.',
    icon: Crown,
    color: 'bg-primary'
  },
  {
    title: 'نظام الإحالة (الفريق)',
    description: 'ادعُ أصدقاءك وانضموا معاً. ستحصل على عمولات مجزية من أرباح أفراد فريقك، مما يضاعف دخلك السلبي.',
    icon: Users,
    color: 'bg-primary'
  }
];

export default function OnboardingTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
  };

  const step = STEPS[currentStep];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
        >
          {/* Close Button */}
          <button 
            onClick={handleComplete}
            className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          <motion.div 
            key={currentStep}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            className="w-full max-w-sm space-y-8 text-center"
          >
            {/* Animated Icon Container */}
            <div className="relative mx-auto">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12 }}
                className={cn(
                  "w-24 h-24 rounded-[2.5rem] mx-auto flex items-center justify-center text-black shadow-2xl relative z-10",
                  step.color
                )}
              >
                <step.icon size={44} strokeWidth={2.5} />
              </motion.div>
              {/* Particle Effects */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 w-32 h-32 -top-4 -left-4 mx-auto border-2 border-primary/20 border-dashed rounded-full"
              />
            </div>

            {/* Content */}
            <div className="space-y-3 px-4">
              <h2 className="text-2xl font-black text-white tracking-tight italic uppercase">
                {step.title}
              </h2>
              <p className="text-sm text-white/50 leading-relaxed font-bold tracking-tight">
                {step.description}
              </p>
            </div>

            {/* Progress Indicators */}
            <div className="flex justify-center gap-2">
              {STEPS.map((_, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "h-1 rounded-full transition-all duration-500",
                    idx === currentStep ? "w-8 bg-primary" : "w-2 bg-white/10"
                  )}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="pt-4 space-y-3">
              <button 
                onClick={handleNext}
                className="w-full py-5 bg-primary text-black font-black rounded-3xl shadow-[0_15px_30px_rgba(212,175,55,0.2)] active:scale-95 transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2"
              >
                {currentStep === STEPS.length - 1 ? (
                  <>
                    ابدأ الآن <Check size={18} strokeWidth={3} />
                  </>
                ) : (
                  <>
                    التالي <ChevronRight size={18} strokeWidth={3} />
                  </>
                )}
              </button>
              
              <button 
                onClick={handleComplete}
                className="text-[10px] text-white/20 font-black uppercase tracking-widest hover:text-white transition-colors"
              >
                تخطي الجولة التعليمية
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
