import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Motions from "@/components/Motions";

export const metadata = {
  title: "Paiement non abouti",
};

export default function PaymentFailurePage() {
  return (
    <>
      <Motions />
      <Header />
      <main className="payment-status-page">
        <div className="payment-status-card">
          <span className="payment-status-icon no" aria-hidden="true">
            ✕
          </span>
          <h1 className="display-md">Paiement non abouti</h1>
          <p className="body-md" style={{ color: "var(--text-body)" }}>
            Le paiement a été annulé ou a échoué. Aucune somme n&apos;a été
            débitée.
          </p>
          <div className="payment-status-actions">
            <Link href="/pricing" className="btn btn-gold">
              Réessayer
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}