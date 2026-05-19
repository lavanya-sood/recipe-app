export function hexToRgba(hex: string, alpha: number): string {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${Math.min(Math.max(alpha, 0), 1)})`;
}

/** Blend two hex colors; `amount` is how much of `to` to apply (0–1). */
export function mixHex(from: string, to: string, amount: number): string {
  const parse = (hex: string) => {
    const n = hex.replace('#', '');
    return [
      parseInt(n.slice(0, 2), 16),
      parseInt(n.slice(2, 4), 16),
      parseInt(n.slice(4, 6), 16),
    ];
  };
  const [r1, g1, b1] = parse(from);
  const [r2, g2, b2] = parse(to);
  const t = Math.min(Math.max(amount, 0), 1);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

/** Vertical hero gradient stops derived from the theme primary color. */
export function primaryHeroGradientColors(primary: string): [string, string, string] {
  return [
    mixHex(primary, '#ffffff', 0.14),
    primary,
    mixHex(primary, '#000000', 0.32),
  ];
}
