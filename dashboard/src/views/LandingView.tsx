interface LandingViewProps {
  onLogin: () => void
}

export default function LandingView(props: LandingViewProps) {
  return (
    <div class="min-h-screen w-full flex items-center justify-center bg-black px-4">
      <div class="relative max-w-lg w-full bg-brandCard/45 border border-glaucous/20 rounded-3xl p-10 md:p-12 backdrop-blur-md shadow-2xl flex flex-col items-center text-center">
        <div class="absolute -top-12 w-24 h-24 rounded-3xl bg-gradient-to-tr from-glaucous to-coral flex items-center justify-center shadow-lg shadow-coral/20">
          <div class="i-ph-shield-check-bold text-white text-5xl"></div>
        </div>

        <h1 class="font-montserrat text-4xl md:text-5xl font-extrabold text-ghostWhite mt-8 mb-3 tracking-tight">
          repogee
        </h1>
        
        <p class="font-molengo text-lg md:text-xl text-paleSky mb-8">
          Repository Gamification Engine
        </p>

        <p class="font-hind text-base text-glaucous mb-10 leading-relaxed max-w-sm">
          Onboard your project in seconds. Automatically track commits, PR merges, reviews, and wikis to build a real-time developer RPG leaderboard.
        </p>

        <button
          onClick={props.onLogin}
          class="group relative w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-glaucous via-paleSky to-coral text-black font-montserrat font-bold text-base tracking-wide shadow-lg shadow-coral/10 hover:shadow-coral/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <div class="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          <span class="flex items-center justify-center gap-3">
            <span class="i-ph-github-logo-fill text-2xl"></span>
            Authorize with GitHub
          </span>
        </button>

        <div class="mt-8 flex items-center gap-2 text-xs text-blueSlate font-hind">
          <span class="i-ph-lock-key-fill"></span>
          <span>Zero database footprint. Fully open-source and stateless.</span>
        </div>
      </div>
    </div>
  )
}
