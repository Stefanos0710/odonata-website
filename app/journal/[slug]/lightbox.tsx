"use client";

import { useEffect, useRef, useState } from "react";

// Opens images in .prose full screen. Without JS the links still open the image directly.
export function Lightbox() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [images, setImages] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const links = [...document.querySelectorAll<HTMLAnchorElement>(".prose a.zoom")];
    setImages(links.map((a) => a.getAttribute("href")!));
    const handlers = links.map((a, i) => {
      const open = (ev: MouseEvent) => {
        if (ev.metaKey || ev.ctrlKey) return;
        ev.preventDefault();
        setIndex(i);
        dialog.current?.showModal();
      };
      a.addEventListener("click", open);
      return () => a.removeEventListener("click", open);
    });
    return () => handlers.forEach((off) => off());
  }, []);

  const go = (step: number) => setIndex((i) => (i + step + images.length) % images.length);

  return (
    <dialog
      ref={dialog}
      className="lightbox"
      aria-label="Image viewer"
      onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
    >
      {images[index] && <img src={images[index]} alt={`Image ${index + 1} of ${images.length}`} />}
      <div className="lightbox-bar">
        <button type="button" onClick={() => go(-1)}>Previous</button>
        <span>{index + 1} / {images.length}</span>
        <button type="button" onClick={() => go(1)}>Next</button>
        <button type="button" onClick={() => dialog.current?.close()}>Close</button>
      </div>
    </dialog>
  );
}
