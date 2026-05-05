import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  ar: {
    translation: {
      nav: {
        home: "بيت",
        task: "مهمة",
        team: "فريق",
        vip: "كبار الشخصيات",
        mine: "أنا"
      },
      home: {
        companyName: "عرب اكس أو",
        slogan: "حيث تعيش الرفاهية",
        recharge: "تعبئة رصيد",
        withdraw: "ينسحب",
        app: "برنامج",
        companyProfile: "ملف الشركة",
        invite: "دعوة الأصدقاء",
        agency: "بين الوكالات",
        announcement: "إعلان",
        announcementText: "🚀 انضم إلى عائلة عرب اكس أو مع نظام مستويات M الجديد كلياً! استثمر بذكاء مع باقاتنا المطورة:\n\n💎 M1: بـ 110$ (ربح 3$) - الخيار الأمثل للمبتدئين.\n💎 M2: بـ 300$ (ربح 9$) - تفعيل ميزة السحب السريع.\n💎 M3: بـ 800$ (ربح 28$) - دعم فني خاص وعمليات فورية.\n💎 M4: بـ 2000$ (ربح 80$) - مدير حساب مخصص لك.\n💎 M5: بـ 5000$ (ربح 225$) - مزايا النخبة وكبار المستثمرين.\n💎 M6: بـ 12000$ (ربح 600$) - أقصى عائد استثماري متاح.\n\n✨ مميزات مستويات M الجديدة: أمان معزز، أرباح يومية ثابتة، وسحب نقدي فوري بدون تأخير. استكشف الرفاهية المالية معنا اليوم!",
        membersList: "قائمة الأعضاء",
        confirm: "تأكيد"
      },
      mine: {
        balance: "رصيد الحساب",
        frozen: "الرصيد المتجمد",
        recharge: "تعبئة رصيد",
        withdraw: "سحب",
        financialRecords: "السجلات المالية",
        security: "الأمان والخصوصية",
        changePassword: "تغيير كلمة المرور",
        logout: "خروج",
        darkMode: "الوضع الليلي",
        lightMode: "الوضع النهاري",
        withdrawLimits: "حدود السحب",
        notifications: "إعدادات الإشعارات",
        linkedDevices: "الأجهزة المرتبطة",
        securityLog: "سجل الأمان"
      },
      vip: {
        levels: "مستويات الاشتراك",
        dailyProfit: "الربح اليومي",
        totalProfit: "إجمالي الربح",
        price: "سعر الفتح",
        duration: "صلاحية",
        subscribe: "اشتراك",
        active: "نشط حالياً",
        alreadySubscribed: "مشترك بالفعل",
        features: "مميزات المستوى"
      }
    }
  },
  en: {
    translation: {
      nav: {
        home: "Home",
        task: "Task",
        team: "Team",
        vip: "VIP",
        mine: "Me"
      },
      home: {
        companyName: "Arab XO",
        slogan: "Where Luxury Lives",
        recharge: "Recharge",
        withdraw: "Withdraw",
        app: "App",
        companyProfile: "Company Profile",
        invite: "Invite Friends",
        agency: "Agency",
        announcement: "Announcement",
        announcementText: "🚀 Join the Arab XO family with our all-new M-Level system! Invest smarter with our upgraded packages:\n\n💎 M1: $110 (Profit $3/day)\n💎 M2: $300 (Profit $9/day)\n💎 M3: $800 (Profit $28/day)\n💎 M4: $2000 (Profit $80/day)\n💎 M5: $5000 (Profit $225/day)\n💎 M6: $12000 (Profit $600/day)\n\n✨ New M-Level features: Enhanced security, stable daily profits, and instant withdrawals. Discover financial luxury with us today!",
        membersList: "Membership List",
        confirm: "Confirm"
      },
      mine: {
        balance: "Account Balance",
        frozen: "Frozen Balance",
        recharge: "Recharge",
        withdraw: "Withdraw",
        financialRecords: "Financial Records",
        security: "Security & Privacy",
        changePassword: "Change Password",
        logout: "Logout",
        darkMode: "Dark Mode",
        lightMode: "Light Mode",
        withdrawLimits: "Withdrawal Limits",
        notifications: "Notification Settings",
        linkedDevices: "Linked Devices",
        securityLog: "Security Log"
      },
      vip: {
        levels: "Subscription Levels",
        dailyProfit: "Daily Profit",
        totalProfit: "Total Profit",
        price: "Unlock Price",
        duration: "Validity",
        subscribe: "Subscribe",
        active: "Currently Active",
        alreadySubscribed: "Already Subscribed",
        features: "Level Features"
      }
    }
  },
  es: {
    translation: {
      nav: { home: "Inicio", task: "Tarea", team: "Equipo", vip: "VIP", mine: "Mío" },
      home: { recharge: "Recargar", withdraw: "Retirar", invite: "Invitar amigos" },
    }
  },
  fr: {
    translation: {
      nav: { home: "Accueil", task: "Tâche", team: "Équipe", vip: "VIP", mine: "Moi" },
      home: { recharge: "Recharger", withdraw: "Retirer", invite: "Inviter des amis" },
    }
  },
  ru: {
    translation: {
      nav: { home: "Главная", task: "Задание", team: "Команда", vip: "VIP", mine: "Я" },
      home: { recharge: "Пополнение", withdraw: "Вывод", invite: "Пригласить друзей" },
    }
  },
  zh: {
    translation: {
      nav: { home: "首页", task: "任务", team: "团队", vip: "会员", mine: "我的" },
      home: { recharge: "充值", withdraw: "提现", invite: "邀请好友" },
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false,
    },
  });

// Handle RTL
i18n.on('languageChanged', (lng) => {
  const dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.body.dir = dir;
});

export default i18n;
