"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    __cbMotion?: boolean;
  }
}

// Runs while the HTML is parsed: opts the page into motion before first paint,
// and backs out after 5 s if the reveal logic below never started.
const BOOTSTRAP = `(function(){try{if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;var d=document.documentElement;d.classList.add("anim");window.setTimeout(function(){if(!window.__cbMotion)d.classList.remove("anim")},5000)}catch(e){}})()`;

export function MotionBootstrap() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: BOOTSTRAP }}
    />
  );
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function countUp(el: HTMLElement) {
  const target = Number(el.dataset.count);
  if (!Number.isFinite(target)) return;
  const start = performance.now();
  const frame = (now: number) => {
    const progress = Math.min(1, (now - start) / 1400);
    el.textContent = Math.round(target * easeOut(progress)).toLocaleString("fr-FR");
    if (progress < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function typeText(el: HTMLElement) {
  const text = el.textContent ?? "";
  const box = el.parentElement ?? el;
  box.style.minHeight = `${box.offsetHeight}px`;
  el.textContent = "";
  let length = 0;
  const tick = () => {
    length += 1;
    el.textContent = text.slice(0, length);
    if (length < text.length) window.setTimeout(tick, 30);
  };
  window.setTimeout(tick, Number(el.dataset.typeDelay ?? 0));
}

/**
 * Reveals `data-reveal` / `data-animate` elements once their top edge enters the
 * lower part of the viewport. Checking positions on scroll (rather than only on
 * intersection changes) also reveals everything skipped by an anchor jump.
 */
export function LandingMotion() {
  useEffect(() => {
    if (!document.documentElement.classList.contains("anim")) return;
    window.__cbMotion = true;

    let pending = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal], [data-animate], [data-count], [data-type]"),
    );
    let frame = 0;

    const check = () => {
      frame = 0;
      const limit = window.innerHeight * 0.92;
      const triggered = pending.filter((el) => el.getBoundingClientRect().top < limit);
      if (triggered.length === 0) return;

      // Nested elements belong to their parent's choreography: reveal them together,
      // even if they sit below the fold (their own delays still apply).
      const reveal = new Set(triggered);
      for (const el of pending) {
        if (!reveal.has(el) && triggered.some((parent) => parent.contains(el))) reveal.add(el);
      }

      for (const el of reveal) {
        el.classList.add("is-in");
        if (el.getBoundingClientRect().bottom <= 0) continue;
        if (el.dataset.count !== undefined) countUp(el);
        if (el.dataset.type !== undefined) typeText(el);
      }
      pending = pending.filter((el) => !reveal.has(el));
      if (pending.length === 0) stop();
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };

    function stop() {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("load", schedule);
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("load", schedule);
    document.fonts?.ready.then(schedule);
    schedule();

    return () => {
      stop();
      cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
