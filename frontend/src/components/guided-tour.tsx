import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride'
import { useTourStore } from '@/stores/tour-store'
import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

interface TourStep extends Step {
  route?: string;
}

const steps: TourStep[] = [
  {
    target: 'body',
    route: '/builder',
    content: 'Welcome to the Aspirational Builder Dashboard! Let me take you on a guided tour across the entire platform, showing you what comes first and goes last.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '#tour-portfolio',
    route: '/builder',
    content: 'First is the Overview page. Create a new Active Project and start your journey here.',
    placement: 'bottom',
  },
  {
    target: 'body',
    route: '/builder/design-drafting',
    content: 'Step 1: Design Drafting. Once you have a project, request architectural drawings from professionals or generate them using our AI.',
    placement: 'center',
  },
  {
    target: 'body',
    route: '/builder/measurements',
    content: 'Step 2: Measurements & BOQs. Upload your approved plans here to automatically extract the precise building quantities.',
    placement: 'center',
  },
  {
    target: 'body',
    route: '/builder/procurement',
    content: 'Step 3: Procurement. Use your extracted BOQ to request materials and services from verified suppliers.',
    placement: 'center',
  },
  {
    target: 'body',
    route: '/builder/building-phase',
    content: 'Step 4: Building Phase. As construction begins, track your progress, tasks, and daily logs here.',
    placement: 'center',
  },
  {
    target: 'body',
    route: '/builder/payments',
    content: 'Step 5: Payments. Finally, safely release milestone payments via the Escrow Vault as your project completes.',
    placement: 'center',
  },
  {
    target: 'body',
    route: '/builder',
    content: 'That concludes the tour! You can always restart it from the Settings. Happy Building!',
    placement: 'center',
  }
]

export function GuidedTour() {
  const { isTourActive, hasSeenTour, tourEnabledInSettings, stepIndex, setStepIndex, finishTour, startTour } = useTourStore()
  const [isMounted, setIsMounted] = useState(false)
  const navigate = useNavigate()

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
    const { action, index, status, type } = data
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED]

    if (finishedStatuses.includes(status)) {
      finishTour()
    } else if (type === 'step:after' || type === 'error') {
      const nextIndex = index + (action === 'prev' ? -1 : 1)
      
      const nextStep = steps[nextIndex]
      if (nextStep && nextStep.route && nextStep.route !== window.location.pathname) {
          navigate({ to: nextStep.route as any })
      }

      setStepIndex(nextIndex)
    }
  }

  return (
    <Joyride
      stepIndex={stepIndex}
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
