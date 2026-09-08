"use client";

import { useEffect, useRef, useId } from "react";
import gsap from "gsap";

interface BalanceLoaderProps {
  compact?: boolean;
  timeScale?: number;
  static?: boolean;
  gentle?: boolean;
}

/**
 * Balance-scale spinner shown while the agent is invoked / a response is
 * being prepared, or as a page-level loader during route rendering.
 * The crossbeam rocks ±9° around the fulcrum while both pans counter-rotate
 * in real time so the chains stay perfectly vertical.
 *
 * Lightweight on purpose: standalone GSAP timeline (repeat -1), no
 * ScrollTrigger / Lenis, inline SVG, honors prefers-reduced-motion.
 *
 * - `compact`: very small inline variant (e.g. next to "Vérification du JORA…").
 * - `timeScale`: multiplies the animation speed (2 = twice as fast).
 * - `static`: renders the balance-scale without any movement (used as a
 *   static status indicator).
 * - `gentle`: idle animation mode — a slow, subtle ±4° oscillation intended
 *   for the empty new-discussion hero, instead of the fast "thinking" spin.
 */
export default function BalanceLoader({
  compact = false,
  timeScale,
  static: isStatic = false,
  gentle = false,
}: BalanceLoaderProps) {
  const gid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const beamRef = useRef<SVGGElement | null>(null);
  const leftRef = useRef<SVGGElement | null>(null);
  const rightRef = useRef<SVGGElement | null>(null);

  const effectiveTimeScale = timeScale ?? (gentle ? 1 : 2);

  useEffect(() => {
    if (isStatic) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const beam = beamRef.current;
    const left = leftRef.current;
    const right = rightRef.current;
    if (!beam || !left || !right) return;

    // Gentle idle sway — the beam rocks subtly between ±4° (yoyo loop, ~3s
    // per half-swing) so the pans keep counter-rotating to stay vertical.
    if (gentle) {
      const tl = gsap.timeline({ repeat: -1, yoyo: true }).timeScale(effectiveTimeScale);
      tl.to(beam, { rotation: -4, svgOrigin: "250 115", duration: 1.6, ease: "sine.inOut" }, 0)
        .to(left, { rotation: 4, svgOrigin: "70 115", duration: 1.6, ease: "sine.inOut" }, 0)
        .to(right, { rotation: 4, svgOrigin: "430 115", duration: 1.6, ease: "sine.inOut" }, 0);
      return () => {
        tl.kill();
      };
    }

    const tl = gsap.timeline({ repeat: -1 }).timeScale(effectiveTimeScale);

    // Phase 1 — Left pan up, right pan down (0.0s → 1.25s)
    tl.to(beam, { rotation: -9, svgOrigin: "250 115", duration: 1.25, ease: "power1.inOut" }, 0)
      .to(left, { rotation: 9, svgOrigin: "70 115", duration: 1.25, ease: "power1.inOut" }, 0)
      .to(right, { rotation: 9, svgOrigin: "430 115", duration: 1.25, ease: "power1.inOut" }, 0)

      // Phase 2 — Reversal shift (1.25s → 3.75s)
      .to(beam, { rotation: 9, svgOrigin: "250 115", duration: 2.5, ease: "power1.inOut" }, 1.25)
      .to(left, { rotation: -9, svgOrigin: "70 115", duration: 2.5, ease: "power1.inOut" }, 1.25)
      .to(right, { rotation: -9, svgOrigin: "430 115", duration: 2.5, ease: "power1.inOut" }, 1.25)

      // Phase 3 — Returning to equilibrium (3.75s → 5.0s)
      .to(beam, { rotation: 0, svgOrigin: "250 115", duration: 1.25, ease: "power1.inOut" }, 3.75)
      .to(left, { rotation: 0, svgOrigin: "70 115", duration: 1.25, ease: "power1.inOut" }, 3.75)
      .to(right, { rotation: 0, svgOrigin: "430 115", duration: 1.25, ease: "power1.inOut" }, 3.75);

    return () => {
      tl.kill();
    };
  }, [effectiveTimeScale, isStatic, gentle]);

  return (
    <svg
      className={compact ? "balance-scale balance-scale--compact" : "balance-scale"}
      viewBox="0 0 500 400"
      role="img"
      aria-hidden={isStatic || gentle ? "true" : undefined}
      aria-label={isStatic || gentle ? undefined : "La réponse de l'agent arrive"}
    >
      <defs>
        <linearGradient id={`pillar-${gid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8a6125" />
          <stop offset="30%" stopColor="#d4af37" />
          <stop offset="50%" stopColor="#fef0a5" />
          <stop offset="70%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#5c4015" />
        </linearGradient>
        <linearGradient id={`beam-${gid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffe699" />
          <stop offset="40%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#7a5519" />
        </linearGradient>
        <linearGradient id={`pan-${gid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f5d77f" />
          <stop offset="25%" stopColor="#b88f28" />
          <stop offset="80%" stopColor="#593f0d" />
          <stop offset="100%" stopColor="#2b1d03" />
        </linearGradient>
        <filter id={`shadow-${gid}`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Stationary base + pillar + fulcrum medallion (téléchargé glyph) */}
      <g filter={`url(#shadow-${gid})`}>
        <ellipse cx="250" cy="365" rx="85" ry="16" fill={`url(#pillar-${gid})`} />
        <path
          d="M 180 365 C 180 345, 210 335, 230 330 L 270 330 C 290 335, 320 345, 320 365 Z"
          fill={`url(#pillar-${gid})`}
          opacity="0.9"
        />
        <rect x="220" y="320" width="60" height="12" rx="3" fill={`url(#pillar-${gid})`} />
        <path d="M 238 320 L 243 130 L 257 130 L 262 320 Z" fill={`url(#pillar-${gid})`} />
        <rect x="235" y="270" width="30" height="8" rx="2" fill={`url(#beam-${gid})`} />
        <rect x="238" y="200" width="24" height="6" rx="2" fill={`url(#beam-${gid})`} />
        <rect x="240" y="140" width="20" height="6" rx="2" fill={`url(#beam-${gid})`} />

        <circle cx="250" cy="115" r="18" fill={`url(#pillar-${gid})`} />
        <circle cx="250" cy="115" r="9" fill={`url(#beam-${gid})`} />
        <circle cx="250" cy="115" r="4" fill="#fff8e7" opacity="0.9" />
      </g>

      {/* Pivoting crossbeam + pans (animated) */}
      <g ref={beamRef}>
        <path
          d="M 70 115 C 130 102, 200 108, 250 115 C 300 108, 370 102, 430 115 C 370 122, 300 122, 250 115 C 200 122, 130 122, 70 115 Z"
          fill={`url(#beam-${gid})`}
          filter={`url(#shadow-${gid})`}
        />
        <circle cx="70" cy="115" r="7" fill={`url(#pillar-${gid})`} />
        <circle cx="70" cy="115" r="3" fill="#16110e" />
        <circle cx="430" cy="115" r="7" fill={`url(#pillar-${gid})`} />
        <circle cx="430" cy="115" r="3" fill="#16110e" />
        <circle cx="250" cy="115" r="7" fill={`url(#beam-${gid})`} />

        {/* Left pan assembly */}
        <g ref={leftRef}>
          <g stroke={`url(#beam-${gid})`} strokeWidth="1.8" opacity="0.85" strokeDasharray="3,2">
            <line x1="70" y1="115" x2="20" y2="235" />
            <line x1="70" y1="115" x2="70" y2="235" />
            <line x1="70" y1="115" x2="120" y2="235" />
          </g>
          <g filter={`url(#shadow-${gid})`}>
            <path d="M 15 235 C 15 265, 125 265, 125 235 Z" fill={`url(#pan-${gid})`} />
            <ellipse cx="70" cy="235" rx="55" ry="7" fill={`url(#beam-${gid})`} />
            <ellipse cx="70" cy="235" rx="51" ry="5" fill="#382607" />
          </g>
        </g>

        {/* Right pan assembly */}
        <g ref={rightRef}>
          <g stroke={`url(#beam-${gid})`} strokeWidth="1.8" opacity="0.85" strokeDasharray="3,2">
            <line x1="430" y1="115" x2="380" y2="235" />
            <line x1="430" y1="115" x2="430" y2="235" />
            <line x1="430" y1="115" x2="480" y2="235" />
          </g>
          <g filter={`url(#shadow-${gid})`}>
            <path d="M 375 235 C 375 265, 485 265, 485 235 Z" fill={`url(#pan-${gid})`} />
            <ellipse cx="430" cy="235" rx="55" ry="7" fill={`url(#beam-${gid})`} />
            <ellipse cx="430" cy="235" rx="51" ry="5" fill="#382607" />
          </g>
        </g>
      </g>
    </svg>
  );
}