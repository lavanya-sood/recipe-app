import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { CookbookPicker } from '@/components/cookbook-picker';
import { IngredientEditor } from '@/components/ingredient-editor';
import { InstructionStepEditor } from '@/components/instruction-step-editor';
import { RecipeImagePicker } from '@/components/recipe-image-picker';
import { Text } from '@/components/ui/text';
import { ThemedView } from '@/components/themed-view';
import { useRecipes } from '@/context/recipes-context';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useFormInputStyle } from '@/hooks/use-form-input-style';
import { useTheme } from '@/hooks/use-theme';
import {
  SocialExtractError,
  extractFromCaptionText,
  extractFromSocialUrl,
} from '@/services/social-extract';
import type { RecipeIngredient, RecipeInstructionStep, RecipeSocialPlatform } from '@/types/recipe';
import {
  SOCIAL_PLATFORM_LABELS,
  SOCIAL_PLATFORMS,
  platformPlaceholder,
} from '@/utils/social-link';

type Props = {
  onSaved?: () => void;
  contentPaddingBottom?: number;
};

export function SocialExtractForm({ onSaved, contentPaddingBottom }: Props) {
  const theme = useTheme();
  const inputStyle = useFormInputStyle();
  const { addRecipe, cookbooks, addCookbook } = useRecipes();

  const [platform, setPlatform] = React.useState<RecipeSocialPlatform>('instagram');
  const [url, setUrl] = React.useState('');
  const [caption, setCaption] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [imageUri, setImageUri] = React.useState<string | null>(null);
  const [cookbookId, setCookbookId] = React.useState<string | null>(null);
  const [ingredients, setIngredients] = React.useState<RecipeIngredient[]>([]);
  const [steps, setSteps] = React.useState<RecipeInstructionStep[]>([]);
  const [extracted, setExtracted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const hasApiKey = !!process.env.EXPO_PUBLIC_SUPADATA_API_KEY;

  function resetForm() {
    setPlatform('instagram');
    setUrl('');
    setCaption('');
    setTitle('');
    setImageUri(null);
    setCookbookId(null);
    setIngredients([]);
    setSteps([]);
    setExtracted(false);
    setError(null);
    setInfo(null);
  }

  function applyExtracted(data: {
    title?: string;
    thumbnailUrl?: string;
    ingredients: RecipeIngredient[];
    steps: RecipeInstructionStep[];
  }) {
    if (data.title) setTitle(data.title);
    if (data.thumbnailUrl) setImageUri(data.thumbnailUrl);
    if (data.ingredients.length) setIngredients(data.ingredients);
    if (data.steps.length) setSteps(data.steps);
    setExtracted(true);
  }

  async function onAutoExtract() {
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const result = await extractFromSocialUrl(url, platform);
      applyExtracted({
        title: result.title,
        thumbnailUrl: result.thumbnailUrl,
        ingredients: result.parsed.ingredients,
        steps: result.parsed.steps,
      });
      setInfo(
        result.source === 'supadata'
          ? 'Fetched post metadata. Review and edit before saving.'
          : 'Parsed caption. Review and edit before saving.',
      );
    } catch (e) {
      if (e instanceof SocialExtractError) {
        setError(e.message);
      } else {
        setError('Extraction failed. Try pasting the caption manually.');
      }
    } finally {
      setLoading(false);
    }
  }

  function onParseCaption() {
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const result = extractFromCaptionText(caption, platform, url);
      applyExtracted({
        title: result.title,
        ingredients: result.parsed.ingredients,
        steps: result.parsed.steps,
      });
      setInfo('Parsed caption text. Review and edit before saving.');
    } catch (e) {
      if (e instanceof SocialExtractError) {
        setError(e.message);
      } else {
        setError('Could not parse caption.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function onSave() {
    setError(null);
    setSaving(true);
    try {
      const t = title.trim();
      if (!t) {
        setError('Add a title before saving.');
        return;
      }
      if (!url.trim()) {
        setError('Add the post URL.');
        return;
      }

      await addRecipe({
        kind: platform,
        title: t,
        url: url.trim(),
        imageUri: imageUri ?? undefined,
        cookbookIds: cookbookId ? [cookbookId] : undefined,
        ingredients: ingredients.length > 0 ? ingredients : undefined,
        steps: steps.length > 0 ? steps : undefined,
      });
      resetForm();
      onSaved?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        styles.form,
        { paddingBottom: contentPaddingBottom ?? BottomTabInset + Spacing.xxxxxxxxlarge },
      ]}>
      <Text variant="bodySmall" themeColor="textSecondary" style={styles.intro}>
        Paste a post link. We fetch the caption when an API key is configured, or you can paste the
        description yourself and we will pull out ingredients and steps.
      </Text>

      <View style={styles.platformRow}>
        {SOCIAL_PLATFORMS.map((p) => {
          const selected = platform === p;
          return (
            <Pressable
              key={p}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => {
                setPlatform(p);
                setError(null);
              }}
              style={({ pressed }) => [
                styles.platformChip,
                { borderColor: theme.backgroundSelected },
                selected && { backgroundColor: theme.text },
                pressed && styles.pressed,
              ]}>
              <Text
                variant="bodySmall"
                style={selected ? { color: theme.background } : undefined}
                themeColor={selected ? undefined : 'textSecondary'}>
                {SOCIAL_PLATFORM_LABELS[p]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text variant="bodySmallBold">Post URL</Text>
      <TextInput
        value={url}
        onChangeText={setUrl}
        placeholder={platformPlaceholder(platform)}
        placeholderTextColor={theme.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        style={[styles.input, inputStyle]}
        accessibilityLabel="Social post URL"
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Extract from URL"
        disabled={loading || !url.trim()}
        onPress={() => void onAutoExtract()}
        style={({ pressed }) => [
          styles.extractBtn,
          { backgroundColor: theme.text, opacity: loading || !url.trim() ? 0.5 : 1 },
          pressed && !loading && url.trim() && styles.pressed,
        ]}>
        {loading ? (
          <ActivityIndicator color={theme.background} />
        ) : (
          <Text variant="bodySmallBold" style={{ color: theme.background }}>
            Extract from URL
          </Text>
        )}
      </Pressable>

      {!hasApiKey && (
        <ThemedView type="backgroundElement" style={styles.notice}>
          <Text variant="bodySmall" themeColor="textSecondary" style={styles.noticeText}>
            Auto-extract needs{' '}
            <Text variant="bodySmallBold">EXPO_PUBLIC_SUPADATA_API_KEY</Text> (Instagram, TikTok,
            Facebook, YouTube). Or paste the post / video description below — no API required.
          </Text>
        </ThemedView>
      )}

      <View style={styles.section}>
        <Text variant="bodySmallBold">Or paste caption / description</Text>
        <Text variant="bodySmall" themeColor="textSecondary" style={styles.hint}>
          Copy the post text (ingredients & steps) from the app, then parse locally — no API required.
        </Text>
        <TextInput
          value={caption}
          onChangeText={setCaption}
          placeholder="Full caption with ingredients and instructions…"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, styles.captionInput, inputStyle]}
          multiline
          textAlignVertical="top"
          accessibilityLabel="Post caption"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Parse caption"
          disabled={loading || !caption.trim() || !url.trim()}
          onPress={onParseCaption}
          style={({ pressed }) => [
            styles.secondaryBtn,
            { borderColor: theme.text },
            (loading || !caption.trim() || !url.trim()) && { opacity: 0.45 },
            pressed && caption.trim() && url.trim() && styles.pressed,
          ]}>
          <Text variant="bodySmallBold">Parse caption</Text>
        </Pressable>
      </View>

      {info && (
        <Text variant="bodySmall" themeColor="textSecondary">
          {info}
        </Text>
      )}
      {error && (
        <Text variant="bodySmall" style={styles.error}>
          {error}
        </Text>
      )}

      {extracted && (
        <>
          <Text variant="bodySmallBold" style={styles.reviewHeading}>
            Review & edit
          </Text>

          <Text variant="bodySmallBold">Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Recipe title"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, inputStyle]}
            accessibilityLabel="Recipe title"
          />

          <RecipeImagePicker imageUri={imageUri} onChange={setImageUri} />

          <CookbookPicker
            cookbooks={cookbooks}
            selectedId={cookbookId}
            onChange={setCookbookId}
            onCreateCookbook={addCookbook}
          />

          <IngredientEditor items={ingredients} onChange={setIngredients} />

          <InstructionStepEditor steps={steps} onChange={setSteps} />

          <Pressable
            disabled={saving}
            onPress={() => void onSave()}
            style={({ pressed }) => [
              styles.saveBtn,
              { backgroundColor: theme.text, opacity: saving ? 0.5 : 1 },
              pressed && !saving && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Save recipe">
            <Text variant="bodySmallBold" style={{ color: theme.background }}>
              {saving ? 'Saving…' : 'Save recipe'}
            </Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.xsmall,
    paddingTop: Spacing.xxxsmall,
  },
  intro: {
    lineHeight: 22,
  },
  platformRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xxxsmall,
  },
  platformChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.xsmall,
    paddingHorizontal: Spacing.xsmall,
    paddingVertical: Spacing.xxxsmall,
  },
  section: {
    gap: Spacing.xxxsmall,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.xxxsmall,
    paddingHorizontal: Spacing.xsmall,
    paddingVertical: Spacing.xxsmall,
    fontSize: 16,
  },
  captionInput: {
    minHeight: 120,
    paddingTop: Spacing.xsmall,
  },
  hint: {
    lineHeight: 20,
    marginTop: -Spacing.xxxxsmall,
  },
  extractBtn: {
    paddingVertical: Spacing.xsmall,
    borderRadius: Spacing.xsmall,
    alignItems: 'center',
  },
  secondaryBtn: {
    alignSelf: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.xxxsmall,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xxsmall,
  },
  notice: {
    padding: Spacing.xsmall,
    borderRadius: Spacing.xxxsmall,
  },
  noticeText: {
    lineHeight: 20,
  },
  reviewHeading: {
    marginTop: Spacing.xxxsmall,
  },
  error: {
    color: '#d32f2f',
  },
  saveBtn: {
    marginTop: Spacing.xxxsmall,
    paddingVertical: Spacing.xsmall,
    borderRadius: Spacing.xsmall,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
