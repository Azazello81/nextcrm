import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import '../styles/globals.css';

// Настраиваем шрифт Montserrat
const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'NextCRM - Modern CRM System',
  description: 'Modern customer relationship management system',
  keywords: 'CRM, customers, management, business',
};

// Mock данные для тестирования без БД
const mockUser = {
  id: '1',
  login: 'admin',
  name: 'Администратор',
  email: 'admin@example.com',
  phone: '+79999999999',
  datereg: new Date('2024-01-01'),
  dateactiv: new Date(),
  avatar: '',
  role: 'admin' as const,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={montserrat.variable}>
      <body className={`${montserrat.className} antialiased`}>{children}</body>
    </html>
  );
}
