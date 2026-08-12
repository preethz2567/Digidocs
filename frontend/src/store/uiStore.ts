import { create } from 'zustand';

interface UiState {
  isCommandPaletteOpen: boolean;
  isUploadModalOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  setUploadModalOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isCommandPaletteOpen: false,
  isUploadModalOpen: false,
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  setUploadModalOpen: (open) => set({ isUploadModalOpen: open }),
}));
