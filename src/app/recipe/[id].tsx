import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";

import { RecipeDetailContent } from "@/components/recipe-detail-content";
import { ThemedView } from "@/components/themed-view";
import { Text } from "@/components/ui/text";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useRecipes } from "@/context/recipes-context";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { recipes, cookbooks, removeRecipe } = useRecipes();
  const recipe = recipes.find((r) => r.id === id);

  if (!recipe) {
    return (
      <ThemedView style={styles.missing}>
        <Stack.Screen options={{ title: "Recipe" }} />
        <Text variant="bodyReg">Recipe not found.</Text>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "",
          headerTransparent: true,
          headerShadowVisible: false,
          headerBackTitle: "Back",
          statusBarTranslucent: true,
          headerStyle: {
            backgroundColor: "transparent",
          },
        }}
      />
      <RecipeDetailContent
        recipe={recipe}
        cookbooks={cookbooks}
        onRemove={removeRecipe}
      />
    </>
  );
}

const styles = StyleSheet.create({
  missing: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.base,
    maxWidth: MaxContentWidth,
    alignSelf: "center",
  },
});
