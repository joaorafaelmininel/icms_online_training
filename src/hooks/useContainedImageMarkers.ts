// src/hooks/useContainedImageMarkers.ts
// Positions hotspot markers against the actual rendered image content inside
// an `object-contain` box, not the box itself. A box using object-contain
// almost never has the same aspect ratio as the image, so it letterboxes —
// blank space above/below or left/right. Positioning markers as a plain %
// of the box (as this app used to) puts them in different visual spots
// depending on how tall/wide the surrounding container happens to be
// (which, in the live slide, is stretched by its flex/grid row to match a
// sibling text column of varying height per slide — something an isolated
// admin-panel preview can never reproduce). Measuring the image's own
// rendered rect makes marker placement correct regardless of container
// shape, so admin and student always agree.
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface ContainedBox {
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
}

export function useContainedImageMarkers(imgSrc: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [box, setBox] = useState<ContainedBox | null>(null);

  const recompute = useCallback(() => {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container || !img.naturalWidth || !img.naturalHeight) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    if (!cw || !ch) return;

    const containerRatio = cw / ch;
    const imageRatio = img.naturalWidth / img.naturalHeight;

    let w: number, h: number, offX: number, offY: number;
    if (imageRatio > containerRatio) {
      // Image is proportionally wider than its box — letterboxed top/bottom.
      w = cw;
      h = cw / imageRatio;
      offX = 0;
      offY = (ch - h) / 2;
    } else {
      // Image is proportionally taller/narrower — letterboxed left/right.
      h = ch;
      w = ch * imageRatio;
      offY = 0;
      offX = (cw - w) / 2;
    }

    setBox({
      leftPct: (offX / cw) * 100,
      topPct: (offY / ch) * 100,
      widthPct: (w / cw) * 100,
      heightPct: (h / ch) * 100,
    });
  }, []);

  useEffect(() => {
    recompute();
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(recompute);
    ro.observe(container);
    return () => ro.disconnect();
  }, [recompute, imgSrc]);

  /** CSS left/top (% of the container) for a marker at x/y (% of the image). */
  function markerStyle(x: number, y: number): { left: string; top: string } {
    if (!box) return { left: `${x}%`, top: `${y}%` };
    return {
      left: `${box.leftPct + (x / 100) * box.widthPct}%`,
      top: `${box.topPct + (y / 100) * box.heightPct}%`,
    };
  }

  /** Convert a click's container-relative % into x/y (% of the image), clamped to [0,100]. */
  function pointToImageXY(clientX: number, clientY: number): { x: number; y: number } {
    const container = containerRef.current;
    if (!container || !box) return { x: 50, y: 50 };
    const rect = container.getBoundingClientRect();
    const containerXPct = ((clientX - rect.left) / rect.width) * 100;
    const containerYPct = ((clientY - rect.top) / rect.height) * 100;
    const x = ((containerXPct - box.leftPct) / box.widthPct) * 100;
    const y = ((containerYPct - box.topPct) / box.heightPct) * 100;
    return { x: Math.min(100, Math.max(0, Math.round(x))), y: Math.min(100, Math.max(0, Math.round(y))) };
  }

  return { containerRef, imgRef, onImgLoad: recompute, markerStyle, pointToImageXY };
}
