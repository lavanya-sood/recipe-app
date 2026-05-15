import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

import { RecipeDetailContent } from '@/components/recipe-detail-content';
import { Text } from '@/components/ui/text';
import { ThemedView } from '@/components/themed-view';
import { useRecipes } from '@/context/recipes-context';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { recipes, cookbooks, removeRecipe } = useRecipes();
  const recipe = recipes.find((r) => r.id === id);

  if (!recipe) {
    return (
      <ThemedView style={styles.missing}>
        <Stack.Screen options={{ title: 'Recipe' }} />
        <Text variant="bodyReg">Recipe not found.</Text>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: recipe.title }} />
      <RecipeDetailContent recipe={recipe} cookbooks={cookbooks} onRemove={removeRecipe} />
    </>
  );
}

const styles = StyleSheet.create({
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
});
