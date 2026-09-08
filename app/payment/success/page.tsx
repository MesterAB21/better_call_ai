import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Motions from "@/components/Motions";

export const metadata = {
  title: "Paiement confirmé",
};

export default function PaymentSuccessPage() {
  return (
    <>
      <Motions />
      <Header />
      <main className="payment-status-page">
        <div className="payment-status-card">
          <span className="payment-status-icon ok" aria-hidden="true">
            ✓
          </span>
          <h1 className="display-md">Paiement confirmé</h1>
          <p className="body-md" style={{ color: "var(--text-body)" }}>
            Merci. Votre abonnement est activé automatiquement dans les
            prochaines secondes.
          </p>
          <div className="payment-status-actions">
            <Link href="/app" className="btn btn-gold">
              Aller à l&apos;application
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}