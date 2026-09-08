import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LogoMotion from "@/components/LogoMotion";
import Motions from "@/components/Motions";
import CtaButton from "@/components/CtaButton";
import { Building2, Lock, Scale, User } from "lucide-react";

const tickerItems = [
  "Code Civil",
  "Code Pénal",
  "Code de Commerce",
  "Code du Travail",
  "Code de la Famille",
  "Code de Procédure Civile",
  "JORA",
];

const audience = [
  {
    icon: Scale,
    title: "Avocats",
    text: "Gagnez du temps sur la recherche de jurisprudence et préparez vos conclusions avec des références vérifiées.",
  },
  {
    icon: Building2,
    title: "Entreprises",
    text: "Sécurisez vos contrats et mises en demeure en quelques minutes, en conformité avec le droit algérien.",
  },
  {
    icon: User,
    title: "Particuliers",
    text: "Comprenez vos droits avant de consulter un professionnel et préparez votre dossier en confiance.",
  },
];

const testimonials = [
  {
    initials: "MB",
    name: "Me. L. Bensaïd",
    role: "Avocate à Alger",
    text: "La recherche de jurisprudence qui me prenait des heures me prend maintenant quelques secondes. Les sources sont fiables et citées.",
  },
  {
    initials: "SK",
    name: "Samir K.",
    role: "Gérant d'une PME",
    text: "J'ai sécurisé un contrat de travail type. L'outil a repéré deux clauses à risque que mon ancien prestataire avait laissées.",
  },
  {
    initials: "AK",
    name: "Amel",
    role: "Particulière",
    text: "J'ai enfin compris mes droits en matière de location. Document clair, sources citées, zéro jargon inutile.",
  },
  {
    initials: "RD",
    name: "Pr. R. Djellal",
    role: "Cabinet à Oran",
    text: "La couverture JORA + codes est impressionnante. Indispensable pour un cabinet moderne.",
  },
];

const plans = [
  { name: "Découverte", price: "0 DA", note: "Pour essayer", features: ["Questions limitées/jour", "Mode Standard", "Sans historique long terme"] },
  { name: "Professionnel", price: "1 900 DA", note: "/mois", featured: true, features: ["Usage étendu", "Recherche Approfondie", "Export PDF / Word", "Dossiers illimités"] },
  { name: "Cabinet", price: "3 900 DA", note: "/utilisateur /mois", features: ["Sièges multiples", "Facturation centralisée", "Dossiers partagés", "Réponses prioritaires"] },
];

export default function Home() {
  return (
    <>
      <Motions />
      <Header />
      <main>
        {/* 1 — HERO */}
        <section className="hero">
          <div className="hero-circuit circuit-1" aria-hidden="true" data-parallax="0.15" />
          <div className="hero-circuit circuit-2" aria-hidden="true" data-parallax="0.3" />
          <div className="hero-inner">
            <div className="hero-emblem" data-reveal-fade>
              <LogoMotion />
            </div>
            <h1 className="display-xl" data-reveal-text>
              Votre consultant juridique, propulsé par l&rsquo;IA.
            </h1>
            <p className="body-md hero-subtitle" data-reveal-fade>
              Interrogez 6 000+ textes de loi algériens, la jurisprudence et le
              JORA. Des réponses claires, sourcées et conformes au droit
              algérien — en français ou en arabe.
            </p>
            <div className="hero-actions" data-reveal-fade>
              <CtaButton href="/app" />
              <Link href="#fonctionnement" className="btn btn-ghost btn-lg" data-magnetic>
                Voir comment ça marche
              </Link>
            </div>
          </div>
        </section>

        {/* 2 — COVERAGE STRIP + TICKER */}
        <section className="cover-band">
          <div className="cover-counter">
            <span className="gold" data-counter="6248">6 248</span>
          </div>
          <p className="cover-label">
            textes juridiques algériens indexés
          </p>
        </section>
        <div className="ticker" aria-hidden="true">
          <div className="ticker-track">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span className="ticker-item" key={i}>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* 3 — HOW IT WORKS */}
        <section className="section" id="fonctionnement">
          <div className="sec-head">
            <span className="caption-uppercase" style={{ color: "var(--gold-primary)" }} data-reveal-fade>
              Comment ça marche
            </span>
            <h2 className="display-lg" data-reveal-text>Trois étapes vers la clarté</h2>
          </div>
          <div className="steps" data-grid>
            <div className="step">
              <span className="step-num">01</span>
              <h3 className="title-md">Décrivez votre situation</h3>
              <p className="body-sm" style={{ color: "var(--text-body)" }}>
                Posez une question, décrivez un litige ou déposez un document
                scanné (OCR automatique FR/AR).
              </p>
            </div>
            <div className="step">
              <span className="step-num">02</span>
              <h3 className="title-md">L&rsquo;IA consulte la bibliothèque</h3>
              <p className="body-sm" style={{ color: "var(--text-body)" }}>
                Fouille les 6 000+ textes, la jurisprudence et le JORA en
                quelques secondes.
              </p>
            </div>
            <div className="step">
              <span className="step-num">03</span>
              <h3 className="title-md">Recevez une réponse sourcée</h3>
              <p className="body-sm" style={{ color: "var(--text-body)" }}>
                Un résumé clair, des références légales cliquables et les
                extraits exacts du texte source.
              </p>
            </div>
          </div>
        </section>

        {/* 4 — FOR WHOM */}
        <section className="section" style={{ background: "var(--bg-surface)" }}>
          <div className="sec-head">
            <span className="caption-uppercase" style={{ color: "var(--gold-primary)" }} data-reveal-fade>
              Pour qui
            </span>
            <h2 className="display-lg" data-reveal-text>Conçu pour les professionnels et les particuliers</h2>
          </div>
          <div className="audience-grid" data-grid>
            {audience.map((a) => (
              <div className="audience-card" key={a.title}>
                <div className="audience-icon">
                  <a.icon size={20} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <h3 className="title-md">{a.title}</h3>
                <p className="body-sm" style={{ color: "var(--text-body)" }}>
                  {a.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 5 — PRIVACY */}
        <section className="section">
          <div className="privacy-band" data-reveal-fade>
            <div className="audience-icon" aria-hidden="true">
              <Lock size={20} strokeWidth={1.8} />
            </div>
            <h2 className="display-md" data-reveal-text>Vos dossiers restent privés et chiffrés</h2>
            <p className="body-md" style={{ maxWidth: 540, color: "var(--text-body)" }}>
              Chaque dossier est chiffré de bout en bout. Vos échanges ne sont
              jamais utilisés pour entraîner nos modèles sans votre accord
              explicite.
            </p>
            <div className="lock-row">• Chiffrement AES-256</div>
          </div>
        </section>

        {/* 6 — TESTIMONIALS */}
        <section className="section" style={{ background: "var(--bg-surface)" }}>
          <div className="sec-head">
            <span className="caption-uppercase" style={{ color: "var(--gold-primary)" }} data-reveal-fade>
              Témoignages
            </span>
            <h2 className="display-lg" data-reveal-text>Ils nous font confiance</h2>
          </div>
          <div className="carousel">
            <div className="carousel-track" data-grid>
              {testimonials.map((t, i) => (
                <div className="testimonial" key={i}>
                  <p>{t.text}</p>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar">{t.initials}</div>
                    <div>
                      <div className="testimonial-name">{t.name}</div>
                      <div className="testimonial-role">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7 — PRICING PREVIEW */}
        <section className="section" id="tarifs">
          <div className="sec-head">
            <span className="caption-uppercase" style={{ color: "var(--gold-primary)" }} data-reveal-fade>
              Tarifs
            </span>
            <h2 className="display-lg" data-reveal-text>Prix simples, sans surprise</h2>
            <p className="body-md" style={{ color: "var(--text-body)" }} data-reveal-fade>
              Commencez gratuitement, passez au niveau supérieur quand vous en
              avez besoin.
            </p>
          </div>
          <div className="pricing-preview-grid" data-grid>
            {plans.map((p) => (
              <div className={`price-card ${p.featured ? "featured" : ""}`} key={p.name}>
                <div className="price-name">{p.name}</div>
                <div>
                  <span className="price-val">{p.price}</span>
                  <span className="price-note"> {p.note}</span>
                </div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                  {p.features.map((f) => (
                    <li key={f} style={{ display: "flex", gap: 8, fontSize: 13.5, alignItems: "flex-start" }}>
                      <span style={{ color: "var(--gold-primary)" }}>✓</span>
                      <span style={{ color: "var(--text-body)" }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/pricing"
                  className={p.featured ? "btn btn-gold" : "btn btn-ghost"}
                  style={{ marginTop: "auto" }}
                >
                  {p.featured ? "Voir le plan" : "En savoir plus"}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* 8 — FINAL CTA */}
        <section className="section">
          <div className="final-cta">
            <h2 className="display-lg" style={{ color: "#EDE8E0" }} data-reveal-text>
              Prêt à consulter votre consultant juridique ?
            </h2>
            <p className="body-md" style={{ color: "rgba(237,232,224,0.8)", maxWidth: 520 }} data-reveal-fade>
              Rejoignez des milliers d&rsquo;avocats et de particuliers qui
              sécurisent leurs décisions avec l&rsquo;IA.
            </p>
            <CtaButton href="/app" />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
