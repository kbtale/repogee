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
    <div class="min-h-screen bg-theme-bg text-theme-primary font-hind flex flex-col sm:flex-row transition-colors duration-200">
      <aside class="py-6 pl-6 sticky top-0 h-screen hidden sm:flex flex-col z-50">
        <div class="w-20 md:w-24 border border-theme-border rounded-full flex flex-col justify-between items-center py-8 bg-theme-card h-[calc(100vh-3rem)] transition-colors duration-200">
          <div class="flex flex-col items-center gap-12">
            <div class="w-10 h-10 rounded-full bg-theme-accent flex items-center justify-center shrink-0">
              <span class="i-ph-shield-check-bold text-[#070A13] text-xl"></span>
            </div>

            <nav class="flex flex-col gap-6">
              <button
                onClick={() => setActiveTab('leaderboard')}
                class={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer ${activeTab() === 'leaderboard' ? 'bg-theme-accent text-[#070A13] border border-theme-accent shadow-sm' : 'text-theme-glaucous hover:text-theme-secondary hover:bg-theme-border-sub'}`}
              >
                <span class="i-ph-trophy-bold text-lg"></span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                class={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer ${activeTab() === 'analytics' ? 'bg-theme-accent text-[#070A13] border border-theme-accent shadow-sm' : 'text-theme-glaucous hover:text-theme-secondary hover:bg-theme-border-sub'}`}
              >
                <span class="i-ph-chart-bar-bold text-lg"></span>
              </button>
              <button
                onClick={props.onBack}
                class="w-12 h-12 rounded-full flex items-center justify-center text-theme-glaucous hover:text-theme-secondary hover:bg-theme-border-sub transition-all duration-200 hover:scale-105 cursor-pointer"
                title="Repositories"
              >
                <span class="i-ph-folder-bold text-lg"></span>
              </button>
            </nav>
          </div>

          <button
            onClick={props.onLogout}
            class="w-12 h-12 rounded-full flex items-center justify-center text-theme-glaucous hover:text-theme-accent hover:bg-theme-border-sub transition-all duration-200 hover:scale-105 cursor-pointer"
            title="Sign Out"
          >
            <span class="i-ph-sign-out-bold text-lg"></span>
          </button>
        </div>
      </aside>

      <div class="flex-1 flex flex-col min-w-0">
        <header class="px-6 pt-6 sticky top-0 z-40">
          <div class="border border-theme-border rounded-full h-16 px-6 sm:px-8 flex justify-between items-center bg-theme-card transition-colors duration-200">
            <div>
              <h1 class="font-montserrat text-sm sm:text-base font-extrabold tracking-widest uppercase truncate max-w-[200px] sm:max-w-none text-theme-primary">
                {props.selectedRepo}
              </h1>
              <p class="text-[9px] text-theme-secondary font-molengo uppercase tracking-wider mt-0.5">Contributor <span class="italic font-bold">RPG</span> Progression</p>
            </div>

            <div class="flex items-center gap-4">
              <div class="relative hidden lg:block w-48">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 i-ph-magnifying-glass-bold text-theme-glaucous text-xs"></span>
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
                <span class={props.theme === 'dark' ? "i-ph-sun-bold text-base" : "i-ph-moon-bold text-base"}></span>
              </button>

              <button class="relative p-2 text-theme-glaucous hover:text-theme-accent transition-colors rounded-full hover:bg-theme-border-sub cursor-pointer">
                <span class="i-ph-bell-bold text-lg"></span>
                <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-theme-accent"></span>
              </button>

              <div class="flex items-center gap-3 text-left pl-2 border-l border-theme-border/20">
                <div class="hidden sm:block">
                  <div class="font-montserrat text-xs font-bold text-theme-primary leading-none">{props.user.name || props.user.login}</div>
                  <div class="text-[8px] text-theme-secondary font-molengo uppercase tracking-widest mt-1">Level {getActiveUser().level} {getActiveUser().subclass}</div>
                </div>
                <img
                  src={props.user.avatar_url}
                  alt={props.user.login}
                  class="w-8 h-8 rounded-full border border-theme-border/40"
                />
              </div>
            </div>
          </div>
        </header>

        <Show
          when={!loading()}
          fallback={
            <div class="flex-1 flex flex-col items-center justify-center">
              <span class="animate-spin i-ph-circle-notch-bold text-3xl text-theme-accent mb-3"></span>
              <p class="text-theme-secondary font-molengo italic">Parsing active analytics...</p>
            </div>
          }
        >
          <div class="flex-1 overflow-y-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 flex flex-col gap-6">
              <div class="bg-theme-card border border-theme-border rounded-3xl p-6 sm:p-8 transition-colors duration-200">
                <h2 class="font-montserrat text-lg font-extrabold tracking-widest uppercase mb-6 text-theme-primary">RPG Rankings</h2>
                
                <div class="flex flex-col gap-3">
                  <For each={contributors()}>
                    {(contributor, index) => (
                      <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-theme-bg border border-theme-border/40 rounded-full hover:border-theme-accent hover:scale-[1.01] transition-all duration-200 gap-4">
                        <div class="flex items-center gap-4 min-w-0">
                          <div class={`w-7 h-7 rounded-full border flex items-center justify-center font-montserrat font-bold text-xs shrink-0 ${getRankColor(index())}`}>
                            {index() + 1}
                          </div>
                          
                          <div class="w-8 h-8 rounded-full bg-theme-border-sub border border-theme-border/30 flex items-center justify-center text-theme-secondary text-xs uppercase font-bold shrink-0">
                            {contributor.username.substring(0, 2)}
                          </div>

                          <div class="min-w-0">
                            <p class="font-montserrat font-bold text-xs text-theme-primary truncate">@{contributor.username}</p>
                            <p class="text-[9px] text-theme-glaucous font-molengo uppercase tracking-wider mt-0.5">{contributor.subclass}</p>
                          </div>
                        </div>

                        <div class="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                          <div class="text-left sm:text-right">
                            <span class="text-[8px] text-theme-glaucous font-molengo uppercase tracking-wider">Level</span>
                            <div class="font-montserrat font-bold text-theme-secondary text-xs sm:text-sm">{contributor.level}</div>
                          </div>

                          <div class="text-left sm:text-right min-w-[70px]">
                            <span class="text-[8px] text-theme-glaucous font-molengo uppercase tracking-wider">Experience</span>
                            <div class="font-montserrat font-bold text-theme-accent text-xs sm:text-sm">{contributor.xp} XP</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>

              <div class="bg-theme-card border border-theme-border rounded-3xl p-6 sm:p-8 transition-colors duration-200">
                <div class="flex justify-between items-center mb-6">
                  <h2 class="font-montserrat text-lg font-extrabold tracking-widest uppercase text-theme-primary">Recent Feeds</h2>
                  <button class="flex items-center gap-1.5 text-[9px] text-theme-secondary border border-theme-border/60 px-3 py-1.5 rounded-full hover:bg-theme-border-sub transition-all uppercase tracking-widest font-bold cursor-pointer">
                    <span>Sort</span>
                    <span class="i-ph-caret-down-bold"></span>
                  </button>
                </div>

                <div class="flex flex-col gap-3">
                  <For
                    each={events()}
                    fallback={
                      <div class="py-8 text-center border border-dashed border-theme-border rounded-3xl bg-theme-bg">
                        <span class="i-ph-clock-bold text-theme-glaucous text-3xl mb-2 block mx-auto"></span>
                        <p class="text-theme-secondary font-molengo text-xs italic">No activity feeds detected</p>
                      </div>
                    }
                  >
                    {(event) => (
                      <div class="flex items-center justify-between p-4 bg-theme-bg border border-theme-border/40 rounded-full hover:border-theme-accent transition-all duration-200">
                        <div class="flex items-center gap-4 min-w-0">
                          <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-theme-border-sub text-theme-glaucous">
                            <span class="i-ph-git-commit-bold text-base"></span>
                          </div>
                          <div class="min-w-0">
                            <p class="font-hind text-xs font-semibold text-theme-primary truncate">{event.title}</p>
                            <p class="text-[9px] text-theme-glaucous font-molengo uppercase tracking-wider mt-0.5">@{event.contributor}</p>
                          </div>
                        </div>

                        <div class="flex items-center gap-4 shrink-0">
                          <span class="text-[9px] text-theme-accent font-montserrat font-bold bg-theme-accent/5 border border-theme-accent/20 px-2 py-0.5 rounded-full">
                            +{event.xp} XP
                          </span>
                          <span class="text-[10px] text-theme-glaucous font-hind hidden sm:inline">{event.time}</span>
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
                    <span class="text-[9px] text-theme-glaucous font-molengo uppercase tracking-wider">Cumulative Experience</span>
                    <div class="font-montserrat text-2xl font-extrabold text-theme-primary mt-2">
                      {contributors().reduce((sum, c) => sum + c.xp, 0)}
                    </div>
                  </div>

                  <div class="bg-theme-bg border border-theme-border/40 rounded-3xl p-4 flex flex-col justify-between">
                    <span class="text-[9px] text-theme-glaucous font-molengo uppercase tracking-wider">Active Developers</span>
                    <div class="font-montserrat text-2xl font-extrabold text-theme-secondary mt-2">
                      {contributors().length}
                    </div>
                  </div>

                  <div class="bg-theme-bg border border-theme-border/40 rounded-3xl p-4 flex flex-col justify-between">
                    <span class="text-[9px] text-theme-glaucous font-molengo uppercase tracking-wider">Weekly Pace</span>
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
                    <p class="text-[10px] text-theme-glaucous mt-1 leading-relaxed">
                      Unlocked by core systems engineering and performance refactoring tasks.
                    </p>
                  </div>

                  <div class="border-l-2 border-theme-secondary pl-4">
                    <div class="font-montserrat font-bold text-xs text-theme-primary">Artisan Tier (Level 10-19)</div>
                    <p class="text-[10px] text-theme-glaucous mt-1 leading-relaxed">
                      Achieved through consistent reviews, automation flows, and styling.
                    </p>
                  </div>

                  <div class="border-l-2 border-theme-border pl-4">
                    <div class="font-montserrat font-bold text-xs text-theme-primary">Novice Tier (Level 1-9)</div>
                    <p class="text-[10px] text-theme-glaucous mt-1 leading-relaxed">
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
