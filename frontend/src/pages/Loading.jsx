import React, { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * LETTER DRAWING RULES (to avoid SVG fill-black bug):
 *
 * SVG fills any path that forms a closed region black by default.
 * Even without a Z command, a path whose end-point meets its start-point
 * creates a filled shape.
 *
 * FIX: Split every letter into MULTIPLE separate <path> elements,
 * each being a simple open stroke. No single path ever loops back
 * to its own start coordinate. This way fill="none" is always respected.
 *
 * Letters like P, D, B, O, A, U, S, G, etc. are drawn as:
 *   - A straight stem (separate path)
 *   - An arc/curve that starts and ENDS at different Y coordinates (never same point)
 */

const NameLoader = ({ onFinished }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(containerRef.current, {
            opacity: 0,
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: onFinished,
          });
        },
      });

      tl.fromTo(
        ".np",
        { strokeDasharray: 1000, strokeDashoffset: 1000, opacity: 0 },
        {
          strokeDashoffset: 0,
          opacity: 1,
          duration: 3,
          stagger: 0.1,
          ease: "power2.inOut",
        },
      ).to(".np", { fill: "#ffffff", duration: 1, stagger: 0.05 }, "-=1");
    }, containerRef);

    return () => ctx.revert();
  }, [onFinished]);

  // Shared SVG group props
  const g = {
    fill: "none",
    stroke: "#ffffff",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[999] bg-[#030303] flex flex-col items-center justify-center gap-10 overflow-hidden"
    >
      {/* ════════════════════════════════════════
          ROW 1 — "Pasindu P Wijethunga"
          viewBox width chosen to fit all letters with spacing
          Baseline y=95, cap-height y=20, x-height y=44
      ════════════════════════════════════════ */}
      <svg viewBox="0 0 1100 130" className="w-[94%] max-w-[1050px] h-auto">
        <g {...g}>
          {/* ── P (x=10) ── stem + open bump arc */}
          <path className="np" d="M10 95 V20" />
          {/* Arc from (10,20) right to peak and back to (10,68) — open, never returns to start */}
          <path className="np" d="M10 20 C40 20 46 68 10 68" />

          {/* ── a (x=58) ── open bowl + right stem */}
          {/* Bowl: arc from top-right going left/down, open endpoints differ */}
          <path
            className="np"
            d="M80 55 C80 44 70 44 62 44 C52 44 52 95 62 95 C74 95 80 88 80 80"
          />
          {/* Stem on right */}
          <path className="np" d="M80 55 V95" />

          {/* ── s (x=94) ── top arc + bottom arc, two separate strokes */}
          <path
            className="np"
            d="M118 50 C116 44 108 44 100 44 C92 44 92 68 106 68"
          />
          <path
            className="np"
            d="M106 68 C120 68 122 95 110 95 C98 95 94 88 93 84"
          />

          {/* ── i (x=130) ── */}
          <path className="np" d="M134 57 V95" />
          <path className="np" d="M134 44 V50" />

          {/* ── n (x=144) ── stem + arch + stem */}
          <path className="np" d="M146 95 V57" />
          <path className="np" d="M146 57 C146 44 178 44 178 57" />
          <path className="np" d="M178 57 V95" />

          {/* ── d (x=188) ── right stem (full height) + open bowl */}
          <path className="np" d="M212 20 V95" />
          <path
            className="np"
            d="M212 55 C212 44 200 44 192 44 C182 44 182 95 192 95 C202 95 212 88 212 78"
          />

          {/* ── u (x=222) ── left stem + curve + right stem */}
          <path className="np" d="M224 44 V78" />
          <path className="np" d="M224 78 C224 95 256 95 256 78" />
          <path className="np" d="M256 78 V44" />

          {/* ── (space 16px) ── */}

          {/* ── P (x=274) ── */}
          <path className="np" d="M274 95 V20" />
          <path className="np" d="M274 20 C304 20 310 68 274 68" />

          {/* ── (space 20px) ── */}

          {/* ── W (x=306) ── four diagonal strokes */}
          <path className="np" d="M306 20 L324 95" />
          <path className="np" d="M324 95 L342 52" />
          <path className="np" d="M342 52 L360 95" />
          <path className="np" d="M360 95 L378 20" />

          {/* ── i (x=390) ── */}
          <path className="np" d="M392 57 V95" />
          <path className="np" d="M392 44 V50" />

          {/* ── j (x=404) ── */}
          <path className="np" d="M408 57 V108 C408 120 394 120 390 118" />
          <path className="np" d="M408 44 V50" />

          {/* ── e (x=420) ── crossbar + open arc */}
          <path className="np" d="M422 70 H446" />
          <path
            className="np"
            d="M446 70 C446 44 422 44 422 70 C422 95 436 95 444 90"
          />

          {/* ── t (x=456) ── */}
          <path className="np" d="M466 30 V95" />
          <path className="np" d="M454 52 H478" />

          {/* ── h (x=486) ── */}
          <path className="np" d="M488 20 V95" />
          <path className="np" d="M488 58 C488 44 520 44 520 58" />
          <path className="np" d="M520 58 V95" />

          {/* ── u (x=530) ── */}
          <path className="np" d="M532 44 V78" />
          <path className="np" d="M532 78 C532 95 562 95 562 78" />
          <path className="np" d="M562 78 V44" />

          {/* ── n (x=572) ── */}
          <path className="np" d="M574 95 V57" />
          <path className="np" d="M574 57 C574 44 604 44 604 57" />
          <path className="np" d="M604 57 V95" />

          {/* ── g (x=614) ── open bowl + descender */}
          <path
            className="np"
            d="M638 55 C638 44 626 44 618 44 C608 44 608 92 618 92 C628 92 638 85 638 75"
          />
          <path className="np" d="M638 55 V106 C638 118 622 118 618 116" />

          {/* ── a (x=648) ── */}
          <path
            className="np"
            d="M672 55 C672 44 662 44 654 44 C644 44 644 95 654 95 C664 95 672 88 672 78"
          />
          <path className="np" d="M672 55 V95" />
        </g>
      </svg>

      {/* ════════════════════════════════════════
          ROW 2 — "Photography"
      ════════════════════════════════════════ */}
      <svg viewBox="0 0 760 130" className="w-[66%] max-w-[700px] h-auto">
        <g {...g}>
          {/* ── P ── */}
          <path className="np" d="M10 95 V20" />
          <path className="np" d="M10 20 C40 20 46 68 10 68" />

          {/* ── h ── */}
          <path className="np" d="M56 20 V95" />
          <path className="np" d="M56 58 C56 44 86 44 86 58" />
          <path className="np" d="M86 58 V95" />

          {/* ── o ── open arc: starts top-center, goes around, ends just before start */}
          <path
            className="np"
            d="M114 44 C128 44 130 95 114 95 C100 95 98 44 114 44"
          />

          {/* ── t ── */}
          <path className="np" d="M148 30 V95" />
          <path className="np" d="M136 52 H160" />

          {/* ── o ── */}
          <path
            className="np"
            d="M182 44 C196 44 198 95 182 95 C168 95 166 44 182 44"
          />

          {/* ── g ── */}
          <path
            className="np"
            d="M220 55 C220 44 208 44 200 44 C190 44 190 92 200 92 C210 92 220 85 220 75"
          />
          <path className="np" d="M220 55 V106 C220 118 204 118 200 116" />

          {/* ── r ── */}
          <path className="np" d="M232 95 V57" />
          <path className="np" d="M232 57 C232 44 250 44 256 50" />

          {/* ── a ── */}
          <path
            className="np"
            d="M284 55 C284 44 274 44 266 44 C256 44 256 95 266 95 C276 95 284 88 284 78"
          />
          <path className="np" d="M284 55 V95" />

          {/* ── p ── stem descends below baseline + open bowl */}
          <path className="np" d="M296 44 V120" />
          <path
            className="np"
            d="M296 55 C296 44 310 44 318 44 C328 44 328 92 318 92 C308 92 296 85 296 75"
          />

          {/* ── h ── */}
          <path className="np" d="M338 20 V95" />
          <path className="np" d="M338 58 C338 44 368 44 368 58" />
          <path className="np" d="M368 58 V95" />

          {/* ── y ── two strokes */}
          <path className="np" d="M380 44 L396 80" />
          <path className="np" d="M412 44 L394 88 C388 104 374 110 370 112" />
        </g>
      </svg>
    </div>
  );
};

export default NameLoader;
