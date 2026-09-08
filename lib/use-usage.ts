"use client";

import { useState, useEffect, useCallback } from "react";
import { userApi } from "@/lib/api";

export type UsageState = {
  loading: boolean;
  tokensUsed: number;
  tokensLimit: number | null;
  plan: string;
  limitReached: boolean;
  quotaLimitExceededAt: string | null;
  quotaResetHours: number | null;
};

export function useUsage(): UsageState & { refresh: () => Promise<void> } {
  const [state, setState] = useState<UsageState>({
    loading: true,
    tokensUsed: 0,
    tokensLimit: null,
    plan: "free",
    limitReached: false,
    quotaLimitExceededAt: null,
    quotaResetHours: null,
  });

  const refresh = useCallback(async () => {
    try {
      const data = await userApi.usage();
      setState({
        loading: false,
        tokensUsed: data.tokens_used,
        tokensLimit: data.tokens_limit,
        plan: data.plan,
        limitReached: data.tokens_limit !== null && data.tokens_used >= data.tokens_limit,
        quotaLimitExceededAt: data.quota_limit_exceeded_at,
        quotaResetHours: data.quota_reset_hours,
      });
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  useEffect(() => {
    // Fetch-on-mount usage check: setState only fires after the awaited call.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  return { ...state, refresh };
}

export function formatReset(quotaLimitExceededAt: string, quotaResetHours: number): string {
  const exceededAt = new Date(quotaLimitExceededAt).getTime();
  if (Number.isNaN(exceededAt)) return "";
  const resetAt = exceededAt + quotaResetHours * 3600 * 1000;
  if (Date.now() >= resetAt) return "";
  return new Date(resetAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}