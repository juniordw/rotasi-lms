// src/app/providers.tsx
'use client';

import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/reactQuery';
import { ToastProvider } from '@/components/ui/Toaster';
import ThemeProvider from '@/components/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <ToastProvider>
          <ThemeProvider />
          <AuthProvider>
            {children}
          </AuthProvider>
        </ToastProvider>
      </Provider>
    </QueryClientProvider>
  );
}