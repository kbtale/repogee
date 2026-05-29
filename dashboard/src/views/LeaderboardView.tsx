import { createSignal, onMount, For, Show } from 'solid-js'
import RadarChart from '../components/RadarChart'

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
  const [activeTab, setActiveTab] = createSignal<'dashboard' | 'analytics' | 'repos' | 'settings'>('dashboard')
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

  const getActiveUser = () => {
    const list = contributors()
    return list.length > 0 ? list[0] : fallbackContributors[0]
  }

  const getRadarStats = (user: Contributor) => {
    const c = user.class
    if (c === 'SystemsEngineer' || c === 'ComputeArchitect' || c === 'BackendDeveloper') {
      return { systems: 0.85, uiux: 0.35, dataScience: 0.45, automation: 0.70, qa: 0.75 }
    }
    if (c === 'FrontendArtisan' || c === 'StyleSculptor' || c === 'MobileDeveloper') {
      return { systems: 0.35, uiux: 0.95, dataScience: 0.25, automation: 0.55, qa: 0.80 }
    }
    if (c === 'DataAlchemist' || c === 'Bioinformatician' || c === 'DatabaseAdministrator' || c === 'NoSqlSpecialist') {
      return { systems: 0.55, uiux: 0.35, dataScience: 0.95, automation: 0.65, qa: 0.55 }
    }
    if (c === 'DevOpsEngineer' || c === 'IaCArchitect') {
      return { systems: 0.75, uiux: 0.25, dataScience: 0.45, automation: 0.98, qa: 0.75 }
    }
    if (c === 'QaEngineer' || c === 'CodeSanitarian') {
      return { systems: 0.65, uiux: 0.45, dataScience: 0.35, automation: 0.75, qa: 0.95 }
    }
    return { systems: 0.60, uiux: 0.60, dataScience: 0.60, automation: 0.60, qa: 0.60 }
  }

  const events: ActivityEvent[] = [
    { id: '1', title: 'Refactored Rust Webhook Core Engine', contributor: 'arnold_warner', xp: 50, time: '7:12 AM', type: 'push' },
    { id: '2', title: 'Submitted Approved Pull Request Review', contributor: 'arnold_warner', xp: 25, time: '10:30 AM', type: 'review' },
    { id: '3', title: 'Opened Detailed Architectural Discussion', contributor: 'clara_dev', xp: 10, time: '1:45 PM', type: 'pr_open' },
    { id: '4', title: 'Added Multi-Threaded Cache Benchmarks', contributor: 'arnold_warner', xp: 15, time: '6:00 PM', type: 'push' },
  ]

  return (
    <div class="min-h-screen bg-black text-ghostWhite font-hind flex flex-row">
      <aside class="w-20 md:w-24 border-r border-blueSlate/20 flex flex-col justify-between items-center py-8 bg-brandCard/15 backdrop-blur-md sticky top-0 h-screen z-50">
        <div class="flex flex-col items-center gap-12">
          <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-glaucous to-coral flex items-center justify-center shadow-lg shadow-coral/15">
            <span class="i-ph-shield-check-bold text-white text-2xl"></span>
          </div>

          <nav class="flex flex-col gap-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              class={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${activeTab() === 'dashboard' ? 'bg-brandCard text-coral border border-coral/30 shadow-md' : 'text-glaucous hover:text-paleSky'}`}
            >
              <span class="i-ph-house-bold text-xl"></span>
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
            >
              <span class="i-ph-folder-bold text-xl"></span>
            </button>
          </nav>
        </div>

        <button
          onClick={props.onLogout}
          class="w-12 h-12 rounded-2xl flex items-center justify-center text-glaucous hover:text-coral transition-all duration-200"
        >
          <span class="i-ph-gear-bold text-xl"></span>
        </button>
      </aside>

      <div class="flex-1 flex flex-col min-w-0">
        <header class="h-20 border-b border-blueSlate/10 px-8 flex justify-between items-center bg-brandCard/5 backdrop-blur-sm sticky top-0 z-40">
          <h1 class="font-montserrat text-2xl font-extrabold tracking-tight">Dashboard</h1>

          <div class="flex items-center gap-6">
            <div class="relative hidden md:block w-64">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 i-ph-magnifying-glass-bold text-glaucous"></span>
              <input
                type="text"
                placeholder="Search anything..."
                class="w-full pl-11 pr-4 py-2 bg-brandCard/45 border border-blueSlate/20 rounded-2xl text-sm text-ghostWhite placeholder-glaucous/50 focus:outline-none focus:border-coral/40"
              />
            </div>
            
            <button class="relative p-2 text-glaucous hover:text-paleSky transition-colors">
              <span class="i-ph-bell-bold text-xl"></span>
              <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-coral animate-ping"></span>
            </button>

            <div class="flex items-center gap-3">
              <div class="text-right hidden sm:block">
                <div class="font-montserrat text-sm font-bold text-ghostWhite">{getActiveUser().username}</div>
                <div class="text-xs text-glaucous font-molengo">Level {getActiveUser().level} {getActiveUser().subclass}</div>
              </div>
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
              <p class="text-glaucous font-molengo">Loading leaderboard data...</p>
            </div>
          }
        >
          <div class="flex-1 overflow-y-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 flex flex-col gap-8">
              <div class="bg-brandCard/35 border border-blueSlate/15 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-md">
                <div class="flex justify-between items-center mb-6">
                  <h2 class="font-montserrat text-xl font-bold tracking-wide">Developer Health</h2>
                  <span class="font-hind text-sm text-coral">Your focus has improved by <strong class="font-bold">12%</strong> this week</span>
                </div>

                <div class="relative w-full h-8 bg-brandCard/65 border border-blueSlate/25 rounded-2xl p-1 mb-3 flex items-center">
                  <div class="h-full w-70% rounded-xl bg-gradient-to-r from-glaucous via-paleSky to-coral shadow-inner"></div>
                  <div class="absolute left-70% -translate-x-1/2 w-6 h-6 rounded-full bg-ghostWhite border-2 border-coral shadow-lg flex items-center justify-center">
                    <div class="w-2 h-2 rounded-full bg-coral"></div>
                  </div>
                </div>

                <div class="flex justify-between text-xs text-glaucous font-molengo tracking-wider px-1 mb-8">
                  <span>Low</span>
                  <span>Balanced</span>
                  <span class="text-coral font-bold">Avg</span>
                  <span>High</span>
                </div>

                <div class="grid grid-cols-3 gap-4 mb-8">
                  <div class="bg-brandCard/45 border border-blueSlate/10 rounded-2xl p-4 flex flex-col justify-between">
                    <span class="text-xs text-glaucous font-molengo tracking-wide">XP Velocity</span>
                    <div class="flex items-baseline gap-1 mt-2">
                      <span class="font-montserrat text-2xl font-bold text-ghostWhite">18</span>
                      <span class="text-xs text-glaucous">/32</span>
                    </div>
                    <span class="text-[10px] text-green-400 font-hind mt-2 flex items-center gap-1">
                      <span class="i-ph-arrow-up-right-bold"></span> +12.7%
                    </span>
                  </div>

                  <div class="bg-brandCard/45 border border-blueSlate/10 rounded-2xl p-4 flex flex-col justify-between">
                    <span class="text-xs text-glaucous font-molengo tracking-wide">Dopamine Level</span>
                    <div class="flex items-baseline gap-1 mt-2">
                      <span class="font-montserrat text-2xl font-bold text-ghostWhite">80</span>
                      <span class="text-xs text-glaucous">/100</span>
                    </div>
                    <span class="text-[10px] text-coral font-hind mt-2 flex items-center gap-1">
                      <span class="i-ph-arrow-down-left-bold"></span> -34.5%
                    </span>
                  </div>

                  <div class="bg-brandCard/45 border border-blueSlate/10 rounded-2xl p-4 flex flex-col justify-between">
                    <span class="text-xs text-glaucous font-molengo tracking-wide">Calm Level</span>
                    <div class="flex items-baseline gap-1 mt-2">
                      <span class="font-montserrat text-2xl font-bold text-ghostWhite">41</span>
                      <span class="text-xs text-glaucous">/50</span>
                    </div>
                    <span class="text-[10px] text-green-400 font-hind mt-2 flex items-center gap-1">
                      <span class="i-ph-arrow-up-right-bold"></span> +24%
                    </span>
                  </div>
                </div>

                <div class="flex gap-4 items-start bg-coral/5 border border-coral/15 rounded-2xl p-4">
                  <span class="i-ph-sparkle-fill text-coral text-lg mt-0.5 shrink-0"></span>
                  <p class="font-hind text-sm text-paleSky leading-relaxed">
                    You've stayed consistent with your commit streak for 5 days. Keeping this pace helps reduce review latency and enhances project velocity significantly. Keep it up!
                  </p>
                </div>
              </div>

              <div class="bg-brandCard/35 border border-blueSlate/15 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-md flex-1">
                <div class="flex justify-between items-center mb-6">
                  <h2 class="font-montserrat text-xl font-bold tracking-wide">Today's Activity</h2>
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
              <div class="bg-brandCard/35 border border-blueSlate/15 rounded-3xl p-6 backdrop-blur-md shadow-md">
                <div class="flex justify-between items-center mb-6">
                  <h2 class="font-montserrat text-lg font-bold tracking-wide">Synergy Statistics</h2>
                  <span class="text-xs text-glaucous border border-blueSlate/30 px-2 py-1 rounded-lg font-molengo">Today</span>
                </div>

                <div class="flex items-center justify-between bg-brandCard/45 border border-blueSlate/10 rounded-2xl p-6">
                  <div>
                    <div class="font-montserrat text-4xl font-extrabold text-ghostWhite">93%</div>
                    <div class="text-xs text-coral font-molengo tracking-wider uppercase mt-1">Synergetic</div>
                  </div>
                  <div class="w-16 h-16 rounded-2xl bg-coral/10 border border-coral/20 flex items-center justify-center text-4xl shadow-inner shadow-coral/5 animate-pulse">
                    ⚡
                  </div>
                </div>
              </div>

              <div class="bg-brandCard/35 border border-blueSlate/15 rounded-3xl p-6 backdrop-blur-md shadow-md flex-1 flex flex-col justify-between">
                <div>
                  <h2 class="font-montserrat text-lg font-bold tracking-wide mb-2">Overall Score</h2>
                  <p class="text-xs text-glaucous font-molengo">Developer Specialization Attributes</p>
                  
                  <div class="my-6">
                    <RadarChart stats={getRadarStats(getActiveUser())} />
                  </div>
                </div>

                <div class="flex flex-col gap-4 border-t border-blueSlate/15 pt-6">
                  <h3 class="font-montserrat text-xs font-bold uppercase tracking-wider text-glaucous">Breakdown</h3>

                  <div class="flex flex-col gap-3">
                    <div class="flex items-center justify-between text-sm">
                      <div class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-coral"></span>
                        <span class="font-hind text-ghostWhite">Systems Optimization</span>
                      </div>
                      <span class="font-montserrat font-bold text-coral text-xs">
                        {getRadarStats(getActiveUser()).systems > 0.8 ? 'Expert' : 'Good'}
                      </span>
                    </div>

                    <div class="flex items-center justify-between text-sm">
                      <div class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-paleSky"></span>
                        <span class="font-hind text-ghostWhite">UI/UX Craftsmanship</span>
                      </div>
                      <span class="font-montserrat font-bold text-paleSky text-xs">
                        {getRadarStats(getActiveUser()).uiux > 0.8 ? 'Expert' : 'Good'}
                      </span>
                    </div>

                    <div class="flex items-center justify-between text-sm">
                      <div class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-glaucous"></span>
                        <span class="font-hind text-ghostWhite">Automation & CI/CD</span>
                      </div>
                      <span class="font-montserrat font-bold text-glaucous text-xs">
                        {getRadarStats(getActiveUser()).automation > 0.8 ? 'Expert' : 'Good'}
                      </span>
                    </div>
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
