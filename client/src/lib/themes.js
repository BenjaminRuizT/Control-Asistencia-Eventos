export const themePresets = {
  sports: {
    label: 'Deportes',
    preset: 'sports',
    primary: '#0f6bff',
    secondary: '#ff7a1a',
    accent: '#4ade80',
    background: '#07111f',
    text: '#f8fafc',
    motion: 'confetti',
    layout: 'stadium',
    icon: 'trophy',
    character: 'mascot',
    intensity: 72
  },
  valentine: {
    label: 'San Valentin',
    preset: 'valentine',
    primary: '#e11d48',
    secondary: '#fb7185',
    accent: '#fbbf24',
    background: '#2b0614',
    text: '#fff1f2',
    motion: 'hearts',
    layout: 'ribbon',
    icon: 'heart',
    character: 'spark',
    intensity: 62
  },
  christmas: {
    label: 'Navidad',
    preset: 'christmas',
    primary: '#0f7a4f',
    secondary: '#dc2626',
    accent: '#facc15',
    background: '#061410',
    text: '#f7fee7',
    motion: 'snow',
    layout: 'ornament',
    icon: 'gift',
    character: 'star',
    intensity: 70
  },
  easter: {
    label: 'Pascua',
    preset: 'easter',
    primary: '#22c55e',
    secondary: '#f9a8d4',
    accent: '#fde047',
    background: '#10261d',
    text: '#f0fdf4',
    motion: 'bubbles',
    layout: 'garden',
    icon: 'egg',
    character: 'bounce',
    intensity: 58
  },
  halloween: {
    label: 'Halloween',
    preset: 'halloween',
    primary: '#f97316',
    secondary: '#7c3aed',
    accent: '#84cc16',
    background: '#120817',
    text: '#fff7ed',
    motion: 'embers',
    layout: 'stage',
    icon: 'sparkles',
    character: 'shadow',
    intensity: 80
  }
};

export const motionOptions = [
  { value: 'confetti', label: 'Confeti' },
  { value: 'hearts', label: 'Corazones' },
  { value: 'snow', label: 'Nieve' },
  { value: 'bubbles', label: 'Burbujas' },
  { value: 'embers', label: 'Destellos' }
];

export const layoutOptions = [
  { value: 'stadium', label: 'Estadio' },
  { value: 'ribbon', label: 'Cintas' },
  { value: 'ornament', label: 'Ornamentos' },
  { value: 'garden', label: 'Jardin' },
  { value: 'stage', label: 'Escenario' }
];

export const iconOptions = [
  { value: 'trophy', label: 'Trofeo' },
  { value: 'heart', label: 'Corazon' },
  { value: 'gift', label: 'Regalo' },
  { value: 'egg', label: 'Pascua' },
  { value: 'sparkles', label: 'Brillo' }
];
