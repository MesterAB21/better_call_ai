import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Motions from "@/components/Motions";
import PricingPlans from "@/components/PricingPlans";

export default function PricingPage() {
  return (
    <>
      <Motions />
      <Header />
      <main className="pricing-page">
        <div className="sec-head">
          <span className="caption-uppercase" style={{ color: "var(--gold-primary)" }} data-reveal-fade>
            Tarifs
          </span>
          <h1 className="display-lg" data-reveal-text>Prix simples, sans surprise</h1>
          <p className="body-md" style={{ color: "var(--text-body)" }} data-reveal-fade>
            Commencez gratuitement. Passez au niveau supérieur quand vous en
            avez besoin.
          </p>
        </div>

        <PricingPlans />

        <div className="compare-wrap" data-reveal-fade>
          <button className="compare-btn" type="button">
            Comparer tous les plans ▾
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}