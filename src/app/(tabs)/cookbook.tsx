import { type Href, router } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { ThemedView } from '@/components/themed-view';
import { useRecipes } from '@/context/recipes-context';
import { UNCATAGORISED_COOKBOOK_ID } from '@/constants/cookbooks';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { buildCookbookList, recipeCountForListItem } from '@/utils/cookbooks';

export default function CookbookScreen() {
  const { cookbooks, recipes } = useRecipes();
  const listItems = buildCookbookList(cookbooks, recipes);

  return (
    <ThemedView style={styles.outer}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <Text variant="h1">Cookbook</Text>

        {listItems.length === 0 ? (
          <ThemedView type="backgroundElement" style={styles.card}>
            <Text variant="bodyReg">No cookbooks yet</Text>
            <Text variant="bodySmall" themeColor="textSecondary" style={styles.sub}>
              Favourite a recipe or assign a cookbook when adding one.
            </Text>
          </ThemedView>
        ) : (
          <FlatList
            data={listItems}
            keyExtractor={(item) => (item.type === 'virtual' ? item.id : item.cookbook.id)}
            contentContainerStyle={{ paddingBottom: BottomTabInset + Spacing.six, gap: Spacing.two }}
            ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
            renderItem={({ item }) => {
              const count = recipeCountForListItem(item, recipes);
              const name = item.type === 'virtual' ? item.name : item.cookbook.name;
              const href =
                item.type === 'virtual'
                  ? `/cookbook/${UNCATAGORISED_COOKBOOK_ID}`
                  : `/cookbook/${item.cookbook.id}`;

              return (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push(href as Href)}
                  style={({ pressed }) => [pressed && styles.pressed]}>
                  <ThemedView type="backgroundElement" style={styles.row}>
                    <View style={styles.rowMain}>
                      <Text variant="bodyReg" style={styles.rowTitle}>
                        {name}
                      </Text>
                      <Text variant="bodySmall" themeColor="textSecondary">
                        {count} {count === 1 ? 'recipe' : 'recipes'}
                      </Text>
                    </View>
                    <Text variant="bodySmall" themeColor="textSecondary">
                      ›
                    </Text>
                  </ThemedView>
                </Pressable>
              );
            }}
          />
        )}
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
  card: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.two,
  },
  sub: {
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  rowMain: {
    flex: 1,
    gap: Spacing.half,
  },
  pressed: {
    opacity: 0.75,
  },
  rowTitle: {
    fontWeight: '600',
  },
});
