"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { plansApi, paymentsApi, userApi, ApiError, type Plan as ApiPlan } from "@/lib/api";

const NAME_MAP: Record<string, string> = {
  "Découverte": "free",
  "Plus": "plus",
  "Pro": "pro",
};

const TIER_RANK: Record<string, number> = { free: 0, plus: 1, pro: 2 };

type Plan = {
  name: string;
  monthly: number | null;
  period: string;
  desc: string;
  featured?: boolean;
  tag?: string;
  current?: boolean;
  enterprise?: boolean;
  features: string[];
};

const plans: Plan[] = [
  {
    name: "Découverte",
    monthly: 0,
    period: "DA / mois",
    desc: "Pour essayer la plateforme",
    features: [
      "Questions limitées / jour",
      "Mode Standard",
      "Recherche sur les principaux codes",
      "Pas d'historique à long terme",
    ],
  },
  {
    name: "Plus",
    monthly: 3999,
    period: "DA / mois",
    desc: "Pour les avocats indépendants et les particuliers exigeants",
    featured: true,
    tag: "Populaire",
    features: [
      "750 000 tokens / jour",
      "Mode Recherche Approfondie",
      "Export PDF / Word",
      "Dossiers illimités",
      "Citations juridiques détaillées",
      "OCR automatique FR / AR",
    ],
  },
  {
    name: "Pro",
    monthly: 5999,
    period: "DA / mois",
    desc: "Pour les cabinets et les PME",
    features: [
      "Tout le plan Plus",
      "Tokens illimités",
      "Sièges multiples",
      "Facturation centralisée",
      "Dossiers partagés en équipe",
      "Réponses prioritaires",
      "Gestion des accès par rôle",
    ],
  },
  {
    name: "Entreprise",
    monthly: null,
    period: "",
    desc: "Pour les grands comptes et les institutions",
    enterprise: true,
    features: [
      "SSO / authentification unique",
      "Hébergement dédié",
      "SLA garanti",
      "Intégration API",
      "Support dédié",
    ],
  },
];

export default function PricingPlans() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [apiPlans, setApiPlans] = useState<ApiPlan[]>([]);

  useEffect(() => {
    plansApi.list().then(setApiPlans).catch(() => {});
  }, []);

  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
  const [currentPlanName, setCurrentPlanName] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    userApi
      .subscription()
      .then((sub) => {
        if (cancelled) return;
        setIsAuthed(true);
        setCurrentPlanName(sub?.plan.name ?? null);
      })
      .catch(() => !cancelled && setIsAuthed(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const startCheckout = async (displayName: string) => {
    const apiPlan = apiPlans.find((p) => p.name === NAME_MAP[displayName]);
    if (!apiPlan) return;
    setCheckingOut(displayName);
    setCheckoutError(null);
    try {
      const res = await paymentsApi.checkout(apiPlan.id, billing);
      window.location.assign(res.checkout_url);
    } catch (e) {
      setCheckoutError(
        e instanceof ApiError
          ? `Le paiement n'a pas pu démarrer : ${e.detail}`
          : "Impossible de démarrer le paiement. Réessayez dans un instant."
      );
      setCheckingOut(null);
    }
  };

  // Map display plan name to API plan slug
  const getPlanPrice = (displayName: string): string => {
    const apiPlan = apiPlans.find((p) => p.name === NAME_MAP[displayName]);
    if (!apiPlan) {
      if (displayName === "Découverte") return "0";
      return "…";
    }
    if (apiPlan.price_dzd === 0) return "0";
    return apiPlan.price_dzd.toLocaleString("fr-DZ");
  };

  const currentRank = isAuthed
    ? currentPlanName
      ? (TIER_RANK[currentPlanName] ?? 0)
      : 0
    : null;

  return (
    <>
      {/* Billing toggle */}
      <div style={{ display: "flex", justifyContent: "center" }} data-reveal-fade>
        <div className="billing-toggle" role="group" aria-label="Périodicité">
          <button
            type="button"
            className={`billing-option ${billing === "monthly" ? "active" : ""}`}
            aria-pressed={billing === "monthly"}
            onClick={() => setBilling("monthly")}
          >
            Mensuel
          </button>
          <button
            type="button"
            className={`billing-option ${billing === "annual" ? "active" : ""}`}
            aria-pressed={billing === "annual"}
            onClick={() => setBilling("annual")}
          >
            Annuel
            <span className="discount-badge">-20%</span>
          </button>
        </div>
      </div>

      {checkoutError && (
        <p className="checkout-error" role="alert">
          {checkoutError}
        </p>
      )}

      <div className="plans-grid" data-grid>
        {plans.map((p) => {
          const price = p.enterprise
            ? "Sur devis"
            : p.monthly === 0
              ? "0"
              : apiPlans.length > 0
                ? (billing === "annual"
                    ? Math.round(Number(getPlanPrice(p.name).replace(/\s/g, "")) * 0.8).toLocaleString("fr-DZ")
                    : getPlanPrice(p.name))
                : "…";
          return (
            <div
              className={`plan-card ${p.featured ? "featured" : ""} ${p.enterprise ? "enterprise" : ""}`}
              key={p.name}
            >
              <div className="plan-card-header">
                <span className="plan-name">{p.name}</span>
                {p.tag && <span className="plan-tag">{p.tag}</span>}
              </div>
              <div className="plan-price">
                {price}
                {p.period && p.enterprise ? null : p.period && (
                  <span className="plan-price-period">
                    {" "}
                    {p.period === "DA / mois" && billing === "annual" ? "DA / mois (annuel)" : p.period}
                  </span>
                )}
              </div>
              {p.enterprise && <span className="plan-price-period">{p.period}</span>}
              <p className="plan-desc">{p.desc}</p>
              <ul className="plan-feats">
                {p.features.map((f) => (
                  <li key={f}>
                    <span className="check">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="plan-cta">
                {p.enterprise ? (
                  <a
                    className="btn btn-ghost"
                    href="mailto:contact@bettercallai.dz?subject=Demande%20Entreprise"
                    style={{ width: "100%", textDecoration: "none" }}
                  >
                    Nous contacter
                  </a>
                ) : (currentRank !== null &&
                    TIER_RANK[NAME_MAP[p.name] ?? ""] < currentRank) ? (
                  <span className="plan-disabled-note">
                    Inclus dans votre abonnement actuel
                  </span>
                ) : (isAuthed &&
                    TIER_RANK[NAME_MAP[p.name] ?? ""] === currentRank) ? (
                  <button
                    className="btn btn-ghost"
                    type="button"
                    style={{ width: "100%" }}
                    disabled
                  >
                    Plan actuel
                  </button>
                ) : isAuthed ? (
                  <button
                    className="btn btn-gold"
                    type="button"
                    style={{ width: "100%" }}
                    disabled={checkingOut === p.name}
                    onClick={() => startCheckout(p.name)}
                  >
                    {checkingOut === p.name
                      ? "Redirection…"
                      : `Passer à ${p.name}`}
                  </button>
                ) : (
                  <Link href="/login?next=/pricing" className="btn btn-gold" style={{ width: "100%" }}>
                    Choisir ce plan
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}