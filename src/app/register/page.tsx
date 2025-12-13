
import RegisterForm from '../../components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-gray-900">NextCRM</h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Создайте аккаунт для начала работы
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}