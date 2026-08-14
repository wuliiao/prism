import { ToastProvider } from '@shared/ui/Toast'
import { AudioEngineProvider } from '@entities/audio'
import { PlayerPage } from '@pages/player'

export function App() {
  return (
    <ToastProvider>
      <AudioEngineProvider>
        <PlayerPage />
      </AudioEngineProvider>
    </ToastProvider>
  )
}
