"use client";

import { useCallback, useRef } from "react";
import Link from "next/link";
import { ShaderButtons } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";
import { useTheme } from "./ThemeProvider";

const BRAND_GOLD = {
  dark: { hue: 38, saturation: 1.3, brightness: 1.18 },
  light: { hue: 44, saturation: 1.05, brightness: 1.05 },
} as const;

export default function CtaButton({ href }: { href: string }) {
  const frameRef = useRef<HTMLAnchorElement>(null);
  const { theme } = useTheme();
  const tone = BRAND_GOLD[theme];

  // The ThreeUI effect renders into a sandboxed, same-origin `srcDoc` iframe.
  // Our stylesheet sets `pointer-events: none` on that iframe so clicks pass
  // through to this `<Link>`; the cost is that the shader's own hover motion
  // never receives the pointer. Fix: relay the link's hover/focus into the
  // iframe — both through the library's own runtime channel (`threeuiRuntime`
  // postMessage, which drives its injected `setHover`) and through synthetic
  // DOM events on the scene (ignition's `#btn` warp + the global pointer
  // handlers). The effect only mounts after suspension, so re-query the iframe
  // on every event instead of caching it.
  const poke = useCallback((enter: boolean) => {
    const frame = frameRef.current;
    if (!frame) return;
    const iframe = frame.querySelector("iframe");
    if (!iframe || !iframe.contentDocument) return;
    try {
      const doc = iframe.contentDocument;
      const btn = doc.querySelector("#btn");
      if (enter) {
        iframe.contentWindow?.postMessage({ threeuiRuntime: { hover: 1 } }, "*");
        btn?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
        btn?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
        doc.documentElement.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
      } else {
        iframe.contentWindow?.postMessage({ threeuiRuntime: { hover: 0 } }, "*");
        btn?.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
        doc.documentElement.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true }));
      }
    } catch {
      // srcdoc iframes are always same-origin; defensive no-op.
    }
  }, []);

  return (
    <Link
      ref={frameRef}
      href={href}
      className="shader-frame"
      data-magnetic
      onMouseEnter={() => poke(true)}
      onMouseLeave={() => poke(false)}
      onFocus={() => poke(true)}
      onBlur={() => poke(false)}
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