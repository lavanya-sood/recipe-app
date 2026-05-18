import { RecipeHeroGradient } from "@/components/recipe-hero-gradient";
import { ScheduleDatetimeModal } from "@/components/schedule-datetime-modal";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useRecipes } from "@/context/recipes-context";
import { useAdaptiveRecipeHeader } from "@/hooks/use-adaptive-recipe-header";
import { useTheme } from "@/hooks/use-theme";
import type { Cookbook, Recipe } from "@/types/recipe";
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

/** How far the content card pulls up over the hero image. */
const HERO_BODY_OVERLAP = Spacing.xxxxxxxxxxlarge;

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
    enabled: true,
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
      <StatusBar style={statusBarStyle} animated />
      <ScrollView
        style={styles.scroll}
        onScroll={onHeaderScroll}
        scrollEventThrottle={16}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              insets.bottom + BottomTabInset + Spacing.xxxxxxxxlarge,
          },
        ]}
      >
        {hasHeroImage ? (
          <Image
            source={{ uri: recipe.imageUri }}
            style={[styles.hero, { width: windowWidth, height: heroHeight }]}
            contentFit="cover"
          />
        ) : (
          <RecipeHeroGradient
            width={windowWidth}
            height={heroHeight}
            primary={theme.primary}
          />
        )}

        <View
          style={[
            styles.body,
            styles.bodyOverlap,
            {
              backgroundColor: theme.background,
              marginTop: -HERO_BODY_OVERLAP,
            },
          ]}
        >
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
                <View
                  style={[
                    styles.infoItemCard,
                    {
                      backgroundColor: theme.cardBackground,
                      borderColor: theme.secondary,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Text variant="bodySmallBold" themeColor="text">
                    Prep
                  </Text>
                  <Text variant="bodySmall" themeColor="textSecondary">
                    {recipe.additionalInfo.prepTime}
                  </Text>
                </View>
              )}
              {recipe.additionalInfo.cookTime && (
                <View
                  style={[
                    styles.infoItemCard,
                    {
                      backgroundColor: theme.cardBackground,
                      borderColor: theme.secondary,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Text variant="bodySmallBold" themeColor="text">
                    Cook
                  </Text>
                  <Text variant="bodySmall" themeColor="textSecondary">
                    {recipe.additionalInfo.cookTime}
                  </Text>
                </View>
              )}
              {recipe.additionalInfo.servings && (
                <View
                  style={[
                    styles.infoItemCard,
                    {
                      backgroundColor: theme.cardBackground,
                      borderColor: theme.secondary,
                      borderWidth: 1,
                    },
                  ]}
                >
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

          {!!recipe.ingredients?.length && (
            <>
              <View style={styles.sectionHeading}>
                <Text variant="h4" style={styles.sectionLabel}>
                  Ingredients
                </Text>
                <View
                  style={[styles.sectionLine, { borderColor: theme.primary }]}
                />
              </View>

              <View style={styles.ingredientList}>
                {recipe.ingredients.map((item) => (
                  // <Text
                  //   key={item.id}
                  //   variant="bodySmall"
                  //   themeColor="textSecondary"
                  //   style={styles.ingredientLine}
                  // >
                  //   • {formatIngredientLine(item)}
                  // </Text>
                  <View key={item.id} style={styles.ingredientItem}>
                    <Text
                      variant="h3"
                      themeColor="accent"
                      style={styles.ingredientBullet}
                    >
                      •
                    </Text>
                    <Text variant="bodySmall" themeColor="textSecondary">
                      {item.name}
                    </Text>
                    <View
                      style={[
                        styles.lineDotted,
                        { borderColor: theme.textSecondary },
                      ]}
                    />
                    <Text variant="bodySmall" themeColor="textSecondary">
                      {item.quantity} {item.unit}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {!!recipe.steps?.length && (
            <>
              <View style={styles.sectionHeading}>
                <Text variant="h4" style={styles.sectionLabel}>
                  Instructions
                </Text>
                <View
                  style={[styles.sectionLine, { borderColor: theme.primary }]}
                />
              </View>
              <View style={styles.stepList}>
                {recipe.steps.map((step) => (
                  <View key={step.id} style={styles.stepRow}>
                    <View
                      style={[
                        styles.stepOrderContainer,
                        { backgroundColor: theme.accent },
                      ]}
                    >
                      <Text variant="bodySmallBold" themeColor="background">
                        {step.order}
                      </Text>
                    </View>

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
                <View
                  style={[
                    styles.infoItemCard,
                    {
                      backgroundColor: theme.cardBackground,
                      borderColor: theme.secondary,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Text variant="bodySmallBold" themeColor="textSecondary">
                    Calories
                  </Text>
                  <Text variant="bodySmall" themeColor="textSecondary">
                    {recipe.nutrition.calories}kcal
                  </Text>
                </View>
              )}
              {recipe.nutrition.protein && (
                <View
                  style={[
                    styles.infoItemCard,
                    {
                      backgroundColor: theme.cardBackground,
                      borderColor: theme.secondary,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Text variant="bodySmallBold" themeColor="textSecondary">
                    Protein
                  </Text>
                  <Text variant="bodySmall" themeColor="textSecondary">
                    {recipe.nutrition.protein}g
                  </Text>
                </View>
              )}
              {recipe.nutrition.carbs && (
                <View
                  style={[
                    styles.infoItemCard,
                    {
                      backgroundColor: theme.cardBackground,
                      borderColor: theme.secondary,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Text variant="bodySmallBold" themeColor="textSecondary">
                    Carbs
                  </Text>
                  <Text variant="bodySmall" themeColor="textSecondary">
                    {recipe.nutrition.carbs}g
                  </Text>
                </View>
              )}
              {recipe.nutrition.fats && (
                <View
                  style={[
                    styles.infoItemCard,
                    {
                      backgroundColor: theme.cardBackground,
                      borderColor: theme.secondary,
                      borderWidth: 1,
                    },
                  ]}
                >
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
    paddingBottom: Spacing.base,
  },
  bodyOverlap: {
    borderTopLeftRadius: Spacing.large,
    borderTopRightRadius: Spacing.large,
    zIndex: 1,
    paddingTop: Spacing.medium,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
      default: {},
    }),
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoContainer: {
    flexDirection: "row",
    gap: Spacing.xsmall,
    justifyContent: "space-between",
  },

  infoItemCard: {
    gap: Spacing.xxxsmall,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xxxsmall,
    borderRadius: Spacing.xxxsmall,
    // backgroundColor: "rgba(248, 241, 236, 0.85)",
    // backdropFilter: "blur(12px)",
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
  sectionHeading: {
    marginTop: Spacing.xxxsmall,
    flexDirection: "row",
    // alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xxxxsmall,
  },
  sectionLine: {
    flex: 1,
    borderBottomWidth: 3,
    // borderStyle: "dashed",
    marginHorizontal: Spacing.xxxsmall,
  },
  sectionLabel: {},
  ingredientItem: {
    // marginTop: Spacing.xxxsmall,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  lineDotted: {
    flex: 1,
    borderBottomWidth: 2,
    borderStyle: "dotted",
    marginHorizontal: Spacing.xxxsmall,
  },
  ingredientBullet: {
    marginRight: Spacing.xxxsmall,
  },
  stepOrderContainer: {
    width: 24,
    height: 24,
    // padding: Spacing.xxxxsmall,
    borderRadius: Spacing.xsmall,
    alignItems: "center",
    justifyContent: "center",
  },
});
