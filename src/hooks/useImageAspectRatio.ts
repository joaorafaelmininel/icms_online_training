// src/hooks/useImageAspectRatio.ts
// Reads an <img>'s natural width/height once it loads, so its container can
// be given a matching CSS aspect-ratio. When the container's proportions
// exactly match the image, object-contain never needs to letterbox it —
// the image always fills the box exactly — so a marker's x/y as a plain %
// of the container is also its % of the image, with no correction needed
// and nothing that can drift between two different layouts (an admin
// preview vs. a live slide's flex-stretched column) the way a fixed or
// externally-driven box shape would.
'use client';

import { useCallback, useRef, useState } from 'react';

export function useImageAspectRatio() {
  const imgRef = useRef<HTMLImageElement>(null);
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);

  const onImgLoad = useCallback(() => {
    const img = imgRef.current;
    if (img && img.naturalWidth && img.naturalHeight) {
      setAspectRatio(img.naturalWidth / img.naturalHeight);
    }
  }, []);

  return { imgRef, onImgLoad, aspectRatio };
}
