import { ScheduleDatetimeModal } from "@/components/schedule-datetime-modal";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useRecipes } from "@/context/recipes-context";
import { useAdaptiveRecipeHeader } from "@/hooks/use-adaptive-recipe-header";
import { useTheme } from "@/hooks/use-theme";
import type { Cookbook, Recipe } from "@/types/recipe";
import { formatIngredientLine } from "@/utils/recipe-ingredients";
import Entypo from "@expo/vector-icons/Entypo";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  openBrowserAsync,
  WebBrowserPresentationStyle,
} from "expo-web-browser";
import React from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  recipe: Recipe;
  cookbooks: Cookbook[];
  onRemove: (id: string) => void;
};

export function RecipeDetailContent({ recipe, cookbooks, onRemove }: Props) {
  const theme = useTheme();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { isFavorite, toggleFavorite } = useRecipes();
  const [scheduleOpen, setScheduleOpen] = React.useState(false);
  const favourited = isFavorite(recipe.id);
  const hasHeroImage = !!recipe.imageUri;
  const heroHeight = windowHeight * 0.4;
  const { onScroll: onHeaderScroll, statusBarStyle } = useAdaptiveRecipeHeader({
    enabled: hasHeroImage,
    heroHeight,
    imageUri: recipe.imageUri,
    recipeId: recipe.id,
  });

  const recipeCookbooks = (recipe.cookbookIds ?? [])
    .map((id) => cookbooks.find((c) => c.id === id)?.name)
    .filter(Boolean) as string[];

  function confirmDelete() {
    Alert.alert(
      "Delete recipe?",
      `Remove “${recipe.title}” from your collection?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            onRemove(recipe.id);
            router.back();
          },
        },
      ],
    );
  }

  return (
    <ThemedView style={styles.outer}>
      {hasHeroImage && <StatusBar style={statusBarStyle} animated />}
      <ScrollView
        style={styles.scroll}
        onScroll={hasHeroImage ? onHeaderScroll : undefined}
        scrollEventThrottle={16}
        contentInsetAdjustmentBehavior={hasHeroImage ? "never" : "automatic"}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              insets.bottom + BottomTabInset + Spacing.xxxxxxxxlarge,
          },
        ]}
      >
        {hasHeroImage && (
          <Image
            source={{ uri: recipe.imageUri }}
            style={[styles.hero, { width: windowWidth, height: heroHeight }]}
            contentFit="cover"
          />
        )}

        <View style={styles.body}>
          <View style={styles.titleContainer}>
            <Text variant="h2">{recipe.title}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                favourited ? "Remove from favourites" : "Add to favourites"
              }
              onPress={() => toggleFavorite(recipe.id)}
            >
              <Entypo
                name={favourited ? "heart" : "heart-outlined"}
                size={32}
                color={theme.primary}
              />
            </Pressable>
          </View>

          {recipe.additionalInfo && (
            <View style={styles.infoContainer}>
              {recipe.additionalInfo.prepTime && (
                <View>
                  <Text variant="bodySmallBold" themeColor="text">
                    Prep
                  </Text>
                  <Text variant="bodySmall" themeColor="textSecondary">
                    {recipe.additionalInfo.prepTime}
                  </Text>
                </View>
              )}
              {recipe.additionalInfo.cookTime && (
                <View>
                  <Text variant="bodySmallBold" themeColor="text">
                    Cook
                  </Text>
                  <Text variant="bodySmall" themeColor="textSecondary">
                    {recipe.additionalInfo.cookTime}
                  </Text>
                </View>
              )}
              {recipe.additionalInfo.servings && (
                <View>
                  <Text variant="bodySmallBold" themeColor="text">
                    Servings
                  </Text>
                  <Text variant="bodySmall" themeColor="textSecondary">
                    {recipe.additionalInfo.servings}
                  </Text>
                </View>
              )}
            </View>
          )}

          {recipe.url && (
            <Button
              variant="ghost"
              accessibilityRole="link"
              accessibilityLabel="Open original post"
              style={styles.linkBanner}
              onPress={async () => {
                const href = recipe.url;
                if (!href) return;
                if (Platform.OS === "web") {
                  await Linking.openURL(href);
                } else {
                  await openBrowserAsync(href, {
                    presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
                  });
                }
              }}
            >
              <Text variant="linkPrimary">Open original post</Text>
            </Button>
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
                    style={styles.ingredientLine}
                  >
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
                    <Text
                      variant="bodySmall"
                      themeColor="textSecondary"
                      style={styles.stepText}
                    >
                      {step.text}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {recipe.nutrition && (
            <View style={styles.infoContainer}>
              {recipe.nutrition.calories && (
                <View>
                  <Text variant="bodySmallBold" themeColor="textSecondary">
                    Calories
                  </Text>
                  <Text variant="bodySmall" themeColor="textSecondary">
                    {recipe.nutrition.calories}kcal
                  </Text>
                </View>
              )}
              {recipe.nutrition.protein && (
                <View>
                  <Text variant="bodySmallBold" themeColor="textSecondary">
                    Protein
                  </Text>
                  <Text variant="bodySmall" themeColor="textSecondary">
                    {recipe.nutrition.protein}g
                  </Text>
                </View>
              )}
              {recipe.nutrition.carbs && (
                <View>
                  <Text variant="bodySmallBold" themeColor="textSecondary">
                    Carbs
                  </Text>
                  <Text variant="bodySmall" themeColor="textSecondary">
                    {recipe.nutrition.carbs}g
                  </Text>
                </View>
              )}
              {recipe.nutrition.fats && (
                <View>
                  <Text variant="bodySmallBold" themeColor="textSecondary">
                    Fats
                  </Text>
                  <Text variant="bodySmall" themeColor="textSecondary">
                    {recipe.nutrition.fats}g
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.badges}>
            {recipeCookbooks.map((name) => (
              <View
                key={name}
                style={[styles.badge, { backgroundColor: theme.accent }]}
              >
                <Entypo name="open-book" size={18} color={theme.background} />
                <Text
                  variant="bodySmallBold"
                  style={{ color: theme.background }}
                >
                  {name}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            <Button
              variant="primary"
              size="sm"
              accessibilityLabel="Schedule recipe"
              leftIcon={
                <Entypo name="calendar" size={18} color={theme.background} />
              }
              onPress={() => setScheduleOpen(true)}
              fullWidth
            >
              Schedule
            </Button>
            <Button
              variant="destructive"
              accessibilityLabel="Delete recipe"
              onPress={confirmDelete}
              fullWidth
            >
              Delete recipe
            </Button>
          </View>
        </View>
      </ScrollView>

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
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  hero: {
    alignSelf: "center",
  },
  body: {
    alignSelf: "center",
    width: "100%",
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.base,
    gap: Spacing.xsmall,
    paddingTop: Spacing.base,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoContainer: {
    flexDirection: "row",
    gap: Spacing.base,
  },

  actions: {
    // flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xxxsmall,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xxxsmall,
  },

  linkBanner: {
    alignSelf: "flex-start",
  },
  sectionLabel: {
    marginTop: Spacing.xxxxsmall,
  },
  bodyBlock: {
    marginTop: -Spacing.xxxsmall,
    lineHeight: 22,
  },
  ingredientList: {
    marginTop: -Spacing.xxxsmall,
    gap: Spacing.xxxxsmall,
  },
  ingredientLine: {
    lineHeight: 22,
  },
  stepList: {
    marginTop: -Spacing.xxxsmall,
    gap: Spacing.xxxsmall,
  },
  stepRow: {
    flexDirection: "row",
    gap: Spacing.xxxsmall,
    alignItems: "flex-start",
  },
  stepOrder: {
    minWidth: 20,
  },
  stepText: {
    flex: 1,
    lineHeight: 22,
  },
  badge: {
    paddingHorizontal: Spacing.xsmall,
    paddingVertical: Spacing.xxxxsmall,
    borderRadius: Spacing.xsmall,
    flexDirection: "row",
    gap: Spacing.xxxsmall,
    alignItems: "center",
  },
});
