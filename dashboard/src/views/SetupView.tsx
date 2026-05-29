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
  onOnboard: (repoFullName: string) => Promise<void>
  onViewLeaderboard: () => void
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
    <div class="min-h-screen bg-black text-ghostWhite font-hind flex flex-col">
      <header class="border-b border-blueSlate/20 py-4 px-6 md:px-12 flex justify-between items-center bg-brandCard/20 backdrop-blur-sm sticky top-0 z-50">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-glaucous to-coral flex items-center justify-center">
            <span class="i-ph-shield-check-bold text-white text-xl"></span>
          </div>
          <span class="font-montserrat font-bold text-xl tracking-wider text-ghostWhite">repogee</span>
        </div>

        <div class="flex items-center gap-4">
          <div class="flex items-center gap-3 border-r border-blueSlate/20 pr-4">
            <img
              src={props.user.avatar_url}
              alt={props.user.login}
              class="w-8 h-8 rounded-full border border-glaucous/30"
            />
            <div class="hidden sm:block text-left">
              <div class="font-montserrat text-sm font-semibold leading-tight">{props.user.name || props.user.login}</div>
              <div class="text-xs text-glaucous font-molengo">GitHub Authorized</div>
            </div>
          </div>
          <button
            onClick={props.onLogout}
            class="p-2 text-glaucous hover:text-coral transition-colors duration-200"
            title="Log Out"
          >
            <span class="i-ph-sign-out-bold text-lg"></span>
          </button>
        </div>
      </header>

      <main class="flex-1 max-w-6xl w-full mx-auto px-6 py-10 md:py-16">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 class="font-montserrat text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
              Repository Setup
            </h1>
            <p class="font-molengo text-lg text-paleSky">
              Select a repository to seed SCORE.md and configure gamification
            </p>
          </div>

          <div class="relative w-full md:w-80">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 i-ph-magnifying-glass-bold text-glaucous"></span>
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchQuery()}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
              class="w-full pl-11 pr-4 py-3 bg-brandCard/40 border border-blueSlate/30 rounded-2xl text-ghostWhite placeholder-glaucous/60 font-hind focus:outline-none focus:border-coral/50 transition-all duration-200"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <For
            each={filteredRepos()}
            fallback={
              <div class="col-span-full py-16 text-center border border-dashed border-blueSlate/20 rounded-3xl">
                <span class="i-ph-folder-dotted-bold text-glaucous text-4xl mb-3 block mx-auto"></span>
                <p class="text-glaucous font-molengo text-lg">No repositories matching search query</p>
              </div>
            }
          >
            {(repo) => (
              <div class="bg-brandCard/40 border border-blueSlate/20 hover:border-glaucous/30 rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 shadow-md">
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="flex items-center gap-2 font-montserrat font-bold text-base tracking-wide truncate max-w-85%">
                      <span class={repo.private ? "i-ph-lock-bold text-coral" : "i-ph-globe-bold text-glaucous"}></span>
                      {repo.name}
                    </span>
                    <span class={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${repo.onboarded ? "bg-coral/10 text-coral border border-coral/20" : "bg-blueSlate/20 text-glaucous border border-blueSlate/30"}`}>
                      {repo.onboarded ? "onboarded" : "ready"}
                    </span>
                  </div>
                  <p class="text-sm text-glaucous font-hind line-clamp-2 min-h-40px mb-6 leading-relaxed">
                    {repo.description || "No description provided."}
                  </p>
                </div>

                <div>
                  <button
                    disabled={loadingRepo() !== null}
                    onClick={() => repo.onboarded ? props.onViewLeaderboard() : handleOnboard(repo.full_name)}
                    class={`w-full py-3 px-4 rounded-xl font-montserrat font-semibold text-xs tracking-wider uppercase transition-all duration-200 ${
                      repo.onboarded
                        ? "bg-transparent border border-coral text-coral hover:bg-coral/10"
                        : "bg-gradient-to-r from-glaucous to-coral text-black hover:scale-[1.02] active:scale-[0.98]"
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
