import { ThemeIcon } from './ThemeIcon.jsx';

const motionMap = {
  confetti: ['◆', '●', '✦', '▰', '▲'],
  hearts: ['♡', '♥', '✦', '♡', '♥'],
  snow: ['✦', '·', '❄', '✧', '·'],
  bubbles: ['○', '◌', '●', '○', '◍'],
  embers: ['✦', '◆', '✧', '•', '✦']
};

export function AmbientMotion({ theme }) {
  const pieces = motionMap[theme.motion] || motionMap.confetti;
  const total = Math.max(12, Math.round((theme.intensity || 60) / 4));

  return (
    <div className={`ambient ambient-${theme.motion}`} aria-hidden="true">
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          className="ambient-piece"
          style={{
            '--x': `${(index * 37) % 100}%`,
            '--delay': `${(index % 9) * -0.8}s`,
            '--duration': `${8 + (index % 7)}s`
          }}
        >
          {pieces[index % pieces.length]}
        </span>
      ))}
      <div className="theme-character">
        <ThemeIcon name={theme.icon} size={84} />
      </div>
    </div>
  );
}
