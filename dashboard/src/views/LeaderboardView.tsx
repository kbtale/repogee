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
  onBack: () => void
  onLogout: () => void
}

export default function LeaderboardView(props: LeaderboardViewProps) {
  const [activeTab, setActiveTab] = createSignal<'leaderboard' | 'analytics' | 'settings'>('leaderboard')
  const [contributors, setContributors] = createSignal<Contributor[]>([])
  const [loading, setLoading] = createSignal(true)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

  const fallbackContributors: Contributor[] = [
    { username: 'arnold_warner', xp: 2450, level: 24, class: 'SystemsEngineer', subclass: 'Rust Vanguard', last_active: '2026-05-28T10:30:00Z' },
    { username: 'clara_dev', xp: 1980, level: 19, class: 'FrontendArtisan', subclass: 'Svelte Sculptor', last_active: '2026-05-28T09:15:00Z' },
    { username: 'dev_wizard', xp: 1720, level: 17, class: 'DataAlchemist', subclass: 'Python Sorcerer', last_active: '2026-05-27T18:45:00Z' },
    { username: 'automation_bot', xp: 1540, level: 15, class: 'DevOpsEngineer', subclass: 'CI/CD Commander', last_active: '2026-05-28T11:02:00Z' },
  ]

  onMount(async () => {
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
    } finally {
      setLoading(false)
    }
  })

  const getRankColor = (index: number) => {
    if (index === 0) return 'text-coral border-coral/30 bg-coral/10'
    if (index === 1) return 'text-paleSky border-paleSky/30 bg-paleSky/10'
    if (index === 2) return 'text-glaucous border-glaucous/30 bg-glaucous/10'
    return 'text-blueSlate border-blueSlate/30 bg-blueSlate/10'
  }

  const events: ActivityEvent[] = [
    { id: '1', title: 'Refactored Rust Webhook Core Engine', contributor: 'arnold_warner', xp: 50, time: '7:12 AM', type: 'push' },
    { id: '2', title: 'Submitted Approved Pull Request Review', contributor: 'arnold_warner', xp: 25, time: '10:30 AM', type: 'review' },
    { id: '3', title: 'Opened Detailed Architectural Discussion', contributor: 'clara_dev', xp: 10, time: '1:45 PM', type: 'pr_open' },
    { id: '4', title: 'Added Multi-Threaded Cache Benchmarks', contributor: 'arnold_warner', xp: 15, time: '6:00 PM', type: 'push' },
  ]

  return (
    <div class="min-h-screen bg-black text-ghostWhite font-hind flex flex-row">
      <aside class="w-20 md:w-24 border-r border-blueSlate/20 flex flex-col justify-between items-center py-8 bg-brandCard/10 sticky top-0 h-screen z-50">
        <div class="flex flex-col items-center gap-12">
          <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-glaucous to-coral flex items-center justify-center">
            <span class="i-ph-shield-check-bold text-white text-2xl"></span>
          </div>

          <nav class="flex flex-col gap-6">
            <button
              onClick={() => setActiveTab('leaderboard')}
              class={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${activeTab() === 'leaderboard' ? 'bg-brandCard text-coral border border-coral/30 shadow-md' : 'text-glaucous hover:text-paleSky'}`}
            >
              <span class="i-ph-trophy-bold text-xl"></span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              class={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${activeTab() === 'analytics' ? 'bg-brandCard text-coral border border-coral/30 shadow-md' : 'text-glaucous hover:text-paleSky'}`}
            >
              <span class="i-ph-chart-bar-bold text-xl"></span>
            </button>
            <button
              onClick={props.onBack}
              class="w-12 h-12 rounded-2xl flex items-center justify-center text-glaucous hover:text-paleSky transition-all duration-200"
              title="Repositories"
            >
              <span class="i-ph-folder-bold text-xl"></span>
            </button>
          </nav>
        </div>

        <button
          onClick={props.onLogout}
          class="w-12 h-12 rounded-2xl flex items-center justify-center text-glaucous hover:text-coral transition-all duration-200"
          title="Sign Out"
        >
          <span class="i-ph-sign-out-bold text-xl"></span>
        </button>
      </aside>

      <div class="flex-1 flex flex-col min-w-0">
        <header class="h-20 border-b border-blueSlate/10 px-8 flex justify-between items-center bg-brandCard/5 sticky top-0 z-40">
          <div>
            <h1 class="font-montserrat text-2xl font-extrabold tracking-tight">Leaderboard</h1>
            <p class="text-xs text-glaucous font-molengo">Real-time Contributor RPG Progression</p>
          </div>

          <div class="flex items-center gap-6">
            <div class="relative hidden md:block w-64">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 i-ph-magnifying-glass-bold text-glaucous"></span>
              <input
                type="text"
                placeholder="Search contributors..."
                class="w-full pl-11 pr-4 py-2 bg-brandCard/45 border border-blueSlate/20 rounded-2xl text-sm text-ghostWhite placeholder-glaucous/50 focus:outline-none focus:border-coral/40"
              />
            </div>
            
            <button class="relative p-2 text-glaucous hover:text-paleSky transition-colors">
              <span class="i-ph-bell-bold text-xl"></span>
              <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-coral animate-ping"></span>
            </button>

            <div class="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80"
                alt="Profile"
                class="w-10 h-10 rounded-full border border-glaucous/20"
              />
            </div>
          </div>
        </header>

        <Show
          when={!loading()}
          fallback={
            <div class="flex-1 flex flex-col items-center justify-center">
              <span class="animate-spin i-ph-circle-notch-bold text-3xl text-coral mb-3"></span>
              <p class="text-glaucous font-molengo">Loading leaderboard rankings...</p>
            </div>
          }
        >
          <div class="flex-1 overflow-y-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 flex flex-col gap-8">
              <div class="bg-brandCard/35 border border-blueSlate/15 rounded-3xl p-6 md:p-8 shadow-md">
                <h2 class="font-montserrat text-xl font-bold tracking-wide mb-6">RPG Rankings</h2>
                
                <div class="flex flex-col gap-4">
                  <For each={contributors()}>
                    {(contributor, index) => (
                      <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-brandCard/40 border border-blueSlate/20 rounded-2xl hover:border-glaucous/30 transition-all duration-200 gap-4">
                        <div class="flex items-center gap-4 min-w-0">
                          <div class={`w-8 h-8 rounded-lg border flex items-center justify-center font-montserrat font-bold text-sm shrink-0 ${getRankColor(index())}`}>
                            {index() + 1}
                          </div>
                          
                          <div class="w-10 h-10 rounded-full bg-blueSlate/20 border border-blueSlate/30 flex items-center justify-center text-glaucous uppercase font-bold shrink-0">
                            {contributor.username.substring(0, 2)}
                          </div>

                          <div class="min-w-0">
                            <p class="font-montserrat font-semibold text-ghostWhite truncate">@{contributor.username}</p>
                            <p class="text-xs text-glaucous font-molengo mt-0.5">{contributor.subclass}</p>
                          </div>
                        </div>

                        <div class="flex items-center justify-between sm:justify-end gap-8 shrink-0">
                          <div class="text-left sm:text-right">
                            <span class="text-xs text-glaucous font-molengo">Level</span>
                            <div class="font-montserrat font-bold text-paleSky text-sm sm:text-base">{contributor.level}</div>
                          </div>

                          <div class="text-left sm:text-right min-w-80px">
                            <span class="text-xs text-glaucous font-molengo">Total Experience</span>
                            <div class="font-montserrat font-bold text-coral text-sm sm:text-base">{contributor.xp} XP</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>

              <div class="bg-brandCard/35 border border-blueSlate/15 rounded-3xl p-6 md:p-8 shadow-md">
                <div class="flex justify-between items-center mb-6">
                  <h2 class="font-montserrat text-xl font-bold tracking-wide">Recent Activity Feed</h2>
                  <button class="flex items-center gap-1.5 text-xs text-glaucous hover:text-paleSky border border-blueSlate/30 px-3 py-1.5 rounded-xl transition-all">
                    <span>Sort</span>
                    <span class="i-ph-caret-down-bold"></span>
                  </button>
                </div>

                <div class="flex flex-col gap-4">
                  <For each={events}>
                    {(event) => (
                      <div class="flex items-center justify-between p-4 bg-brandCard/35 border border-blueSlate/5 rounded-2xl hover:border-blueSlate/20 transition-all duration-200">
                        <div class="flex items-center gap-4 min-w-0">
                          <div class={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            event.type === 'push' ? 'bg-glaucous/10 text-glaucous' :
                            event.type === 'review' ? 'bg-coral/10 text-coral' :
                            'bg-paleSky/10 text-paleSky'
                          }`}>
                            <span class={
                              event.type === 'push' ? 'i-ph-git-commit-bold text-lg' :
                              event.type === 'review' ? 'i-ph-shield-check-bold text-lg' :
                              'i-ph-git-pull-request-bold text-lg'
                            }></span>
                          </div>
                          <div class="min-w-0">
                            <p class="font-hind text-sm font-semibold text-ghostWhite truncate">{event.title}</p>
                            <p class="text-xs text-glaucous font-molengo mt-0.5">@{event.contributor}</p>
                          </div>
                        </div>

                        <div class="flex items-center gap-4 shrink-0">
                          <span class="text-xs text-coral font-montserrat bg-coral/5 border border-coral/20 px-2 py-1 rounded-lg">
                            +{event.xp} XP
                          </span>
                          <span class="text-xs text-glaucous font-hind hidden sm:inline">{event.time}</span>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-8">
              <div class="bg-brandCard/35 border border-blueSlate/15 rounded-3xl p-6 shadow-md">
                <h2 class="font-montserrat text-lg font-bold tracking-wide mb-4">Project Summary</h2>
                
                <div class="flex flex-col gap-4">
                  <div class="bg-brandCard/45 border border-blueSlate/10 rounded-2xl p-4 flex flex-col justify-between">
                    <span class="text-xs text-glaucous font-molengo tracking-wide">Total Repository XP</span>
                    <div class="font-montserrat text-3xl font-extrabold text-ghostWhite mt-2">
                      {contributors().reduce((sum, c) => sum + c.xp, 0)}
                    </div>
                  </div>

                  <div class="bg-brandCard/45 border border-blueSlate/10 rounded-2xl p-4 flex flex-col justify-between">
                    <span class="text-xs text-glaucous font-molengo tracking-wide">Active Contributor Count</span>
                    <div class="font-montserrat text-3xl font-extrabold text-paleSky mt-2">
                      {contributors().length} Developers
                    </div>
                  </div>

                  <div class="bg-brandCard/45 border border-blueSlate/10 rounded-2xl p-4 flex flex-col justify-between">
                    <span class="text-xs text-glaucous font-molengo tracking-wide">Weekly Activity Health</span>
                    <div class="font-montserrat text-3xl font-extrabold text-coral mt-2">
                      High Synergy
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-brandCard/35 border border-blueSlate/15 rounded-3xl p-6 shadow-md flex-1">
                <h2 class="font-montserrat text-lg font-bold tracking-wide mb-3">Tiers & Milestones</h2>
                <p class="text-xs text-glaucous font-molengo mb-6">RPG Level Class Achievements</p>

                <div class="flex flex-col gap-5">
                  <div class="border-l-2 border-coral pl-4">
                    <div class="font-montserrat font-bold text-sm text-ghostWhite">Vanguard Tier (Level 20+)</div>
                    <p class="text-xs text-glaucous mt-1 leading-relaxed">
                      Unlocked by core systems engineering and performance refactoring tasks.
                    </p>
                  </div>

                  <div class="border-l-2 border-paleSky pl-4">
                    <div class="font-montserrat font-bold text-sm text-ghostWhite">Artisan Tier (Level 10-19)</div>
                    <p class="text-xs text-glaucous mt-1 leading-relaxed">
                      Achieved through consistent pull reviews, automated flow integrations, and style enhancements.
                    </p>
                  </div>

                  <div class="border-l-2 border-glaucous pl-4">
                    <div class="font-montserrat font-bold text-sm text-ghostWhite">Novice Tier (Level 1-9)</div>
                    <p class="text-xs text-glaucous mt-1 leading-relaxed">
                      The starting progression path earned by closing detailed issues and commenting.
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
