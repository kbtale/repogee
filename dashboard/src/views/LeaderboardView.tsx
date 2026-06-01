import { createSignal, onMount, For, Show } from 'solid-js'

interface Contributor {
  username: string
  xp: number
  level: number
  class: string
  subclass: string
  last_active: string | null
}

interface ActivityEvent {
  id: string
  title: string
  contributor: string
  xp: number
  time: string
  type: 'push' | 'pr_open' | 'review' | 'comment'
}

interface LeaderboardViewProps {
  user: {
    login: string
    avatar_url: string
    name: string | null
  }
  selectedRepo: string
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  onBack: () => void
  onLogout: () => void
}

export default function LeaderboardView(props: LeaderboardViewProps) {
  const [activeTab, setActiveTab] = createSignal<'leaderboard' | 'analytics' | 'settings'>('leaderboard')
  const [contributors, setContributors] = createSignal<Contributor[]>([])
  const [events, setEvents] = createSignal<ActivityEvent[]>([])
  const [loading, setLoading] = createSignal(true)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

  const fallbackContributors: Contributor[] = [
    { username: props.user.login, xp: 120, level: 2, class: 'BackendDeveloper', subclass: 'General Architect', last_active: '2026-05-28T10:30:00Z' },
  ]

  onMount(async () => {
    const token = localStorage.getItem('token')
    
    try {
      const res = await fetch(`${API_URL}/api/leaderboard`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setContributors(data)
      } else {
        setContributors(fallbackContributors)
      }
    } catch (err) {
      setContributors(fallbackContributors)
    }

    try {
      const commitsRes = await fetch(`https://api.github.com/repos/${props.selectedRepo}/commits?per_page=5`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (commitsRes.ok) {
        const commits = await commitsRes.json()
        const mappedEvents: ActivityEvent[] = commits.map((c: any, index: number) => {
          const commitTime = new Date(c.commit.author.date)
          return {
            id: c.sha || String(index),
            title: c.commit.message.split('\n')[0],
            contributor: c.author?.login || c.commit.author.name || 'anonymous',
            xp: 15,
            time: commitTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'push' as const,
          }
        })
        setEvents(mappedEvents)
      }
    } catch (err) {
      setEvents([])
    } finally {
      setLoading(false)
    }
  })

  const getRankColor = (index: number) => {
    if (index === 0) return 'text-[#070A13] border-theme-accent bg-theme-accent'
    if (index === 1) return 'text-[#070A13] border-theme-secondary bg-theme-secondary'
    if (index === 2) return 'text-theme-primary border-theme-border bg-theme-glaucous'
    return 'text-theme-secondary border-theme-border/60 bg-theme-card'
  }

  const getActiveUser = () => {
    const list = contributors()
    const active = list.find(c => c.username.toLowerCase() === props.user.login.toLowerCase())
    return active || (list.length > 0 ? list[0] : fallbackContributors[0])
  }

  return (
    <div class="min-h-screen bg-theme-bg text-theme-primary font-hind flex flex-col lg:flex-row transition-colors duration-200 pb-24 lg:pb-0 overflow-x-hidden">
      <aside class="py-6 pl-6 sticky top-0 h-screen hidden lg:flex flex-col z-50">
        <div class="w-20 md:w-24 border border-theme-border rounded-full flex flex-col justify-between items-center py-8 bg-theme-card h-[calc(100vh-3rem)] transition-colors duration-200">
          <div class="flex flex-col items-center gap-12">
            <div class="w-10 h-10 rounded-full bg-theme-accent flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-[#070A13]" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5.338 1.59a61 61 0 0 0-2.837.856.48.48 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.7 10.7 0 0 0 2.287 2.233c.346.244.652.42.893.533q.18.085.293.118a1 1 0 0 0 .101.025 1 1 0 0 0 .1-.025q.114-.034.294-.118c.24-.113.547-.29.893-.533a10.7 10.7 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.8 11.8 0 0 1-2.517 2.453 7 7 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7 7 0 0 1-1.048-.625 11.8 11.8 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 63 63 0 0 1 5.072.56"/>
                <path d="M10.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
              </svg>
            </div>

            <nav class="flex flex-col gap-6">
              <button
                onClick={() => setActiveTab('leaderboard')}
                class={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${activeTab() === 'leaderboard' ? 'bg-theme-accent text-[#070A13] border border-theme-accent shadow-sm' : 'text-theme-glaucous hover:text-theme-secondary hover:bg-theme-border-sub'}`}
              >
                <svg class="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5q0 .807-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33 33 0 0 1 2.5.5m.099 2.54a2 2 0 0 0 .72 3.935c-.333-1.05-.588-2.346-.72-3.935m10.083 3.935a2 2 0 0 0 .72-3.935c-.133 1.59-.388 2.885-.72 3.935"/>
                </svg>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                class={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${activeTab() === 'analytics' ? 'bg-theme-accent text-[#070A13] border border-theme-accent shadow-sm' : 'text-theme-glaucous hover:text-theme-secondary hover:bg-theme-border-sub'}`}
              >
                <svg class="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z"/>
                </svg>
              </button>
              <button
                onClick={props.onBack}
                class="w-12 h-12 rounded-full flex items-center justify-center text-theme-glaucous hover:text-theme-secondary hover:bg-theme-border-sub transition-all duration-200 cursor-pointer"
                title="Repositories"
              >
                <svg class="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139q.323-.119.684-.12h5.396z"/>
                </svg>
              </button>
            </nav>
          </div>

          <button
            onClick={props.onLogout}
            class="w-12 h-12 rounded-full flex items-center justify-center text-theme-glaucous hover:text-theme-accent hover:bg-theme-border-sub transition-all duration-200 cursor-pointer"
            title="Sign Out"
          >
            <svg class="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
              <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
              <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
            </svg>
          </button>
        </div>
      </aside>

      <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 lg:hidden w-[90%] max-w-sm">
        <div class="border border-theme-border rounded-full py-2.5 px-6 flex justify-around items-center bg-theme-card/95 backdrop-blur shadow-xl transition-colors duration-200">
          <button
            onClick={() => setActiveTab('leaderboard')}
            class={`p-3 rounded-full transition-all duration-200 cursor-pointer ${activeTab() === 'leaderboard' ? 'bg-theme-accent text-[#070A13]' : 'text-theme-glaucous'}`}
          >
            <svg class="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5q0 .807-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33 33 0 0 1 2.5.5m.099 2.54a2 2 0 0 0 .72 3.935c-.333-1.05-.588-2.346-.72-3.935m10.083 3.935a2 2 0 0 0 .72-3.935c-.133 1.59-.388 2.885-.72 3.935"/>
            </svg>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            class={`p-3 rounded-full transition-all duration-200 cursor-pointer ${activeTab() === 'analytics' ? 'bg-theme-accent text-[#070A13]' : 'text-theme-glaucous'}`}
          >
            <svg class="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z"/>
            </svg>
          </button>
          <button
            onClick={props.onBack}
            class="p-3 rounded-full text-theme-glaucous hover:text-theme-secondary transition-all cursor-pointer"
          >
            <svg class="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139q.323-.119.684-.12h5.396z"/>
            </svg>
          </button>
          <button
            onClick={props.onLogout}
            class="p-3 rounded-full text-theme-glaucous hover:text-theme-accent transition-all cursor-pointer"
          >
            <svg class="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
              <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
              <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="flex-1 flex flex-col min-w-0">
        <header class="px-4 sm:px-6 pt-4 sm:pt-6 sticky top-0 z-40">
          <div class="border border-theme-border rounded-full h-16 px-4 sm:px-8 flex justify-between items-center bg-theme-card transition-colors duration-200">
            <div class="min-w-0 pr-2">
              <h1 class="font-montserrat text-xs sm:text-base font-extrabold tracking-widest uppercase truncate text-theme-primary">
                {props.selectedRepo}
              </h1>
              <p class="text-[8px] sm:text-[9px] text-theme-secondary font-molengo uppercase tracking-wider mt-0.5 leading-none">Contributor <span class="italic font-bold">RPG</span> Progression</p>
            </div>

            <div class="flex items-center gap-2 sm:gap-4 shrink-0">
              <div class="relative hidden lg:block w-48">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-theme-glaucous flex items-center justify-center">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search..."
                  class="w-full pl-9 pr-4 py-1.5 bg-theme-bg border border-theme-border rounded-full text-xs text-theme-primary placeholder-theme-glaucous/50 focus:outline-none focus:border-theme-accent transition-all duration-150"
                />
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

              <button class="relative p-2 text-theme-glaucous hover:text-theme-accent transition-colors rounded-full hover:bg-theme-border-sub cursor-pointer">
                <svg class="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6"/>
                </svg>
                <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-theme-accent"></span>
              </button>

              <div class="flex items-center gap-2 sm:gap-3 text-left pl-2 border-l border-theme-border/20">
                <div class="hidden sm:block">
                  <div class="font-montserrat text-xs font-bold text-theme-primary leading-none">{props.user.name || props.user.login}</div>
                  <div class="text-[8px] text-theme-secondary font-molengo uppercase tracking-widest mt-1">Level {getActiveUser().level} {getActiveUser().subclass}</div>
                </div>
                <img
                  src={props.user.avatar_url}
                  alt={props.user.login}
                  class="w-8 h-8 rounded-full border border-theme-border/40 shrink-0"
                />
              </div>
            </div>
          </div>
        </header>

        <Show
          when={!loading()}
          fallback={
            <div class="flex-1 flex flex-col items-center justify-center py-24">
              <svg class="animate-spin w-8 h-8 text-theme-accent mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>
              <p class="text-theme-secondary font-molengo italic">Parsing active analytics...</p>
            </div>
          }
        >
          <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 flex flex-col gap-6">
              <div class="bg-theme-card border border-theme-border rounded-3xl p-5 sm:p-8 transition-colors duration-200">
                <h2 class="font-montserrat text-base sm:text-lg font-extrabold tracking-widest uppercase mb-6 text-theme-primary">RPG Rankings</h2>
                
                <div class="flex flex-col gap-3">
                  <For each={contributors()}>
                    {(contributor, index) => (
                      <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-theme-bg border border-theme-border/40 rounded-3xl sm:rounded-full hover:border-theme-accent transition-all duration-200 gap-3">
                        <div class="flex items-center gap-3 min-w-0">
                          <div class={`w-7 h-7 rounded-full border flex items-center justify-center font-montserrat font-bold text-xs shrink-0 ${getRankColor(index())}`}>
                            {index() + 1}
                          </div>
                          
                          <div class="w-8 h-8 rounded-full bg-theme-border-sub border border-theme-border/30 flex items-center justify-center text-theme-secondary text-xs uppercase font-bold shrink-0">
                            {contributor.username.substring(0, 2)}
                          </div>

                          <div class="min-w-0">
                            <p class="font-montserrat font-bold text-xs text-theme-primary truncate">@{contributor.username}</p>
                            <p class="text-[9px] text-theme-secondary font-molengo uppercase tracking-wider mt-0.5">{contributor.subclass}</p>
                          </div>
                        </div>

                        <div class="flex items-center justify-between sm:justify-end gap-6 shrink-0 border-t sm:border-t-0 border-theme-border/10 pt-2 sm:pt-0">
                          <div class="text-left sm:text-right">
                            <span class="text-[8px] text-theme-secondary font-molengo uppercase tracking-wider">Level</span>
                            <div class="font-montserrat font-bold text-theme-secondary text-xs sm:text-sm">{contributor.level}</div>
                          </div>

                          <div class="text-left sm:text-right min-w-[70px]">
                            <span class="text-[8px] text-theme-secondary font-molengo uppercase tracking-wider">Experience</span>
                            <div class="font-montserrat font-bold text-theme-accent text-xs sm:text-sm">{contributor.xp} XP</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>

              <div class="bg-theme-card border border-theme-border rounded-3xl p-5 sm:p-8 transition-colors duration-200">
                <div class="flex justify-between items-center mb-6">
                  <h2 class="font-montserrat text-base sm:text-lg font-extrabold tracking-widest uppercase text-theme-primary">Recent Feeds</h2>
                  <button class="flex items-center gap-1.5 text-[9px] text-theme-secondary border border-theme-border/60 px-3 py-1.5 rounded-full hover:bg-theme-border-sub transition-all uppercase tracking-widest font-bold cursor-pointer">
                    <span>Sort</span>
                    <svg class="w-2.5 h-2.5" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                    </svg>
                  </button>
                </div>

                <div class="flex flex-col gap-3">
                  <For
                    each={events()}
                    fallback={
                      <div class="py-8 text-center border border-dashed border-theme-border rounded-3xl bg-theme-bg">
                        <svg class="w-8 h-8 text-theme-glaucous mb-2 mx-auto" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
                          <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0"/>
                        </svg>
                        <p class="text-theme-secondary font-molengo text-xs italic">No activity feeds detected</p>
                      </div>
                    }
                  >
                    {(event) => (
                      <div class="flex items-center justify-between p-4 bg-theme-bg border border-theme-border/40 rounded-3xl sm:rounded-full hover:border-theme-accent transition-all duration-200">
                        <div class="flex items-center gap-3 min-w-0">
                          <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-theme-border-sub text-theme-glaucous">
                            <svg class="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M15.698 7.287 8.712.302a1.03 1.03 0 0 0-1.457 0l-1.45 1.45 1.84 1.84a1.223 1.223 0 0 1 1.55 1.56l1.773 1.774a1.224 1.224 0 0 1 1.267 2.025 1.226 1.226 0 0 1-2.002-1.334L8.58 5.963v4.353a1.226 1.226 0 1 1-1.008-.036V5.887a1.226 1.226 0 0 1-.666-1.608L5.093 2.465l-4.79 4.79a1.03 1.03 0 0 0 0 1.457l6.986 6.986a1.03 1.03 0 0 0 1.457 0l6.953-6.953a1.03 1.03 0 0 0 0-1.457"/>
                            </svg>
                          </div>
                          <div class="min-w-0">
                            <p class="font-hind text-xs font-semibold text-theme-primary truncate">{event.title}</p>
                            <p class="text-[9px] text-theme-secondary font-molengo uppercase tracking-wider mt-0.5">@{event.contributor}</p>
                          </div>
                        </div>

                        <div class="flex items-center gap-3 shrink-0">
                          <span class="text-[9px] text-theme-accent font-montserrat font-bold bg-theme-accent/5 border border-theme-accent/20 px-2 py-0.5 rounded-full">
                            +{event.xp} XP
                          </span>
                          <span class="text-[10px] text-theme-secondary font-hind hidden sm:inline">{event.time}</span>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-6">
              <div class="bg-theme-card border border-theme-border rounded-3xl p-6 transition-colors duration-200">
                <h2 class="font-montserrat text-sm font-extrabold tracking-widest uppercase mb-4 text-theme-primary">Repository Synergy</h2>
                
                <div class="flex flex-col gap-3">
                  <div class="bg-theme-bg border border-theme-border/40 rounded-3xl p-4 flex flex-col justify-between">
                    <span class="text-[9px] text-theme-secondary font-molengo uppercase tracking-wider">Cumulative Experience</span>
                    <div class="font-montserrat text-2xl font-extrabold text-theme-primary mt-2">
                      {contributors().reduce((sum, c) => sum + c.xp, 0)}
                    </div>
                  </div>

                  <div class="bg-theme-bg border border-theme-border/40 rounded-3xl p-4 flex flex-col justify-between">
                    <span class="text-[9px] text-theme-secondary font-molengo uppercase tracking-wider">Active Developers</span>
                    <div class="font-montserrat text-2xl font-extrabold text-theme-secondary mt-2">
                      {contributors().length}
                    </div>
                  </div>

                  <div class="bg-theme-bg border border-theme-border/40 rounded-3xl p-4 flex flex-col justify-between">
                    <span class="text-[9px] text-theme-secondary font-molengo uppercase tracking-wider">Weekly Pace</span>
                    <div class="font-montserrat text-2xl font-extrabold text-theme-accent mt-2 uppercase tracking-wide">
                      High Synergy
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-theme-card border border-theme-border rounded-3xl p-6 flex-1 transition-colors duration-200">
                <h2 class="font-montserrat text-sm font-extrabold tracking-widest uppercase mb-1 text-theme-primary">Achievements</h2>
                <p class="text-[9px] text-theme-secondary font-molengo uppercase tracking-widest mb-6">Tiers & Milestones</p>

                <div class="flex flex-col gap-5">
                  <div class="border-l-2 border-theme-accent pl-4">
                    <div class="font-montserrat font-bold text-xs text-theme-primary">Vanguard Tier (Level 20+)</div>
                    <p class="text-[10px] text-theme-secondary mt-1 leading-relaxed">
                      Unlocked by core systems engineering and performance refactoring tasks.
                    </p>
                  </div>

                  <div class="border-l-2 border-theme-secondary pl-4">
                    <div class="font-montserrat font-bold text-xs text-theme-primary">Artisan Tier (Level 10-19)</div>
                    <p class="text-[10px] text-theme-secondary mt-1 leading-relaxed">
                      Achieved through consistent reviews, automation flows, and styling.
                    </p>
                  </div>

                  <div class="border-l-2 border-theme-border pl-4">
                    <div class="font-montserrat font-bold text-xs text-theme-primary">Novice Tier (Level 1-9)</div>
                    <p class="text-[10px] text-theme-secondary mt-1 leading-relaxed">
                      Starting path earned by closing detailed issues and commenting.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </div>
  )
}
