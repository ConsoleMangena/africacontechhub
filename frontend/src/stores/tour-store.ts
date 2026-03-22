import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TourState {
  hasSeenTour: boolean
  isTourActive: boolean
  tourEnabledInSettings: boolean
  startTour: () => void
  finishTour: () => void
  toggleTourSetting: (enabled: boolean) => void
  resetTour: () => void
}

export const useTourStore = create<TourState>()(
  persist(
    (set) => ({
      hasSeenTour: false,
      isTourActive: false,
      tourEnabledInSettings: true,
      startTour: () => set({ isTourActive: true }),
      finishTour: () => set({ isTourActive: false, hasSeenTour: true }),
      toggleTourSetting: (enabled: boolean) => set({ tourEnabledInSettings: enabled }),
      resetTour: () => set({ hasSeenTour: false, isTourActive: true, tourEnabledInSettings: true }),
    }),
    {
      name: 'sqb-tour-storage', // name of the item in the storage (must be unique)
    }
  )
)
