import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, setDoc, getDoc, orderBy, limit, where } from 'firebase/firestore';
import { db } from './firebase';

interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'vip_purchase' | 'task_reward';
  status: 'completed' | 'pending' | 'rejected';
  userEmail?: string;
  proof?: string;
  method?: string;
  address?: string;
}

interface BalanceContextType {
  balance: number;
  frozenAmount: number;
  teamEarnings: number;
  vipLevel: string;
  subscriptions: any[];
  referralCode: string;
  transactions: Transaction[];
  updateBalance: (amount: number) => Promise<void>;
  updateFrozenAmount: (amount: number) => Promise<void>;
  collectTeamEarnings: () => Promise<number>;
  collectSubscriptions: () => Promise<number>;
  purchaseVIP: (price: number, level: string, dailyProfit: number) => Promise<boolean>;
  addTransaction: (tx: Omit<Transaction, 'id' | 'date' | 'status'>) => Promise<void>;
  approveTransaction: (id: string) => Promise<void>;
  rejectTransaction: (id: string) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  isAdmin: boolean;
  setAsAdmin: (val: boolean) => void;
  currentUserEmail: string;
  quotaExceeded: boolean;
  setQuotaExceeded: (val: boolean) => void;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export const BalanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUserEmail, setCurrentUserEmail] = useState(() => localStorage.getItem('currentUserEmail') || 'guest');
  
  const getStorageKey = (key: string, email?: string) => `${email || currentUserEmail}_${key}`;

  const [isAdmin, setIsAdmin] = useState(() => {
    const email = localStorage.getItem('currentUserEmail');
    const saved = localStorage.getItem(getStorageKey('isAdmin', email || 'guest')) === 'true' || localStorage.getItem('isAdmin') === 'true';
    return saved || email === 'akosbali5@gmail.com';
  });

  const [balance, setBalance] = useState(0);
  const [frozenAmount, setFrozenAmount] = useState(0);
  const [teamEarnings, setTeamEarnings] = useState(0);
  const [vipLevel, setVipLevel] = useState('M0');
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [referralCode, setReferralCode] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // 1. Sync User Profile from Firestore
  useEffect(() => {
    // We now allow guest to sync too for better testing experience
    const targetEmail = currentUserEmail;
    const userDocRef = doc(db, 'users', targetEmail);
    
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBalance(data.balance || 0);
        setFrozenAmount(data.frozenAmount || 0);
        setTeamEarnings(data.teamEarnings || 0);
        let normalizedVip = data.vipLevel || 'M0';
        if (normalizedVip.startsWith('VIP ')) {
          normalizedVip = normalizedVip.replace('VIP ', 'M');
        }
        setVipLevel(normalizedVip);
        setSubscriptions(data.subscriptions || []);
        setReferralCode(data.referralCode || '');
        if (data.isAdmin !== undefined) setIsAdmin(data.isAdmin);

        // Generate referral code if missing
        if (!data.referralCode && targetEmail !== 'guest') {
          const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          updateDoc(userDocRef, { referralCode: newCode });
        }
      } else if (targetEmail !== 'guest') {
        const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const referredBy = localStorage.getItem('referredBy');
        
        // Initialize user in Firestore if they don't exist
        const initialBalance = referredBy ? 1 : 0; // New user gets $1 if referred
        
        setDoc(userDocRef, {
          email: targetEmail,
          balance: initialBalance,
          frozenAmount: 0,
          teamEarnings: 0,
          vipLevel: 'M0',
          subscriptions: [],
          referralCode: newCode,
          referredBy: referredBy || null,
          isAdmin: targetEmail === 'akosbali5@gmail.com',
          createdAt: new Date().toISOString()
        }).then(async () => {
          if (referredBy) {
            // Award $1 to the inviter
            const usersRef = collection(db, 'users');
            const qInviter = query(usersRef, where('referralCode', '==', referredBy), limit(1));
            
            // We need a way to find user by referralCode efficiently since we don't know their email here
            const { getDocs } = await import('firebase/firestore');
            const inviterQuerySnap = await getDocs(qInviter);
            
            if (!inviterQuerySnap.empty) {
              const inviterDoc = inviterQuerySnap.docs[0];
              const inviterData = inviterDoc.data();
              const inviterRef = doc(db, 'users', inviterDoc.id);
              
              const currentInviterBalance = inviterData.balance || 0;
              await updateDoc(inviterRef, {
                balance: currentInviterBalance + 1
              });

              // Add a transaction record for inviter
              await addDoc(collection(db, 'transactions'), {
                userEmail: inviterDoc.id,
                amount: 1,
                type: 'task_reward', // Use generic reward type
                status: 'completed',
                date: new Date().toISOString().replace('T', ' ').substring(0, 19),
                method: 'Referral Bonus'
              });
            }
            localStorage.removeItem('referredBy');
          }
        });
      }
    }, (error) => {
      console.error("Firestore User Error:", error);
      if (error.code === 'resource-exhausted') {
        setQuotaExceeded(true);
      }
    });

    return () => unsubscribe();
  }, [currentUserEmail]);

  // 2. Sync Transactions from Firestore
  useEffect(() => {
    const txCollection = collection(db, 'transactions');
    let q;
    if (isAdmin) {
      q = query(txCollection, orderBy('date', 'desc'), limit(50));
    } else {
      q = query(txCollection, where('userEmail', '==', currentUserEmail), orderBy('date', 'desc'), limit(20));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Transaction))
        .filter(tx => tx.status !== 'deleted');
      setTransactions(txs);
    }, (error) => {
      console.error("Firestore Transactions Error:", error);
      if (error.code === 'resource-exhausted') {
        setQuotaExceeded(true);
      }
    });

    return () => unsubscribe();
  }, [isAdmin, currentUserEmail]);

  const updateBalance = async (amount: number) => {
    if (currentUserEmail === 'guest') return;
    const userDocRef = doc(db, 'users', currentUserEmail);
    const newBalance = parseFloat((balance + amount).toFixed(2));
    await setDoc(userDocRef, { balance: newBalance }, { merge: true });
  };

  const updateFrozenAmount = async (amount: number) => {
    if (currentUserEmail === 'guest') return;
    const userDocRef = doc(db, 'users', currentUserEmail);
    const newFrozen = parseFloat((frozenAmount + amount).toFixed(2));
    await setDoc(userDocRef, { frozenAmount: newFrozen }, { merge: true });
  };

  const addTransaction = async (tx: Omit<Transaction, 'id' | 'date' | 'status'>) => {
    const email = tx.userEmail || currentUserEmail;
    const newTx = {
      ...tx,
      userEmail: email,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: (tx.type === 'vip_purchase' || tx.type === 'task_reward') ? 'completed' : 'pending'
    };

    if (tx.type === 'withdrawal') {
      await updateBalance(-tx.amount);
      await updateFrozenAmount(tx.amount);
    }

    await addDoc(collection(db, 'transactions'), newTx);
  };

  const approveTransaction = async (id: string) => {
    if (!isAdmin) return;
    const txRef = doc(db, 'transactions', id);
    const txSnap = await getDoc(txRef);
    if (!txSnap.exists()) return;
    
    const tx = txSnap.data() as Transaction;
    if (tx.status !== 'pending') return;

    const targetEmail = tx.userEmail || 'guest';
    const targetUserRef = doc(db, 'users', targetEmail);
    const targetSnap = await getDoc(targetUserRef);
    
    if (tx.type === 'deposit') {
      const currentBal = targetSnap.exists() ? targetSnap.data().balance || 0 : 0;
      await setDoc(targetUserRef, { balance: currentBal + tx.amount }, { merge: true });
      
      // Handle Multi-Level Recharge Commissions
      if (targetSnap.exists()) {
        const rechargeAmount = tx.amount;
        let currentReffereeEmail = targetEmail;
        let currentReferredBy = targetSnap.data().referredBy;
        
        // Level 1: 12%, Level 2: 3%, Level 3: 1%
        const depthRates = [0.12, 0.03, 0.01];

        for (let i = 0; i < depthRates.length; i++) {
          if (!currentReferredBy) break;

          const usersRef = collection(db, 'users');
          const qInviter = query(usersRef, where('referralCode', '==', currentReferredBy), limit(1));
          const { getDocs } = await import('firebase/firestore');
          const inviterQuerySnap = await getDocs(qInviter);
          
          if (!inviterQuerySnap.empty) {
            const inviterDoc = inviterQuerySnap.docs[0];
            const inviterData = inviterDoc.data();
            const inviterSubscriptions = inviterData.subscriptions || [];
            
            // Only reward if inviter has active subscription (M1 - M6)
            if (inviterSubscriptions.length > 0 && inviterSubscriptions.some((s: any) => s.level !== 'M0')) {
              const inviterRef = doc(db, 'users', inviterDoc.id);
              const rate = depthRates[i];
              const commission = parseFloat((rechargeAmount * rate).toFixed(2));
              
              if (commission > 0) {
                await updateDoc(inviterRef, {
                  teamEarnings: (inviterData.teamEarnings || 0) + commission
                });

                await addDoc(collection(db, 'transactions'), {
                  userEmail: inviterDoc.id,
                  amount: commission,
                  type: 'task_reward',
                  status: 'completed',
                  date: new Date().toISOString().replace('T', ' ').substring(0, 19),
                  method: `عمولة فريق مستوى ${i+1} (${targetEmail})`
                });
              }
            }
            
            // Move up the chain
            currentReferredBy = inviterData.referredBy;
          } else {
            break;
          }
        }
      }

      // Add notification for depositor
      await addDoc(collection(db, 'notifications'), {
        title: 'تم قبول الإيداع',
        message: `تمت الموافقة على طلب الإيداع الخاص بك بقيمة ${tx.amount} USDT. الرصيد متاح الآن.`,
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false,
        userEmail: targetEmail
      });
    } else if (tx.type === 'withdrawal') {
      const currentFrozen = targetSnap.exists() ? targetSnap.data().frozenAmount || 0 : 0;
      await setDoc(targetUserRef, { frozenAmount: Math.max(0, currentFrozen - tx.amount) }, { merge: true });
      
      // Add notification
      await addDoc(collection(db, 'notifications'), {
        title: 'تم اكتمال السحب',
        message: `تمت الموافقة على طلب السحب الخاص بك بقيمة ${tx.amount} USDT. يرجى التحقق من محفظتك.`,
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false,
        userEmail: targetEmail
      });
    }

    await updateDoc(txRef, { status: 'completed' });
  };

  const rejectTransaction = async (id: string) => {
    if (!isAdmin) return;
    const txRef = doc(db, 'transactions', id);
    const txSnap = await getDoc(txRef);
    if (!txSnap.exists()) return;

    const tx = txSnap.data() as Transaction;
    if (tx.status !== 'pending') return;

    const targetEmail = tx.userEmail || 'guest';
    const targetUserRef = doc(db, 'users', targetEmail);
    const targetSnap = await getDoc(targetUserRef);

    if (tx.type === 'withdrawal') {
      const currentBal = targetSnap.exists() ? targetSnap.data().balance || 0 : 0;
      const currentFrozen = targetSnap.exists() ? targetSnap.data().frozenAmount || 0 : 0;
      await setDoc(targetUserRef, { 
        balance: currentBal + tx.amount,
        frozenAmount: Math.max(0, currentFrozen - tx.amount)
      }, { merge: true });
    }

    // Add notification
    const isDeposit = tx.type === 'deposit';
    await addDoc(collection(db, 'notifications'), {
      title: isDeposit ? 'تم رفض الإيداع' : 'تم رفض السحب',
      message: isDeposit 
        ? 'تم رفض طلب الإيداع الخاص بك. يرجى العلم أنه في حال تكرار الإيداع الوهمي سيتم إغلاق حسابك نهائياً.'
        : `تم رفض طلب السحب الخاص بك بقيمة ${tx.amount} USDT.`,
      type: 'error',
      timestamp: new Date().toISOString(),
      read: false,
      userEmail: targetEmail
    });

    await updateDoc(txRef, { status: 'rejected' });
  };

  const purchaseVIP = async (price: number, level: string, dailyProfit: number) => {
    if (currentUserEmail === 'guest') return false;
    
    // Ensure we are working with normalized levels
    const normalizedLevel = level.startsWith('VIP ') ? level.replace('VIP ', 'M') : level;
    
    if (balance >= price) {
      const userDocRef = doc(db, 'users', currentUserEmail);
      
      // Prevent multiple identical subscriptions (especially M0)
      if (normalizedLevel === 'M0' && subscriptions.some(s => s.level.replace('VIP ', 'M') === 'M0')) {
        return true; 
      }

      const newSubscription = {
        level: normalizedLevel,
        purchaseDate: new Date().toISOString(),
        dailyProfit,
        lastCollectDate: ''
      };

      const newSubscriptions = [...subscriptions, newSubscription];
      
      // Update vipLevel to the highest level among subscriptions
      const getLevelNum = (l: string) => {
        if (!l) return 0;
        const norm = l.replace('VIP ', 'M');
        const match = norm.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      };
      
      const highestVip = newSubscriptions.reduce((prev, curr) => 
        getLevelNum(curr.level) > getLevelNum(prev.level) ? curr : prev
      , { level: 'M0' });

      const finalLevel = highestVip.level.replace('VIP ', 'M');

      console.log(`Processing VIP purchase: ${level} for ${price}`);
      await setDoc(userDocRef, { 
        balance: parseFloat((balance - price).toFixed(2)),
        vipLevel: finalLevel,
        subscriptions: newSubscriptions
      }, { merge: true });
      
      await addTransaction({ amount: price, type: 'vip_purchase', method: `Upgrade to ${finalLevel}` });
      console.log(`VIP purchase successful: ${finalLevel}`);
      return true;
    }
    console.log(`VIP purchase failed: Insufficient balance (${balance} < ${price})`);
    return false;
  };

  const collectSubscriptions = async () => {
    if (currentUserEmail === 'guest') return 0;
    const userDocRef = doc(db, 'users', currentUserEmail);
    const now = new Date();
    const todayStr = now.toDateString();

    let totalToCollect = 0;
    const updatedSubscriptions = subscriptions.map(sub => {
      const lastCollect = sub.lastCollectDate ? new Date(sub.lastCollectDate).toDateString() : '';
      if (lastCollect !== todayStr) {
        totalToCollect += parseFloat(sub.dailyProfit || 0);
        return { ...sub, lastCollectDate: now.toISOString() };
      }
      return sub;
    });

    if (totalToCollect > 0) {
      const newBalance = parseFloat((balance + totalToCollect).toFixed(2));
      await updateDoc(userDocRef, {
        balance: newBalance,
        subscriptions: updatedSubscriptions
      });

      // Add to transactions
      await addTransaction({
        amount: totalToCollect,
        type: 'task_reward',
        userEmail: currentUserEmail
      });

      return totalToCollect;
    }
    return 0;
  };

  const deleteTransaction = async (id: string) => {
    if (!isAdmin) return;
    const txRef = doc(db, 'transactions', id);
    await updateDoc(txRef, { status: 'deleted' });
  };

  const collectTeamEarnings = async () => {
    if (currentUserEmail === 'guest') return 0;
    
    // Check for active subscription (M1 - M6)
    const hasSubscription = subscriptions.length > 0 && subscriptions.some(s => s.level !== 'M0');
    if (!hasSubscription) {
      throw new Error('يجب عليك الاشتراك في أحد المستويات (M1 - M6) لتتمكن من جمع أرباح الفريق.');
    }

    if (teamEarnings <= 0) return 0;

    const userDocRef = doc(db, 'users', currentUserEmail);
    const rewardAmount = teamEarnings;
    
    try {
      await updateDoc(userDocRef, {
        balance: parseFloat((balance + rewardAmount).toFixed(2)),
        teamEarnings: 0
      });

      await addTransaction({
        amount: rewardAmount,
        type: 'task_reward',
        method: 'Team Commission Collection'
      });

      return rewardAmount;
    } catch (err) {
      console.error("Error collecting team earnings:", err);
      throw new Error('حدث خطأ أثناء جمع الأرباح. يرجى المحاولة مرة أخرى.');
    }
  };

  const setAsAdmin = (val: boolean) => {
    setIsAdmin(val);
    const email = localStorage.getItem('currentUserEmail') || 'guest';
    localStorage.setItem(getStorageKey('isAdmin', email), val.toString());
    localStorage.setItem('isAdmin', val.toString());
    
    if (email !== 'guest') {
      setDoc(doc(db, 'users', email), { isAdmin: val }, { merge: true }).catch(console.error);
    }
  };

  return (
    <BalanceContext.Provider value={{ 
      balance, 
      frozenAmount, 
      teamEarnings,
      vipLevel, 
      subscriptions,
      referralCode,
      transactions, 
      updateBalance, 
      updateFrozenAmount,
      collectTeamEarnings, 
      collectSubscriptions,
      purchaseVIP,
      addTransaction,
      approveTransaction,
      rejectTransaction,
      deleteTransaction,
      isAdmin,
      setAsAdmin,
      currentUserEmail,
      quotaExceeded,
      setQuotaExceeded
    }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (!context) throw new Error('useBalance must be used within a BalanceProvider');
  return context;
};
