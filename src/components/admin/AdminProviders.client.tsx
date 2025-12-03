'use client';
/**
 * AdminProviders.client.tsx
 * - Нужен для подключения Material UI ThemeProvider и Emotion cache.
 * - В App Router оборачиваем admin-страницы этим провайдером, чтобы MUI корректно работал.
 * - Пока тема простая; при желании настроьте цвета и компоненты.
 */
import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
  },
});

// Emotion cache нужен для корректного SSR/клиентного рендера стилей MUI
const cache = createCache({ key: 'mui', prepend: true });

export default function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
