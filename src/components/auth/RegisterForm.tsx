// src/components/auth/RegisterForm.tsx
'use client';

import { useState, useEffect, ChangeEvent, ReactNode } from 'react';
import { JWTClientService } from '@lib/auth/jwt-client';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, AuthUser } from '../../stores/auth-store';
import { UserRole } from '@prisma/client';

// Типы для ответов API
interface RegisterResponse {
  success: boolean;
  message?: string;
  data?: {
    sessionId?: string;
    verificationCode?: string;
    expiresAt?: Date;
  };
  sessionId?: string;
  verificationCode?: string;
}

interface VerifyResponse {
  success: boolean;
  message?: string;
  token?: string;
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
    role: UserRole;
    registeredAt?: Date | string | null;
    lastLoginAt?: Date | string | null;
  };
}

interface ResendCodeResponse {
  success: boolean;
  message?: string;
  sessionId?: string;
  verificationCode?: string;
  data?: {
    sessionId?: string;
    verificationCode?: string;
  };
}

// Вспомогательные компоненты
const StepIndicator = ({ step }: { step: number }) => (
  <div className="flex justify-center mb-8">
    <div className="flex space-x-4">
      <div className={`w-12 h-2 rounded-full ${step >= 1 ? 'bg-accent' : 'bg-gray-200'}`} />
      <div className={`w-12 h-2 rounded-full ${step >= 2 ? 'bg-accent' : 'bg-gray-200'}`} />
    </div>
  </div>
);

const ErrorMessage = ({ error }: { error: string }) => (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: 'auto' }}
    exit={{ opacity: 0, height: 0 }}
    className="error-message mb-6"
  >
    <div className="flex items-start">
      <svg className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
      <span className="text-sm">{error}</span>
    </div>
  </motion.div>
);

const AnimatedIcon = ({ step }: { step: number }) => (
  <div className="flex justify-center mb-4">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 5 }}
      className="w-12 h-12 rounded-full flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-accent)' }}
    >
      {step === 1 ? (
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
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
      ) : (
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
            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      )}
    </motion.div>
  </div>
);

interface FormInputProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  minLength?: number;
  pattern?: string;
  maxLength?: number;
  className?: string;
}

const FormInput = ({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  focused,
  onFocus,
  onBlur,
  minLength,
  pattern,
  maxLength,
  className = '',
}: FormInputProps) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium mb-2 transition-all duration-200 text-secondary"
      style={{
        color: focused ? 'var(--color-accent)' : '',
        transform: focused ? 'translateX(2px)' : 'none',
      }}
    >
      {label}
    </label>
    <motion.div transition={{ duration: 0.2 }} className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        required={required}
        minLength={minLength}
        pattern={pattern}
        maxLength={maxLength}
        className={`input-field ${className}`}
        placeholder={placeholder}
      />
    </motion.div>
  </div>
);

interface SubmitButtonProps {
  loading: boolean;
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const SubmitButton = ({
  loading,
  onClick,
  children,
  disabled = false,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: SubmitButtonProps) => (
  <motion.button
    type={onClick ? 'button' : 'submit'}
    disabled={loading || disabled}
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
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
          <span className="text-base">Загрузка...</span>
        </motion.div>
      ) : (
        <motion.div
          key="text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center text-base"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
    {isHovered && !loading && (
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0 opacity-10 bg-text-on-accent"
      />
    )}
  </motion.button>
);

// Основной компонент
export default function RegisterForm() {
  const [step, setStep] = useState<number>(1);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isHovered, setIsHovered] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [codeFocused, setCodeFocused] = useState(false);

  const { setTokens, setUser } = useAuthStore();

  useEffect(() => {
    document.body.classList.add('login-page');
    return () => document.body.classList.remove('login-page');
  }, []);

  // Вспомогательная функция для преобразования даты
  const parseDate = (date: Date | string | null | undefined): Date | null => {
    if (!date) return null;
    if (date instanceof Date) return date;
    return new Date(date);
  };

  // Вспомогательные функции
  const logVerificationCode = (data: RegisterResponse) => {
    if (process.env.NODE_ENV !== 'development') return;

    const code = data.data?.verificationCode || data.verificationCode;
    if (code) {
      console.log(`Код подтверждения: ${code}`);
      return;
    }

    if (data.message?.includes('Код подтверждения:')) {
      const regex = /Код подтверждения: (\d{6})/;
      const match = regex.exec(data.message);
      if (match) console.log(`Код подтверждения: ${match[1]}`);
    }
  };

  const updateSessionId = (data: ResendCodeResponse) => {
    const newSessionId = data.data?.sessionId || data.sessionId;
    if (newSessionId) setSessionId(newSessionId);
  };

  const showCodeMessage = (data: ResendCodeResponse) => {
    if (process.env.NODE_ENV === 'development') {
      const code = data.data?.verificationCode || data.verificationCode;
      if (code) console.log(`Новый код подтверждения: ${code}`);
    } else {
      alert('Новый код отправлен на email!');
    }
  };

  // API вызовы
  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data: RegisterResponse = await response.json();

      if (data.success) {
        const sessionIdFromResponse = data.data?.sessionId || data.sessionId;
        if (!sessionIdFromResponse) throw new Error('Не получен ID сессии от сервера');

        setSessionId(sessionIdFromResponse);
        setStep(2);
        logVerificationCode(data);
      } else {
        setError(data.message || 'Ошибка регистрации');
      }
    } catch (err) {
      console.error('❌ Ошибка регистрации:', err);
      setError('Произошла ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId.trim(),
          code: verificationCode.trim(),
        }),
      });

      const data: VerifyResponse = await response.json();

      if (data.success && data.token) {
        // Сохраняем токены в Zustand store
        setTokens(data.token, data.refreshToken);

        // Сохраняем данные пользователя если есть
        if (data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email,
            role: data.user.role,
            registeredAt: parseDate(data.user.registeredAt),
            lastLoginAt: parseDate(data.user.lastLoginAt),
          };
          setUser(authUser);
        }

        // Для совместимости сохраняем также в localStorage
        JWTClientService.storeToken(data.token);

        // Редирект на личный кабинет
        if (globalThis.window !== undefined) {
          globalThis.window.location.href = '/user';
        }
      } else {
        setError(data.message || 'Ошибка верификации');
      }
    } catch (err) {
      console.error('❌ Ошибка верификации:', err);
      setError('Произошла ошибка при подтверждении');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data: ResendCodeResponse = await response.json();

      if (data.success) {
        updateSessionId(data);
        showCodeMessage(data);
      } else {
        setError(data.message || 'Ошибка отправки кода');
      }
    } catch (err) {
      console.error('❌ Ошибка отправки кода:', err);
      setError('Ошибка при отправке кода');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replaceAll(/\D/g, '');
    setVerificationCode(value.slice(0, 6));
  };

  const handleGoBack = () => setStep(1);

  // Рендер компонентов по шагам
  const renderStepOne = () => (
    <form onSubmit={handleRegistration} className="space-y-6">
      <FormInput
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        focused={emailFocused}
        onFocus={() => setEmailFocused(true)}
        onBlur={() => setEmailFocused(false)}
      />

      <FormInput
        id="password"
        label="Пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Минимум 6 символов"
        required
        minLength={6}
        focused={passwordFocused}
        onFocus={() => setPasswordFocused(true)}
        onBlur={() => setPasswordFocused(false)}
      />

      <SubmitButton
        loading={loading}
        isHovered={isHovered}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <>
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
              d="M11 5H9a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          Зарегистрироваться
        </>
      </SubmitButton>
    </form>
  );

  const renderStepTwo = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800 mb-2">
          На email <strong className="text-blue-900">{email}</strong> был отправлен 6-значный код
          подтверждения.
        </p>
        <p className="text-xs text-blue-700">
          Проверьте папку &quot;Входящие&quot; и &quot;Спам&quot;. Код действителен 10 минут.
        </p>
        {process.env.NODE_ENV === 'development' && sessionId && (
          <p className="text-xs text-gray-500 mt-2">
            Session ID: {sessionId.substring(0, 20)}... (debug)
          </p>
        )}
      </div>

      <form onSubmit={handleVerification} className="space-y-6">
        <FormInput
          id="code"
          label="Код подтверждения"
          type="text"
          value={verificationCode}
          onChange={handleVerificationCodeChange}
          placeholder="123456"
          required
          pattern="[0-9]{6}"
          maxLength={6}
          focused={codeFocused}
          onFocus={() => setCodeFocused(true)}
          onBlur={() => setCodeFocused(false)}
          className="text-center text-xl font-mono tracking-widest"
        />

        <div className="flex space-x-4">
          <SubmitButton
            loading={loading}
            disabled={!verificationCode || verificationCode.length !== 6 || !sessionId}
            isHovered={isHovered}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <>
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Подтвердить
            </>
          </SubmitButton>

          <motion.button
            type="button"
            onClick={handleResendCode}
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 px-4 flex items-center justify-center bg-transparent border border-color text-secondary rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Новый код
          </motion.button>
        </div>

        <button
          type="button"
          onClick={handleGoBack}
          className="w-full text-sm text-accent hover:text-blue-500 flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Вернуться к регистрации
        </button>
      </form>
    </motion.div>
  );

  const renderLoginLink = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="mt-8 pt-6 text-center border-t border-color"
    >
      <p className="text-sm text-secondary">
        Уже есть аккаунт?{' '}
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="/login"
          className="ml-2 font-medium inline-flex items-center transition-colors duration-200 text-accent"
        >
          Войти
          <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.a>
      </p>
    </motion.div>
  );

  return (
    <div className="w-full flex items-center justify-center p-4 bg-primary">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="card p-8"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <AnimatedIcon step={step} />
            <h1 className="text-2xl font-semibold mb-2 text-primary">
              {step === 1 ? 'Создание аккаунта' : 'Подтверждение email'}
            </h1>
            <p className="text-sm text-secondary">
              {step === 1 ? 'Заполните форму для регистрации' : 'Введите код подтверждения'}
            </p>
          </motion.div>

          <StepIndicator step={step} />

          <AnimatePresence>{error && <ErrorMessage error={error} />}</AnimatePresence>

          {step === 1 ? renderStepOne() : renderStepTwo()}

          {renderLoginLink()}
        </motion.div>

        <div className="mt-4 text-center">
          <p className="text-xs text-secondary">
            © {new Date().getFullYear()} NextCRM. Все права защищены.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
