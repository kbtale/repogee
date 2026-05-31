import { createSignal, For } from 'solid-js'

interface Repo {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  onboarded: boolean
}

interface SetupViewProps {
  user: {
    login: string
    avatar_url: string
    name: string | null
  }
  repos: Repo[]
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  onOnboard: (repoFullName: string) => Promise<void>
  onViewLeaderboard: (repoFullName: string) => void
  onLogout: () => void
}

export default function SetupView(props: SetupViewProps) {
  const [searchQuery, setSearchQuery] = createSignal('')
  const [loadingRepo, setLoadingRepo] = createSignal<string | null>(null)

  const filteredRepos = () => {
    const q = searchQuery().toLowerCase().trim()
    if (!q) return props.repos
    return props.repos.filter((repo) =>
      repo.name.toLowerCase().includes(q) ||
      (repo.description && repo.description.toLowerCase().includes(q))
    )
  }

  const handleOnboard = async (repoFullName: string) => {
    setLoadingRepo(repoFullName)
    try {
      await props.onOnboard(repoFullName)
    } finally {
      setLoadingRepo(null)
    }
  }

  return (
    <div class="min-h-screen bg-theme-bg text-theme-primary font-hind flex flex-col transition-colors duration-200">
      <header class="max-w-6xl w-full mx-auto px-6 py-4 mt-4 sticky top-0 z-50">
        <div class="border border-theme-border rounded-full py-3 px-6 flex justify-between items-center bg-theme-card transition-colors duration-200">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-theme-accent flex items-center justify-center shrink-0">
              <span class="i-ph-shield-check-bold text-[#070A13] text-lg"></span>
            </div>
            <span class="font-montserrat font-extrabold text-lg tracking-widest uppercase text-theme-primary">repogee</span>
          </div>

          <div class="flex items-center gap-4">
            <div class="flex items-center gap-3 border-r border-theme-border/20 pr-4">
              <img
                src={props.user.avatar_url}
                alt={props.user.login}
                class="w-7 h-7 rounded-full border border-theme-border/40"
              />
              <div class="hidden sm:block text-left">
                <div class="font-montserrat text-xs font-bold leading-none text-theme-primary">{props.user.name || props.user.login}</div>
                <div class="text-[9px] text-theme-secondary uppercase tracking-widest font-molengo mt-0.5">Contributor</div>
              </div>
            </div>
            <button
              onClick={props.onToggleTheme}
              class="p-2 text-theme-glaucous hover:text-theme-accent transition-colors duration-150 rounded-full hover:bg-theme-border-sub flex items-center justify-center cursor-pointer"
              title="Toggle Theme"
            >
              <span class={props.theme === 'dark' ? "i-ph-sun-bold text-base" : "i-ph-moon-bold text-base"}></span>
            </button>
            <button
              onClick={props.onLogout}
              class="p-2 text-theme-glaucous hover:text-theme-accent transition-colors duration-150 rounded-full hover:bg-theme-border-sub flex items-center justify-center cursor-pointer"
              title="Log Out"
            >
              <span class="i-ph-sign-out-bold text-base"></span>
            </button>
          </div>
        </div>
      </header>

      <main class="flex-1 max-w-6xl w-full mx-auto px-6 py-10 md:py-16">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 class="font-montserrat text-3xl font-extrabold tracking-tight mb-2 text-theme-primary">
              Repository <span class="italic font-bold">Onboarding</span>
            </h1>
            <p class="font-molengo text-lg text-theme-secondary italic">
              Configure gamification settings and generate SCORE.md
            </p>
          </div>

          <div class="relative w-full md:w-80">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 i-ph-magnifying-glass-bold text-theme-glaucous"></span>
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchQuery()}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
              class="w-full pl-11 pr-4 py-3 bg-theme-card border border-theme-border rounded-full text-theme-primary placeholder-theme-glaucous/50 font-hind focus:outline-none focus:border-theme-accent transition-all duration-150 text-sm"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <For
            each={filteredRepos()}
            fallback={
              <div class="col-span-full py-16 text-center border border-dashed border-theme-border rounded-3xl bg-theme-card">
                <span class="i-ph-folder-dotted-bold text-theme-glaucous text-4xl mb-3 block mx-auto"></span>
                <p class="text-theme-secondary font-molengo text-lg italic">No repositories found</p>
              </div>
            }
          >
            {(repo) => (
              <div class="bg-theme-card border border-theme-border rounded-3xl p-6 flex flex-col justify-between hover:border-theme-accent hover:scale-[1.01] hover:shadow-lg transition-all duration-200">
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="flex items-center gap-2 font-montserrat font-extrabold text-sm tracking-wide truncate max-w-[70%] text-theme-primary">
                      <span class={repo.private ? "i-ph-lock-bold text-theme-accent" : "i-ph-globe-bold text-theme-secondary"}></span>
                      {repo.name}
                    </span>
                    <span class={`text-[8px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border ${repo.onboarded ? "bg-theme-accent/10 text-theme-accent border-theme-accent/20" : "bg-theme-border-sub text-theme-secondary border-theme-border"}`}>
                      {repo.onboarded ? "onboarded" : "ready"}
                    </span>
                  </div>
                  <p class="text-xs text-theme-glaucous font-hind line-clamp-2 min-h-[32px] mb-6 leading-relaxed">
                    {repo.description || "No description provided."}
                  </p>
                </div>

                <div>
                  <button
                    disabled={loadingRepo() !== null}
                    onClick={() => repo.onboarded ? props.onViewLeaderboard(repo.full_name) : handleOnboard(repo.full_name)}
                    class={`w-full py-3 px-4 rounded-full font-montserrat font-bold text-[10px] tracking-widest uppercase transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                      repo.onboarded
                        ? "bg-transparent border border-theme-accent text-theme-accent hover:bg-theme-accent hover:text-[#070A13]"
                        : "bg-theme-accent hover:bg-theme-primary hover:text-theme-bg text-[#070A13]"
                    }`}
                  >
                    {loadingRepo() === repo.full_name ? (
                      <span class="flex items-center justify-center gap-2">
                        <span class="animate-spin i-ph-circle-notch-bold"></span>
                        ONBOARDING...
                      </span>
                    ) : repo.onboarded ? (
                      "VIEW LEADERBOARD"
                    ) : (
                      "1-CLICK ONBOARD"
                    )}
                  </button>
                </div>
              </div>
            )}
          </For>
        </div>
      </main>
    </div>
  )
}
