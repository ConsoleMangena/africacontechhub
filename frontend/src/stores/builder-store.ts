import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface BuilderState {
  /** Currently-selected project ID across all builder pages. null = show picker. */
  selectedProjectId: number | null
  selectProject: (projectId: number) => void
  exitProject: () => void
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set) => ({
      selectedProjectId: null,
      selectProject: (projectId) => set({ selectedProjectId: projectId }),
      exitProject: () => set({ selectedProjectId: null }),
    }),
    {
      name: 'builder-active-project',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
