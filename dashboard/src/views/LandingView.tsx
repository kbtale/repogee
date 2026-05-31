interface LandingViewProps {
  onLogin: () => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

export default function LandingView(props: LandingViewProps) {
  return (
    <div class="min-h-screen w-full flex flex-col items-center justify-center bg-theme-bg px-4 relative transition-colors duration-200">
      <div class="absolute top-6 right-6">
        <button
          onClick={props.onToggleTheme}
          class="px-4 py-2 rounded-full border border-theme-border text-theme-primary hover:bg-theme-primary hover:text-theme-bg transition-all duration-200 flex items-center gap-2 text-xs font-montserrat uppercase font-semibold cursor-pointer active:scale-95"
        >
          <span class={props.theme === 'dark' ? "i-ph-sun-bold" : "i-ph-moon-bold"}></span>
          <span>{props.theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
      </div>

      <div class="max-w-md w-full bg-theme-card border border-theme-border rounded-3xl p-10 flex flex-col items-center text-center">
        <div class="w-20 h-20 rounded-full border border-theme-accent bg-transparent flex items-center justify-center mb-8 relative group hover:border-theme-primary transition-all duration-300">
          <span class="i-ph-brackets-angle-bold text-theme-accent text-3xl group-hover:text-theme-primary transition-colors duration-300"></span>
        </div>

        <h1 class="font-montserrat text-4xl font-extrabold text-theme-primary tracking-tight mb-2">
          repogee
        </h1>
        
        <p class="font-molengo text-lg text-theme-secondary italic mb-8">
          The <span class="italic font-bold">Gamified</span> Engine Built for Contributors
        </p>

        <p class="font-hind text-sm text-theme-glaucous mb-8 leading-relaxed max-w-sm">
          Onboard your project in seconds. Automatically track commits, PR merges, reviews, and wikis to build a real-time developer RPG leaderboard.
        </p>

        <button
          onClick={props.onLogin}
          class="w-full py-4 px-8 rounded-full bg-theme-accent hover:bg-theme-primary hover:text-theme-bg text-[#070A13] font-montserrat font-bold text-xs tracking-widest uppercase transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <span class="flex items-center justify-center gap-3">
            <span class="i-ph-github-logo-fill text-lg"></span>
            Authorize with GitHub
          </span>
        </button>

        <div class="mt-8 px-4 py-2 rounded-full border border-theme-border-sub bg-transparent flex items-center gap-2 text-[10px] text-theme-glaucous font-hind uppercase tracking-wider">
          <span class="i-ph-lock-key-fill text-theme-accent"></span>
          <span>Zero database footprint • Stateless flow</span>
        </div>
      </div>
    </div>
  )
}
