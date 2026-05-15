import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { useRecipes } from '@/context/recipes-context';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Cookbook, Recipe } from '@/types/recipe';

function subtitleForRecipe(recipe: Recipe, cookbooks: Cookbook[]) {
  const parts: string[] = [];
  const names = (recipe.cookbookIds ?? [])
    .map((id) => cookbooks.find((c) => c.id === id)?.name)
    .filter(Boolean);
  if (names.length) parts.push(names.join(', '));
  if (recipe.kind === 'instagram') parts.push('Instagram');
  else if (recipe.kind === 'tiktok') parts.push('TikTok');
  else if (recipe.kind === 'facebook') parts.push('Facebook');
  else if (recipe.kind === 'youtube') parts.push('YouTube');
  return parts.join(' · ') || 'Recipe';
}

export default function HomeScreen() {
  const theme = useTheme();
  const { recipes, cookbooks, loaded } = useRecipes();

  return (
    <ThemedView style={styles.outer}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ThemedText type="subtitle">Home</ThemedText>

        {!loaded ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.placeholder}>
            Loading…
          </ThemedText>
        ) : recipes.length === 0 ? (
          <ThemedView style={styles.emptyCard} type="backgroundElement">
            <ThemedText type="default">No recipes yet</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptySub}>
              Tap + to add your first recipe — everything stays on this device.
            </ThemedText>
            <Pressable
              onPress={() => router.push('/add')}
              style={({ pressed }) => pressed && styles.pressed}>
              <ThemedText type="linkPrimary">Add a recipe</ThemedText>
            </Pressable>
          </ThemedView>
        ) : (
          <FlatList
            contentContainerStyle={[styles.listContent, { paddingBottom: BottomTabInset + Spacing.six }]}
            data={recipes}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push(`/recipe/${item.id}`)}
                style={({ pressed }) => [pressed && styles.pressed]}>
                <ThemedView type="backgroundElement" style={styles.row}>
                  {item.imageUri ? (
                    <Image source={{ uri: item.imageUri }} style={styles.thumb} contentFit="cover" />
                  ) : (
                    <View
                      style={[styles.thumb, styles.thumbPlaceholder, { backgroundColor: theme.backgroundSelected }]}
                    />
                  )}
                  <View style={styles.rowMain}>
                    <ThemedText type="default" numberOfLines={2} style={styles.rowTitle}>
                      {item.title}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                      {subtitleForRecipe(item, cookbooks)}
                    </ThemedText>
                  </View>
                  <ThemedText type="small" themeColor="textSecondary">
                    ›
                  </ThemedText>
                </ThemedView>
              </Pressable>
            )}
          />
        )}

        {Platform.OS === 'web' && <WebBadge />}
      </SafeAreaView>
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
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  listContent: {
    paddingTop: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.three,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: Spacing.two,
  },
  thumbPlaceholder: {
    opacity: 0.5,
  },
  rowMain: {
    flex: 1,
    gap: Spacing.half,
  },
  rowTitle: {
    fontWeight: '600',
  },
  emptyCard: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.three,
    alignSelf: 'stretch',
  },
  emptySub: {
    lineHeight: 22,
  },
  placeholder: {
    marginTop: Spacing.three,
  },
  pressed: {
    opacity: 0.75,
  },
});
