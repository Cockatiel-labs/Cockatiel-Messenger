"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import api from "@/lib/api";

/**
 * Bootstrap a CSRF token cookie on app load.
 *
 * This ensures that a `csrf_token` cookie is present in the browser before
 * any state-changing request (sign-up, sign-in, etc.) is made. Without this,
 * a fresh visitor who lands directly on an auth page would have no CSRF token
 * and their first POST would be rejected with 403.
 */
function useCsrfBootstrap() {
  React.useEffect(() => {
    api.get("/v1/csrf-token").catch(() => {
      // Silently ignore — the token will be set by the next safe request anyway.
    });
  }, []);
}

function CsrfBootstrap({ children }: { children: React.ReactNode }) {
  useCsrfBootstrap();
  return <>{children}</>;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider queryClient={queryClient}>
      <CsrfBootstrap>{children}</CsrfBootstrap>
    </QueryClientProvider>
  );
}
