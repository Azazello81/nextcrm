'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { JWTClientService } from '@lib/auth/jwt-client';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectUrl = searchParams.get('redirect') || '/user';
  const isInvalidToken = searchParams.get('invalid') === 'true';

  useEffect(() => {
    // Добавляем класс для body чтобы убрать скролл
    document.body.classList.add('login-page');

    if (isInvalidToken) {
      setError('Ваша сессия истекла. Пожалуйста, войдите снова.');
    }

    // Очищаем класс при размонтировании
    return () => {
      document.body.classList.remove('login-page');
    };
  }, [isInvalidToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        JWTClientService.storeToken(data.token);

        // Плавный переход перед редиректом
        await new Promise((resolve) => setTimeout(resolve, 300));
        window.location.href = redirectUrl;
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Произошла ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" w-full flex items-center justify-center p-4 bg-primary">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Карточка формы */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="card p-8"
        >
          {/* Заголовок с анимацией */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <div className="flex justify-center mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 5 }}
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-accent)' }}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="var(--color-text-on-accent)"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </motion.div>
            </div>
            <h1 className="text-2xl font-semibold mb-2 text-primary">Добро пожаловать</h1>
            <p className="text-sm text-secondary">Введите свои данные для входа</p>
          </motion.div>

          {/* Сообщение об ошибке */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="error-message mb-6"
              >
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Форма */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Поле Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2 transition-all duration-200 text-secondary"
                style={{
                  color: emailFocused ? 'var(--color-accent)' : '',
                  transform: emailFocused ? 'translateX(2px)' : 'none',
                }}
              >
                Email
              </label>
              <motion.div transition={{ duration: 0.2 }} className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  required
                  className="input-field text-base"
                  placeholder="your@email.com"
                />
              </motion.div>
            </div>

            {/* Поле Пароль */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2 transition-all duration-200 text-secondary"
                style={{
                  color: passwordFocused ? 'var(--color-accent)' : '',
                  transform: passwordFocused ? 'translateX(2px)' : 'none',
                }}
              >
                Пароль
              </label>
              <motion.div transition={{ duration: 0.2 }} className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required
                  className="input-field text-base"
                  placeholder="Ваш пароль"
                />
              </motion.div>
            </div>

            {/* Кнопка отправки */}
            <motion.button
              type="submit"
              disabled={loading}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              whileTap={{ scale: 0.98 }}
              className="btn-accent w-full py-3 px-4 flex items-center justify-center relative overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span className="text-base">Вход...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center text-base"
                  >
                    <svg
                      className="w-5 h-5 mr-2 transition-transform duration-200"
                      style={{ transform: isHovered ? 'translateX(4px)' : 'none' }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                    Войти
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Акцентная полоска при наведении */}
              {isHovered && !loading && (
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 opacity-10 bg-text-on-accent"
                />
              )}
            </motion.button>
          </form>

          {/* Ссылка на регистрацию */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 pt-6 text-center border-t border-color"
          >
            <p className="text-sm text-secondary">
              Нет аккаунта?{' '}
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/register"
                className="ml-2 font-medium inline-flex items-center transition-colors duration-200 text-accent"
              >
                Зарегистрироваться
                <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </motion.a>
            </p>
          </motion.div>
        </motion.div>

        {/* Дополнительная информация */}
        <div className="mt-4 text-center">
          <p className="text-xs text-secondary">
            © {new Date().getFullYear()} NextCRM. Все права защищены.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
