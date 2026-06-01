import { Button, Card, PillHeader } from '../components/UI'

interface LandingViewProps {
  onLogin: () => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

export default function LandingView(props: LandingViewProps) {
  const scrollToFeatures = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div class="min-h-screen w-full flex flex-col bg-theme-bg transition-colors duration-200 overflow-x-hidden pb-12">
      <PillHeader>
        <div class="flex items-center gap-2 sm:gap-3">
          <div class="w-8 h-8 rounded-full bg-theme-accent flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-[#070A13]" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5.338 1.59a61 61 0 0 0-2.837.856.48.48 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.7 10.7 0 0 0 2.287 2.233c.346.244.652.42.893.533q.18.085.293.118a1 1 0 0 0 .101.025 1 1 0 0 0 .1-.025q.114-.034.294-.118c.24-.113.547-.29.893-.533a10.7 10.7 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.8 11.8 0 0 1-2.517 2.453 7 7 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7 7 0 0 1-1.048-.625 11.8 11.8 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 63 63 0 0 1 5.072.56"/>
              <path d="M10.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
            </svg>
          </div>
          <span class="font-montserrat font-extrabold text-sm sm:text-base tracking-widest uppercase text-theme-primary">repogee</span>
        </div>

        <div class="flex items-center gap-3">
          <button
            onClick={() => scrollToFeatures('how-it-works')}
            class="hidden md:block text-xs font-montserrat uppercase font-semibold text-theme-secondary hover:text-theme-primary px-3 py-1 cursor-pointer transition-colors duration-200"
          >
            How it works
          </button>
          <button
            onClick={() => scrollToFeatures('features-section')}
            class="hidden md:block text-xs font-montserrat uppercase font-semibold text-theme-secondary hover:text-theme-primary px-3 py-1 cursor-pointer transition-colors duration-200"
          >
            Features
          </button>
          <button
            onClick={props.onToggleTheme}
            class="p-2 rounded-full border border-theme-border text-theme-primary bg-theme-bg hover:bg-theme-primary hover:text-theme-bg transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm"
            title="Toggle Theme"
          >
            {props.theme === 'dark' ? (
              <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>
              </svg>
            ) : (
              <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278M4.858 1.311A7.27 7.27 0 0 0 1.025 7.71c0 4.02 3.279 7.276 7.319 7.276a7.32 7.32 0 0 0 5.205-2.162q-.506.063-1.029.063c-4.61 0-8.343-3.714-8.343-8.29 0-1.167.242-2.278.681-3.286"/>
              </svg>
            )}
          </button>
          <Button variant="secondary" onClick={props.onLogin} class="py-2 px-4 sm:px-6">
            <span>Login</span>
          </Button>
        </div>
      </PillHeader>

      <section class="max-w-4xl w-full mx-auto px-6 pt-16 sm:pt-28 pb-16 flex flex-col items-center text-center">
        <div class="w-20 h-20 rounded-full border border-theme-accent bg-transparent flex items-center justify-center mb-8 group hover:border-theme-primary transition-all duration-300">
          <svg class="w-10 h-10 text-theme-accent group-hover:text-theme-primary transition-colors duration-300" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5.338 1.59a61 61 0 0 0-2.837.856.48.48 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.7 10.7 0 0 0 2.287 2.233c.346.244.652.42.893.533q.18.085.293.118a1 1 0 0 0 .101.025 1 1 0 0 0 .1-.025q.114-.034.294-.118c.24-.113.547-.29.893-.533a10.7 10.7 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.8 11.8 0 0 1-2.517 2.453 7 7 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7 7 0 0 1-1.048-.625 11.8 11.8 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 63 63 0 0 1 5.072.56"/>
            <path d="M10.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
          </svg>
        </div>

        <h1 class="font-montserrat text-4xl sm:text-6xl font-extrabold text-theme-primary tracking-tight leading-tight max-w-3xl mb-6">
          Gamified progression boards for code repositories
        </h1>
        
        <p class="font-molengo text-lg sm:text-xl text-theme-secondary italic max-w-2xl mb-10 leading-relaxed">
          Turn git contributions into RPG milestones. Trace commits, reviews, and pull requests to build team leaderboards.
        </p>

        <div class="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Button variant="primary" onClick={props.onLogin} class="w-full sm:w-auto py-4 px-8">
            <svg class="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
            </svg>
            <span>Connect with GitHub</span>
          </Button>
          <Button variant="outline" onClick={() => scrollToFeatures('how-it-works')} class="w-full sm:w-auto py-4 px-8">
            <span>Explore How it Works</span>
          </Button>
        </div>
      </section>

      <section id="how-it-works" class="max-w-6xl w-full mx-auto px-6 py-16 border-t border-theme-border-sub mt-12">
        <div class="text-center mb-16">
          <h2 class="font-montserrat text-2xl sm:text-4xl font-extrabold text-theme-primary tracking-tight mb-2">
            How It Works
          </h2>
          <p class="font-molengo text-base sm:text-lg text-theme-secondary italic">
            Three quick steps
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card class="flex flex-col justify-between">
            <div>
              <svg class="w-8 h-8 text-theme-accent mb-6 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9"/>
                <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z"/>
              </svg>
              <h3 class="font-montserrat font-bold text-base text-theme-primary mb-3 uppercase tracking-wide">Connect Account</h3>
              <p class="text-xs text-theme-secondary font-hind leading-relaxed">
                Authorize access with your GitHub profile. We scan repositories and lay down the foundations for progression modeling.
              </p>
            </div>
            <div class="text-[10px] text-theme-glaucous font-montserrat uppercase tracking-widest mt-8 font-semibold">Step 01 • Connect</div>
          </Card>

          <Card class="flex flex-col justify-between">
            <div>
              <svg class="w-8 h-8 text-theme-secondary mb-6 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                <path d="M7.068.727c.243-.97 1.62-.97 1.864 0l.071.286a.96.96 0 0 0 1.622.434l.205-.211c.695-.719 1.888-.03 1.613.931l-.08.284a.96.96 0 0 0 1.187 1.187l.283-.081c.96-.275 1.65.918.931 1.613l-.211.205a.96.96 0 0 0 .434 1.622l.286.071c.97.243.97 1.62 0 1.864l-.286.071a.96.96 0 0 0-.434 1.622l.211.205c.719.695.03 1.888-.931 1.613l-.284-.08a.96.96 0 0 0-1.187 1.187l.081.283c.275.96-.918 1.65-1.613.931l-.205-.211a.96.96 0 0 0-1.622.434l-.071.286c-.243.97-1.62.97-1.864 0l-.071-.286a.96.96 0 0 0-1.622-.434l-.205.211c-.695.719-1.888.03-1.613-.931l.08-.284a.96.96 0 0 0-1.186-1.187l-.284.081c-.96.275-1.65-.918-.931-1.613l.211-.205a.96.96 0 0 0-.434-1.622l-.286-.071c-.97-.243-.97-1.62 0-1.864l.286-.071a.96.96 0 0 0 .434-1.622l-.211-.205c-.719-.695-.03-1.888.931-1.613l.284.08a.96.96 0 0 0 1.187-1.186l-.081-.284c-.275-.96.918-1.65 1.613-.931l.205.211a.96.96 0 0 0 1.622-.434zM12.973 8.5H8.25l-2.834 3.779A4.998 4.998 0 0 0 12.973 8.5m0-1a4.998 4.998 0 0 0-7.557-3.779l2.834 3.78zM5.048 3.967l-.087.065zm-.431.355A4.98 4.98 0 0 0 3.002 8c0 1.455.622 2.765 1.615 3.678L7.375 8zm.344 7.646.087.065z"/>
              </svg>
              <h3 class="font-montserrat font-bold text-base text-theme-primary mb-3 uppercase tracking-wide">Plant Config</h3>
              <p class="text-xs text-theme-secondary font-hind leading-relaxed">
                Select your repository. We write a flat-file config to your codebase. Ranks and points parse without database footprints.
              </p>
            </div>
            <div class="text-[10px] text-theme-glaucous font-montserrat uppercase tracking-widest mt-8 font-semibold">Step 02 • Seed</div>
          </Card>

          <Card class="flex flex-col justify-between">
            <div>
              <svg class="w-8 h-8 text-theme-accent mb-6 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5q0 .807-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33 33 0 0 1 2.5.5m.099 2.54a2 2 0 0 0 .72 3.935c-.333-1.05-.588-2.346-.72-3.935m10.083 3.935a2 2 0 0 0 .72-3.935c-.133 1.59-.388 2.885-.72 3.935"/>
              </svg>
              <h3 class="font-montserrat font-bold text-base text-theme-primary mb-3 uppercase tracking-wide">Rise the Ranks</h3>
              <p class="text-xs text-theme-secondary font-hind leading-relaxed">
                Commit pushes and review actions generate experience points. Developers assign to subclass archetypes and rise on scoreboards.
              </p>
            </div>
            <div class="text-[10px] text-theme-glaucous font-montserrat uppercase tracking-widest mt-8 font-semibold">Step 03 • Compete</div>
          </Card>
        </div>
      </section>

      <section id="features-section" class="max-w-6xl w-full mx-auto px-6 py-16 border-t border-theme-border-sub mt-12">
        <div class="text-center mb-16">
          <h2 class="font-montserrat text-2xl sm:text-4xl font-extrabold text-theme-primary tracking-tight mb-2">
            Features
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card class="flex gap-6 items-start">
            <div class="w-10 h-10 rounded-full bg-theme-accent/10 border border-theme-accent/25 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-theme-accent" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5.338 1.59a61 61 0 0 0-2.837.856.48.48 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.7 10.7 0 0 0 2.287 2.233c.346.244.652.42.893.533q.18.085.293.118a1 1 0 0 0 .101.025 1 1 0 0 0 .1-.025q.114-.034.294-.118c.24-.113.547-.29.893-.533a10.7 10.7 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.8 11.8 0 0 1-2.517 2.453 7 7 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7 7 0 0 1-1.048-.625 11.8 11.8 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 63 63 0 0 1 5.072.56"/>
                <path d="M10.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
              </svg>
            </div>
            <div>
              <h3 class="font-montserrat font-bold text-base text-theme-primary mb-2 uppercase tracking-wide">Stateless Parsing</h3>
              <p class="text-xs text-theme-secondary font-hind leading-relaxed">
                No databases. Repogee parses stats from a local SCORE.md file in your repository. Ranks generate without persistence management.
              </p>
            </div>
          </Card>

          <Card class="flex gap-6 items-start">
            <div class="w-10 h-10 rounded-full bg-theme-secondary/10 border border-theme-secondary/25 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-theme-secondary" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-montserrat font-bold text-base text-theme-primary mb-2 uppercase tracking-wide">Developer Subclasses</h3>
              <p class="text-xs text-theme-secondary font-hind leading-relaxed">
                Map commits to roles. Track developer composition as Frontend, Backend, or DevOps subclasses.
              </p>
            </div>
          </Card>

          <Card class="flex gap-6 items-start">
            <div class="w-10 h-10 rounded-full bg-theme-accent/10 border border-theme-accent/25 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-theme-accent" viewBox="0 0 16 16" fill="currentColor">
                <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9"/>
                <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-montserrat font-bold text-base text-theme-primary mb-2 uppercase tracking-wide">Webhook Sync</h3>
              <p class="text-xs text-theme-secondary font-hind leading-relaxed">
                Pushes and review actions update rankings via secure GitHub webhooks.
              </p>
            </div>
          </Card>

          <Card class="flex gap-6 items-start">
            <div class="w-10 h-10 rounded-full bg-theme-secondary/10 border border-theme-secondary/25 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-theme-secondary" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5q0 .807-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33 33 0 0 1 2.5.5m.099 2.54a2 2 0 0 0 .72 3.935c-.333-1.05-.588-2.346-.72-3.935m10.083 3.935a2 2 0 0 0 .72-3.935c-.133 1.59-.388 2.885-.72 3.935"/>
              </svg>
            </div>
            <div>
              <h3 class="font-montserrat font-bold text-base text-theme-primary mb-2 uppercase tracking-wide">Achievement Badges</h3>
              <p class="text-xs text-theme-secondary font-hind leading-relaxed">
                Track levels, experience milestones, and rank badges as contributors progress.
              </p>
            </div>
          </Card>
        </div>
      </section>

      <section class="max-w-md w-full mx-auto px-6 py-12 text-center">
        <Card class="flex flex-col items-center">
          <h2 class="font-montserrat text-xl font-extrabold text-theme-primary mb-3 uppercase tracking-widest">Get started</h2>
          <p class="text-xs text-theme-secondary font-hind mb-6 max-w-xs leading-relaxed">
            Begin gamifying team contribution progression. Open source and integrated with GitHub profiles.
          </p>
          <Button variant="primary" onClick={props.onLogin} class="w-full py-3.5 px-6">
            <svg class="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
            </svg>
            <span>Connect with GitHub</span>
          </Button>
        </Card>
      </section>

      <footer class="max-w-6xl w-full mx-auto px-6 mt-16 border-t border-theme-border/20 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-theme-secondary font-hind">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-full bg-theme-accent flex items-center justify-center shrink-0">
            <svg class="w-3.5 h-3.5 text-[#070A13]" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5.338 1.59a61 61 0 0 0-2.837.856.48.48 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.7 10.7 0 0 0 2.287 2.233c.346.244.652.42.893.533q.18.085.293.118a1 1 0 0 0 .101.025 1 1 0 0 0 .1-.025q.114-.034.294-.118c.24-.113.547-.29.893-.533a10.7 10.7 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.8 11.8 0 0 1-2.517 2.453 7 7 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7 7 0 0 1-1.048-.625 11.8 11.8 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 63 63 0 0 1 5.072.56"/>
              <path d="M10.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
            </svg>
          </div>
          <span class="font-montserrat font-extrabold uppercase tracking-widest text-theme-primary">repogee</span>
        </div>
        <div class="flex items-center gap-6">
          <Button
            href="https://github.com/kbtale/repogee"
            target="_blank"
            variant="outline"
            class="py-2.5 px-5 text-[10px]"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
            </svg>
            <span>GitHub</span>
          </Button>
          <span>© 2026 Repogee. Open Source under GNU GPL v3.</span>
        </div>
      </footer>
    </div>
  )
}
