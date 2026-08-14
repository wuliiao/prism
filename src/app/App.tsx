import { AudioEngineProvider } from '@entities/audio'
import { PlayerPage } from '@pages/player'

export function App() {
  return (
    <AudioEngineProvider>
      <PlayerPage />
    </AudioEngineProvider>
  )
}
