import { createSignal, onMount, For, Show, Switch, Match } from 'solid-js'

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
  time: string
  rawDate: Date
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
  const [showNotifications, setShowNotifications] = createSignal(false)
  const [sortOrder, setSortOrder] = createSignal<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = createSignal(1)
  const itemsPerPage = 5

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

  onMount(async () => {
    const token = localStorage.getItem('token')
    
    try {
      const res = await fetch(`${API_URL}/api/leaderboard?repo=${props.selectedRepo}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setContributors(data)
      } else {
        setContributors([])
      }
    } catch (err) {
      setContributors([])
    }

    try {
      const commitsRes = await fetch(`https://api.github.com/repos/${props.selectedRepo}/commits?per_page=30`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (commitsRes.ok) {
        const commits = await commitsRes.json()
        const mappedEvents: ActivityEvent[] = commits.map((c: any, index: number) => {
          const commitTime = new Date(c.commit.author.date)
          const today = new Date()
          const isToday = commitTime.getDate() === today.getDate() &&
            commitTime.getMonth() === today.getMonth() &&
            commitTime.getFullYear() === today.getFullYear()

          const timeStr = isToday
            ? commitTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : `${commitTime.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${commitTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

          return {
            id: c.sha || String(index),
            title: c.commit.message.split('\n')[0],
            contributor: c.author?.login || c.commit.author.name || 'anonymous',
            time: timeStr,
            rawDate: commitTime,
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
    return active || (list.length > 0 ? list[0] : { username: props.user.login, xp: 0, level: 1, class: 'Novice', subclass: 'Unranked', last_active: null })
  }

  const getWeeklyPace = () => {
    const today = new Date()
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const recentCommits = events().filter(e => e.rawDate && e.rawDate >= sevenDaysAgo)
    const count = recentCommits.length
    if (count === 0) return 'Inactive'
    if (count < 3) return 'Low Activity'
    if (count < 10) return 'Moderate Activity'
    return 'High Activity'
  }

  const handleSort = () => {
    setSortOrder(sortOrder() === 'desc' ? 'asc' : 'desc')
    setCurrentPage(1)
  }

  const sortedEvents = () => {
    const list = [...events()]
    return list.sort((a, b) => {
      const timeA = a.rawDate ? a.rawDate.getTime() : 0
      const timeB = b.rawDate ? b.rawDate.getTime() : 0
      return sortOrder() === 'desc' ? timeB - timeA : timeA - timeB
    })
  }

  const paginatedEvents = () => {
    const list = sortedEvents()
    const startIndex = (currentPage() - 1) * itemsPerPage
    return list.slice(startIndex, startIndex + itemsPerPage)
  }

  return (
    <div class="min-h-screen bg-theme-bg text-theme-primary font-hind flex flex-col lg:flex-row transition-colors duration-200 pb-24 lg:pb-0 overflow-x-hidden">
      <aside class="py-6 pl-6 sticky top-0 h-screen hidden lg:flex flex-col z-50">
        <div class="w-20 md:w-24 border border-theme-border rounded-full flex flex-col justify-between items-center py-8 bg-theme-card h-[calc(100vh-3rem)] transition-colors duration-200">
          <div class="flex flex-col items-center gap-12">
            <div class="w-10 h-10 rounded-full bg-theme-accent flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-[#070A13]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>

            <nav class="flex flex-col gap-6">
              <button
                onClick={() => setActiveTab('leaderboard')}
                class={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${activeTab() === 'leaderboard' ? 'bg-theme-accent text-[#070A13] border border-theme-accent shadow-sm' : 'text-theme-glaucous hover:text-theme-secondary hover:bg-theme-border-sub'}`}
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34M12 2a7 7 0 0 1 7 7c0 2.37-1.2 4.46-3 5.66H8C6.2 13.46 5 11.37 5 9a7 7 0 0 1 7-7Z"/></svg>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                class={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${activeTab() === 'analytics' ? 'bg-theme-accent text-[#070A13] border border-theme-accent shadow-sm' : 'text-theme-glaucous hover:text-theme-secondary hover:bg-theme-border-sub'}`}
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
              </button>
              <button
                onClick={props.onBack}
                class="w-12 h-12 rounded-full flex items-center justify-center text-theme-glaucous hover:text-theme-secondary hover:bg-theme-border-sub transition-all duration-200 cursor-pointer"
                title="Repositories"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              </button>
            </nav>
          </div>

          <button
            onClick={props.onLogout}
            class="w-12 h-12 rounded-full flex items-center justify-center text-theme-glaucous hover:text-theme-accent hover:bg-theme-border-sub transition-all duration-200 cursor-pointer"
            title="Sign Out"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </button>
        </div>
      </aside>

      <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 lg:hidden w-[90%] max-w-sm">
        <div class="border border-theme-border rounded-full py-2.5 px-6 flex justify-around items-center bg-theme-card/95 backdrop-blur shadow-xl transition-colors duration-200">
          <button
            onClick={() => setActiveTab('leaderboard')}
            class={`p-3 rounded-full transition-all duration-200 cursor-pointer ${activeTab() === 'leaderboard' ? 'bg-theme-accent text-[#070A13]' : 'text-theme-glaucous'}`}
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34M12 2a7 7 0 0 1 7 7c0 2.37-1.2 4.46-3 5.66H8C6.2 13.46 5 11.37 5 9a7 7 0 0 1 7-7Z"/></svg>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            class={`p-3 rounded-full transition-all duration-200 cursor-pointer ${activeTab() === 'analytics' ? 'bg-theme-accent text-[#070A13]' : 'text-theme-glaucous'}`}
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
          </button>
          <button
            onClick={props.onBack}
            class="p-3 rounded-full text-theme-glaucous hover:text-theme-secondary transition-all cursor-pointer"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          </button>
          <button
            onClick={props.onLogout}
            class="p-3 rounded-full text-theme-glaucous hover:text-theme-accent transition-all cursor-pointer"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
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
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
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
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                ) : (
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                )}
              </button>

              <div class="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications())}
                  class="relative p-2 text-theme-glaucous hover:text-theme-accent transition-colors rounded-full hover:bg-theme-border-sub cursor-pointer"
                >
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-theme-accent"></span>
                </button>
                <Show when={showNotifications()}>
                  <div class="absolute right-0 mt-2 w-64 bg-theme-card border border-theme-border rounded-2xl p-4 shadow-xl z-50 text-xs">
                    <div class="font-montserrat font-bold uppercase tracking-wider mb-2 text-theme-primary">Notifications</div>
                    <div class="flex flex-col gap-2">
                      <div class="p-2 bg-theme-bg rounded-lg border border-theme-border/30">
                        <p class="text-theme-primary font-semibold">Welcome to Repogee!</p>
                        <p class="text-theme-secondary mt-0.5 text-[10px]">Your repository leaderboard has been successfully connected.</p>
                      </div>
                    </div>
                  </div>
                </Show>
              </div>

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
          <Switch>
            <Match when={activeTab() === 'leaderboard'}>
              <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 flex flex-col gap-6">
                  <div class="bg-theme-card border border-theme-border rounded-3xl p-5 sm:p-8 transition-colors duration-200">
                    <h2 class="font-montserrat text-base sm:text-lg font-extrabold tracking-widest uppercase mb-6 text-theme-primary">RPG Rankings</h2>
                    
                    <div class="flex flex-col gap-3">
                      <For
                        each={contributors()}
                        fallback={
                          <div class="py-8 text-center border border-dashed border-theme-border rounded-3xl bg-theme-bg">
                            <svg class="w-8 h-8 text-theme-glaucous mb-2 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            <p class="text-theme-secondary font-molengo text-xs italic">No contributors yet - onboard a repository to start tracking</p>
                          </div>
                        }
                      >
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
                      <button
                        onClick={handleSort}
                        class="flex items-center gap-1.5 text-[9px] text-theme-secondary border border-theme-border/60 px-3 py-1.5 rounded-full hover:bg-theme-border-sub transition-all uppercase tracking-widest font-bold cursor-pointer"
                      >
                        <span>Sort ({sortOrder()})</span>
                        <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
                      </button>
                    </div>

                    <div class="flex flex-col gap-3">
                      <For
                        each={paginatedEvents()}
                        fallback={
                          <div class="py-8 text-center border border-dashed border-theme-border rounded-3xl bg-theme-bg">
                            <svg class="w-8 h-8 text-theme-glaucous mb-2 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                            <p class="text-theme-secondary font-molengo text-xs italic">No activity feeds detected</p>
                          </div>
                        }
                      >
                        {(event) => (
                          <div class="flex items-center justify-between p-4 bg-theme-bg border border-theme-border/40 rounded-3xl sm:rounded-full hover:border-theme-accent transition-all duration-200">
                            <div class="flex items-center gap-3 min-w-0">
                              <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-theme-border-sub text-theme-glaucous">
                                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/><path d="M12 8v10"/></svg>
                              </div>
                              <div class="min-w-0">
                                <p class="font-hind text-xs font-semibold text-theme-primary truncate">{event.title}</p>
                                <p class="text-[9px] text-theme-secondary font-molengo uppercase tracking-wider mt-0.5">@{event.contributor}</p>
                              </div>
                            </div>

                            <div class="flex items-center gap-3 shrink-0">
                              <span class="text-[10px] text-theme-secondary font-hind hidden sm:inline">{event.time}</span>
                            </div>
                          </div>
                        )}
                      </For>
                    </div>

                    <Show when={events().length > itemsPerPage}>
                      <div class="flex justify-between items-center mt-6 pt-4 border-t border-theme-border/20">
                        <button
                          disabled={currentPage() === 1}
                          onClick={() => setCurrentPage(currentPage() - 1)}
                          class="px-4 py-2 bg-theme-bg border border-theme-border rounded-full text-[10px] font-bold tracking-wider uppercase text-theme-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-theme-border-sub transition cursor-pointer"
                        >
                          Prev
                        </button>
                        <span class="text-[10px] text-theme-secondary font-montserrat uppercase tracking-wider">
                          Page {currentPage()} of {Math.ceil(events().length / itemsPerPage)}
                        </span>
                        <button
                          disabled={currentPage() >= Math.ceil(events().length / itemsPerPage)}
                          onClick={() => setCurrentPage(currentPage() + 1)}
                          class="px-4 py-2 bg-theme-bg border border-theme-border rounded-full text-[10px] font-bold tracking-wider uppercase text-theme-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-theme-border-sub transition cursor-pointer"
                        >
                          Next
                        </button>
                      </div>
                    </Show>
                  </div>
                </div>

                <div class="flex flex-col gap-6">
                  <div class="bg-theme-card border border-theme-border rounded-3xl p-6 transition-colors duration-200">
                    <h2 class="font-montserrat text-sm font-extrabold tracking-widest uppercase mb-4 text-theme-primary">Repository Activity</h2>
                    
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
                          {getWeeklyPace()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="bg-theme-card border border-theme-border rounded-3xl p-6 flex-1 transition-colors duration-200">
                    <h2 class="font-montserrat text-sm font-extrabold tracking-widest uppercase mb-1 text-theme-primary">Progression Tiers</h2>
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
            </Match>
            <Match when={activeTab() === 'analytics'}>
              <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-theme-card border border-theme-border rounded-3xl p-6 sm:p-8 transition-colors duration-200">
                  <h2 class="font-montserrat text-base sm:text-lg font-extrabold tracking-widest uppercase mb-6 text-theme-primary">XP Contribution Analytics</h2>
                  <div class="flex flex-col gap-4">
                    <div class="flex items-center justify-between p-4 bg-theme-bg border border-theme-border/40 rounded-2xl">
                      <span class="text-xs font-semibold text-theme-primary">Merged Pull Request (Base)</span>
                      <span class="text-xs font-bold text-theme-accent">50 XP</span>
                    </div>
                    <div class="flex items-center justify-between p-4 bg-theme-bg border border-theme-border/40 rounded-2xl">
                      <span class="text-xs font-semibold text-theme-primary">Closed Issue (Base)</span>
                      <span class="text-xs font-bold text-theme-accent">30 XP</span>
                    </div>
                    <div class="flex items-center justify-between p-4 bg-theme-bg border border-theme-border/40 rounded-2xl">
                      <span class="text-xs font-semibold text-theme-primary">Approved Review (Base)</span>
                      <span class="text-xs font-bold text-theme-accent">25 XP</span>
                    </div>
                    <div class="flex items-center justify-between p-4 bg-theme-bg border border-theme-border/40 rounded-2xl">
                      <span class="text-xs font-semibold text-theme-primary">Opened Detailed Issue (Base)</span>
                      <span class="text-xs font-bold text-theme-accent">10 XP</span>
                    </div>
                    <div class="flex items-center justify-between p-4 bg-theme-bg border border-theme-border/40 rounded-2xl">
                      <span class="text-xs font-semibold text-theme-primary">Inline Review Comment (Base)</span>
                      <span class="text-xs font-bold text-theme-accent">5 XP</span>
                    </div>
                    <p class="text-[10px] text-theme-secondary mt-2 leading-relaxed">
                      Note: Additional XP bonuses are awarded for heavy refactoring, resolving merge conflicts, adding documentation, batch commits, and maintaining activity streaks.
                    </p>
                  </div>
                </div>

                <div class="bg-theme-card border border-theme-border rounded-3xl p-6 sm:p-8 transition-colors duration-200">
                  <h2 class="font-montserrat text-base sm:text-lg font-extrabold tracking-widest uppercase mb-6 text-theme-primary">Your Status</h2>
                  <div class="flex flex-col gap-4">
                    <div class="p-4 bg-theme-bg border border-theme-border/40 rounded-2xl">
                      <span class="text-[9px] text-theme-secondary font-molengo uppercase tracking-wider">Active Role</span>
                      <div class="font-montserrat text-lg font-bold text-theme-primary mt-1">
                        {getActiveUser().subclass}
                      </div>
                    </div>
                    <div class="p-4 bg-theme-bg border border-theme-border/40 rounded-2xl">
                      <span class="text-[9px] text-theme-secondary font-molengo uppercase tracking-wider">Level Progression</span>
                      <div class="font-montserrat text-lg font-bold text-theme-accent mt-1">
                        Level {getActiveUser().level} ({getActiveUser().xp} XP total)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Match>
          </Switch>
        </Show>
      </div>
    </div>
  )
}
