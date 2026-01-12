import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, TRPCClientError } from "@trpc/client";
import superjson from "superjson";

import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from "@shared/const";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;
  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

// ✅ Correct: create the tRPC *client* with createTRPCClient
const trpcClient = createTRPCClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

// Optional: keep your existing error subscriptions if you had them.
// If you already had these, keep them; if not, you can remove safely.
queryClient.getQueryCache().subscribe((event) => {
  if (event?.type !== "updated") return;
  const error = event.query?.state?.error;
  if (!error) return;
  redirectToLoginIfUnauthorized(error);
});

queryClient.getMutationCache().subscribe((event) => {
  if (event?.type !== "updated") return;
  const error = event.mutation?.state?.error;
  if (!error) return;
  redirectToLoginIfUnauthorized(error);
});

const container = document.getElementById("root");
if (!container) throw new Error("Root container #root not found");

createRoot(container).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <App />
      </trpc.Provider>
    </QueryClientProvider>
  </React.StrictMode>
);
