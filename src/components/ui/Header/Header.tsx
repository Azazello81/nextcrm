'use client';

import { useState, useEffect } from 'react';
import { useUserProfile, handleLogout as storeLogout } from '@/stores/auth-store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Logout as LogoutIcon,
  PointOfSale as PointOfSaleIcon,
  AttachMoney as AttachMoneyIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  Contacts as ContactsIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';

interface User {
  id: string;
  login: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  phone?: string;
  datereg: Date;
  dateactiv: Date;
  avatar?: string;
  role: 'admin' | 'manager' | 'user';
}

interface HeaderProps {
  user?: User | null;
  onLogout?: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const {
    user: storeUser,
    isAdmin: storeIsAdmin,
    fullName: storeFullName,
    initials: storeInitials,
  } = useUserProfile();

  const handleLogout = async () => {
    // Always trigger store logout to clear auth state and inform server;
    // call passed prop handler too for compatibility (e.g., page-local mocks).
    try {
      storeLogout();
    } catch (err) {
      console.error('Logout store call failed', err);
    }
    if (onLogout) {
      try {
        onLogout();
      } catch (err) {
        console.error('onLogout handler failed', err);
      }
    }
    setIsProfileMenuOpen(false);
    setIsMenuOpen(false);
    router.push('/');
  };

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);
  const currentUser = mounted ? storeUser || user : user;
  const buildFullNameFromFields = (u?: User | null) => {
    if (!u) return undefined;
    const parts: string[] = [];
    if (u.lastName) parts.push(u.lastName);
    if (u.firstName) parts.push(u.firstName);
    if (u.middleName) parts.push(u.middleName);
    if (parts.length > 0) return parts.join(' ');
    if (u.name) return u.name;
    return undefined;
  };

  const buildInitialFromFields = (u?: User | null) => {
    if (!u) return undefined;
    if (u.lastName) return u.lastName.charAt(0).toUpperCase();
    if (u.firstName) return u.firstName.charAt(0).toUpperCase();
    if (u.name) return u.name.charAt(0).toUpperCase();
    if (u.login) return u.login.charAt(0).toUpperCase();
    return undefined;
  };

  const nameFromFields = buildFullNameFromFields(currentUser);
  const initialFromFields = buildInitialFromFields(currentUser);

  const displayName = mounted
    ? storeFullName || nameFromFields || currentUser?.email || currentUser?.login
    : nameFromFields || currentUser?.email || currentUser?.login;

  const displayInitial = mounted
    ? storeInitials || initialFromFields || currentUser?.login?.charAt(0)?.toUpperCase()
    : initialFromFields || currentUser?.login?.charAt(0)?.toUpperCase();

  const handleProfileClick = () => {
    if (currentUser) {
      const role = String(currentUser?.role || '').toLowerCase();
      router.push(role === 'admin' ? '/admin' : '/user');
    } else {
      router.push('/login');
    }
    setIsProfileMenuOpen(false);
    setIsMenuOpen(false);
  };

  const navigationItems = [
    { href: '/', label: 'Главная', icon: <HomeIcon sx={{ fontSize: 20 }} /> },
    { href: '/services', label: 'Услуги', icon: <PointOfSaleIcon sx={{ fontSize: 20 }} /> },
    { href: '/pricing', label: 'Цены', icon: <AttachMoneyIcon sx={{ fontSize: 20 }} /> },
    { href: '/about', label: 'О компании', icon: <InfoIcon sx={{ fontSize: 20 }} /> },
    { href: '/contact', label: 'Контакты', icon: <ContactsIcon sx={{ fontSize: 20 }} /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-accent to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <PointOfSaleIcon sx={{ fontSize: 24, color: 'white' }} />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-900 group-hover:text-accent transition-colors">
                  КассоСервис
                </span>
                <span className="text-xs text-slate-500">Профессиональное обслуживание ККТ</span>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="hidden lg:flex items-center space-x-1"
          >
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-4 py-2 text-slate-700 hover:text-accent transition-colors duration-200 font-medium group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-accent to-blue-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </motion.nav>

          {/* Desktop Auth Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="hidden lg:flex items-center space-x-4"
          >
            {currentUser ? (
              /* User Menu */
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 rounded-xl px-4 py-2.5 transition-all duration-200 border border-slate-200"
                >
                  <div className="relative">
                    <div className="w-9 h-9 bg-gradient-to-br from-accent to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                      {displayInitial}
                    </div>
                    {(storeIsAdmin ||
                      String(currentUser?.role || '').toLowerCase() === 'admin') && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center">
                        <VerifiedIcon sx={{ fontSize: 8, color: 'white' }} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold text-slate-900">{displayName}</span>
                    <span className="text-xs text-slate-500 capitalize">{displayName}</span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </motion.button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <>
                      <motion.div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsProfileMenuOpen(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 20,
                        }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                          <p className="text-sm font-semibold text-slate-900">
                            {displayName || 'Пользователь'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {currentUser?.email || `@${currentUser?.login}`}
                          </p>
                        </div>

                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={handleProfileClick}
                          className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-200 flex items-center gap-3"
                        >
                          <PersonIcon sx={{ fontSize: 20, color: 'var(--color-accent)' }} />
                          <span>Личный кабинет</span>
                        </motion.button>

                        {(storeIsAdmin ||
                          String(currentUser?.role || '').toLowerCase() === 'admin') && (
                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              router.push('/admin');
                              setIsProfileMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-200 flex items-center gap-3"
                          >
                            <AdminPanelSettingsIcon
                              sx={{ fontSize: 20, color: 'var(--color-amber-500)' }}
                            />
                            <span>Админ панель</span>
                          </motion.button>
                        )}

                        <div className="border-t border-slate-100 mt-2 pt-2">
                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center gap-3"
                          >
                            <LogoutIcon sx={{ fontSize: 20 }} />
                            <span>Выйти</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Auth Buttons */
              <div className="flex items-center gap-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/login"
                    className="text-slate-700 hover:text-accent transition-colors duration-200 font-medium px-4 py-2 rounded-lg hover:bg-slate-50"
                  >
                    Вход
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/register" className="btn-accent px-6 py-2.5 font-medium">
                    Регистрация
                  </Link>
                </motion.div>
              </div>
            )}

            {/* Contact Info */}
            <div className="hidden xl:flex items-center gap-6 ml-4 pl-4 border-l border-slate-200">
              <a href="tel:+78001234567" className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                  <PhoneIcon sx={{ fontSize: 20, color: 'white' }} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    8 (800) 123-45-67
                  </span>
                  <span className="text-xs text-slate-500">Бесплатный звонок</span>
                </div>
              </a>
            </div>
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors duration-200 border border-slate-200"
            aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
          >
            {isMenuOpen ? (
              <CloseIcon sx={{ fontSize: 24, color: 'var(--color-accent)' }} />
            ) : (
              <MenuIcon sx={{ fontSize: 24, color: 'var(--color-slate-700)' }} />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/0  z-40 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Content */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden fixed top-0 left-0 right-0 bg-white z-50 mt-16 md:mt-20 shadow-xl"
          >
            <div className="container mx-auto px-4 py-6 max-h-[calc(100vh-4rem)] md:max-h-[calc(100vh-5rem)] overflow-y-auto">
              {/* Navigation Links */}
              <div className="space-y-3 mb-8">
                {navigationItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between px-5 py-4 text-slate-800 hover:text-accent bg-slate-50 hover:bg-blue-50 rounded-2xl transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-accent transform group-hover:scale-110 transition-transform duration-300"></div>
                        <span className="text-lg font-semibold">{item.label}</span>
                      </div>
                      <svg
                        className="w-6 h-6 text-slate-400 group-hover:text-accent transition-colors duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Contact Info */}
              <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl p-5 mb-8 border border-slate-200">
                <div className="space-y-4">
                  <a
                    href="tel:+78001234567"
                    className="flex items-center justify-between p-4 bg-white/80 hover:bg-white rounded-xl transition-all duration-300 group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-md">
                        <PhoneIcon sx={{ fontSize: 28, color: 'white' }} />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-lg font-bold text-slate-900">8 (800) 123-45-67</span>
                        <span className="text-sm text-slate-600 mt-1">Бесплатный звонок</span>
                      </div>
                    </div>
                  </a>

                  <a
                    href="mailto:info@kassa-service.ru"
                    className="flex items-center justify-between p-4 bg-white/80 hover:bg-white rounded-xl transition-all duration-300 group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-accent to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                        <EmailIcon sx={{ fontSize: 28, color: 'white' }} />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-lg font-bold text-slate-900">
                          info@kassa-service.ru
                        </span>
                        <span className="text-sm text-slate-600 mt-1">Электронная почта</span>
                      </div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Auth Section */}
              {currentUser ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-accent to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                          {displayInitial}
                        </div>
                        {(storeIsAdmin ||
                          String(currentUser?.role || '').toLowerCase() === 'admin') && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center shadow-md">
                            <VerifiedIcon sx={{ fontSize: 12, color: 'white' }} />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-start">
                        <p className="text-xl font-bold text-slate-900">{displayName}</p>
                        <p className="text-sm text-slate-500 capitalize mt-1">{displayName}</p>
                      </div>
                    </div>
                    <div className="text-slate-400">
                      <PersonIcon sx={{ fontSize: 28 }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        handleProfileClick();
                        setIsMenuOpen(false);
                      }}
                      className="btn-accent flex items-center justify-center gap-3 py-4 rounded-xl text-lg font-semibold shadow-md hover:shadow-lg transition-shadow"
                    >
                      <PersonIcon sx={{ fontSize: 24 }} />
                      Кабинет
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center justify-center gap-3 py-4 border-2 border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-lg font-semibold transition-colors shadow-sm hover:shadow"
                    >
                      <LogoutIcon sx={{ fontSize: 24 }} />
                      Выйти
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      router.push('/login');
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-center px-5 py-4 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold text-lg transition-colors border-2 border-slate-200 hover:border-slate-300"
                  >
                    Войти в систему
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      router.push('/register');
                      setIsMenuOpen(false);
                    }}
                    className="w-full btn-accent py-4 font-semibold text-lg rounded-xl shadow-md hover:shadow-lg transition-shadow"
                  >
                    Зарегистрироваться
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
