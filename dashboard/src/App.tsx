import { createSignal, onMount, Switch, Match, Show, createEffect } from 'solid-js'
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
  const [installModalRepo, setInstallModalRepo] = createSignal<string | null>(null)
  const [toastMessage, setToastMessage] = createSignal<string | null>(null)

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => {
      if (toastMessage() === message) {
        setToastMessage(null)
      }
    }, 4000)
  }

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

  createEffect(() => {
    view()
    window.scrollTo({ top: 0, behavior: 'instant' })
  })

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
      const wasOnboarded = repos().find((r) => r.full_name === repoFullName)?.onboarded
      setRepos(
        repos().map((r) =>
          r.full_name === repoFullName ? { ...r, onboarded: true } : r
        )
      )
      setSelectedRepo(repoFullName)
      if (wasOnboarded) {
        showToast('Workflow updated!')
      }
    } else {
      const errText = await res.text();
      console.error("Onboarding failed:", res.status, errText);
      try {
        const errJson = JSON.parse(errText);
        if (errJson.error === 'not_installed' && errJson.install_url) {
          setInstallModalRepo(repoFullName)
          setInstallModalUrl(errJson.install_url)
          return
        }
      } catch (_) {}
      showToast(`Failed to connect repository: ${errText || res.statusText}`);
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
        <Match when={!loading()}>
          <div class="relative w-full overflow-x-hidden min-h-screen">
            <div
              class="transition-transform duration-500 ease-out flex w-[300%]"
              style={{
                transform: `translateX(-${
                  view() === 'landing' ? '0%' : view() === 'setup' ? '33.333333%' : '66.666667%'
                })`
              }}
            >
              <div class="w-1/3 shrink-0 min-h-screen">
                <LandingView onLogin={handleLogin} theme={theme()} onToggleTheme={toggleTheme} />
              </div>
              <div class="w-1/3 shrink-0 min-h-screen">
                <Show when={user()}>
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
                </Show>
              </div>
              <div class="w-1/3 shrink-0 min-h-screen">
                <Show when={selectedRepo()}>
                  <LeaderboardView
                    user={user()!}
                    selectedRepo={selectedRepo()!}
                    theme={theme()}
                    onToggleTheme={toggleTheme}
                    onBack={() => setView('setup')}
                    onLogout={handleLogout}
                  />
                </Show>
              </div>
            </div>
          </div>
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
                  To connect <strong class="text-theme-primary">{installModalRepo()}</strong>, please click <strong class="text-theme-primary">Open Settings</strong>. On GitHub, select your account or organization. Under <strong class="text-theme-primary">Repository access</strong>, choose <strong class="text-theme-primary">All repositories</strong> or add <strong class="text-theme-primary">{installModalRepo()?.split('/')[1]}</strong> to the list of selected repositories. You can add multiple repositories at the same time.
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
                    const repoName = installModalRepo();
                    setInstallModalUrl(null);
                    if (repoName) {
                      const onFocus = () => {
                        window.removeEventListener('focus', onFocus);
                        handleOnboard(repoName);
                      };
                      setTimeout(() => {
                        window.addEventListener('focus', onFocus);
                      }, 1000);
                    }
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

      <Show when={toastMessage()}>
        {(msg) => (
          <div class="fixed bottom-6 right-6 z-[110]">
            <div class="bg-theme-card border border-theme-border/60 rounded-2xl px-5 py-3.5 shadow-2xl flex items-center gap-3 backdrop-blur-md">
              <span class="w-2 h-2 rounded-full bg-theme-accent shrink-0 animate-ping"></span>
              <p class="font-hind text-xs font-bold text-theme-primary">{msg()}</p>
              <button
                onClick={() => setToastMessage(null)}
                class="ml-2 text-theme-secondary hover:text-theme-primary transition-colors text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </Show>
    </>
  )
}
