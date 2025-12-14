'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon,
  Verified as VerifiedIcon,
  PointOfSale as PointOfSaleIcon,
  Calculate as CalculateIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Description as DescriptionIcon,
  Analytics as AnalyticsIcon,
  Facebook as FacebookIcon,
  Telegram as TelegramIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
  Code as CodeIcon,
  Cloud as CloudIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

interface HealthResponse {
  status: string;
  database: {
    status: string;
    responseTime?: string;
    message?: string;
  };
  timestamp: string;
  environment: string;
}

export default function Footer() {
  const [dbStatus, setDbStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');
  const [dbResponseTime, setDbResponseTime] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<string>('Гость');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastChecked, setLastChecked] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Функция для получения реального статуса БД
  const fetchDbStatus = async () => {
    try {
      const response = await fetch('/api/health', {
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: HealthResponse = await response.json();
      setDbStatus(data.database.status as 'connected' | 'disconnected');
      setDbResponseTime(data.database.responseTime || '');
      setLastChecked(new Date().toLocaleTimeString('ru-RU'));
    } catch (error) {
      console.error('Ошибка получения статуса БД:', error);
      setDbStatus('disconnected');
      setDbResponseTime('');
      setLastChecked(new Date().toLocaleTimeString('ru-RU'));
    }
  };

  useEffect(() => {
    // Получаем пользователя из localStorage
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('nextcrm_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setCurrentUser(userData.name || userData.login || 'Пользователь');
        } catch {
          setCurrentUser(storedUser);
        }
      }
    }

    // Первоначальная загрузка статуса БД
    fetchDbStatus();

    // Анимация появления
    setIsVisible(true);

    // Обновляем время каждую секунду
    const timeTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // mark mounted to avoid hydration mismatch with server-rendered time
    setMounted(true);

    // Обновляем статус БД каждые 30 секунд
    const statusTimer = setInterval(fetchDbStatus, 30000);

    return () => {
      clearInterval(timeTimer);
      clearInterval(statusTimer);
    };
  }, []);

  const getDbStatusColor = () => {
    switch (dbStatus) {
      case 'connected':
        return 'text-emerald-400';
      case 'disconnected':
        return 'text-red-400';
      case 'loading':
        return 'text-amber-400';
      default:
        return 'text-slate-400';
    }
  };

  const getDbStatusText = () => {
    switch (dbStatus) {
      case 'connected':
        return 'Подключено';
      case 'disconnected':
        return 'Отключено';
      case 'loading':
        return 'Загрузка...';
      default:
        return 'Неизвестно';
    }
  };

  const getDbStatusDot = () => {
    switch (dbStatus) {
      case 'connected':
        return 'bg-emerald-400';
      case 'disconnected':
        return 'bg-red-400 animate-pulse';
      case 'loading':
        return 'bg-amber-400 animate-pulse';
      default:
        return 'bg-slate-400';
    }
  };

  const services = [
    { icon: <PointOfSaleIcon sx={{ fontSize: 16 }} />, label: 'Обслуживание ККТ' },
    { icon: <CalculateIcon sx={{ fontSize: 16 }} />, label: 'Бухгалтерские услуги' },
    { icon: <StorageIcon sx={{ fontSize: 16 }} />, label: 'Фискальные накопители' },
    { icon: <SecurityIcon sx={{ fontSize: 16 }} />, label: 'ОНЛАЙН-ККТ' },
    { icon: <DescriptionIcon sx={{ fontSize: 16 }} />, label: 'ЭДО и СФ' },
    { icon: <AnalyticsIcon sx={{ fontSize: 16 }} />, label: 'Аналитика продаж' },
  ];

  const quickLinks = [
    { href: '/', label: 'Главная' },
    { href: '/services', label: 'Услуги' },
    { href: '/pricing', label: 'Цены' },
    { href: '/about', label: 'О компании' },
    { href: '/contact', label: 'Контакты' },
    { href: '/faq', label: 'FAQ' },
  ];

  const legalLinks = [
    { href: '/privacy', label: 'Политика конфиденциальности' },
    { href: '/terms', label: 'Условия использования' },
    { href: '/cookies', label: 'Политика cookies' },
    { href: '/support', label: 'Техническая поддержка' },
  ];

  const socialLinks = [
    { icon: <FacebookIcon sx={{ fontSize: 20 }} />, href: '#', label: 'Facebook' },
    { icon: <TelegramIcon sx={{ fontSize: 20 }} />, href: '#', label: 'Telegram' },
    { icon: <LinkedInIcon sx={{ fontSize: 20 }} />, href: '#', label: 'LinkedIn' },
    { icon: <InstagramIcon sx={{ fontSize: 20 }} />, href: '#', label: 'Instagram' },
  ];

  return (
    <footer className="bg-linear-to-br from-slate-900 to-blue-900 text-white">
      {/* Main Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-linear-to-br from-accent to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <PointOfSaleIcon sx={{ fontSize: 28, color: 'white' }} />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">КассоСервис</h2>
                <p className="text-slate-300 leading-relaxed">
                  Профессиональное обслуживание кассовой техники и бухгалтерские услуги. Более 10
                  лет на рынке, более 1500 довольных клиентов.
                </p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <a href="tel:+78001234567" className="flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-linear-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PhoneIcon sx={{ fontSize: 20, color: 'white' }} />
                  </div>
                  <div>
                    <p className="font-semibold group-hover:text-emerald-400 transition-colors">
                      8 (800) 123-45-67
                    </p>
                    <p className="text-sm text-slate-400">Бесплатный звонок</p>
                  </div>
                </a>

                <a href="mailto:info@kassa-service.ru" className="flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-linear-to-br from-accent to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <EmailIcon sx={{ fontSize: 20, color: 'white' }} />
                  </div>
                  <div>
                    <p className="font-semibold group-hover:text-accent transition-colors">
                      info@kassa-service.ru
                    </p>
                    <p className="text-sm text-slate-400">Электронная почта</p>
                  </div>
                </a>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <LocationIcon sx={{ fontSize: 20, color: 'white' }} />
                  </div>
                  <div>
                    <p className="font-semibold">г. Москва, ул. Примерная, д. 123</p>
                    <p className="text-sm text-slate-400">Офис компании</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <AccessTimeIcon sx={{ fontSize: 20, color: 'white' }} />
                  </div>
                  <div>
                    <p className="font-semibold">Пн-Пт: 9:00-20:00</p>
                    <p className="text-sm text-slate-400">Время работы</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4 pt-6 border-t border-slate-700">
              <span className="text-slate-400">Мы в соцсетях:</span>
              <div className="flex items-center gap-3">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors group"
                    aria-label={social.label}
                  >
                    <div className="group-hover:scale-110 transition-transform">{social.icon}</div>
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold mb-6 pb-3 border-b border-slate-700 flex items-center gap-2">
              <VerifiedIcon sx={{ fontSize: 20, color: 'var(--color-primary)' }} />
              Наши услуги
            </h3>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={`/services#${service.label.toLowerCase().replace(/\s+/g, '-')}`}
                    className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group"
                  >
                    <div className="text-accent opacity-70 group-hover:opacity-100 transition-opacity">
                      {service.icon}
                    </div>
                    <span className="group-hover:translate-x-1 transition-transform">
                      {service.label}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 pb-3 border-b border-slate-700">Навигация</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  Сайт
                </h4>
                <ul className="space-y-2">
                  {quickLinks.map((link, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                    >
                      <Link
                        href={link.href}
                        className="text-sm text-slate-300 hover:text-white transition-colors hover:pl-2 duration-200"
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  Документы
                </h4>
                <ul className="space-y-2">
                  {legalLinks.map((link, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <Link
                        href={link.href}
                        className="text-sm text-slate-300 hover:text-white transition-colors hover:pl-2 duration-200"
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Bar with System Info */}
      <div className="border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="text-center lg:text-left">
              <p className="text-slate-400 text-sm">© 2026 КассоСервис. Все права защищены.</p>
              <p className="text-xs text-slate-500 mt-1">
                ООО КассоСервис, ИНН 1234567890, ОГРН 1234567890123
              </p>
            </div>

            {/* System Information */}
            <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-6 text-sm">
              {/* Database Status */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${dbStatus === 'connected' ? 'bg-emerald-900/20' : 'bg-red-900/20'}`}
                title={`Проверено: ${lastChecked}`}
              >
                <div className={`w-2 h-2 rounded-full ${getDbStatusDot()}`}></div>
                <span className={getDbStatusColor()}>БД: {getDbStatusText()}</span>
                {dbResponseTime && (
                  <span className="text-xs text-slate-400">({dbResponseTime})</span>
                )}
              </motion.div>

              {/* Version */}
              <div className="flex items-center gap-2 text-slate-400">
                <CodeIcon sx={{ fontSize: 16 }} />
                <span>v2.0.1</span>
              </div>

              {/* Current User */}
              <div className="flex items-center gap-2 text-slate-400">
                <PersonIcon sx={{ fontSize: 16 }} />
                <span>{currentUser}</span>
              </div>

              {/* Current Time */}
              <div className="flex items-center gap-2 text-slate-400">
                <ScheduleIcon sx={{ fontSize: 16 }} />

                <span aria-live="polite">
                  {mounted ? currentTime.toLocaleTimeString('ru-RU') : '--:--:--'}
                </span>
              </div>

              {/* Environment */}
              <div className="flex items-center gap-2 text-slate-400">
                <CloudIcon sx={{ fontSize: 16 }} />
                <span>PROD</span>
              </div>
            </div>

            {/* Status Badge */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                dbStatus === 'connected'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : dbStatus === 'disconnected'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              {dbStatus === 'connected'
                ? '✅ Система активна'
                : dbStatus === 'disconnected'
                  ? '❌ Технические работы'
                  : '🔄 Проверка состояния'}
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
}
