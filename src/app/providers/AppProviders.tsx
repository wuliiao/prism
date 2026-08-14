import type { ReactNode } from 'react'
import { ToastProvider } from '@shared/ui/Toast'
import { AudioEngineProvider } from '@entities/audio'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AudioEngineProvider>{children}</AudioEngineProvider>
    </ToastProvider>
  )
}
