import { Gift, Heart, Sparkles, Trophy } from 'lucide-react';

function EggIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 3c4.2 4.1 6.2 8 6.2 11.8A6.2 6.2 0 0 1 12 21a6.2 6.2 0 0 1-6.2-6.2C5.8 11 7.8 7.1 12 3Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 13.2c1.2-1 2.6-1 4 0s2.8 1 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 16.5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const icons = {
  trophy: Trophy,
  heart: Heart,
  gift: Gift,
  egg: EggIcon,
  sparkles: Sparkles
};

export function ThemeIcon({ name, ...props }) {
  const Icon = icons[name] || Trophy;
  return <Icon {...props} />;
}
