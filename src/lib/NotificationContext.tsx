import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, setDoc, orderBy, limit, where } from 'firebase/firestore';
import { db } from './firebase';
import { useBalance } from './BalanceContext';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  userEmail: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { currentUserEmail } = useBalance();

  useEffect(() => {
    // We allow guest to receive notifications for better testing
    const targetEmail = currentUserEmail || 'guest';

    const q = query(
      collection(db, 'notifications'),
      where('userEmail', '==', targetEmail),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      setNotifications(notes);
    }, (error) => {
      console.error("Firestore Notifications Error:", error);
      // We don't have direct access to setQuotaExceeded here without adding it to context,
      // but the balance provider will likely catch it too.
    });

    return () => unsubscribe();
  }, [currentUserEmail]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = async (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification = {
      ...n,
      timestamp: new Date().toISOString(),
      read: false,
    };
    await addDoc(collection(db, 'notifications'), newNotification);
  };

  const markAsRead = async (id: string) => {
    const noteRef = doc(db, 'notifications', id);
    await updateDoc(noteRef, { read: true });
  };

  const clearAll = async () => {
    // Usually we'd want to delete or mark all as read
    // For simplicity, let's just mark current visible as read
    for (const note of notifications) {
      if (!note.read) {
        await markAsRead(note.id);
      }
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
