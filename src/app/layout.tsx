import type { Metadata } from 'next';
import localFont from 'next/font/local';
import '../styles/globals.css';
import { ToastProvider } from '../components/ui/Toast';

// Настраиваем шрифт Montserrat
const montserrat = localFont({
  src: '../fonts/Montserrat-VariableFont_wght.ttf',
  display: 'swap',
  variable: '--font-montserrat',
  weight: '100 900',
  style: 'normal',
});

export const metadata: Metadata = {
  title: 'NextCRM - Modern CRM System',
  description: 'Modern customer relationship management system',
  keywords: 'CRM, customers, management, business',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={montserrat.variable}>
      <body className={`${montserrat.className} antialiased`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
