"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function LogoMotion() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;

    const tl = gsap.timeline({ repeat: -1 });

    tl.fromTo(
      el,
      { y: 0, rotation: -0.6, scale: 1 },
      { y: -12, rotation: 0.6, scale: 1.02, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: 1 }
    );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className="hero-logo" ref={ref}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/better_call_ai_logo_original.png"
        alt="Better Call AI"
        className="hero-logo-img"
        width={1234}
        height={848}
      />
    </div>
  );
}