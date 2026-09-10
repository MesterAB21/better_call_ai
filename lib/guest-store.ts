/**
 * guest-store.ts — ephemeral guest workspace, held only in the browser.
 *
 * An anonymous visitor gets a single conversation and a 100 000-token session
 * budget. Nothing here ever reaches the backend: when the user signs in or
 * signs up, the local conversation is imported into their account and this
 * storage is cleared (the account's real token counters are then read from the
 * database — the guest budget is never added on top).
 */
import type { Conversation, Message } from "@/lib/api";

export const GUEST_BUDGET = 100_000;

const KEY = "bcai_guest_v1";

export type GuestConversation = {
  id: string;
  title: string;
  createdAt: string;
};

export type GuestState = {
  conversation: GuestConversation;
  messages: Message[];
  /** Tokens consumed by guest requests in this browser session. */
  tokensUsed: number;
};

function newConversationId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function seedGuestState(): GuestState {
  const state: GuestState = {
    conversation: {
      id: newConversationId(),
      title: "Nouvelle consultation",
      createdAt: new Date().toISOString(),
    },
    messages: [],
    tokensUsed: 0,
  };
  writeGuestState(state);
  return state;
}

export function readGuestState(): GuestState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GuestState;
    if (!parsed || !parsed.conversation?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeGuestState(state: GuestState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full / blocked — guest workspace degrades gracefully */
  }
}

export function clearGuestState(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

/** Sidebar entry that mirrors the single guest conversation. */
export function convFromGuest(s: GuestState): Conversation {
  const last = s.messages[s.messages.length - 1];
  return {
    id: s.conversation.id,
    title: s.conversation.title || null,
    is_archived: false,
    created_at: s.conversation.createdAt,
    updated_at: s.conversation.createdAt,
    last_message_at: last ? last.created_at : null,
  };
}