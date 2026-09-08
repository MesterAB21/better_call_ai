import Link from "next/link";
import Wordmark from "./Wordmark";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <Wordmark size={30} />
          <p
            className="body-sm"
            style={{ color: "var(--text-muted)", marginTop: 12, maxWidth: 260 }}
          >
            Votre consultant juridique, propulsé par l&rsquo;IA. 6 000+ textes
            algériens indexés.
          </p>
        </div>
        <div className="footer-col">
          <h4>Produit</h4>
          <Link href="/app">Application</Link>
          <Link href="/pricing">Tarifs</Link>
          <Link href="/#fonctionnement">Comment ça marche</Link>
        </div>
        <div className="footer-col">
          <h4>Légal</h4>
          <span>Mentions légales</span>
          <span>Confidentialité</span>
          <span>CGU</span>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <span>bonjour@bettercallai.dz</span>
          <span>LinkedIn</span>
          <span>X / Twitter</span>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Better Call AI. Tous droits réservés.</span>
        <span>République Algérienne Démocratique et Populaire</span>
      </div>
    </footer>
  );
}