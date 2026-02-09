export const CHART_PALETTE = [
  '#1A237E', // primary
  '#8BC34A', // accent
  '#0EA5E9',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#14B8A6',
  '#64748B',
];

export const CHART_GRID = 'rgba(255, 255, 255, 0.35)';
export const CHART_TICK = '#ffffff';

export function paletteColor(index: number) {
  return CHART_PALETTE[index % CHART_PALETTE.length];
}

export function rgba(hex: string, alpha: number) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function barDataset(label: string, data: number[], index = 0) {
  const c = paletteColor(index);
  return {
    label,
    data,
    backgroundColor: rgba(c, 0.6),
    borderColor: c,
    borderWidth: 1,
  };
}

export function lineDataset(label: string, data: number[], index = 0) {
  const c = paletteColor(index);
  return {
    label,
    data,
    borderColor: c,
    backgroundColor: rgba(c, 0.2),
    pointBackgroundColor: c,
    pointBorderColor: '#ffffff',
    borderWidth: 2,
    tension: 0.25,
    fill: false,
  };
}

export function doughnutDataset(data: number[]) {
  return {
    data,
    backgroundColor: data.map((_, i) => paletteColor(i)),
    borderColor: '#ffffff',
    borderWidth: 1,
  };
}
