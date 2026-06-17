import { create } from 'zustand'

interface UIState {
  isMobileMenuOpen: boolean
  activeModal: string | null
  toastMessage: string | null
  toastType: 'success' | 'error' | 'info'

  setMobileMenuOpen: (value: boolean) => void
  openModal: (modalId: string) => void
  closeModal: () => void
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  hideToast: () => void
}

export const useUIStore = create<UIState>()((set) => ({
  isMobileMenuOpen: false,
  activeModal: null,
  toastMessage: null,
  toastType: 'info',

  setMobileMenuOpen: (value) => set({ isMobileMenuOpen: value }),
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
  showToast: (message, type = 'info') => set({ toastMessage: message, toastType: type }),
  hideToast: () => set({ toastMessage: null }),
}))
