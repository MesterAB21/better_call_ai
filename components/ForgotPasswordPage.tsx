"use client";
import { useState } from "react";
import Link from "next/link";
import { authApi, ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  if (sent) return (
    <main style={{ maxWidth: 480, margin: "80px auto", padding: "0 16px" }}>
      <h1>Vérifiez votre boîte mail</h1>
      <p>Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien de réinitialisation dans quelques minutes.</p>
      <Link href="/login">Retour à la connexion</Link>
    </main>
  );

  return (
    <main style={{ maxWidth: 480, margin: "80px auto", padding: "0 16px" }}>
      <h1>Mot de passe oublié</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={onSubmit}>
        <label htmlFor="fp-email">Adresse e-mail</label>
        <input id="fp-email" type="email" required value={email}
          onChange={(e) => setEmail(e.target.value)} placeholder="nadia.benali@exemple.dz" />
        <button type="submit" disabled={loading}>{loading ? "Envoi…" : "Envoyer le lien"}</button>
      </form>
      <Link href="/login">Retour à la connexion</Link>
    </main>
  );
}