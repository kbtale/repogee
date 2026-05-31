interface LandingViewProps {
  onLogin: () => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

export default function LandingView(props: LandingViewProps) {
  return (
    <div class="min-h-screen w-full flex flex-col bg-theme-bg transition-colors duration-200 overflow-x-hidden">
      <header class="max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 mt-2 sm:mt-4 sticky top-0 z-50">
        <div class="border border-theme-border rounded-full py-2.5 px-4 sm:px-6 flex justify-between items-center bg-theme-card transition-colors duration-200">
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="w-8 h-8 rounded-full bg-theme-accent flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 text-[#070A13]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <span class="font-montserrat font-extrabold text-sm sm:text-lg tracking-widest uppercase text-theme-primary">repogee</span>
          </div>

          <button
            onClick={props.onToggleTheme}
            class="px-4 py-2 rounded-full border border-theme-border text-theme-primary bg-theme-card hover:bg-theme-primary hover:text-theme-bg transition-all duration-200 flex items-center gap-2 text-xs font-montserrat uppercase font-semibold cursor-pointer shadow-sm"
          >
            {props.theme === 'dark' ? (
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
            ) : (
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            )}
            <span>{props.theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </header>

      <div class="flex-1 flex items-center justify-center px-6 py-12">
        <div class="max-w-md w-full bg-theme-card border border-theme-border rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center">
          <div class="w-20 h-20 rounded-full border border-theme-accent bg-transparent flex items-center justify-center mb-8 relative group hover:border-theme-primary transition-all duration-300">
            <svg class="w-10 h-10 text-theme-accent group-hover:text-theme-primary transition-colors duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />
            </svg>
          </div>

          <h1 class="font-montserrat text-4xl font-extrabold text-theme-primary tracking-tight mb-2">
            repogee
          </h1>
          
          <p class="font-molengo text-lg text-theme-secondary italic mb-8">
            The <span class="italic font-bold">Gamified</span> Engine Built for Contributors
          </p>

          <p class="font-hind text-sm text-theme-secondary mb-8 leading-relaxed max-w-sm">
            Onboard your project in seconds. Automatically track commits, PR merges, reviews, and wikis to build a real-time developer RPG leaderboard.
          </p>

          <button
            onClick={props.onLogin}
            class="w-full py-4 px-8 rounded-full bg-theme-accent hover:bg-theme-primary hover:text-theme-bg text-[#070A13] font-montserrat font-bold text-xs tracking-widest uppercase transition-all duration-200 cursor-pointer"
          >
            <span class="flex items-center justify-center gap-3">
              <svg class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              Authorize with GitHub
            </span>
          </button>

          <div class="mt-8 px-4 py-2 rounded-full border border-theme-border-sub bg-transparent flex items-center gap-2 text-[10px] text-theme-glaucous font-hind uppercase tracking-wider">
            <svg class="w-3 h-3 text-theme-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span>Zero database footprint • Stateless flow</span>
          </div>
        </div>
      </div>
    </div>
  )
}
