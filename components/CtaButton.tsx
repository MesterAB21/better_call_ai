"use client";

import { useCallback, useLayoutEffect, useRef } from "react";
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

  // The ThreeUI effect renders inside a sandboxed `srcDoc` iframe. Two design
  // constraints collide:
  //   • globals.css pins `pointer-events: none` on that iframe so clicks reach
  //     this <Link> — which leaves the shader's own hover handlers without any
  //     real pointer events;
  //   • a bare `sandbox="allow-scripts"` gives the iframe an opaque origin, so
  //     the parent cannot dispatch synthetic DOM events into it either.
  // Fix: post-mount, upgrade the sandbox to `allow-scripts allow-same-origin`
  // (same srcDoc — the library's own static content, so lifting the isolation
  // costs nothing security-wise). The iframe then becomes same-origin, so
  // `contentDocument` works and synthetic `mouseenter`/`mouseleave`/`focus`
  // events on `#btn` trigger the ignition warp while `pointer-events: none`
  // keeps the Link fully clickable.
  //
  // React re-renders (e.g. theme switch) restore the original sandbox attribute
  // and reload the frame, making the document opaque again; `ensureSameOrigin`
  // re-patches on demand and `poke` waits for the reload to resolve.

  const ensureSameOrigin = useCallback((iframe: HTMLIFrameElement): Promise<void> => {
    if (iframe.contentDocument) return Promise.resolve();
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
    return new Promise((resolve) => {
      const onLoad = () => {
        iframe.removeEventListener("load", onLoad);
        resolve();
      };
      iframe.addEventListener("load", onLoad);
      // Changing the sandbox always triggers a reload; time out defensively
      // rather than queuing forever behind a cached/bfcache frame.
      window.setTimeout(() => {
        iframe.removeEventListener("load", onLoad);
        resolve();
      }, 250);
    });
  }, []);

  const poke = useCallback(
    async (enter: boolean) => {
      const frame = frameRef.current;
      if (!frame) return;
      const iframe = frame.querySelector("iframe");
      if (!iframe) return;
      try {
        await ensureSameOrigin(iframe);
        const doc = iframe.contentDocument;
        if (!doc) return;
        const btn = doc.querySelector("#btn");
        if (enter) {
          btn?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
          btn?.dispatchEvent(new FocusEvent("focus"));
          doc.dispatchEvent(
            new MouseEvent("mousemove", {
              bubbles: true,
              clientX: Math.round(iframe.clientWidth / 2),
              clientY: Math.round(iframe.clientHeight / 2),
            })
          );
        } else {
          btn?.dispatchEvent(new MouseEvent("mouseleave", { bubbles: false }));
          btn?.dispatchEvent(new FocusEvent("blur"));
          doc.dispatchEvent(
            new MouseEvent("mousemove", {
              bubbles: true,
              clientX: 0,
              clientY: 0,
            })
          );
        }
        // Cross-origin runtime channel used by the neuform grainient scenes.
        iframe.contentWindow?.postMessage({ threeuiRuntime: { hover: enter ? 1 : 0 } }, "*");
      } catch {
        // Best-effort decoration — the Link still navigates without it.
      }
    },
    [ensureSameOrigin]
  );

  // Patch the sandbox as soon as the effect mounts (and after any re-render
  // that could have restored the original attribute) so hover works instantly.
  useLayoutEffect(() => {
    const iframe = frameRef.current?.querySelector("iframe");
    if (iframe) void ensureSameOrigin(iframe);
  }, [ensureSameOrigin, theme]);

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