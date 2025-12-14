'use client';

import Link from 'next/link';
import { useState } from 'react';
import Header from '../components/ui/Header/Header';
import Footer from '../components/ui/Footer/Footer';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  PointOfSale,
  Calculate,
  Security,
  HeadsetMic,
  Verified,
  AccessTime,
  People,
  CheckCircle,
  ArrowForward,
  Download,
  Phone,
  Email,
  LocationOn,
  Storage,
  Description,
  Analytics,
  SupportAgent,
  AssignmentTurnedIn,
} from '@mui/icons-material';
import { FullScreenLoading } from '@/components/ui/LoadingSpinner';

// Note: Remove mock user; Home page relies on store for auth state

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const services = [
  {
    icon: <PointOfSale sx={{ fontSize: 32 }} />,
    title: 'Обслуживание ККТ',
    description:
      'Настройка, ремонт и техническое обслуживание кассовой техники любых производителей',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
  },
  {
    icon: <Calculate sx={{ fontSize: 32 }} />,
    title: 'Бухгалтерские услуги',
    description: 'Полное ведение бухгалтерии, налоговые консультации и отчетность',
    color: 'from-emerald-500 to-green-500',
    bgColor: 'bg-emerald-50',
  },
  {
    icon: <Storage sx={{ fontSize: 32 }} />,
    title: 'Фискальные накопители',
    description: 'Продажа и замена ФН, регистрация в ФНС, обновление прошивок',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
  },
  {
    icon: <Security sx={{ fontSize: 32 }} />,
    title: 'ОНЛАЙН-ККТ',
    description: 'Настройка онлайн-касс для работы с ОФД и маркировкой товаров',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50',
  },
  {
    icon: <Description sx={{ fontSize: 32 }} />,
    title: 'ЭДО и СФ',
    description: 'Подключение электронного документооборота и электронных счетов-фактур',
    color: 'from-red-500 to-rose-500',
    bgColor: 'bg-red-50',
  },
  {
    icon: <Analytics sx={{ fontSize: 32 }} />,
    title: 'Аналитика продаж',
    description: 'Анализ данных с касс, формирование отчетов, бизнес-аналитика',
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'bg-indigo-50',
  },
];

const advantages = [
  'Более 10 лет на рынке',
  'Сертифицированные специалисты',
  'Круглосуточная поддержка',
  'Гарантия на все работы',
  'Выезд специалиста в течение 2 часов',
  'Помощь в регистрации ККТ в ФНС',
];

const partners = ['АТОЛ', 'ШТРИХ-М', 'ЭВОТОР', 'МЕРКУРИЙ', 'ПОС-СИСТЕМЫ', 'R-keeper'];

const stats = [
  { value: '1500+', label: 'Довольных клиентов', icon: <People sx={{ fontSize: 32 }} /> },
  { value: '5000+', label: 'Обслуженных касс', icon: <PointOfSale sx={{ fontSize: 32 }} /> },
  { value: '12 лет', label: 'На рынке', icon: <Verified sx={{ fontSize: 32 }} /> },
  { value: '24/7', label: 'Поддержка', icon: <SupportAgent sx={{ fontSize: 32 }} /> },
];

const faqItems = [
  {
    question: 'Сколько времени занимает настройка онлайн-кассы?',
    answer: 'Обычно настройка занимает 1-2 часа на месте у клиента.',
  },
  {
    question: 'Как часто нужно менять фискальный накопитель?',
    answer: 'ФН подлежит замене каждые 13-36 месяцев в зависимости от модели.',
  },
  {
    question: 'Какие документы нужны для регистрации ККТ?',
    answer: 'Паспорт владельца, ИНН, ОГРН и технический паспорт кассы.',
  },
  {
    question: 'Предоставляете ли вы гарантию на работы?',
    answer: 'Да, на все работы предоставляем гарантию от 6 до 24 месяцев.',
  },
];

export default function HomePage() {
  const isLoading = false;
  const [activeService, setActiveService] = useState(0);
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: 'Обслуживание ККТ',
  });

  // No mock user; rely on store for auth state

  // Logout handled by Header via store; keep local function removed

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Заявка отправлена! Мы свяжемся с вами в ближайшее время.');
    setFormData({ name: '', phone: '', service: 'Обслуживание ККТ' });
  };

  if (isLoading) {
    return <FullScreenLoading />;
  }

  return (
    <>
      <Header />

      <main className="grow bg-linear-to-br from-slate-50 to-slate-100">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 bg-linear-to-br from-accent/10 via-transparent to-slate-900/10"></div>
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-accent/5 rounded-full blur-3xl"></div>

          <div className="container mx-auto px-4 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full px-4 py-2 mb-6">
                  <Verified sx={{ fontSize: 16, color: 'var(--color-accent)' }} />
                  <span className="text-sm font-medium text-slate-700">
                    Официальный партнер ведущих производителей
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-slate-900 leading-tight">
                  <span className="text-slate-900">Профессиональное</span>{' '}
                  <span className="bg-linear-to-r from-accent to-blue-600 bg-clip-text text-transparent">
                    обслуживание касс
                  </span>{' '}
                  <span className="text-slate-900">и бухгалтерские услуги</span>
                </h1>

                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Полный спектр услуг для вашего бизнеса: от настройки кассовой техники до ведения
                  бухгалтерии. Работаем с 2010 года, более 1500 довольных клиентов.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/login"
                      className="btn-accent px-8 py-4 text-lg font-semibold rounded-xl flex items-center gap-2 group"
                    >
                      <HeadsetMic sx={{ fontSize: 20 }} />
                      Заказать консультацию
                      <ArrowForward className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="tel:+78001234567"
                      className="px-8 py-4 text-lg font-semibold rounded-xl border-2 border-slate-300 hover:border-accent hover:text-accent transition-all duration-300 text-slate-700 flex items-center gap-2"
                    >
                      <Phone sx={{ fontSize: 20 }} />8 (800) 123-45-67
                    </Link>
                  </motion.div>
                </div>

                {/* Quick Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl md:text-3xl font-bold text-accent mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-slate-600">{stat.label}</div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-200">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-linear-to-r from-accent to-blue-600 text-white px-6 py-2 rounded-full font-semibold">
                      Онлайн-заявка
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Ваше имя
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        className="input-field"
                        placeholder="Иван Иванов"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Телефон
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleFormChange}
                        className="input-field"
                        placeholder="+7 (999) 999-99-99"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Услуга
                      </label>
                      <select
                        name="service"
                        value={formData.service}
                        onChange={handleFormChange}
                        className="input-field"
                      >
                        <option>Обслуживание ККТ</option>
                        <option>Бухгалтерские услуги</option>
                        <option>Покупка ФН</option>
                        <option>Настройка онлайн-кассы</option>
                        <option>Другое</option>
                      </select>
                    </div>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-linear-to-r from-accent to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                    >
                      <AssignmentTurnedIn sx={{ fontSize: 20 }} />
                      Отправить заявку
                    </motion.button>
                  </form>
                </div>

                {/* Декоративные элементы */}
                <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
                  <motion.div
                    animate={{
                      rotate: 360,
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="absolute top-1/4 left-1/4 w-32 h-32 bg-linear-to-r from-accent/10 to-blue-600/10 rounded-full blur-xl"
                  />
                  <motion.div
                    animate={{
                      rotate: -360,
                      scale: [1, 0.9, 1],
                    }}
                    transition={{
                      duration: 15,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-linear-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-xl"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4 text-slate-900">Наши услуги</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Комплексные решения для автоматизации торговли и бухгалтерского учета
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ y: -10 }}
                  className={`${service.bgColor} rounded-2xl p-8 border border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer ${activeService === index ? 'ring-2 ring-accent border-accent' : ''}`}
                  onMouseEnter={() => setActiveService(index)}
                  onClick={() => router.push(`/services/${index + 1}`)}
                >
                  <div
                    className={`inline-flex p-4 rounded-2xl bg-linear-to-r ${service.color} text-white mb-6`}
                  >
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-slate-900">{service.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-6">{service.description}</p>
                  <div className="inline-flex items-center gap-2 text-accent font-medium hover:gap-3 transition-all">
                    Подробнее
                    <ArrowForward sx={{ fontSize: 16 }} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Advantages Section */}
        <section className="py-20 bg-linear-to-br from-slate-50 to-blue-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold mb-8 text-slate-900">Почему выбирают нас</h2>

                <div className="space-y-6">
                  {advantages.map((advantage, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      style={{ transitionDelay: `${index * 100}ms` }}
                      className="flex items-start gap-4"
                    >
                      <div className="bg-accent/10 p-2 rounded-lg">
                        <CheckCircle sx={{ color: 'var(--color-accent)', fontSize: 20 }} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">{advantage}</h4>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-linear-to-r from-accent to-blue-600 p-3 rounded-xl">
                      <AccessTime sx={{ fontSize: 24, color: 'white' }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">Срочный выезд</h3>
                      <p className="text-slate-600">В течение 2 часов по Москве</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                      <span className="text-slate-700">Настройка ККТ</span>
                      <span className="font-semibold text-accent">от 2 500 ₽</span>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                      <span className="text-slate-700">Замена ФН</span>
                      <span className="font-semibold text-accent">от 1 500 ₽</span>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                      <span className="text-slate-700">Бухгалтерское сопровождение</span>
                      <span className="font-semibold text-accent">от 5 000 ₽/мес</span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mt-8 bg-linear-to-r from-accent to-blue-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                  >
                    <Download sx={{ fontSize: 20 }} />
                    Скачать прайс-лист
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Partners Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4 text-slate-900">Наши партнеры</h2>
              <p className="text-slate-600">Работаем с ведущими производителями кассовой техники</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8"
            >
              {partners.map((partner, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="bg-slate-50 rounded-xl p-6 flex items-center justify-center h-24 hover:shadow-lg transition-all border border-slate-200"
                >
                  <span className="text-xl font-semibold text-slate-700">{partner}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-linear-to-r from-slate-900 to-blue-900 text-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto"
            >
              <h2 className="text-4xl font-bold mb-6">Готовы оптимизировать ваш бизнес?</h2>

              <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                Оставьте заявку и получите бесплатную консультацию специалиста
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/contact"
                    className="bg-white text-slate-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-slate-100 transition-colors inline-flex items-center gap-2"
                  >
                    <Email sx={{ fontSize: 20 }} />
                    Написать нам
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="tel:+78001234567"
                    className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors inline-flex items-center gap-2"
                  >
                    <Phone sx={{ fontSize: 20 }} />
                    Позвонить
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition-all"
              >
                <Phone
                  sx={{ fontSize: 48, color: 'var(--color-accent)', margin: '0 auto 1.5rem' }}
                />
                <h3 className="text-xl font-semibold mb-4 text-slate-900">Телефон</h3>
                <a
                  href="tel:+78001234567"
                  className="text-2xl font-bold text-slate-900 hover:text-accent transition-colors"
                >
                  8 (800) 123-45-67
                </a>
                <p className="text-slate-600 mt-2">Бесплатный звонок по России</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition-all"
                style={{ transitionDelay: '100ms' }}
              >
                <LocationOn
                  sx={{ fontSize: 48, color: 'var(--color-accent)', margin: '0 auto 1.5rem' }}
                />
                <h3 className="text-xl font-semibold mb-4 text-slate-900">Адрес</h3>
                <p className="text-lg text-slate-900">г. Москва, ул. Примерная, д. 123</p>
                <p className="text-slate-600 mt-2">Пн-Пт: 9:00-20:00</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition-all"
                style={{ transitionDelay: '200ms' }}
              >
                <Email
                  sx={{ fontSize: 48, color: 'var(--color-accent)', margin: '0 auto 1.5rem' }}
                />
                <h3 className="text-xl font-semibold mb-4 text-slate-900">Email</h3>
                <a
                  href="mailto:info@kassa-service.ru"
                  className="text-lg text-slate-900 hover:text-accent transition-colors"
                >
                  info@kassa-service.ru
                </a>
                <p className="text-slate-600 mt-2">Ответим в течение 30 минут</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Preview */}
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4 text-slate-900">Частые вопросы</h2>
              <p className="text-slate-600">Ответы на популярные вопросы наших клиентов</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {faqItems.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  style={{ transitionDelay: `${index * 100}ms` }}
                  className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-lg transition-all"
                >
                  <h3 className="text-lg font-semibold mb-3 text-slate-900">{faq.question}</h3>
                  <p className="text-slate-600">{faq.answer}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all"
              >
                Все вопросы
                <ArrowForward sx={{ fontSize: 20 }} />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
