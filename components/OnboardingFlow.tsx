"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Emblem from "@/components/Emblem";
import Motions from "@/components/Motions";

type ScreenId = "profile" | "complete";

const PROFILE_OPTIONS = [
  { id: "avocat", icon: "⚖️", label: "Avocat" },
  { id: "notaire", icon: "📜", label: "Notaire" },
  { id: "entreprise", icon: "🏢", label: "Entreprise" },
  { id: "particulier", icon: "👤", label: "Particulier" },
];

const SCREENS: Record<ScreenId, { screen: string; step: number; total_steps: number; completion: boolean }> = {
  profile: { screen: "onboarding_profile", step: 1, total_steps: 2, completion: false },
  complete: { screen: "onboarding_complete", step: 2, total_steps: 2, completion: true },
};

export default function OnboardingFlow() {
  const router = useRouter();
  const [screen, setScreen] = useState<ScreenId>("profile");
  const [selected, setSelected] = useState<string | null>(null);

  const ui = SCREENS[screen];
  const progress = Math.round((ui.step / ui.total_steps) * 100);

  return (
    <main
      className="onboarding"
      data-screen={ui.screen}
      data-step={ui.step}
      data-total-steps={ui.total_steps}
      data-completion={String(ui.completion)}
      data-ui-state={JSON.stringify(ui)}
    >
      <Motions />

      {/* Progress bar — driven by current step */}
      <div className="ob-progress-bar">
        <div className="ob-progress-fill" data-progress style={{ width: `${progress}%` }} />
      </div>

      {/* Only ONE screen is ever rendered at a time */}
      {screen === "profile" && (
        <>
          <div className="ob-header" data-reveal-fade>
            <button className="ob-skip" type="button" onClick={() => router.push("/app")}>
              Passer
            </button>
          </div>

          <div className="ob-body">
            <div className="ob-card">
              <h1 className="ob-question" data-reveal-text>Vous êtes ?</h1>
              <div className="ob-options" style={{ marginTop: 24 }} data-grid>
                {PROFILE_OPTIONS.map((o) => (
                  <button
                    className={`ob-option${selected === o.id ? " selected" : ""}`}
                    type="button"
                    key={o.id}
                    onClick={() => setSelected(o.id)}
                  >
                    <span className="ic">{o.icon}</span>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="ob-foot" data-reveal-fade>
            <button className="ob-back" type="button" onClick={() => router.push("/login")}>
              ← Retour
            </button>
            <button
              className="btn btn-gold"
              type="button"
              data-magnetic
              disabled={!selected}
              onClick={() => setScreen("complete")}
            >
              Continuer
            </button>
          </div>
        </>
      )}

      {ui.completion && (
        <section
          className="ob-complete"
          data-reveal-fade
          aria-label="Onboarding terminé"
        >
          <span className="caption-uppercase" style={{ color: "var(--gold-primary)" }}>
            Votre espace est prêt
          </span>
          <h2 className="display-lg" style={{ marginTop: 8 }} data-reveal-text>
            L&rsquo;assemblage est terminé.
          </h2>
          <div className="ob-emblem-assembly" data-reveal-fade>
            <Emblem size={120} className="hero-emblem" />
          </div>
          <div className="ob-complete-actions">
            <button className="ob-back" type="button" onClick={() => setScreen("profile")}>
              ← Retour
            </button>
            <Link href="/app" className="btn btn-gold btn-lg" data-magnetic>
              Accéder à l&rsquo;application →
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}