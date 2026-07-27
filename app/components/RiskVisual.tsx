"use client";

import { animate, createScope, stagger, svg, waapi } from "animejs";
import { useEffect, useRef } from "react";

const BAR_HEIGHTS = [42, 76, 58, 96, 68, 34];
const PROFILE_POINTS = "25,112 51,65 77,88 103,38 129,72 155,51";
const FACETS = [
  { x: 35, y: 42, size: 11, opacity: .86 },
  { x: 72, y: 29, size: 8, opacity: .38 },
  { x: 134, y: 44, size: 13, opacity: .72 },
  { x: 145, y: 98, size: 7, opacity: .28 },
  { x: 103, y: 127, size: 10, opacity: .58 },
  { x: 42, y: 112, size: 6, opacity: .24 },
];

function Bars() {
  return <g>{BAR_HEIGHTS.map((height, index) => <rect className="audit-mark" key={index} x={25 + index * 22} y={130 - height} width="14" height={height} rx="7" fill="currentColor" opacity={index < 3 ? .9 : .38} />)}</g>;
}

function Rings() {
  return <g transform="rotate(-90 90 82)">{[
    { radius: 55, dash: ".72 1", width: 7, opacity: .9 },
    { radius: 42, dash: ".46 1", width: 5, opacity: .52 },
    { radius: 30, dash: ".28 1", width: 4, opacity: .24 },
  ].map((ring) => <circle className="audit-drawable audit-mark" key={ring.radius} cx="90" cy="82" r={ring.radius} pathLength="1" fill="none" stroke="currentColor" strokeWidth={ring.width} strokeLinecap="round" strokeDasharray={ring.dash} opacity={ring.opacity} />)}</g>;
}

function ExposureMap() {
  return <g>
    <path d="M 90 20 L 150 55 L 150 105 L 90 140 L 30 105 L 30 55 Z" fill="none" stroke="currentColor" opacity=".1" />
    {FACETS.map((facet, index) => {
      const { x, y, size } = facet;
      const node = `M ${x} ${y - size} L ${x + size * .72} ${y} L ${x} ${y + size} L ${x - size * .72} ${y} Z`;
      return <g key={index}>
        <path className="audit-drawable" d={`M 90 81 Q ${(90 + x) / 2 + (index % 2 ? 8 : -8)} ${(81 + y) / 2} ${x} ${y}`} fill="none" stroke="currentColor" strokeWidth=".8" opacity=".2" />
        <path className="audit-mark exposure-node" d={node} fill="currentColor" stroke="currentColor" opacity={facet.opacity} />
      </g>;
    })}
    <path className="audit-mark exposure-core" d="M 90 66 L 104 74 L 104 90 L 90 98 L 76 90 L 76 74 Z" fill="currentColor" opacity=".34" />
  </g>;
}

function Profile() {
  return <g>
    {[42, 72, 102, 132].map((y) => <line key={y} x1="22" y1={y} x2="158" y2={y} stroke="currentColor" opacity=".11" />)}
    <path d={`M ${PROFILE_POINTS} L 155 132 L 25 132 Z`} fill="currentColor" opacity=".09" />
    <polyline className="audit-drawable" points={PROFILE_POINTS} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    {PROFILE_POINTS.split(" ").map((point) => { const [cx, cy] = point.split(","); return <rect className="audit-mark" key={point} x={Number(cx) - 3} y={Number(cy) - 3} width="6" height="6" rx="1" fill="currentColor" />; })}
  </g>;
}

export default function RiskVisual({ description, variant }: { description: string; variant: number }) {
  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);
  const play = () => {
    const element = root.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    scope.current?.revert();
    scope.current = createScope({ root: element }).add(() => {
      waapi.animate(".audit-mark", { opacity: [0.16, (target) => Number((target as Element).getAttribute("opacity") ?? 1)], translateY: [7, 0], scale: [0.9, 1], duration: 620, delay: stagger(48), ease: "out(4)" });
      waapi.animate(".exposure-node", { rotate: [(_target, index) => index % 2 ? -12 : 12, 0], duration: 760, delay: stagger(46), ease: "out(4)" });
      waapi.animate(".exposure-core", { rotate: [-18, 0], scale: [0.72, 1], duration: 820, ease: "out(5)" });
      const drawables = svg.createDrawable(".audit-drawable");
      if (drawables.length) animate(drawables, { draw: ["0 0", "0 1"], duration: 760, delay: stagger(34), ease: "out(3)" });
    });
  };
  useEffect(() => {
    const link = root.current?.closest("a");
    link?.addEventListener("mouseenter", play);
    link?.addEventListener("focus", play);
    return () => { link?.removeEventListener("mouseenter", play); link?.removeEventListener("focus", play); scope.current?.revert(); };
  }, []);
  return <div ref={root} className="risk-visual h-full w-full" role="img" aria-label={description}><svg viewBox="0 0 180 160" className="h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">{variant === 0 ? <Bars /> : null}{variant === 1 ? <Rings /> : null}{variant === 2 ? <ExposureMap /> : null}{variant === 3 ? <Profile /> : null}</svg></div>;
}
