// src/hooks/useImageAspectRatio.ts
// Reads an <img>'s natural width/height so its container can be given a
// matching CSS aspect-ratio. When the container's proportions exactly
// match the image, object-contain never needs to letterbox it — the image
// always fills the box exactly — so a marker's x/y as a plain % of the
// container is also its % of the image, with no correction needed and
// nothing that can drift between two different layouts (an admin preview
// vs. a live slide's flex-stretched column) the way a fixed or
// externally-driven box shape would.
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function useImageAspectRatio(src: string) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);

  const readNaturalSize = useCallback(() => {
    const img = imgRef.current;
    if (img && img.naturalWidth && img.naturalHeight) {
      setAspectRatio(img.naturalWidth / img.naturalHeight);
      return true;
    }
    return false;
  }, []);

  // A browser-cached image can finish loading before this effect's onLoad
  // listener is wired up, so `load` never fires for it — check `.complete`
  // (true for an already-decoded image) as a fallback whenever `src`
  // changes, on top of the onLoad handler below.
  useEffect(() => {
    setAspectRatio(undefined);
    if (imgRef.current?.complete) readNaturalSize();
  }, [src, readNaturalSize]);

  return { imgRef, onImgLoad: readNaturalSize, aspectRatio };
}
