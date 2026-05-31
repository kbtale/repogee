interface LandingViewProps {
  onLogin: () => void
}

export default function LandingView(props: LandingViewProps) {
  return (
    <div class="min-h-screen w-full flex items-center justify-center bg-black px-4">
      <div class="max-w-md w-full bg-black border border-blueSlate rounded-xl p-8 flex flex-col items-center text-center">
        <div class="w-16 h-16 rounded-xl bg-coral flex items-center justify-center mb-6">
          <div class="i-ph-shield-check-bold text-black text-3xl"></div>
        </div>

        <h1 class="font-montserrat text-3xl font-extrabold text-ghostWhite mb-2">
          repogee
        </h1>
        
        <p class="font-molengo text-lg text-paleSky mb-8">
          Repository Gamification Engine
        </p>

        <p class="font-hind text-sm text-glaucous mb-8 leading-relaxed max-w-sm">
          Onboard your project in seconds. Automatically track commits, PR merges, reviews, and wikis to build a real-time developer RPG leaderboard.
        </p>

        <button
          onClick={props.onLogin}
          class="w-full py-4 px-6 rounded-xl bg-coral hover:bg-coral text-black font-montserrat font-bold text-sm tracking-wider uppercase transition-all duration-150"
        >
          <span class="flex items-center justify-center gap-3">
            <span class="i-ph-github-logo-fill text-xl"></span>
            Authorize with GitHub
          </span>
        </button>

        <div class="mt-6 flex items-center gap-2 text-xs text-blueSlate font-hind">
          <span class="i-ph-lock-key-fill"></span>
          <span>Zero database footprint. Fully open-source and stateless.</span>
        </div>
      </div>
    </div>
  )
}
