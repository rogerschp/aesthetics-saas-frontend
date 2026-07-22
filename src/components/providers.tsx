"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { useState } from 'react';
import { TenantProvider } from '@/components/providers/TenantProvider';
import { AuthQuerySync } from '@/components/providers/AuthQuerySync';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <AuthQuerySync />
        <TenantProvider>{children}</TenantProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
