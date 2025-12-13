// app/debug/auth-debug.tsx
'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';

export default function AuthDebug() {
  const {
    user, accessToken, isAuthenticated, isLoading,
    setUser, setTokens, logout, isAdmin, hasRole
  } = useAuthStore();

  useEffect(() => {
    console.log('AuthStore обновлен:', { user, isAuthenticated });
  }, [user, isAuthenticated]);

  const testLogin = () => {
    setUser({
      id: 'debug-1',
      email: 'debug@example.com',
      role: 'ADMIN'
    });
    setTokens('debug-access-token');
  };

  return (
    <div className="p-4 space-y-4 bg-gray-100">
      <h2>Auth Store Debug</h2>
      
      <div>
        <p>isLoading: {String(isLoading)}</p>
        <p>isAuthenticated: {String(isAuthenticated)}</p>
        <p>User: {user ? `${user.email} (${user.role})` : 'null'}</p>
        <p>Token: {accessToken ? 'есть' : 'нет'}</p>
        <p>isAdmin: {String(isAdmin())}</p>
      </div>

      <div className="space-x-2">
        <button onClick={testLogin} className="px-4 py-2 bg-blue-500 text-white">
          Test Login
        </button>
        <button onClick={logout} className="px-4 py-2 bg-red-500 text-white">
          Logout
        </button>
      </div>
    </div>
  );
}
