"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell, Check, Clock, Info, LogOut, Menu, PanelLeftClose, Pencil, Plus, Search, Send, X, Zap,
} from "lucide-react";
import Wordmark from "@/components/Wordmark";
import { ThemeToggle } from "@/components/ThemeProvider";
import BalanceLoader from "@/components/BalanceLoader";
import AiBody from "@/components/AiBody";
import Markdown from "@/components/Markdown";
import QuestionnaireCard from "@/components/QuestionnaireCard";
import {
  conversationsApi, chatApi, mergeActivity, questionnaireOf, summarizeTitle,
  ApiError,
  type Conversation, type Message, type AgentActivityItem,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useUsage, formatReset } from "@/lib/use-usage";

export default function AppChat() {
  const { user, logout } = useAuth();
  const usage = useUsage();
  const { refresh: refreshUsage } = usage;
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [limitDismissed, setLimitDismissed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState("");
  // Server-side search results (title + message content). Null = no active search.
  const [searchResults, setSearchResults] = useState<Conversation[] | null>(null);
  // Inline rename state for a sidebar item
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");

  // Sidebar: drawer is collapsed by default on narrow screens; open on wide.
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(max-width: 880px)").matches ? false : true;
  });
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 880px)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 880px)");
    const onChange = () => {
      setIsMobile(mq.matches);
      setSidebarOpen((open) => (!mq.matches ? true : open));
    };
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // Streaming state for the assistant message currently being generated.
  const [streamingKey, setStreamingKey] = useState<string | null>(null);
  const [assistantActivities, setAssistantActivities] = useState<AgentActivityItem[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [assistantError, setAssistantError] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const assistantActivitiesRef = useRef<AgentActivityItem[]>([]);
  const streamingTextRef = useRef("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const prependRef = useRef(false);
  const sendingRef = useRef(false);
  const limitReachedRef = useRef(usage.limitReached);

  useEffect(() => {
    limitReachedRef.current = usage.limitReached;
  }, [usage.limitReached]);

  const MESSAGES_PAGE = 30;
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);

  // Load conversations on mount
  useEffect(() => {
    conversationsApi.list().then((list) => {
      setConversations(list);
      if (list.length > 0) setActiveId(list[0].id);
    }).catch(() => {});
  }, []);

  // Server-side search: searches titles AND message content. Debounced so it
  // only fires once the user stops typing. When the field is cleared the
  // reset happens in the onChange handler (not this effect) to keep effects
  // synchronous-setState-free.
  useEffect(() => {
    const term = sidebarSearch.trim();
    if (!term) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      conversationsApi.list({ search: term, limit: 50 })
        .then((list) => { if (!cancelled) setSearchResults(list); })
        .catch(() => { if (!cancelled) setSearchResults([]); });
    }, 250);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [sidebarSearch]);

  // Load the latest page of messages when the active conversation changes
  useEffect(() => {
    if (!activeId) return;
    // Never clobber the optimistic messages while a stream is in flight.
    if (sendingRef.current) return;
    let cancelled = false;
    conversationsApi.messages(activeId, { limit: MESSAGES_PAGE })
      .then((list) => {
        if (cancelled) return;
        setMessages(list);
        setHasMore(list.length === MESSAGES_PAGE);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [activeId]);

  const loadOlder = useCallback(async () => {
    const oldest = messages[0];
    if (!activeId || loadingOlder || !hasMore || oldest === undefined || sending) return;
    setLoadingOlder(true);
    const el = chatContainerRef.current;
    const prevScrollHeight = el?.scrollHeight ?? 0;
    const prevScrollTop = el?.scrollTop ?? 0;
    try {
      const older = await conversationsApi.messages(activeId, {
        limit: MESSAGES_PAGE,
        before: oldest.id,
      });
      prependRef.current = true;
      setMessages((prev) => {
        const ids = new Set(prev.map((m) => m.id));
        const uniq = older.filter((m) => !ids.has(m.id));
        return [...uniq, ...prev];
      });
      setHasMore(older.length === MESSAGES_PAGE);
    } catch {
      // keep the current page; next scroll will retry
    } finally {
      setLoadingOlder(false);
      requestAnimationFrame(() => {
        if (el) el.scrollTop = prevScrollTop + (el.scrollHeight - prevScrollHeight);
      });
    }
  }, [activeId, messages, loadingOlder, hasMore, sending]);

  const handleChatScroll = useCallback(() => {
    const el = chatContainerRef.current;
    if (!el || loadingOlder) return;
    if (el.scrollTop < 80) loadOlder();
  }, [loadingOlder, loadOlder]);

  // Auto-scroll to bottom only when new content was appended (send/stream) —
  // never when older messages are prepended.
  useEffect(() => {
    if (prependRef.current) {
      prependRef.current = false;
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const createNewConversation = useCallback(() => {
    // Frontend-only draft: no backend row is created until the user sends
    // their first message. Repeated/rapid clicks reuse the same draft.
    setInputText("");
    setMessages([]);
    setActiveId(null);
  }, []);

  const SUGGESTIONS = [
    {
      label: "بناء بدون رخصة",
      prompt:
        "قمت ببناء مسكن عائلي بدون رخصة بناء فوق قطعة أرض، وأريد تسوية وضعيتي القانونية والحصول على عقد ورخصة مطابقة. كيف يمكنني ذلك",
    },
    {
      label: "عقد عمل وفصل تعسفي",
      prompt: "عقد عمل وفصل تعسفي",
    },
    {
      label: "Capital d'une SARL",
      prompt:
        "Quel est le capital social minimum requis pour la création d'une société à responsabilité limitée (SARL) selon le droit commercial algérien actuellement en vigueur ?",
    },
    {
      label: "Cybercriminalité bancaire",
      prompt:
        "Quelles sont les sanctions légales prévues contre une personne ou une société qui accède sans autorisation à un système de traitement automatisé de données bancaires et utilise des documents électroniques falsifiés en Algérie ? La société est-elle également punissable en tant que personne morale ?",
    },
  ];

  const performSend = useCallback(async (text: string) => {
    // Limit already reached: never even touch the backend again (blocks
    // sending even right after the usage state resets on a page refresh).
    if (limitReachedRef.current) {
      void refreshUsage();
      return;
    }
    const content = text.trim();
    if (!content || sending) return;
    setInputText("");
    setSendError(null);
    setSending(true);
    sendingRef.current = true;
    setStreamingKey(null);
    setAssistantActivities([]);
    setStreamingText("");
    setAssistantError(false);
    assistantActivitiesRef.current = [];
    streamingTextRef.current = "";

    // Resolve the real conversation. A draft has no backend conversation yet,
    // so it is created now (the backend generates the conversation_id) right
    // before the first message is sent.
    let targetId: string;
    if (activeId) {
      targetId = activeId;
    } else {
      try {
        const conv = await conversationsApi.create();
        targetId = conv.id;
        setConversations((prev) => [conv, ...prev]);
        setActiveId(conv.id);
      } catch {
        setSending(false);
        return;
      }
    }

    // Optimistic user message + placeholder assistant message (activities and
    // streamed text are rendered from the AiBody state while streaming).
    const tempId = `temp-${Date.now()}`;
    const tempAiId = `temp-ai-${Date.now()}`;
    const tempMsg: Message = {
      id: tempId, conversation_id: targetId, role: "user", type: "message",
      content, content_json: null, tokens_input: 0, tokens_output: 0,
      model_used: null, created_at: new Date().toISOString(),
    };
    const tempAi: Message = {
      id: tempAiId, conversation_id: targetId, role: "assistant", type: "message",
      content: "", content_json: null, tokens_input: 0, tokens_output: 0,
      model_used: null, created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg, tempAi]);
    setStreamingKey(tempAiId);

    try {
      await chatApi.stream(targetId, content, {
        onActivity: (act) => {
          assistantActivitiesRef.current = mergeActivity(assistantActivitiesRef.current, act);
          setAssistantActivities(assistantActivitiesRef.current);
        },
        onToken: (chunk) => {
          streamingTextRef.current += chunk;
          setStreamingText(streamingTextRef.current);
        },
        onFinal: (resp) => {
          if (!resp.assistant_message_id) {
            // Degenerate final (no real message id yet): keep the visible temp
            // rows so nothing disappears from the conversation.
            return;
          }
          const realUser: Message = { ...tempMsg, id: resp.user_message_id };
          const realAi: Message = {
            id: resp.assistant_message_id, conversation_id: targetId,
            role: "assistant", type: resp.type, content: resp.content,
            content_json: resp.content_json, tokens_input: resp.tokens_input,
            tokens_output: resp.tokens_output, model_used: resp.model_used,
            created_at: new Date().toISOString(),
            activities: assistantActivitiesRef.current.map((a) => ({ ...a })),
          };
          setMessages((prev) => [
            ...prev.filter((m) => m.id !== tempId && m.id !== tempAiId),
            realUser, realAi,
          ]);
        },
      });
      // Update sidebar entry (title mirrors the backend auto-title, so the
      // conversation appears in the history from its first message)
      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetId
            ? { ...c, title: c.title ?? summarizeTitle(content), last_message_at: new Date().toISOString() }
            : c
        )
      );
      // The reply was persisted: re-fetch usage so an over-limit reply shows
      // the "limit reached" state right away, after the answer.
      void refreshUsage();
    } catch (error) {
      // A quota rejection (402/429) never reaches the agent: the message was
      // NOT persisted, so optimistic rows would vanish on refresh. Instead
      // put the text back in the composer and surface the limit state.
      const status = error instanceof ApiError ? error.status : 0;
      if (status === 402 || status === 429) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId && m.id !== tempAiId));
        setInputText(content);
        setLimitDismissed(false);
        void refreshUsage();
        return;
      }
      // Any other failure. When nothing was generated yet (agent unreachable /
      // timeout), roll the optimistic rows back and restore the text into the
      // composer with a single inline error — no ghost user/assistant rows, so
      // repeated failures don't produce duplicated messages on screen.
      const hadPartial =
        streamingTextRef.current.trim().length > 0 || assistantActivitiesRef.current.length > 0;
      if (!hadPartial) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId && m.id !== tempAiId));
        setInputText(content);
        setSendError(
          error instanceof ApiError
            ? error.detail
            : "Le service de consultation ne répond pas. Veuillez réessayer."
        );
        return;
      }
      setAssistantError(true);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempAiId
            ? {
                ...m,
                content: streamingTextRef.current,
                activities: assistantActivitiesRef.current.map((a) => ({ ...a })),
              }
            : m
        )
      );
    } finally {
      setStreamingKey(null);
      sendingRef.current = false;
      setSending(false);
    }
  }, [activeId, sending, refreshUsage]);

  const sendMessage = useCallback(() => {
    const t = inputText.trim();
    if (!t || sending) return;
    setInputText("");
    performSend(t);
  }, [inputText, sending, performSend]);

  const handleQuestionnaireAnswer = useCallback(
    (composedText: string) => {
      if (!composedText.trim()) return;
      performSend(composedText);
    },
    [performSend]
  );

  const confirmLogout = useCallback(async () => {
    setShowLogoutConfirm(false);
    await logout();
    router.push("/login");
  }, [logout, router]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const isLimitReached = usage.limitReached;
  const showLimitModal = isLimitReached && !limitDismissed;
  const resetLabel = usage.quotaLimitExceededAt && usage.quotaResetHours
    ? formatReset(usage.quotaLimitExceededAt, usage.quotaResetHours) : "";

  const startRename = useCallback((conv: Conversation) => {
    setRenamingId(conv.id);
    setRenameDraft(conv.title ?? "");
  }, []);

  const submitRename = useCallback(async () => {
    if (!renamingId) return;
    const id = renamingId;
    const title = renameDraft.trim();
    setRenamingId(null);
    try {
      await conversationsApi.update(id, { title });
      const apply = (c: Conversation) => (c.id === id ? { ...c, title: title || null } : c);
      setConversations((prev) => prev.map(apply));
      setSearchResults((prev) => prev ? prev.map(apply) : prev);
    } catch {
      // keep the old title visible on failure
    }
  }, [renamingId, renameDraft]);

  const cancelRename = useCallback(() => {
    setRenamingId(null);
    setRenameDraft("");
  }, []);

  // Use live search results when the user typed something; otherwise the
  // full conversation list (already client-side stable after loading).
  const filteredConvs = searchResults ?? conversations;
  const activeConv = conversations.find((c) => c.id === activeId);

  return (
    <div className={`app-shell${isMobile ? " is-mobile" : ""}${sidebarOpen ? " sidebar-open" : ""}`}>
      <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Link href="/app" aria-label="Better Call AI"><Wordmark size={22} /></Link>
          <button className="sidebar-collapse-btn" type="button"
            aria-label="Réduire la barre latérale" title="Réduire"
            onClick={() => setSidebarOpen(false)}>
            <PanelLeftClose size={16} strokeWidth={1.75} />
          </button>
        </div>
        <div className="sidebar-actions">
          <button className="btn btn-gold" type="button" onClick={createNewConversation}>
            <Plus size={16} strokeWidth={1.75} />
            Nouvelle discussion
          </button>
        </div>
        <div className="sidebar-search">
          <span className="sidebar-search-icon"><Search size={16} strokeWidth={1.75} /></span>
          <input type="search" placeholder="Rechercher" aria-label="Rechercher"
            value={sidebarSearch} onChange={(e) => { setSidebarSearch(e.target.value); if (!e.target.value.trim()) setSearchResults(null); }} />
        </div>

        <div className="sidebar-list">
          {filteredConvs.map((conv) =>
            renamingId === conv.id ? (
              <form key={conv.id} className="sidebar-item sidebar-rename-form"
                onSubmit={(e) => { e.preventDefault(); submitRename(); }}
                onBlur={submitRename}>
                <input
                  className="sidebar-rename-input"
                  type="text"
                  value={renameDraft}
                  autoFocus
                  placeholder="Nom de la conversation"
                  onChange={(e) => setRenameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") { e.stopPropagation(); cancelRename(); }
                  }}
                />
                <button className="rename-confirm-btn" type="submit" aria-label="Valider le nom"
                  title="Enregistrer">
                  <Check size={14} strokeWidth={1.75} />
                </button>
              </form>
            ) : (
              <div key={conv.id}
                className={`sidebar-item${conv.id === activeId ? " active" : ""}`}
                role="button" tabIndex={0}
                onClick={() => { setMessages([]); setActiveId(conv.id); if (isMobile) setSidebarOpen(false); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setMessages([]); setActiveId(conv.id); if (isMobile) setSidebarOpen(false);
                  }
                }}>
                <span className="sidebar-item-title">{conv.title ?? "Nouvelle consultation"}</span>
                <button className="sidebar-rename-btn" type="button" aria-label="Renommer"
                  title="Renommer" onClick={(e) => { e.stopPropagation(); startRename(conv); }}>
                  <Pencil size={13} strokeWidth={1.75} />
                </button>
              </div>
            )
          )}
          {filteredConvs.length === 0 && (
            <p style={{ padding: "8px 12px", opacity: 0.5, fontSize: 13 }}>Aucune conversation</p>
          )}
        </div>

        <div className="sidebar-footer">
          {usage.plan !== "pro" && (
            <Link href="/pricing" className="pro-badge">
              <Zap size={14} strokeWidth={1.75} /> Passer à Pro
            </Link>
          )}
          {user ? (
            <div className="user-row">
              <div className="user-avatar">
                {(user.full_name ?? user.email).slice(0, 2).toUpperCase()}
              </div>
              <div className="user-meta">
                <span className="user-name">{user.full_name ?? user.email}</span>
                <span className="user-plan">
                  {usage.plan === "free" ? "Plan Gratuit" : usage.plan === "plus" ? "Plan Plus" : usage.plan === "pro" ? "Plan Pro" : ""}
                </span>
              </div>
              <div className="sidebar-controls">
                <button className="sidebar-settings-btn" type="button"
                  aria-label="Se déconnecter" title="Se déconnecter" onClick={() => setShowLogoutConfirm(true)}>
                  <LogOut size={16} strokeWidth={1.75} />
                </button>
                <ThemeToggle />
              </div>
            </div>
          ) : (
            <div className="guest-row">
              <Link href="/login" className="login-chip">Se connecter</Link>
              <div className="sidebar-controls"><ThemeToggle /></div>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <main className="app-main">
        <div className="topbar">
          <div className="topbar-title-group">
            {(isMobile || !sidebarOpen) && (
              <button className="topbar-icon-btn" type="button"
                aria-label="Ouvrir la barre latérale" title="Menu"
                onClick={() => setSidebarOpen(true)}>
                <Menu size={18} strokeWidth={1.75} />
              </button>
            )}
            <span className="topbar-title">{activeConv?.title ?? "Nouvelle consultation"}</span>
          </div>
          <div className="topbar-actions">
            <div className="topbar-icons">
              <button className="topbar-icon-btn" type="button" aria-label="Notifications">
                <Bell size={18} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>

        <div className="conversation main-content" ref={chatContainerRef} onScroll={handleChatScroll}>
          <div className="conv-inner">
            {loadingOlder && (
              <div className="history-loading">
                <BalanceLoader compact static />
                <span>Chargement des messages précédents…</span>
              </div>
            )}
            {messages.length === 0 && !sending && (
              <div className="conv-empty">
                <div className="conv-empty-hero">
                  <div className="conv-empty-logo">
                    <BalanceLoader gentle timeScale={3} />
                  </div>
                  <h2 className="conv-empty-title">Bonjour, quelle est votre situation aujourd&rsquo;hui&nbsp;?</h2>
                  <p className="conv-empty-sub">Analyse juridique instantanée, claire, et basée sur le droit algérien.</p>
                  <div className="conv-suggestions">
                    {SUGGESTIONS.map((s) => (
                      <button key={s.label} type="button" className="conv-suggestion"
                        onClick={() => {
                          if (sending || limitReachedRef.current) { setInputText(s.prompt); return; }
                          performSend(s.prompt);
                        }}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {messages.map((m) =>
              m.role === "assistant" ? (
                m.id === streamingKey ? (
                  <div className="msg msg-ai" key={m.id}>
                    <AiBody
                      text={streamingText}
                      activities={assistantActivities}
                      loading={streamingText === "" && assistantActivities.length === 0}
                    />
                  </div>
                ) : (
                  <div className="msg msg-ai" key={m.id}>
                    {(() => {
                      const q = questionnaireOf(m);
                      if (q) {
                        return (
                          <div className="ai-body t-body">
                            <QuestionnaireCard questionnaire={q} onAnswer={handleQuestionnaireAnswer} />
                          </div>
                        );
                      }
                      return (
                        <div className="ai-body t-body">
                          {m.content && <Markdown>{m.content}</Markdown>}
                          {m.id.startsWith("temp-ai") && assistantError && (
                            <p className="ai-error">L&rsquo;exécution a été interrompue.</p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )
              ) : (
                <div className="msg msg-user" key={m.id}>
                  <div className="msg-bubble">{m.content}</div>
                </div>
              )
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {isLimitReached && (
          <div className="limit-banner" role="status">
            <Info size={14} strokeWidth={1.75} />
            <span>
              Limite atteinte{resetLabel && <> — revenez à <strong>{resetLabel}</strong></>}, ou{" "}
              <Link href="/pricing" className="limit-banner-link">passez à Pro</Link>.
            </span>
          </div>
        )}

        {sendError && (
          <div className="send-error-banner" role="alert">
            <Info size={14} strokeWidth={1.75} />
            <span>{sendError}</span>
            <button className="send-error-close" type="button" aria-label="Fermer"
              title="Fermer" onClick={() => setSendError(null)}>
              <X size={14} strokeWidth={1.75} />
            </button>
          </div>
        )}

        <div className="composer-wrap">
          <div className="composer">
            <div className="composer-row">
              <textarea className="composer-textarea" rows={1}
                placeholder={isLimitReached ? "Limite atteinte — passez à Pro" : "Décrivez votre situation juridique…"}
                disabled={isLimitReached || sending}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button className="send-btn" type="button" aria-label="Envoyer"
                disabled={isLimitReached || sending || !inputText.trim()} onClick={sendMessage}>
                <Send size={18} strokeWidth={1.75} />
              </button>
            </div>
            <p className="disclaimer">Better Call AI peut faire des erreurs. Vérifiez les informations importantes.</p>
          </div>
        </div>
      </main>

      {showLimitModal && (
        <div className="limit-overlay" role="dialog" aria-modal="true" aria-labelledby="limit-title"
          onClick={() => setLimitDismissed(true)}>
          <div className="limit-modal" onClick={(e) => e.stopPropagation()}>
            <button className="limit-close" type="button" aria-label="Fermer" onClick={() => setLimitDismissed(true)}>
              <X size={18} strokeWidth={1.75} />
            </button>
            <div className="limit-icon"><Clock size={22} strokeWidth={1.75} /></div>
            <h2 id="limit-title">Limite d&rsquo;utilisation atteinte</h2>
            <p>
              {usage.tokensLimit !== null && <>Vous avez utilisé {usage.tokensUsed.toLocaleString()} / {usage.tokensLimit.toLocaleString()} tokens.</>}
              {resetLabel && <> Rechargement à <strong>{resetLabel}</strong>.</>}
            </p>
            <Link href="/pricing" className="btn btn-gold" style={{ width: "100%" }}>Passer à Pro</Link>
            <button className="limit-later" type="button" onClick={() => setLimitDismissed(true)}>Plus tard</button>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="limit-overlay" role="dialog" aria-modal="true" aria-labelledby="logout-title"
          onClick={() => setShowLogoutConfirm(false)}>
          <div className="limit-modal" onClick={(e) => e.stopPropagation()}>
            <button className="limit-close" type="button" aria-label="Fermer" onClick={() => setShowLogoutConfirm(false)}>
              <X size={18} strokeWidth={1.75} />
            </button>
            <div className="limit-icon"><LogOut size={22} strokeWidth={1.75} /></div>
            <h2 id="logout-title">Êtes-vous sûr de vouloir vous déconnecter ?</h2>
            <div className="logout-actions">
              <button className="btn btn-silver" type="button" onClick={() => setShowLogoutConfirm(false)}>
                Annuler
              </button>
              <button className="btn btn-gold" type="button" onClick={confirmLogout}>
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}