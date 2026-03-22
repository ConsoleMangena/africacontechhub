import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TourState {
  hasSeenTour: boolean
  isTourActive: boolean
  tourEnabledInSettings: boolean
  stepIndex: number
  startTour: () => void
  finishTour: () => void
  toggleTourSetting: (enabled: boolean) => void
  resetTour: () => void
  setStepIndex: (index: number) => void
}

export const useTourStore = create<TourState>()(
  persist(
    (set) => ({
      hasSeenTour: false,
      isTourActive: false,
      tourEnabledInSettings: true,
      stepIndex: 0,
      startTour: () => set({ isTourActive: true, stepIndex: 0 }),
      finishTour: () => set({ isTourActive: false, hasSeenTour: true, stepIndex: 0 }),
      toggleTourSetting: (enabled: boolean) => set({ tourEnabledInSettings: enabled }),
      resetTour: () => set({ hasSeenTour: false, isTourActive: true, tourEnabledInSettings: true, stepIndex: 0 }),
      setStepIndex: (index: number) => set({ stepIndex: index }),
    }),
    {
      name: 'sqb-tour-storage', // name of the item in the storage (must be unique)
    }
  )
)
