import { router, Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import { RecipeDetailContent } from "@/components/recipe-detail-content";
import { ThemedView } from "@/components/themed-view";
import { Text } from "@/components/ui/text";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useRecipes } from "@/context/recipes-context";
import { useTheme } from "@/hooks/use-theme";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { recipes, cookbooks, removeRecipe } = useRecipes();
  const theme = useTheme();
  const recipe = recipes.find((r) => r.id === id);

  if (!recipe) {
    return (
      <ThemedView style={styles.missing}>
        <Stack.Screen options={{ title: "Recipe" }} />
        <Text variant="bodyReg">Recipe not found.</Text>
      </ThemedView>
    );
  }

  const hasHeroImage = !!recipe.imageUri;

  return (
    <>
      <Stack.Screen
        options={{
          title: hasHeroImage ? "" : recipe.title,
          headerTransparent: hasHeroImage,
          headerShadowVisible: !hasHeroImage,
          headerBackTitle: "Back",
          headerTintColor: theme.text,
          statusBarTranslucent: hasHeroImage,
          headerStyle: {
            backgroundColor: hasHeroImage ? "transparent" : theme.background,
          },
          ...(!hasHeroImage && {
            headerRight: () => (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Edit recipe"
                onPress={() => router.push(`/recipe/edit/${recipe.id}`)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={{ color: theme.text, fontWeight: "600" }}>
                  Edit
                </Text>
              </TouchableOpacity>
            ),
          }),
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
