"use client";

import Link from "next/link";
import { ShaderButtons } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";
import { useTheme } from "./ThemeProvider";

const BRAND_GOLD = {
  dark: { hue: 38, saturation: 1.3, brightness: 1.18 },
  light: { hue: 44, saturation: 1.05, brightness: 1.05 },
} as const;

export default function CtaButton({ href }: { href: string }) {
  const { theme } = useTheme();
  const tone = BRAND_GOLD[theme];
  return (
    <Link
      href={href}
      className="shader-frame"
      data-magnetic
      aria-label="Ouvrir l'application Better Call AI"
    >
      <span className="shader-frame-inner" aria-hidden="true">
        <ShaderButtons
          variant="ignition-button"
          mode={theme}
          hue={tone.hue}
          saturation={tone.saturation}
          brightness={tone.brightness}
        />
      </span>
    </Link>
  );
}