import ru from '../locales/ru.json';
import en from '../locales/en.json';
import { NextRequest } from 'next/server';

type Dict = { [k: string]: string };

export function detectLocaleFromRequest(req: NextRequest): 'ru' | 'en' {
  const cookie = req.cookies.get('NEXT_LOCALE')?.value;
  if (cookie === 'ru' || cookie === 'en') return cookie;

  const al = req.headers.get('accept-language') || '';
  if (al.includes('ru')) return 'ru';
  return 'en';
}

export function getI18nForRequest(req: NextRequest) {
  const locale = detectLocaleFromRequest(req);
  const dict: Dict = locale === 'ru' ? ru : en;

  function t(key: string, vars?: Record<string, string | number>) {
    let s = dict[key] || key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return s;
  }

  return { locale, t } as const;
}
