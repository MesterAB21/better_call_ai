"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, ApiError } from "@/lib/api";

export default function ResetPasswordPage({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await authApi.resetPassword(token, password);
      if (result.valid) {
        setDone(true);
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(result.detail);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  if (done) return <p>Mot de passe réinitialisé ! Redirection vers la connexion…</p>;

  return (
    <main style={{ maxWidth: 480, margin: "80px auto", padding: "0 16px" }}>
      <h1>Nouveau mot de passe</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={onSubmit}>
        <label htmlFor="rp-pass">Nouveau mot de passe</label>
        <input id="rp-pass" type="password" required minLength={6}
          value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Six caractères minimum" />
        <button type="submit" disabled={loading}>{loading ? "Enregistrement…" : "Enregistrer"}</button>
      </form>
    </main>
  );
}