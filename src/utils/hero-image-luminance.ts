import { Platform } from 'react-native';

function parseHex(hex: string): [number, number, number] | null {
  const normalized = hex.replace('#', '').trim();
  if (normalized.length !== 6 && normalized.length !== 3) return null;
  if (normalized.length === 3) {
    const r = parseInt(normalized[0] + normalized[0], 16);
    const g = parseInt(normalized[1] + normalized[1], 16);
    const b = parseInt(normalized[2] + normalized[2], 16);
    return [r, g, b];
  }
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return [r, g, b];
}

export function isLightColor(color: string): boolean {
  const rgb =
    color.startsWith('rgb') ?
      color
        .replace(/[^\d,]/g, '')
        .split(',')
        .slice(0, 3)
        .map(Number)
    : parseHex(color);
  if (!rgb || rgb.length < 3) return true;
  const [r, g, b] = rgb;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55;
}

async function isHeroImageLightWeb(uri: string): Promise<boolean> {
  if (typeof document === 'undefined') return true;

  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const sampleHeight = Math.max(1, Math.floor(img.height * 0.28));
      canvas.width = 32;
      canvas.height = 10;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(true);
        return;
      }
      ctx.drawImage(img, 0, 0, img.width, sampleHeight, 0, 0, 32, 10);
      const { data } = ctx.getImageData(0, 0, 32, 10);
      let sum = 0;
      const pixels = data.length / 4;
      for (let i = 0; i < data.length; i += 4) {
        sum += (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
      }
      resolve(sum / pixels > 0.55);
    };
    img.onerror = () => resolve(true);
    img.src = uri;
  });
}

/**
 * True when the hero's upper region is light (use dark header text).
 * Returns null on native when luminance cannot be sampled (Expo Go / no native module).
 */
export async function isHeroImageLight(imageUri: string): Promise<boolean | null> {
  try {
    if (Platform.OS === 'web') {
      return isHeroImageLightWeb(imageUri);
    }
    return null;
  } catch {
    return null;
  }
}
