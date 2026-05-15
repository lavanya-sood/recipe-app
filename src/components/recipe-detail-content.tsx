import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { ScheduleDatetimeModal } from '@/components/schedule-datetime-modal';
import { Text } from '@/components/ui/text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useRecipes } from '@/context/recipes-context';
import type { Cookbook, Recipe } from '@/types/recipe';
import { formatIngredientLine } from '@/utils/recipe-ingredients';

type Props = {
  recipe: Recipe;
  cookbooks: Cookbook[];
  onRemove: (id: string) => void;
};

function kindLabel(kind: Recipe['kind']) {
  switch (kind) {
    case 'instagram':
      return 'Instagram';
    case 'tiktok':
      return 'TikTok';
    case 'facebook':
      return 'Facebook';
    case 'youtube':
      return 'YouTube';
    default:
      return 'Manual';
  }
}

function nutritionLine(n: NonNullable<Recipe['nutrition']>) {
  const parts: string[] = [];
  if (n.calories?.trim()) parts.push(`Calories ${n.calories.trim()}`);
  if (n.protein?.trim()) parts.push(`Protein ${n.protein.trim()}`);
  if (n.carbs?.trim()) parts.push(`Carbs ${n.carbs.trim()}`);
  if (n.fats?.trim()) parts.push(`Fats ${n.fats.trim()}`);
  return parts.join(' · ');
}

export function RecipeDetailContent({ recipe, cookbooks, onRemove }: Props) {
  const theme = useTheme();
  const { isFavorite, toggleFavorite } = useRecipes();
  const [scheduleOpen, setScheduleOpen] = React.useState(false);
  const favourited = isFavorite(recipe.id);

  const recipeCookbooks = (recipe.cookbookIds ?? [])
    .map((id) => cookbooks.find((c) => c.id === id)?.name)
    .filter(Boolean) as string[];

  const info = recipe.additionalInfo;
  const infoParts: string[] = [];
  if (info?.servings?.trim()) infoParts.push(`${info.servings.trim()} servings`);
  if (info?.prepTime?.trim()) infoParts.push(`Prep ${info.prepTime.trim()}`);
  if (info?.cookTime?.trim()) infoParts.push(`Cook ${info.cookTime.trim()}`);

  function confirmDelete() {
    Alert.alert('Delete recipe?', `Remove “${recipe.title}” from your collection?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          onRemove(recipe.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <ThemedView style={styles.outer}>
      <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + Spacing.six }]}>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit recipe"
              onPress={() => router.push(`/recipe/edit/${recipe.id}`)}
              style={({ pressed }) => [
                styles.actionBtn,
                { backgroundColor: theme.text },
                pressed && styles.pressed,
              ]}>
              <Text variant="bodySmallBold" style={{ color: theme.background }}>
                Edit
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={favourited ? 'Remove from favourites' : 'Add to favourites'}
              onPress={() => toggleFavorite(recipe.id)}
              style={({ pressed }) => [
                styles.actionBtn,
                styles.actionBtnOutline,
                { borderColor: theme.text },
                favourited && { backgroundColor: theme.backgroundSelected },
                pressed && styles.pressed,
              ]}>
              <Text variant="bodySmallBold">{favourited ? '★ Favourited' : '☆ Favourite'}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Schedule recipe"
              onPress={() => setScheduleOpen(true)}
              style={({ pressed }) => [
                styles.actionBtn,
                styles.actionBtnOutline,
                { borderColor: theme.text },
                pressed && styles.pressed,
              ]}>
              <Text variant="bodySmallBold">Schedule</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Delete recipe"
              onPress={confirmDelete}
              style={({ pressed }) => [styles.actionBtn, styles.deleteBtn, pressed && styles.pressed]}>
              <Text variant="bodySmallBold" style={styles.deleteLabel}>
                Delete
              </Text>
            </Pressable>
          </View>

          {recipe.imageUri && (
            <Image source={{ uri: recipe.imageUri }} style={styles.hero} contentFit="cover" />
          )}

          <View style={styles.badges}>
            <ThemedView type="backgroundElement" style={styles.badge}>
              <Text variant="bodySmall">{kindLabel(recipe.kind)}</Text>
            </ThemedView>
            {recipeCookbooks.map((name) => (
              <ThemedView key={name} type="backgroundElement" style={styles.badge}>
                <Text variant="bodySmall">{name}</Text>
              </ThemedView>
            ))}
          </View>

          {infoParts.length > 0 && (
            <Text variant="bodySmall" themeColor="textSecondary">
              {infoParts.join(' · ')}
            </Text>
          )}

          {recipe.nutrition && nutritionLine(recipe.nutrition) && (
            <>
              <Text variant="bodySmallBold" style={styles.sectionLabel}>
                Nutrition
              </Text>
              <Text variant="bodySmall" themeColor="textSecondary" style={styles.bodyBlock}>
                {nutritionLine(recipe.nutrition)}
              </Text>
            </>
          )}

          {recipe.kind !== 'manual' && recipe.url && (
            <Pressable
              style={({ pressed }) => [styles.linkBanner, pressed && styles.pressed]}
              accessibilityRole="link"
              onPress={async () => {
                const href = recipe.url;
                if (!href) return;
                if (Platform.OS === 'web') {
                  await Linking.openURL(href);
                } else {
                  await openBrowserAsync(href, {
                    presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
                  });
                }
              }}>
              <Text variant="linkPrimary">Open original post</Text>
            </Pressable>
          )}

          {!!recipe.ingredients?.length && (
            <>
              <Text variant="bodySmallBold" style={styles.sectionLabel}>
                Ingredients
              </Text>
              <View style={styles.ingredientList}>
                {recipe.ingredients.map((item) => (
                  <Text
                    key={item.id}
                    variant="bodySmall"
                    themeColor="textSecondary"
                    style={styles.ingredientLine}>
                    • {formatIngredientLine(item)}
                  </Text>
                ))}
              </View>
            </>
          )}

          {!!recipe.steps?.length && (
            <>
              <Text variant="bodySmallBold" style={styles.sectionLabel}>
                Instructions
              </Text>
              <View style={styles.stepList}>
                {recipe.steps.map((step) => (
                  <View key={step.id} style={styles.stepRow}>
                    <Text variant="bodySmallBold" style={styles.stepOrder}>
                      {step.order}.
                    </Text>
                    <Text variant="bodySmall" themeColor="textSecondary" style={styles.stepText}>
                      {step.text}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      <ScheduleDatetimeModal
        visible={scheduleOpen}
        recipeId={recipe.id}
        recipeTitle={recipe.title}
        onClose={() => setScheduleOpen(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safe: {
    flex: 1,
    alignSelf: 'stretch',
    maxWidth: MaxContentWidth,
  },
  content: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingTop: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  actionBtn: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two + 2,
    borderRadius: Spacing.three,
  },
  actionBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth,
  },
  deleteBtn: {
    backgroundColor: 'transparent',
  },
  deleteLabel: {
    color: '#d32f2f',
  },
  hero: {
    width: '100%',
    height: 220,
    borderRadius: Spacing.three,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  badge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  linkBanner: {
    alignSelf: 'flex-start',
  },
  sectionLabel: {
    marginTop: Spacing.one,
  },
  bodyBlock: {
    marginTop: -Spacing.two,
    lineHeight: 22,
  },
  ingredientList: {
    marginTop: -Spacing.two,
    gap: Spacing.one,
  },
  ingredientLine: {
    lineHeight: 22,
  },
  stepList: {
    marginTop: -Spacing.two,
    gap: Spacing.two,
  },
  stepRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
  stepOrder: {
    minWidth: 20,
  },
  stepText: {
    flex: 1,
    lineHeight: 22,
  },
  pressed: {
    opacity: 0.65,
  },
});
