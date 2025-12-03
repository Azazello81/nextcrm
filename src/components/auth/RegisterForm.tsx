// src/components/auth/RegisterForm.tsx (полностью исправленный)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { JWTClientService } from '@lib/auth/jwt-client';

interface RegisterResponse {
  sessionId: string;
  verificationCode?: string;
  expiresAt?: Date;
}

export default function RegisterForm() {
  const [step, setStep] = useState<number>(1);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      console.log('📨 Ответ регистрации:', data); // Для отладки

      if (data.success) {
        // Используем data.data.sessionId если есть, иначе data.sessionId
        const sessionIdFromResponse = data.data?.sessionId || data.sessionId;
        
        if (!sessionIdFromResponse) {
          throw new Error('Не получен ID сессии от сервера');
        }

        setSessionId(sessionIdFromResponse);
        setStep(2);
        
        // Показываем код в development
        if (process.env.NODE_ENV === 'development') {
          const code = data.data?.verificationCode || data.verificationCode;
          if (code) {
            alert(`Код подтверждения: ${code}`);
          } else if (data.message && data.message.includes('Код подтверждения:')) {
            const match = data.message.match(/Код подтверждения: (\d{6})/);
            if (match) {
              alert(`Код подтверждения: ${match[1]}`);
            }
          }
        }
      } else {
        setError(data.message);
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
      console.log('📤 Отправка verify запроса:', { sessionId, code: verificationCode });

      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          sessionId: sessionId.trim(), // Убедимся, что нет лишних пробелов
          code: verificationCode.trim() 
        }),
      });

      const data = await response.json();
      console.log('📨 Ответ верификации:', data);

      if (data.success) {
        // Сохраняем токен
        if (data.token) {
          JWTClientService.storeToken(data.token);
        }
        
        // Редирект на личный кабинет
        window.location.href = '/user';
      } else {
        setError(data.message);
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        // Обновляем sessionId если пришел новый
        if (data.data?.sessionId) {
          setSessionId(data.data.sessionId);
        } else if (data.sessionId) {
          setSessionId(data.sessionId);
        }
        
        // Показываем новый код
        if (process.env.NODE_ENV === 'development') {
          const code = data.data?.verificationCode || data.verificationCode;
          if (code) {
            alert(`Новый код подтверждения: ${code}`);
          }
        } else {
          alert('Новый код отправлен на email!');
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('❌ Ошибка отправки кода:', err);
      setError('Ошибка при отправке кода');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {step === 1 ? 'Регистрация в NextCRM' : 'Подтверждение email'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleRegistration} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Минимум 6 символов"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Отправка кода...' : 'Зарегистрироваться'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerification} className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              На email <strong>{email}</strong> был отправлен 6-значный код подтверждения.
              Введите его ниже:
            </p>
            <p className="text-xs text-gray-500 mb-2">
              Session ID: {sessionId.substring(0, 10)}... (для отладки)
            </p>
            
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Код подтверждения
            </label>
            <input
              id="code"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              maxLength={6}
              pattern="[0-9]{6}"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono"
              placeholder="123456"
            />
            <p className="text-xs text-gray-500 mt-1">
              Введите 6 цифр полученного кода
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading || !sessionId}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Подтверждение...' : 'Подтвердить'}
            </button>
            
            <button
              type="button"
              onClick={handleResendCode}
              disabled={loading}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Отправка...' : 'Новый код'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full text-sm text-blue-600 hover:text-blue-500"
          >
            Вернуться к регистрации
          </button>
        </form>
      )}

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          {step === 1 ? 'Уже есть аккаунт?' : 'Уже есть аккаунт?'}{' '}
          <a href="/login" className="text-blue-600 hover:text-blue-500">
            Войти
          </a>
        </p>
      </div>
    </div>
  );
}