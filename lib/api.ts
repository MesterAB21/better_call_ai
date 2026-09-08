/**
 * api.ts — Central API client.
 * All requests go through /api/* which Next.js proxies to the backend.
 * Cookies are sent automatically by the browser (credentials: "include").
 */

const BASE = "/api/v1";

type ApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

export class ApiError extends Error {
  status: number;
  detail: string;
  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: options.method ?? "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const json = await res.json();
      detail = json.detail ?? detail;
    } catch {}
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── AUTH ─────────────────────────────────────────────────────────────────────

export type UserResponse = {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  role: "user" | "admin";
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  user: UserResponse;
};

export const authApi = {
  login: (email: string, password: string) =>
    request<LoginResponse>("/auth/login", { method: "POST", body: { email, password } }),

  register: (full_name: string, email: string, password: string, phone?: string) =>
    request<UserResponse>("/auth/register", { method: "POST", body: { full_name, email, password, phone } }),

  logout: () =>
    request<{ message: string }>("/auth/logout", { method: "POST" }),

  me: () =>
    request<UserResponse>("/users/me"),

  forgotPassword: (email: string) =>
    request<{ detail: string }>("/auth/forget-password", { method: "POST", body: { email } }),

  resetPassword: (token: string, new_password: string) =>
    request<{ valid: boolean; detail: string }>(`/auth/reset-password/${token}`, {
      method: "POST",
      body: { new_password },
    }),

  googleLogin: (next?: string) => {
    // Redirect browser to the backend Google OAuth start URL
    const q = next ? `?next=${encodeURIComponent(next)}` : "";
    window.location.href = `/api/v1/auth/google${q}`;
  },

  registerGoogle: (gToken: string, phone?: string) =>
    request<LoginResponse>("/auth/register-google", {
      method: "POST",
      body: { g_token: gToken, phone: phone || null },
    }),
};

// ── CONVERSATIONS ────────────────────────────────────────────────────────────

export type Conversation = {
  id: string;
  title: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
};

const TITLE_STOPWORDS = new Set([
  "le", "la", "les", "un", "une", "des", "de", "du", "je", "me",
  "ma", "mon", "mes", "pour", "avec", "sur", "dans", "et", "ou",
  "ne", "pas", "suis", "ai", "est", "sont", "veut", "veux",
  "souhaite", "faire", "avoir", "etre", "que", "qui", "il", "elle",
  "nous", "vous", "ce", "ces", "an", "fi", "was", "arad", "in", "min",
  "ala", "ila", "an", "ana", "kan", "kantt", "hatha", "hathihi",
  "ma", "la", "lam", "li", "ana", "hwal", "aa", "lı",
  "في", "من", "على", "إلى", "عن", "أن", "أنا", "انا", "أريد", "اريد",
  "تريد", "كان", "كانت", "هذا", "هذه", "ذلك", "التي", "الذي", "مع",
  "ما", "لا", "لم", "لي", "هم", "أنتم", "هو", "هي", "عندي", "ثم",
  "أيضا", "أيضاً", "و", "مت",
]);

/** Concise sidebar title (mirrors the backend heuristic). */
export function summarizeTitle(content: string, maxWords = 6): string {
  const words = (content ?? "")
    .replace(/[\r\n\t]+/g, " ")
    .split(/[^\p{L}\p{N}_]+/u)
    .filter(Boolean);
  if (words.length === 0) return "Nouvelle consultation";
  const contentWords = words.filter((w) => !TITLE_STOPWORDS.has(w.toLowerCase()));
  const picked = (contentWords.length >= 3 ? contentWords : words).slice(0, maxWords);
  const title = picked.join(" ");
  return (contentWords.length > maxWords ? title + "…" : title) || "Nouvelle consultation";
}

export const conversationsApi = {
  list: (opts?: { search?: string; limit?: number }) => {
    const params = new URLSearchParams();
    if (opts?.search) params.set("search", opts.search);
    if (opts?.limit) params.set("limit", String(opts.limit));
    const qs = params.toString();
    return request<Conversation[]>(`/conversations/${qs ? `?${qs}` : ""}`);
  },
  create: (title?: string) =>
    request<Conversation>("/conversations/", { method: "POST", body: { title } }),
  get: (id: string) => request<Conversation>(`/conversations/${id}`),
  update: (id: string, data: { title?: string; is_archived?: boolean }) =>
    request<Conversation>(`/conversations/${id}`, { method: "PATCH", body: data }),
  delete: (id: string) =>
    request<void>(`/conversations/${id}`, { method: "DELETE" }),
  messages: (id: string, opts?: { limit?: number; before?: string }) => {
    const params = new URLSearchParams();
    params.set("limit", String(opts?.limit ?? 30));
    if (opts?.before) params.set("before", opts.before);
    return request<Message[]>(`/conversations/${id}/messages?${params.toString()}`);
  },
};

// ── MESSAGES / CHAT ──────────────────────────────────────────────────────────

export type AgentActivityStatus = "started" | "running" | "completed" | "error";

export type AgentActivityItem = {
  id: string;
  status: AgentActivityStatus;
  title: string;
  message?: string | null;
  metadata?: Record<string, unknown>;
};

export type Message = {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  type: string;
  content: string;
  content_json: Record<string, unknown> | null;
  tokens_input: number;
  tokens_output: number;
  model_used: string | null;
  created_at: string;
  /** Transient agent activities shown while this assistant message is generated. */
  activities?: AgentActivityItem[];
};

// ── QUESTIONNAIRE (structured interactive assistant message) ─────────────────

export type QuestionnaireOption = {
  value: string;
  label: string;
};

export type QuestionnaireQuestion = {
  question_id?: string | null;
  id?: string | null;
  field?: string | null;
  question: string;
  answer_type?: "single_choice" | "yes_no" | "select_multiple" | "ranking" | string;
  options?: Array<QuestionnaireOption | string> | null;
  required?: boolean;
  allow_custom_text?: boolean;
  placeholder?: string | null;
  reason?: string | null;
  priority?: string | null;
};

export type Questionnaire = {
  questionnaire_id?: string | null;
  title?: string | null;
  introduction?: string | null;
  questions: QuestionnaireQuestion[];
  language?: string | null;
  max_questions?: number;
};

/** Stable key for a question — the agent may send `question_id` or `id`. */
export function questionId(q: QuestionnaireQuestion): string {
  return q.question_id ?? q.id ?? `q-${q.question ?? ""}`;
}

export function isMultiQuestion(q: QuestionnaireQuestion): boolean {
  return ["select_multiple", "multiple", "ranking"].includes(q.answer_type ?? "");
}

/** Normalizes options to `{value,label}`; yields Oui/Non for yes_no cards. */
export function optionsOf(q: QuestionnaireQuestion): QuestionnaireOption[] {
  if (!Array.isArray(q.options) || q.options.length === 0) {
    if (q.answer_type === "yes_no") {
      return [
        { value: "oui", label: "Oui" },
        { value: "non", label: "Non" },
      ];
    }
    return [];
  }
  return q.options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o
  );
}

/** Extracts a structured questionnaire from a stored message, if present. */
export function questionnaireOf(m: Pick<Message, "type" | "content_json">): Questionnaire | null {
  const cj = m.content_json;
  if (!cj || !Array.isArray(cj.questions) || cj.questions.length === 0) {
    return null;
  }
  return cj as unknown as Questionnaire;
}

/**
 * Single recap message compiled ONLY after every question is answered,
 * sent as `input_text` to /stream (Option A: natural bullet list):
 *
 *   Voici mes réponses aux questions :
 *   - Forme juridique : SARL
 *   - Nombre d'employés : 5
 */
export function formatQuestionnaireAnswer(
  answers: { question: string; value: string }[]
): string {
  if (answers.length === 0) return "Voici mes réponses aux questions :";
  const lines = answers.map((a) => `- ${a.question} : ${a.value}`);
  return `Voici mes réponses aux questions :\n${lines.join("\n")}`;
}

/**
 * Merges an incoming activity event into the ordered list, deduplicating by
 * `id` while preserving first-appearance order and updating status/title/message.
 */
export function mergeActivity(
  prev: AgentActivityItem[],
  act: AgentActivityItem
): AgentActivityItem[] {
  const idx = prev.findIndex((a) => a.id === act.id);
  if (idx === -1) return [...prev, act];
  const next = prev.slice();
  next[idx] = {
    ...prev[idx],
    status: act.status,
    title: act.title,
    message: (act.message ?? prev[idx].message) as string | undefined,
    metadata: act.metadata,
  };
  return next;
}

export type ChatResponse = {
  conversation_id: string;
  user_message_id: string;
  assistant_message_id: string;
  role: string;
  type: string;
  content: string;
  content_json: Record<string, unknown> | null;
  tokens_input: number;
  tokens_output: number;
  model_used: string | null;
};

export const chatApi = {
  send: (conversation_id: string, content: string) =>
    request<ChatResponse>(`/chat/${conversation_id}/send`, {
      method: "POST",
      body: { content },
    }),

  stream: (conversation_id: string, content: string, handlers: StreamHandlers = {}) =>
    streamChat(conversation_id, content, handlers),
};

// ── STREAMING CHAT (SSE) ─────────────────────────────────────────────────────

export type StreamHandlers = {
  onActivity?: (activity: AgentActivityItem) => void;
  onToken?: (text: string) => void;
  onFinal?: (response: ChatResponse) => void;
  onError?: (error: ApiError) => void;
};

type StreamPayload = {
  type?: string;
  message_type?: string;
  activity?: AgentActivityItem;
  response?: Partial<ChatResponse>;
  result?: Partial<ChatResponse>;
  content?: string;
  delta?: string;
  text?: string;
  detail?: string;
  message?: string;
  status?: number;
};

/** Mutable state accumulated across SSE blocks of a single request. */
export type StreamState = {
  accumulated: string;
  final: ChatResponse | null;
  error: ApiError | null;
  done: boolean;
};

export function createStreamState(): StreamState {
  return { accumulated: "", final: null, error: null, done: false };
}

/**
 * Parses one SSE block (everything between blank lines) and folds it into the
 * stream state, invoking handlers as events arrive. Pure and side-effect free
 * apart from the callbacks — unit-tested directly in Node.
 */
export function parseStreamBlock(
  block: string,
  state: StreamState,
  opts: { conversationId?: string; handlers?: StreamHandlers } = {}
): void {
  const { conversationId, handlers } = opts;
  let eventName = "";
  let data = "";
  for (const line of block.split(/\r?\n/)) {
    if (line.startsWith("event:")) eventName = line.slice(6).trim();
    else if (line.startsWith("data:")) data += line.slice(5).trim();
  }
  if (!data) return;
  let payload: StreamPayload;
  try {
    payload = JSON.parse(data) as StreamPayload;
  } catch {
    return;
  }
  const type = payload.type ?? eventName;

  if (type === "activity") {
    const act = payload.activity ?? (payload as unknown as AgentActivityItem);
    if (act && act.id) handlers?.onActivity?.(act);
    return;
  }
  if (type === "token" || type === "response" || type === "delta" || type === "content") {
    const chunk = payload.content ?? payload.delta ?? payload.text ?? "";
    if (chunk) {
      state.accumulated += chunk;
      handlers?.onToken?.(chunk);
    }
    return;
  }
  if (type === "final") {
    const obj = payload.response ?? payload.result ?? (payload as Partial<ChatResponse>);
    if (obj && obj.assistant_message_id) {
      state.final = {
        conversation_id: obj.conversation_id ?? conversationId ?? "",
        user_message_id: obj.user_message_id ?? "",
        assistant_message_id: obj.assistant_message_id ?? "",
        role: obj.role ?? "assistant",
        type: obj.type ?? "message",
        content: obj.content ?? state.accumulated,
        content_json: obj.content_json ?? null,
        tokens_input: obj.tokens_input ?? 0,
        tokens_output: obj.tokens_output ?? 0,
        model_used: obj.model_used ?? null,
      };
      handlers?.onFinal?.(state.final);
    }
    return;
  }
  // Agent-native final (no backend ids yet) — defensive: surfaces content
  // without reconciliation ids (keeps temp rows until refresh).
  if (type === "final_response") {
    state.done = true;
    const rawContent = payload.content;
    const isQuestionnaire = payload.message_type === "questionnaire";
    const textContent = typeof rawContent === "string" ? rawContent : state.accumulated;
    if (rawContent !== undefined || state.accumulated) {
      state.final = {
        conversation_id: conversationId ?? "",
        user_message_id: "",
        assistant_message_id: "",
        role: "assistant",
        type: "answer",
        content: textContent,
        content_json:
          isQuestionnaire && rawContent && typeof rawContent === "object"
            ? (rawContent as Record<string, unknown>)
            : null,
        tokens_input: 0,
        tokens_output: 0,
        model_used: null,
      };
      handlers?.onFinal?.(state.final);
    }
    return;
  }
  if (type === "done") {
    state.done = true;
    return;
  }
  if (type === "error") {
    const msg = payload.detail ?? payload.message ?? "Une erreur est survenue.";
    state.error = new ApiError(payload.status ?? 500, msg);
    handlers?.onError?.(state.error);
  }
}

/**
 * Streams the assistant response from POST /chat/{id}/send.
 *
 * The request is sent with `Accept: text/event-stream`; the backend may reply
 * either with SSE events (`activity`, `token`, `final`, `error`) or with the
 * legacy JSON ChatResponse — both are handled, so the existing protocol is
 * never broken.
 */
async function streamChat(
  conversation_id: string,
  content: string,
  handlers: StreamHandlers
): Promise<ChatResponse> {
  const res = await fetch(`${BASE}/chat/${conversation_id}/send`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const json = await res.json();
      detail = json.detail ?? detail;
    } catch {}
    throw new ApiError(res.status, detail);
  }

  const ctype = res.headers.get("content-type") ?? "";
  if (!ctype.toLowerCase().includes("text/event-stream")) {
    // Legacy path: plain JSON response (current backend behaviour)
    const json = (await res.json()) as ChatResponse;
    if (json.content) handlers.onToken?.(json.content);
    handlers.onFinal?.(json);
    return json;
  }

  const reader = res.body?.getReader();
  if (!reader) throw new ApiError(0, "Streaming non disponible");

  const decoder = new TextDecoder();
  let buffer = "";
  const state = createStreamState();

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      // Normalise CRLF SSE endings so blocks split per event, not only at EOF.
      // The whole buffer is rescanned each iteration so \r\n pairs split across
      // chunk boundaries are still reconciled.
      buffer += decoder.decode(value, { stream: true });
      buffer = buffer.replace(/\r\n/g, "\n");
      let idx = buffer.indexOf("\n\n");
      while (idx !== -1) {
        parseStreamBlock(buffer.slice(0, idx), state, { conversationId: conversation_id, handlers });
        buffer = buffer.slice(idx + 2);
        idx = buffer.indexOf("\n\n");
      }
    }
    if (buffer.trim()) parseStreamBlock(buffer, state, { conversationId: conversation_id, handlers });
  } finally {
    reader.releaseLock();
  }

  if (state.error) throw state.error;
  if (state.final) return state.final;
  if (state.done || state.accumulated) {
    const fallback: ChatResponse = {
      conversation_id,
      user_message_id: "",
      assistant_message_id: "",
      role: "assistant",
      type: "message",
      content: state.accumulated,
      content_json: null,
      tokens_input: 0,
      tokens_output: 0,
      model_used: null,
    };
    handlers.onFinal?.(fallback);
    return fallback;
  }
  throw new ApiError(0, "La réponse de l'assistant n'a pas pu être récupérée.");
}

// ── PLANS ────────────────────────────────────────────────────────────────────

export type Plan = {
  id: string;
  name: string;
  display_name: string;
  price_dzd: number;
  tokens_limit: number | null;
  quota_reset_hours: number | null;
  duration_days: number;
  features: Record<string, unknown>;
};

export const plansApi = {
  list: () => request<Plan[]>("/plans/"),
};

// ── SUBSCRIPTION & USAGE ─────────────────────────────────────────────────────

export type Subscription = {
  id: string;
  status: string;
  started_at: string;
  expires_at: string;
  quota_window_start: string | null;
  quota_limit_exceeded_at: string | null;
  plan: Plan;
};

export type UsageSummary = {
  tokens_used: number;
  tokens_limit: number | null;
  plan: string;
  window_start: string | null;
  quota_limit_exceeded_at: string | null;
  quota_reset_hours: number | null;
};

export const userApi = {
  subscription: () => request<Subscription | null>("/users/me/subscription"),
  usage: () => request<UsageSummary>("/users/me/usage"),
  updateProfile: (data: { full_name?: string; phone?: string }) =>
    request<UserResponse>("/users/me", { method: "PATCH", body: data }),
};

// ── PAYMENTS ─────────────────────────────────────────────────────────────────

export type CheckoutResponse = {
  checkout_url: string;
  order_id: string;
};

export const paymentsApi = {
  checkout: (plan_id: string) =>
    request<CheckoutResponse>("/payments/checkout", {
      method: "POST",
      body: { plan_id },
    }),
};