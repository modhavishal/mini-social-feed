import AppShell from '../shared/components/layout/AppShell'
import { FeedPage, Trending } from '../features/feed'
import Providers from './providers'

export default function App() {
  return (
    <Providers>
      <AppShell aside={<Trending />}>
        <FeedPage />
      </AppShell>
    </Providers>
  )
}