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
    <div class="min-h-screen bg-theme-bg text-theme-primary font-hind flex flex-col transition-colors duration-200 overflow-x-hidden pb-12">
      <header class="max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 mt-2 sm:mt-4 sticky top-0 z-50">
        <div class="border border-theme-border rounded-full py-2.5 px-4 sm:px-6 flex justify-between items-center bg-theme-card transition-colors duration-200">
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="w-8 h-8 rounded-full bg-theme-accent flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 text-[#070A13]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <span class="font-montserrat font-extrabold text-sm sm:text-lg tracking-widest uppercase text-theme-primary">repogee</span>
          </div>

          <div class="flex items-center gap-2 sm:gap-4">
            <div class="flex items-center gap-2 sm:gap-3 border-r border-theme-border/20 pr-2 sm:pr-4">
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
              {props.theme === 'dark' ? (
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
              ) : (
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              )}
            </button>
            <button
              onClick={props.onLogout}
              class="p-2 text-theme-glaucous hover:text-theme-accent transition-colors duration-150 rounded-full hover:bg-theme-border-sub flex items-center justify-center cursor-pointer"
              title="Log Out"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            </button>
          </div>
        </div>
      </header>

      <main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 class="font-montserrat text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-theme-primary">
              Repository <span class="italic font-bold">Onboarding</span>
            </h1>
            <p class="font-molengo text-base sm:text-lg text-theme-secondary italic">
              Configure gamification settings and generate SCORE.md
            </p>
          </div>

          <div class="relative w-full md:w-80">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-theme-glaucous flex items-center justify-center">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </span>
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
              <div class="col-span-full py-16 text-center border border-dashed border-theme-border rounded-3xl bg-theme-card px-4">
                <svg class="w-10 h-10 text-theme-glaucous mb-3 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><path d="M12 11v6M9 14h6"/></svg>
                <p class="text-theme-secondary font-molengo text-lg italic">No repositories found</p>
              </div>
            }
          >
            {(repo) => (
              <div class="bg-theme-card border border-theme-border rounded-3xl p-6 flex flex-col justify-between hover:border-theme-accent hover:shadow-lg transition-all duration-200">
                <div>
                  <div class="flex items-center justify-between mb-3 gap-2">
                    <span class="flex items-center gap-2 font-montserrat font-extrabold text-sm tracking-wide truncate max-w-[70%] text-theme-primary">
                      {repo.private ? (
                        <svg class="w-3.5 h-3.5 text-theme-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      ) : (
                        <svg class="w-3.5 h-3.5 text-theme-secondary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/></svg>
                      )}
                      {repo.name}
                    </span>
                    <span class={`text-[8px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border shrink-0 ${repo.onboarded ? "bg-theme-accent/10 text-theme-accent border-theme-accent/20" : "bg-theme-border-sub text-theme-secondary border-theme-border"}`}>
                      {repo.onboarded ? "onboarded" : "ready"}
                    </span>
                  </div>
                  <p class="text-xs text-theme-secondary font-hind line-clamp-2 min-h-[32px] mb-6 leading-relaxed">
                    {repo.description || "No description provided."}
                  </p>
                </div>

                <div>
                  <button
                    disabled={loadingRepo() !== null}
                    onClick={() => repo.onboarded ? props.onViewLeaderboard(repo.full_name) : handleOnboard(repo.full_name)}
                    class={`w-full py-3 px-4 rounded-full font-montserrat font-bold text-[10px] tracking-widest uppercase transition-all duration-200 cursor-pointer ${
                      repo.onboarded
                        ? "bg-transparent border border-theme-accent text-theme-accent hover:bg-theme-accent hover:text-[#070A13]"
                        : "bg-theme-accent hover:bg-theme-primary hover:text-theme-bg text-[#070A13]"
                    }`}
                  >
                    {loadingRepo() === repo.full_name ? (
                      <span class="flex items-center justify-center gap-2">
                        <svg class="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>
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
