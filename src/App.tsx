/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Home, ClipboardList, Users, Diamond, User, Bell, Mail, PlusCircle, ArrowUpCircle, FileText, Share2, Globe, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// Pages
import HomePage from './pages/HomePage';
import TasksPage from './pages/TasksPage';
import TeamPage from './pages/TeamPage';
import VIPPage from './pages/VIPPage';
import MinePage from './pages/MinePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import { BalanceProvider, useBalance } from './lib/BalanceContext';
import AIChatSupport from './components/AIChatSupport';
import QuotaBanner from './components/QuotaBanner';

import { useTranslation } from 'react-i18next';
import { NotificationProvider } from './lib/NotificationContext';

const NAVIGATION = [
  { id: 'home', path: '/', labelKey: 'nav.home', icon: Home },
  { id: 'tasks', path: '/tasks', labelKey: 'nav.task', icon: ClipboardList },
  { id: 'team', path: '/team', labelKey: 'nav.team', icon: Users },
  { id: 'vip', path: '/vip', labelKey: 'nav.vip', icon: Diamond },
  { id: 'mine', path: '/mine', labelKey: 'nav.mine', icon: User },
];

function BottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const { isAdmin } = useBalance();
  const currentPath = location.pathname;

  if (currentPath === '/login' || currentPath === '/register') return null;

  const visibleNav = [...NAVIGATION];
  if (isAdmin) {
    visibleNav.push({ id: 'admin', path: '/admin', labelKey: 'nav.admin', icon: ArrowUpCircle });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/5 px-2 py-3 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] rounded-t-[2.5rem]">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {visibleNav.map((item) => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', item.path);
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className={cn(
                "flex flex-col items-center gap-1.5 px-3 py-1 transition-all rounded-2xl",
                isActive ? "text-primary scale-110" : "text-white/20 hover:text-white/40"
              )}
            >
              <div className={cn(
                "w-10 h-10 flex items-center justify-center rounded-2xl transition-all",
                isActive ? "bg-primary/10 shadow-[0_0_15px_rgba(212,175,55,0.1)]" : ""
              )}>
                <Icon size={24} className={cn(isActive && "drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]")} strokeWidth={isActive ? 3 : 2} />
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest">{t(item.labelKey) || (item.id === 'admin' ? 'الإدارة' : item.labelKey)}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('isLoggedIn') === 'true');

  const handleLogin = (email?: string) => {
    setIsAuthenticated(true);
    localStorage.setItem('isLoggedIn', 'true');
    if (email) {
      localStorage.setItem('currentUserEmail', email);
      if (email === 'akosbali5@gmail.com') {
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem(`${email}_isAdmin`, 'true');
      }
    }
    // Small delay to ensure localStorage is written before reload
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleLogout = () => {
    const currentUserEmail = localStorage.getItem('currentUserEmail') || 'guest';
    setIsAuthenticated(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem(`${currentUserEmail}_isAdmin`);
    localStorage.removeItem('currentUserEmail');
    window.location.href = '/login';
  };

  return (
    <BalanceProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen rtl-container pb-20 selection:bg-primary/20 bg-[#0a0a0a]">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />} />
                <Route path="/tasks" element={isAuthenticated ? <TasksPage /> : <Navigate to="/login" />} />
                <Route path="/team" element={isAuthenticated ? <TeamPage /> : <Navigate to="/login" />} />
                <Route path="/vip" element={isAuthenticated ? <VIPPage /> : <Navigate to="/login" />} />
                <Route path="/mine" element={isAuthenticated ? <MinePage /> : <Navigate to="/login" />} />
                <Route path="/login" element={isAuthenticated ? <Navigate to="/mine" /> : <LoginPage onLogin={handleLogin} />} />
                <Route path="/register" element={isAuthenticated ? <Navigate to="/mine" /> : <RegisterPage onRegister={handleLogin} />} />
                <Route path="/admin" element={isAuthenticated ? <AdminPage /> : <Navigate to="/login" />} />
              </Routes>
            </AnimatePresence>
            <BottomNav />
            <AIChatSupport />
            <QuotaBanner />
          </div>
        </Router>
      </NotificationProvider>
    </BalanceProvider>
  );
}
