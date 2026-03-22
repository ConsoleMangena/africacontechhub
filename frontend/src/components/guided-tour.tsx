import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride'
import { useTourStore } from '@/stores/tour-store'
import { useEffect, useState } from 'react'

const steps: Step[] = [
  {
    target: 'body',
    content: 'Welcome to the Aspirational Builder Dashboard! Let me give you a quick tour to help you get started building your dream.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '#tour-portfolio',
    content: 'Here is your Portfolio. You can view all your active, planning, and completed construction projects here. Click "Create Project" to start a new one!',
    placement: 'top',
  },
  {
    target: '#tour-ai-chat',
    content: 'Meet your Dzenhare Budget Engineer. Read plans, automatically extract Building Quantities, or chat to generate architectural drawings.',
    placement: 'left',
  },
  {
    target: 'a[href="/builder/design-drafting"]',
    content: 'The Design Drafting hub is where you can upload sketches, request plan redraws, and track your building plan approvals securely.',
    placement: 'right',
  },
  {
    target: '#tour-metrics',
    content: 'Track your overall budget and multi-currency rates here. Stay on top of your financials in real time.',
    placement: 'bottom',
  },
  {
    target: 'a[href="/settings"]',
    content: 'You can always turn this tour on or off or customize your platform here in Settings. Happy building!',
    placement: 'right',
  }
]

export function GuidedTour() {
  const { isTourActive, hasSeenTour, tourEnabledInSettings, finishTour, startTour } = useTourStore()
  const [isMounted, setIsMounted] = useState(false)

  // Ensure hydration matches and check auto-start logic
  useEffect(() => {
    setIsMounted(true)
    if (tourEnabledInSettings && !hasSeenTour && !isTourActive) {
      // Small delay to ensure UI elements are rendered
      const timeout = setTimeout(() => {
        startTour()
      }, 1000)
      return () => clearTimeout(timeout)
    }
  }, [tourEnabledInSettings, hasSeenTour, isTourActive, startTour])

  if (!isMounted) return null

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED]

    if (finishedStatuses.includes(status)) {
      finishTour()
    }
  }

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={isTourActive}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#4f46e5', // Indigo-600
        },
      }}
    />
  )
}
