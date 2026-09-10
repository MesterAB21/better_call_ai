"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Wordmark from "./Wordmark";
import { ThemeToggle } from "./ThemeProvider";
import { useAuth } from "@/lib/auth-context";

export default function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/" className="nav-logo"><Wordmark size={28} /></Link>
        <nav className="nav-links" aria-label="Navigation principale">
          <Link href="/#fonctionnement" className="nav-link">Comment ça marche</Link>
          <Link href="/pricing" className="nav-link">Tarifs</Link>
          <Link href="/app" className="nav-link">L&rsquo;application</Link>
        </nav>
        <div className="nav-actions">
          <ThemeToggle />
          {!loading && (
            user ? (
              <Link href="/app" className="btn btn-gold">
                Mon espace <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
              </Link>
            ) : (
              <Link href="/login" className="btn btn-gold">
                Se connecter <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
}