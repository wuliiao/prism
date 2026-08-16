import { AppProviders } from './providers/AppProviders'
import { PlayerPage } from '@pages/player'

export function App() {
  return (
    <AppProviders>
      <PlayerPage />
    </AppProviders>
  )
}
