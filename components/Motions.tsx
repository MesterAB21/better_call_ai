"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

/**
 * Cuberto-style motion engine (GSAP + Lenis + SplitType).
 * Everything is data-attribute driven and homogeneous across pages.
 * The /app workspace does NOT include this component on purpose.
 */
export default function Motions() {
  const router = useRouter();
  const pathname = usePathname();
  const revealRef = useRef<(() => void) | null>(null);
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cleanups: Array<() => void> = [];

    // ---- smooth scroll, synced to the GSAP ticker ----
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: true });
    lenis.on("scroll", () => ScrollTrigger.update());
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    cleanups.push(() => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    });

    // ---- navbar: hide on scroll down, show on scroll up + blur ----
    const nav = document.querySelector<HTMLElement>(".nav");
    if (nav) {
      let lastY = 0;
      const onScroll = (l: Lenis) => {
        const scroll = l.scroll;
        nav.classList.toggle("nav--blurred", scroll > 40);
        if (scroll > lastY && scroll > 100) {
          nav.classList.add("nav--hidden");
        } else {
          nav.classList.remove("nav--hidden");
        }
        lastY = scroll;
      };
      lenis.on("scroll", onScroll);
      cleanups.push(() => lenis.off("scroll", onScroll));
    }

    // ---- custom cursor (dot + trailing ring, blend difference) ----
    let cursor: HTMLDivElement | null = null;
    if (window.matchMedia("(pointer: fine)").matches) {
      cursor = document.createElement("div");
      cursor.className = "cursor";
      cursor.setAttribute("aria-hidden", "true");
      cursor.innerHTML = '<div class="cursor-dot"></div><div class="cursor-ring"></div>';
      document.body.appendChild(cursor);
      gsap.set(cursor, { xPercent: -50, yPercent: -50 });
      const xTo = gsap.quickTo(cursor, "x", { duration: 0.12, ease: "power2.out" });
      const yTo = gsap.quickTo(cursor, "y", { duration: 0.32, ease: "power3.out" });
      const onMove = (e: MouseEvent) => {
        xTo(e.clientX);
        yTo(e.clientY);
      };
      const onHover = (e: MouseEvent) => {
        const t = e.target as Element | null;
        cursor?.classList.toggle(
          "cursor--active",
          !!t?.closest("a, button, input, textarea, select, [role='button']")
        );
      };
      window.addEventListener("mousemove", onMove, { passive: true });
      document.addEventListener("mouseover", onHover);
      document.addEventListener("mouseout", onHover);
      cleanups.push(() => {
        window.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseover", onHover);
        document.removeEventListener("mouseout", onHover);
        cursor?.remove();
      });
    }

    // ---- page transition overlay (route wipe + loading spinner) ----
    const overlay = document.createElement("div");
    overlay.className = "page-transition";
    overlay.setAttribute("aria-hidden", "true");
    const spinner = document.createElement("div");
    spinner.className = "page-transition-spinner";
    overlay.appendChild(spinner);
    document.body.appendChild(overlay);
    // Reveal the freshly navigated page. Bound before the click handler so it
    // stays available even after `router.push`, once the new route commits.
    const reveal = () => {
      if (!overlay.isConnected) return;
      gsap.to(overlay, {
        scaleY: 0,
        duration: 0.6,
        ease: "power4.inOut",
        transformOrigin: "top",
        onComplete: () => {
          try {
            lenis.start();
          } catch {
            /* already destroyed during unmount */
          }
        },
      });
      try {
        ScrollTrigger.refresh();
      } catch {
        /* noop */
      }
    };
    revealRef.current = reveal;
    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const anchor = (e.target as Element | null)?.closest?.(
        "a[href]"
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }
      const url = new URL(anchor.href, window.location.origin);
      if (url.origin !== window.location.origin) return;
      if (anchor.getAttribute("target") === "_blank") return;

      // Same-page navigation (e.g. /#fonctionnement or /#tarifs): smooth-scroll
      // to the section instead of running the route wipe (which would leave the
      // overlay covering the page for a hash-only change of the same route).
      if (url.pathname === window.location.pathname) {
        if (url.hash) {
          e.preventDefault();
          e.stopPropagation();
          lenis.scrollTo(url.hash);
          window.history.replaceState(null, "", url.pathname + url.search + url.hash);
        }
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      lenis.stop();
      gsap.to(overlay, {
        scaleY: 1,
        duration: 0.6,
        ease: "power4.inOut",
        transformOrigin: "bottom",
        onComplete: () => {
          router.push(url.pathname + url.search + url.hash);
        },
      });
    };
    document.addEventListener("click", onClick, true);
    cleanups.push(() => {
      document.removeEventListener("click", onClick, true);
      overlay.remove();
    });

    // ---- motion setup (name + parallax + reveals + grids + counters) ----
    const ctx = gsap.context(() => {
      // nav entrance on load
      if (nav) {
        gsap.from(nav, {
          y: -40,
          opacity: 0,
          duration: 0.6,
          ease: "power4.out",
          clearProps: "transform,opacity",
        });
      }

      // progress bars
      gsap.utils.toArray<HTMLElement>("[data-progress]").forEach((el) => {
        gsap.from(el, { width: "0%", duration: 1.2, ease: "power2.out" });
      });

      // 1/2 — masked line reveal (SplitType)
      gsap.utils.toArray<HTMLElement>("[data-reveal-text]").forEach((el) => {
        const split = new SplitType(el, { types: "lines" });
        const lines = split.lines ?? [];
        lines.forEach((line) => {
          line.style.overflow = "hidden";
          const inner = document.createElement("div");
          inner.innerHTML = line.innerHTML;
          line.innerHTML = "";
          line.appendChild(inner);
        });
        gsap.from(lines.map((l) => l.firstChild) as Element[], {
          yPercent: 110,
          duration: 1,
          stagger: 0.08,
          ease: "power4.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });

      // character reveal
      gsap.utils.toArray<HTMLElement>("[data-reveal-chars]").forEach((el) => {
        const split = new SplitType(el, { types: "chars" });
        gsap.from((split.chars ?? []) as Element[], {
          opacity: 0,
          y: 20,
          stagger: 0.02,
          duration: 0.6,
          scrollTrigger: { trigger: el, start: "top 90%" },
        });
      });

      // generic fade-up reveal
      gsap.utils.toArray<HTMLElement>("[data-reveal-fade]").forEach((el) => {
        gsap.from(el, {
          y: 28,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });

      // staggered grid cards
      gsap.utils.toArray<HTMLElement>("[data-grid]").forEach((el) => {
        gsap.from(gsap.utils.toArray<HTMLElement>(el.children), {
          y: 60,
          opacity: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 80%" },
        });
      });

      // parallax layers
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const speed = parseFloat(el.dataset.parallax || "0.3");
        gsap.to(el, {
          yPercent: -100 * speed,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      // stat counters
      gsap.utils.toArray<HTMLElement>("[data-counter]").forEach((el) => {
        const target = parseInt(el.dataset.counter || "0", 10);
        const state = { n: 0 };
        gsap.to(state, {
          n: target,
          duration: 2,
          ease: "power1.out",
          onUpdate() {
            el.textContent = Math.round(state.n).toLocaleString("fr-FR");
          },
          scrollTrigger: { trigger: el, start: "top 90%" },
        });
      });

      // image wipe reveal
      gsap.utils.toArray<HTMLElement>("[data-reveal-image]").forEach((el) => {
        const img = el.querySelector("img");
        if (!img) return;
        gsap.from(img, {
          scale: 1.3,
          clipPath: "inset(15% 15% 15% 15%)",
          duration: 1.4,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 80%" },
        });
      });

      // svg line draw
      gsap.utils.toArray<SVGPathElement>("path[data-draw]").forEach((path) => {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 1.5,
          ease: "power2.inOut",
          scrollTrigger: { trigger: path, start: "top 85%" },
        });
      });

      // magnetic buttons
      gsap.utils.toArray<HTMLElement>("[data-magnetic]").forEach((btn) => {
        const mx = gsap.quickTo(btn, "x", { duration: 0.3, ease: "power3" });
        const my = gsap.quickTo(btn, "y", { duration: 0.3, ease: "power3" });
        const onMove = (e: MouseEvent) => {
          const r = btn.getBoundingClientRect();
          mx((e.clientX - r.left - r.width / 2) * 0.3);
          my((e.clientY - r.top - r.height / 2) * 0.3);
        };
        const onLeave = () => {
          gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.3)" });
        };
        btn.addEventListener("mousemove", onMove);
        btn.addEventListener("mouseleave", onLeave);
        cleanups.push(() => {
          btn.removeEventListener("mousemove", onMove);
          btn.removeEventListener("mouseleave", onLeave);
        });
      });
    }, document.documentElement);

    cleanups.push(() => {
      try {
        revealRef.current = null;
      } catch {
        /* noop */
      }
      ctx.revert();
      ScrollTrigger.killAll();
    });

    return () => {
      cleanups.forEach((fn) => {
        try {
          fn();
        } catch {
          /* noop */
        }
      });
    };
  }, [router]);

  // Once the router commits a different route, roll the transition overlay
  // back off and re-enable smooth scroll (see `reveal` in the effect above).
  useEffect(() => {
    if (lastPathRef.current === null) {
      lastPathRef.current = pathname;
      return;
    }
    if (lastPathRef.current !== pathname) {
      lastPathRef.current = pathname;
      revealRef.current?.();
    }
  }, [pathname]);

  return null;
}