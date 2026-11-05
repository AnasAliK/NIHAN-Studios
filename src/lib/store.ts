import { create } from 'zustand';

interface LightboxState {
  images: string[];
  index: number;
  caption: string;
}

interface UIState {
  loaded: boolean;
  hover: string | null;
  lightbox: LightboxState | null;
  setLoaded: () => void;
  setHover: (label: string | null) => void;
  openLightbox: (images: string[], index: number, caption: string) => void;
  stepLightbox: (dir: number) => void;
  closeLightbox: () => void;
}

export const useUI = create<UIState>((set) => ({
  loaded: false,
  hover: null,
  lightbox: null,
  setLoaded: () => set({ loaded: true }),
  setHover: (hover) => set({ hover }),
  openLightbox: (images, index, caption) => set({ lightbox: { images, index, caption }, hover: null }),
  stepLightbox: (dir) =>
    set((s) =>
      s.lightbox
        ? { lightbox: { ...s.lightbox, index: (s.lightbox.index + dir + s.lightbox.images.length) % s.lightbox.images.length } }
        : s,
    ),
  closeLightbox: () => set({ lightbox: null }),
}));
