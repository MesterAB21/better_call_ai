"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, Scale, User,
} from "lucide-react";
import { authApi, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

function GoogleG({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();

  const next = searchParams.get("next");
  // Google registration step: the Google identity is already verified, only
  // the optional phone number remains to be completed.
  const isGoogleSignup = searchParams.get("google") === "1";
  const gToken = searchParams.get("g");
  const googleError = searchParams.get("error");

  // Destination after login/signup: honour an explicit same-site `next`, but
  // never land on the landing page ("/") — fall back to the app workspace.
  const target = () =>
    next && next.startsWith("/") && !next.startsWith("//") && next !== "/"
      ? next
      : "/app";

  const [tab, setTab] = useState<"login" | "signup">(isGoogleSignup ? "signup" : "login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const headKicker = isGoogleSignup ? "Bienvenue" : tab === "login" ? "Ravi de vous revoir" : "Bienvenue";
  const headTitle = isGoogleSignup ? "Finalisez votre compte." : tab === "login" ? "Reprendre le fil." : "Créer un espace.";
  const headSub = isGoogleSignup
    ? "Votre identité Google est vérifiée — complétez votre profil pour terminer."
    : "Vos consultations et vos recherches sont conservées dans un espace confidentiel.";

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isGoogleSignup) {
        if (!gToken) {
          setError("Informations Google manquantes. Veuillez réessayer.");
          return;
        }
        const data = await authApi.registerGoogle(gToken, phone || undefined);
        setUser(data.user);
        router.push(target());
      } else if (tab === "login") {
        const data = await authApi.login(email, password);
        setUser(data.user);
        router.push(target());
      } else {
        await authApi.register(fullName, email, password, phone || undefined);
        // Auto-login after registration
        const data = await authApi.login(email, password);
        setUser(data.user);
        router.push(target());
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Une erreur inattendue s'est produite.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      {/* LEFT PANE */}
      <div className="login-pane">
        <header className="login-topbar">
          <Link href="/" className="login-topbar-link">
            <ArrowLeft size={12} strokeWidth={2} />
            ACCUEIL
          </Link>
          <span>ESPACE PRIVÉ / 01</span>
        </header>

        <div className="login-brand">
          <div className="login-brand-mark"><Scale size={15} strokeWidth={2} /></div>
          <div>
            <p className="login-brand-title login-serif">Better Call <em>AI</em></p>
            <p className="login-brand-tag">Droit, avec clarté</p>
          </div>
        </div>

        <div className="login-head">
          <h3 className="login-kicker">{headKicker}</h3>
          <h1 className="login-title login-serif">
            {headTitle}
          </h1>
          <p className="login-sub">
            {headSub}
          </p>
        </div>

        {!isGoogleSignup && (
          <div className="login-tabs" role="tablist" aria-label="Authentification">
            <button type="button" role="tab" aria-selected={tab === "login"}
              className={tab === "login" ? "login-tab login-tab--active" : "login-tab"}
              onClick={() => { setTab("login"); setError(null); }}>
              Se connecter
            </button>
            <button type="button" role="tab" aria-selected={tab === "signup"}
              className={tab === "signup" ? "login-tab login-tab--active" : "login-tab"}
              onClick={() => { setTab("signup"); setError(null); }}>
              Créer un compte
            </button>
          </div>
        )}

        {/* Error display */}
        {(error || googleError) && (
          <div role="alert" style={{
            color: "var(--error, #e53e3e)", background: "rgba(229,62,62,0.08)",
            padding: "8px 12px", borderRadius: 6, fontSize: 13, marginBottom: 8,
          }}>
            {error ?? decodeURIComponent(googleError!)}
          </div>
        )}

        <form className="login-form" onSubmit={onSubmit}>
          {/* Full name — signup only */}
          {tab === "signup" && !isGoogleSignup && (
            <div className="login-field">
              <label className="login-label" htmlFor="login-fullname">Nom complet</label>
              <div className="login-input">
                <User size={13} strokeWidth={2} />
                <input id="login-fullname" type="text" placeholder="Nadia Benali"
                  value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
            </div>
          )}

          {/* Email — hidden during Google registration (verified via Google) */}
          {!isGoogleSignup && (
            <div className="login-field">
              <label className="login-label" htmlFor="login-email">Adresse e-mail</label>
              <div className="login-input">
                <Mail size={13} strokeWidth={2} />
                <input id="login-email" type="email" placeholder="nadia.benali@exemple.dz"
                  value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
          )}

          {/* Phone — signup only, optional */}
          {tab === "signup" && (
            <div className="login-field">
              <label className="login-label" htmlFor="login-phone">
                Téléphone <span style={{ opacity: 0.5 }}>(optionnel)</span>
              </label>
              <div className="login-input">
                <input id="login-phone" type="tel" placeholder="+213 555 123 456"
                  value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
          )}

          {/* Password — hidden during Google registration */}
          {!isGoogleSignup && (
            <div className="login-field">
              <label className="login-label" htmlFor="login-password">Mot de passe</label>
              <div className="login-input">
                <Lock size={13} strokeWidth={2} />
                <input id="login-password" type={showPassword ? "text" : "password"}
                  placeholder="Six caractères minimum" value={password}
                  onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                <button type="button" className="login-eye"
                  aria-label={showPassword ? "Masquer" : "Afficher"}
                  onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? <EyeOff size={13} strokeWidth={2} /> : <Eye size={13} strokeWidth={2} />}
                </button>
              </div>
            </div>
          )}

          {tab === "login" && !isGoogleSignup && (
            <div className="login-forgot">
              <Link href="/reset-password">Mot de passe oublié ?</Link>
            </div>
          )}

          <button type="submit" className="login-submit" disabled={loading}>
            <span>
              {loading ? "Chargement…" : isGoogleSignup ? "Créer un compte"
                : tab === "login" ? "Entrer dans mon espace" : "Créer mon espace"}
            </span>
            {!loading && <ArrowRight size={14} strokeWidth={2} />}
          </button>

          {isGoogleSignup ? (
            <div className="login-forgot">
              <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}>
                Revenir à la connexion
              </Link>
            </div>
          ) : (
            <>
              <div className="login-divider" aria-hidden="true">
                <span className="login-divider-line" />
                <em className="login-divider-ou login-serif">ou</em>
                <span className="login-divider-line" />
              </div>

              <button type="button" className="login-google" onClick={() => authApi.googleLogin(next ?? undefined)}>
                <GoogleG size={14} />
                Continuer avec Google
              </button>
            </>
          )}
        </form>

        <footer className="login-foot">
          <p>
            En continuant, vous acceptez nos conditions d&rsquo;utilisation.
            <br />
            Better Call AI n&rsquo;est pas un cabinet d&rsquo;avocats.
          </p>
        </footer>
      </div>

      {/* RIGHT PANE — unchanged visual */}
      <aside className="login-art">
        <div className="login-art-grid" aria-hidden="true" />
        <div className="login-art-vignette" aria-hidden="true" />
        <div className="login-art-glow" aria-hidden="true" />
        <div className="login-art-content">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/better_call_ai_logo_original.png" alt="Better Call AI Logo" className="login-logo" />
          <h2 className="login-quote login-serif">
            « Votre consultant juridique digital numéro 1 en Algérie »
          </h2>
        </div>
        <div className="login-art-foot">
          <div className="login-art-rule" aria-hidden="true" />
          <p>Une lecture augmentée du droit algérien, conçue<br />pour les moments où chaque mot compte.</p>
        </div>
      </aside>
    </div>
  );
}