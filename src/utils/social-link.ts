import type { RecipeSocialPlatform } from '@/types/recipe';

export const SOCIAL_PLATFORMS: RecipeSocialPlatform[] = [
  'instagram',
  'tiktok',
  'facebook',
  'youtube',
];

export const SOCIAL_PLATFORM_LABELS: Record<RecipeSocialPlatform, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  youtube: 'YouTube',
};

function withScheme(raw: string) {
  const t = raw.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

function hostOf(href: string): string | null {
  try {
    return new URL(href).hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
  } catch {
    return null;
  }
}

function detectPlatform(host: string): RecipeSocialPlatform | null {
  if (host.endsWith('instagram.com') || host === 'instagr.am') return 'instagram';
  if (host.endsWith('tiktok.com')) return 'tiktok';
  if (host.endsWith('facebook.com') || host.endsWith('fb.com') || host === 'fb.watch') return 'facebook';
  if (
    host.endsWith('youtube.com') ||
    host === 'youtu.be' ||
    host.endsWith('youtube-nocookie.com')
  ) {
    return 'youtube';
  }
  return null;
}

/** Returns normalized URL and detected platform when valid. */
export function parseSocialRecipeUrl(
  raw: string,
  expectedPlatform?: RecipeSocialPlatform,
): { platform: RecipeSocialPlatform; normalized: string } | null {
  const href = withScheme(raw);
  if (!href) return null;
  const host = hostOf(href);
  if (!host) return null;

  const platform = detectPlatform(host);
  if (!platform) return null;
  if (expectedPlatform && platform !== expectedPlatform) return null;

  return { platform, normalized: href };
}

export function platformPlaceholder(platform: RecipeSocialPlatform): string {
  switch (platform) {
    case 'instagram':
      return 'https://www.instagram.com/reel/…';
    case 'tiktok':
      return 'https://www.tiktok.com/@user/video/…';
    case 'facebook':
      return 'https://www.facebook.com/reel/…';
    case 'youtube':
      return 'https://www.youtube.com/watch?v=…';
  }
}
