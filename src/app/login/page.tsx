import { Suspense } from 'react';
import LoginForm from '../../components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-gray-900">NextCRM</h1>
        <p className="mt-2 text-center text-sm text-gray-600">Система управления клиентами</p>
      </div>
      <Suspense
        fallback={
          <div className="w-full max-w-md p-8">
            <div className="h-48 bg-gray-100 animate-pulse rounded" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
