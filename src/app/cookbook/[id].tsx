import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { ThemedView } from '@/components/themed-view';
import { useRecipes } from '@/context/recipes-context';
import { UNCATAGORISED_COOKBOOK_ID, UNCATAGORISED_COOKBOOK_NAME } from '@/constants/cookbooks';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getUncategorisedRecipes } from '@/utils/cookbooks';

export default function CookbookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { cookbooks, recipes } = useRecipes();

  const isUncategorised = id === UNCATAGORISED_COOKBOOK_ID;
  const cookbook = isUncategorised ? null : cookbooks.find((c) => c.id === id);
  const title = isUncategorised ? UNCATAGORISED_COOKBOOK_NAME : cookbook?.name;
  const items = isUncategorised
    ? getUncategorisedRecipes(recipes)
    : recipes.filter((r) => r.cookbookIds?.includes(id ?? ''));

  if (!isUncategorised && !cookbook) {
    return (
      <ThemedView style={styles.missing}>
        <Stack.Screen options={{ title: 'Cookbook' }} />
        <Text variant="bodyReg">Cookbook not found.</Text>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: title ?? 'Cookbook' }} />
      <ThemedView style={styles.outer}>
        <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
          {items.length === 0 ? (
            <ThemedView type="backgroundElement" style={styles.empty}>
              <Text variant="bodyReg">No recipes here</Text>
              <Text variant="bodySmall" themeColor="textSecondary" style={styles.emptySub}>
                {isUncategorised
                  ? 'Recipes without a cookbook appear here.'
                  : 'Assign recipes to this cookbook when adding or editing them.'}
              </Text>
            </ThemedView>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: BottomTabInset + Spacing.base }}
              ItemSeparatorComponent={() => <View style={{ height: Spacing.xxxsmall }} />}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => router.push(`/recipe/${item.id}`)}
                  style={({ pressed }) => [pressed && styles.pressed]}>
                  <ThemedView type="backgroundElement" style={styles.row}>
                    {item.imageUri ? (
                      <Image source={{ uri: item.imageUri }} style={styles.thumb} contentFit="cover" />
                    ) : (
                      <View
                        style={[
                          styles.thumb,
                          styles.thumbPlaceholder,
                          { backgroundColor: theme.backgroundSelected },
                        ]}
                      />
                    )}
                    <Text variant="bodyReg" numberOfLines={2} style={styles.rowTitle}>
                      {item.title}
                    </Text>
                    <Text variant="bodySmall" themeColor="textSecondary">
                      ›
                    </Text>
                  </ThemedView>
                </Pressable>
              )}
            />
          )}
        </SafeAreaView>
      </ThemedView>
    </>
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
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xxxsmall,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.base,
  },
  empty: {
    padding: Spacing.base,
    borderRadius: Spacing.base,
    gap: Spacing.xxxsmall,
  },
  emptySub: {
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xsmall,
    borderRadius: Spacing.xsmall,
    gap: Spacing.xsmall,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: Spacing.xxxsmall,
  },
  thumbPlaceholder: {
    opacity: 0.5,
  },
  rowTitle: {
    flex: 1,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
});
