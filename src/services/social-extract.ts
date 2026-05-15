import type { RecipeSocialPlatform } from '@/types/recipe';
import { parseRecipeCaption, type ParsedCaption } from '@/utils/parse-recipe-caption';
import { parseSocialRecipeUrl } from '@/utils/social-link';

export type SocialExtractResult = {
  platform: RecipeSocialPlatform;
  url: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  parsed: ParsedCaption;
  source: 'supadata' | 'caption-only';
};

export type SocialExtractErrorCode =
  | 'invalid-url'
  | 'platform-mismatch'
  | 'no-api-key'
  | 'fetch-failed'
  | 'no-content';

export class SocialExtractError extends Error {
  constructor(
    message: string,
    readonly code: SocialExtractErrorCode,
  ) {
    super(message);
    this.name = 'SocialExtractError';
  }
}

type SupadataResponse = {
  title?: string | null;
  description?: string | null;
  media?: {
    thumbnailUrl?: string;
  };
};

const SUPADATA_KEY = process.env.EXPO_PUBLIC_SUPADATA_API_KEY;

/** All four platforms work with Supadata metadata API when a key is set. */
export function isSupadataSupported(_platform: RecipeSocialPlatform): boolean {
  return true;
}

/**
 * Fetches post metadata when EXPO_PUBLIC_SUPADATA_API_KEY is set, then parses caption text.
 * @see https://docs.supadata.ai/get-metadata
 */
export async function extractFromSocialUrl(
  rawUrl: string,
  platform: RecipeSocialPlatform,
): Promise<SocialExtractResult> {
  const parsed = parseSocialRecipeUrl(rawUrl, platform);
  if (!parsed) {
    throw new SocialExtractError(
      `Paste a valid ${platform} post URL.`,
      parseSocialRecipeUrl(rawUrl) ? 'platform-mismatch' : 'invalid-url',
    );
  }

  if (!SUPADATA_KEY) {
    throw new SocialExtractError(
      'Add EXPO_PUBLIC_SUPADATA_API_KEY to enable automatic extraction, or paste the video description below.',
      'no-api-key',
    );
  }

  const encoded = encodeURIComponent(parsed.normalized);
  const response = await fetch(`https://api.supadata.ai/v1/metadata?url=${encoded}`, {
    headers: {
      'x-api-key': SUPADATA_KEY,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new SocialExtractError(
      `Could not fetch post metadata (${response.status}). Try pasting the description manually.`,
      'fetch-failed',
    );
  }

  const data = (await response.json()) as SupadataResponse;
  const description = data.description?.trim() ?? '';
  const title = data.title?.trim() || undefined;

  if (!description && !title) {
    throw new SocialExtractError(
      'No title or description returned for this post. Paste the description manually.',
      'no-content',
    );
  }

  const captionParsed = parseRecipeCaption(description || title || '');
  return {
    platform: parsed.platform,
    url: parsed.normalized,
    title: title ?? captionParsed.title,
    description: description || undefined,
    thumbnailUrl: data.media?.thumbnailUrl,
    parsed: {
      ...captionParsed,
      title: title ?? captionParsed.title,
    },
    source: 'supadata',
  };
}

/** Parse user-pasted caption without calling an external API. */
export function extractFromCaptionText(
  caption: string,
  platform: RecipeSocialPlatform,
  url: string,
): SocialExtractResult {
  const parsed = parseSocialRecipeUrl(url, platform);
  if (!parsed) {
    throw new SocialExtractError(`Paste a valid ${platform} post URL.`, 'invalid-url');
  }
  const captionParsed = parseRecipeCaption(caption);
  if (!captionParsed.title && captionParsed.ingredients.length === 0 && captionParsed.steps.length === 0) {
    throw new SocialExtractError('Could not find ingredients or steps in the caption.', 'no-content');
  }
  return {
    platform: parsed.platform,
    url: parsed.normalized,
    title: captionParsed.title,
    description: caption,
    parsed: captionParsed,
    source: 'caption-only',
  };
}
