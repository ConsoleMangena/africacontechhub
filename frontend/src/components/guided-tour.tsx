import { useEffect } from 'react'
import { useTourStore } from '@/stores/tour-store'

export function GuidedTour() {
  const { isTourActive, hasSeenTour, tourEnabledInSettings, finishTour, startTour } = useTourStore()

  useEffect(() => {
    if (tourEnabledInSettings && !hasSeenTour && !isTourActive) {
      const timeout = setTimeout(() => {
        startTour()
      }, 1000)
      return () => clearTimeout(timeout)
    }
  }, [tourEnabledInSettings, hasSeenTour, isTourActive, startTour])

  useEffect(() => {
    // Temporary no-op tour implementation while react-joyride is incompatible with React 19.
    if (isTourActive) finishTour()
  }, [isTourActive, finishTour])

  return null
}
