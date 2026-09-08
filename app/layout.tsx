import type { Metadata } from "next";
import {
  Fraunces,
  Schibsted_Grotesk,
  IBM_Plex_Mono,
  El_Messiri,
  Noto_Kufi_Arabic,
  Montserrat,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";
import { ThemeScript } from "@/components/ThemeProvider";
import { AuthProvider } from "@/lib/auth-context";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const generalSans = Schibsted_Grotesk({
  variable: "--font-general-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const elMessiri = El_Messiri({
  variable: "--font-el-messiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600"],
});

const notoKufi = Noto_Kufi_Arabic({
  variable: "--font-noto-kufi",
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Better Call AI — Votre consultant juridique propulsé par l'IA",
  description:
    "Consultation juridique algérienne assistée par IA : 6 000+ textes de loi, jurisprudence et JORA.",
  icons: {
    icon: "/better_call_ai_logo_original.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${generalSans.variable} ${ibmPlexMono.variable} ${elMessiri.variable} ${notoKufi.variable} ${montserrat.variable} ${playfair.variable}`}
    >
      <head>
        <ThemeScript />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
