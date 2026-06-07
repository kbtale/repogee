import { createSignal, onMount, Switch, Match, Show } from 'solid-js'
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
  const [selectedRepo, setSelectedRepo] = createSignal<string | null>(null)
  const [theme, setTheme] = createSignal<'dark' | 'light'>('dark')
  const [installModalUrl, setInstallModalUrl] = createSignal<string | null>(null)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

  onMount(async () => {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme as 'dark' | 'light')
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }

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
        
        const activeOnboarded = reposData.find((r: Repo) => r.onboarded)
        if (activeOnboarded) {
          setSelectedRepo(activeOnboarded.full_name)
        }

        setView('setup')
      } catch (err) {
        localStorage.removeItem('token')
        setView('landing')
      } finally {
        setLoading(false)
      }
    }
  })

  const toggleTheme = () => {
    const next = theme() === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    if (next === 'light') {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }
  }

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
      setSelectedRepo(repoFullName)
    } else {
      const errText = await res.text();
      console.error("Onboarding failed:", res.status, errText);
      try {
        const errJson = JSON.parse(errText);
        if (errJson.error === 'not_installed' && errJson.install_url) {
          setInstallModalUrl(errJson.install_url);
          return;
        }
      } catch (_) {}
      alert(`Failed to connect repository: ${errText || res.statusText}`);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setRepos([])
    setSelectedRepo(null)
    setView('landing')
  }

  return (
    <>
      <Switch>
        <Match when={loading()}>
          <div class="min-h-screen bg-theme-bg flex flex-col items-center justify-center text-theme-primary font-hind">
            <span class="animate-spin i-ph-circle-notch-bold text-4xl text-theme-accent mb-4"></span>
            <p class="text-theme-secondary font-molengo text-lg">Authenticating with GitHub...</p>
          </div>
        </Match>
        <Match when={view() === 'landing' && !loading()}>
          <LandingView onLogin={handleLogin} theme={theme()} onToggleTheme={toggleTheme} />
        </Match>
        <Match when={view() === 'setup' && !loading() && user()}>
          <SetupView
            user={user()!}
            repos={repos()}
            theme={theme()}
            onToggleTheme={toggleTheme}
            onOnboard={handleOnboard}
            onViewLeaderboard={(repoFullName) => {
              setSelectedRepo(repoFullName)
              setView('leaderboard')
            }}
            onLogout={handleLogout}
          />
        </Match>
        <Match when={view() === 'leaderboard' && !loading() && user() && selectedRepo()}>
          <LeaderboardView
            user={user()!}
            selectedRepo={selectedRepo()!}
            theme={theme()}
            onToggleTheme={toggleTheme}
            onBack={() => setView('setup')}
            onLogout={handleLogout}
          />
        </Match>
      </Switch>

      <Show when={installModalUrl()}>
        {(url) => (
          <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
            <div class="bg-theme-card border border-theme-border rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl flex flex-col gap-6">
              <div>
                <h3 class="font-montserrat text-xl font-extrabold text-theme-primary mb-2 uppercase tracking-wide">
                  GitHub App Access Required
                </h3>
                <p class="text-xs text-theme-secondary font-hind leading-relaxed">
                  The Repogee GitHub App is not installed on this repository. Please configure the app on GitHub to select this repository and grant access.
                </p>
              </div>
              <div class="flex gap-3 justify-end items-center" style="gap: 0.75rem;">
                <button
                  onClick={() => setInstallModalUrl(null)}
                  class="px-5 py-3 border border-theme-border rounded-full font-montserrat font-bold text-[10px] tracking-widest uppercase text-theme-secondary hover:bg-theme-border-sub hover:text-theme-primary transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    window.open(url(), '_blank');
                    setInstallModalUrl(null);
                  }}
                  class="px-5 py-3 bg-theme-accent hover:bg-theme-primary hover:text-theme-bg text-[#070A13] rounded-full font-montserrat font-bold text-[10px] tracking-widest uppercase transition-all cursor-pointer"
                >
                  Open Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </Show>
    </>
  )
}
