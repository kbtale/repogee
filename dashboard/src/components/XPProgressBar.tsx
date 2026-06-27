interface XPProgressBarProps {
  xp: number;
  nextLevelXP: number;
  class?: string;
}

export function XPProgressBar(props: XPProgressBarProps) {
  const percentage = () => {
    if (props.nextLevelXP <= 0) return 100;
    return Math.min(100, Math.max(0, (props.xp / props.nextLevelXP) * 100));
  };

  return (
    <div class={`w-full flex flex-col gap-1.5 ${props.class || ''}`}>
      <div class="flex justify-between items-center text-xs font-bold font-montserrat text-theme-secondary uppercase tracking-wider">
        <span>XP Progress</span>
        <span>{props.xp} / {props.nextLevelXP} XP</span>
      </div>
      <div class="w-full h-3 bg-theme-bg border border-theme-border rounded-full overflow-hidden p-0.5">
        <div 
          class="h-full bg-gradient-to-r from-theme-accent to-theme-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage()}%` }}
        />
      </div>
    </div>
  );
}
