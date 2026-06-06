import { createSignal, For, Show } from 'solid-js'

interface Repo {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  onboarded: boolean
  contributors_count?: number
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
  const [sortOrder, setSortOrder] = createSignal<'connected' | 'name' | 'contributors'>('connected')

  const handleSortToggle = () => {
    if (sortOrder() === 'connected') {
      setSortOrder('name')
    } else if (sortOrder() === 'name') {
      setSortOrder('contributors')
    } else {
      setSortOrder('connected')
    }
  }

  const filteredRepos = () => {
    const q = searchQuery().toLowerCase().trim()
    let list = props.repos
    if (q) {
      list = props.repos.filter((repo) =>
        repo.name.toLowerCase().includes(q) ||
        (repo.description && repo.description.toLowerCase().includes(q))
      )
    }
    return [...list].sort((a, b) => {
      if (sortOrder() === 'connected') {
        if (a.onboarded && !b.onboarded) return -1
        if (!a.onboarded && b.onboarded) return 1
        return a.name.localeCompare(b.name)
      } else if (sortOrder() === 'contributors') {
        const countA = a.contributors_count || 0
        const countB = b.contributors_count || 0
        if (countA !== countB) return countB - countA;
        return a.name.localeCompare(b.name)
      } else {
        return a.name.localeCompare(b.name)
      }
    })
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
              <svg class="w-4 h-4 text-[#070A13]" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5.338 1.59a61 61 0 0 0-2.837.856.48.48 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.7 10.7 0 0 0 2.287 2.233c.346.244.652.42.893.533q.18.085.293.118a1 1 0 0 0 .101.025 1 1 0 0 0 .1-.025q.114-.034.294-.118c.24-.113.547-.29.893-.533a10.7 10.7 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.8 11.8 0 0 1-2.517 2.453 7 7 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7 7 0 0 1-1.048-.625 11.8 11.8 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 63 63 0 0 1 5.072.56"/>
                <path d="M10.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
              </svg>
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
                <svg class="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>
                </svg>
              ) : (
                <svg class="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278M4.858 1.311A7.27 7.27 0 0 0 1.025 7.71c0 4.02 3.279 7.276 7.319 7.276a7.32 7.32 0 0 0 5.205-2.162q-.506.063-1.029.063c-4.61 0-8.343-3.714-8.343-8.29 0-1.167.242-2.278.681-3.286"/>
                </svg>
              )}
            </button>
            <button
              onClick={props.onLogout}
              class="p-2 text-theme-glaucous hover:text-theme-accent transition-colors duration-150 rounded-full hover:bg-theme-border-sub flex items-center justify-center cursor-pointer"
              title="Log Out"
            >
              <svg class="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 class="font-montserrat text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-theme-primary">
              Repositories
            </h1>
            <p class="font-molengo text-base sm:text-lg text-theme-secondary italic">
              Connect a code repository to show stats
            </p>
          </div>

          <div class="flex gap-3 w-full md:w-auto items-center">
            <div class="relative w-full md:w-80">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-theme-glaucous flex items-center justify-center">
                <svg class="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search repositories..."
                value={searchQuery()}
                onInput={(e) => setSearchQuery(e.currentTarget.value)}
                class="w-full pl-11 pr-4 py-3 bg-theme-card border border-theme-border rounded-full text-theme-primary placeholder-theme-glaucous/50 font-hind focus:outline-none focus:ring-0 focus:shadow-none focus:border-theme-accent transition-[border-color] duration-150 text-sm"
              />
            </div>
            <button
              onClick={handleSortToggle}
              class="flex items-center gap-1.5 text-[10px] text-theme-secondary border border-theme-border px-4 py-3.5 rounded-full hover:bg-theme-border-sub transition-all uppercase tracking-widest font-bold cursor-pointer shrink-0"
            >
              <span>Sort: {sortOrder() === 'connected' ? 'Connected' : sortOrder() === 'name' ? 'Name' : 'Contributors'}</span>
              <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L11 2.707V14.5a.5.5 0 0 0 .5-.5m-7-14a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L4 13.293V1.5a.5.5 0 0 1 .5-.5"/></svg>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <For
            each={filteredRepos()}
            fallback={
              <div class="col-span-full py-16 text-center border border-dashed border-theme-border rounded-3xl bg-theme-card px-4">
                <svg class="w-10 h-10 text-theme-glaucous mb-3 mx-auto" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139q.323-.119.684-.12h5.396z"/>
                </svg>
                <p class="text-theme-secondary font-molengo text-lg italic">No repositories found</p>
              </div>
            }
          >
            {(repo) => (
              <div class="bg-theme-card border border-theme-border rounded-3xl p-6 flex flex-col justify-between hover:border-theme-accent hover:shadow-lg transition-all duration-200">
                <div>
                  <div class="flex items-center justify-between mb-3 gap-2">
                    <span class="flex items-center gap-2 font-montserrat font-extrabold text-sm tracking-wide truncate max-w-[50%] text-theme-primary">
                      {repo.private ? (
                        <svg class="w-3.5 h-3.5 text-theme-accent shrink-0" viewBox="0 0 16 16" fill="currentColor">
                          <path fill-rule="evenodd" d="M8 0a4 4 0 0 1 4 4v2.05a2.5 2.5 0 0 1 2 2.45v5a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 13.5v-5a2.5 2.5 0 0 1 2-2.45V4a4 4 0 0 1 4-4m0 1a3 3 0 0 0-3 3v2h6V4a3 3 0 0 0-3-3"/>
                        </svg>
                      ) : (
                        <svg class="w-3.5 h-3.5 text-theme-secondary shrink-0" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0M2.04 4.326c.325 1.329 2.532 2.54 3.717 3.19.48.263.793.434.743.484q-.121.12-.242.234c-.416.396-.787.749-.758 1.266.035.634.618.824 1.214 1.017.577.188 1.168.38 1.286.983.082.417-.075.988-.22 1.52-.215.782-.406 1.48.22 1.48 1.5-.5 3.798-3.186 4-5 .138-1.243-2-2-3.5-2.5-.478-.16-.755.081-.99.284-.172.15-.322.279-.51.216-.445-.148-2.5-2-1.5-2.5.78-.39.952-.171 1.227.182.078.099.163.208.273.318.609.304.662-.132.723-.633.039-.322.081-.671.277-.867.434-.434 1.265-.791 2.028-1.12.712-.306 1.365-.587 1.579-.88A7 7 0 1 1 2.04 4.327Z"/>
                        </svg>
                      )}
                      {repo.name}
                    </span>
                    <div class="flex items-center gap-2 shrink-0">
                      <Show when={repo.contributors_count !== undefined}>
                        <span class="text-[8px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border bg-theme-accent/10 text-theme-accent border-theme-accent/20">
                          {repo.contributors_count || 0} users
                        </span>
                      </Show>
                      <span class={`text-[8px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border shrink-0 ${repo.onboarded ? "bg-theme-accent/10 text-theme-accent border-theme-accent/20" : "bg-theme-border-sub text-theme-secondary border-theme-border"}`}>
                        {repo.onboarded ? "connected" : "ready"}
                      </span>
                    </div>
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
                        <svg class="animate-spin w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                          <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z"/>
                        </svg>
                        CONNECTING...
                      </span>
                    ) : repo.onboarded ? (
                      "VIEW LEADERBOARD"
                    ) : (
                      "CONNECT REPO"
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
