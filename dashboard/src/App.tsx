import { createSignal, onMount, Switch, Match } from 'solid-js'
import LandingView from './views/LandingView'
import SetupView from './views/SetupView'
import LeaderboardView from './views/LeaderboardView'

interface Repo {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  onboarded: boolean
}

export default function App() {
  const [view, setView] = createSignal<'landing' | 'setup' | 'leaderboard'>('landing')
  const [loading, setLoading] = createSignal(false)
  const [user, setUser] = createSignal<{ login: string; avatar_url: string; name: string | null } | null>(null)
  const [repos, setRepos] = createSignal<Repo[]>([])

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

  onMount(async () => {
    const params = new URLSearchParams(window.location.search)
    const tokenParam = params.get('token')

    if (tokenParam) {
      localStorage.setItem('token', tokenParam)
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    const token = localStorage.getItem('token')
    if (token) {
      setLoading(true)
      try {
        const userRes = await fetch('https://api.github.com/user', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!userRes.ok) throw new Error()
        const userData = await userRes.json()
        setUser({
          login: userData.login,
          avatar_url: userData.avatar_url,
          name: userData.name,
        })

        const reposRes = await fetch(`${API_URL}/api/repos`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!reposRes.ok) throw new Error()
        const reposData = await reposRes.json()
        setRepos(reposData)
        setView('setup')
      } catch (err) {
        localStorage.removeItem('token')
        setView('landing')
      } finally {
        setLoading(false)
      }
    }
  })

  const handleLogin = () => {
    window.location.href = `${API_URL}/login`
  }

  const handleOnboard = async (repoFullName: string) => {
    const token = localStorage.getItem('token')
    if (!token) return

    const res = await fetch(`${API_URL}/api/onboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ repo_full_name: repoFullName }),
    })

    if (res.ok) {
      setRepos(
        repos().map((r) =>
          r.full_name === repoFullName ? { ...r, onboarded: true } : r
        )
      )
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setRepos([])
    setView('landing')
  }

  return (
    <Switch>
      <Match when={loading()}>
        <div class="min-h-screen bg-black flex flex-col items-center justify-center text-ghostWhite font-hind">
          <span class="animate-spin i-ph-circle-notch-bold text-4xl text-coral mb-4"></span>
          <p class="text-glaucous font-molengo text-lg">Authenticating with GitHub...</p>
        </div>
      </Match>
      <Match when={view() === 'landing' && !loading()}>
        <LandingView onLogin={handleLogin} />
      </Match>
      <Match when={view() === 'setup' && !loading() && user()}>
        <SetupView
          user={user()!}
          repos={repos()}
          onOnboard={handleOnboard}
          onViewLeaderboard={() => setView('leaderboard')}
          onLogout={handleLogout}
        />
      </Match>
      <Match when={view() === 'leaderboard' && !loading()}>
        <LeaderboardView
          onBack={() => setView('setup')}
          onLogout={handleLogout}
        />
      </Match>
    </Switch>
  )
}
