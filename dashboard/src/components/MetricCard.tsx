import { JSX } from 'solid-js';
import { Card } from './UI';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: JSX.Element;
  class?: string;
}

export function MetricCard(props: MetricCardProps) {
  return (
    <Card class={`flex flex-col gap-2 hover:border-theme-accent transition-colors duration-300 ${props.class || ''}`}>
      <div class="flex justify-between items-center text-sm font-semibold text-theme-secondary uppercase tracking-wider">
        <span>{props.title}</span>
        {props.icon && <div class="text-theme-accent">{props.icon}</div>}
      </div>
      <div class="text-3xl font-extrabold text-theme-primary my-1">
        {props.value}
      </div>
      {props.description && (
        <span class="text-xs text-theme-secondary">
          {props.description}
        </span>
      )}
    </Card>
  );
}
