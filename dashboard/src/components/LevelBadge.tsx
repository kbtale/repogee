
interface LevelBadgeProps {
  level: number;
  xp: number;
  class?: string;
}

export function LevelBadge(props: LevelBadgeProps) {
  return (
    <div class={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-theme-accent/10 border border-theme-accent/30 text-theme-accent text-xs font-bold font-montserrat uppercase tracking-wider ${props.class || ''}`}>
      <span class="w-2 h-2 rounded-full bg-theme-accent animate-pulse"></span>
      <span>LVL {props.level}</span>
      <span class="text-theme-secondary font-normal">({props.xp} XP)</span>
    </div>
  );
}
