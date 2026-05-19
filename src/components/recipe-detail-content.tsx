import { RecipeHeroBanner } from "@/components/recipe-hero-banner";
import { ScheduleDatetimeModal } from "@/components/schedule-datetime-modal";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { MaxContentWidth, ShadowFloating, Spacing } from "@/constants/theme";
import { useRecipes } from "@/context/recipes-context";
import { useAdaptiveRecipeHeader } from "@/hooks/use-adaptive-recipe-header";
import { useTheme } from "@/hooks/use-theme";
import type { Cookbook, Recipe, RecipeIngredient } from "@/types/recipe";
import { hexToRgba } from "@/utils/color-mix";
import Entypo from "@expo/vector-icons/Entypo";
import { LinearGradient } from "expo-linear-gradient";
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
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  recipe: Recipe;
  cookbooks: Cookbook[];
  onRemove: (id: string) => void;
};

const HERO_BODY_OVERLAP = Spacing.large;
const SHEET_TOP_RADIUS = Spacing.large;
const CONTENT_PAD = Spacing.base;
/** Approximate height of the schedule CTA row (excl. safe area). */
const FOOTER_CTA_HEIGHT = 52;

function formatIngredientAmount(item: RecipeIngredient): string | null {
  const qty = item.quantity?.trim();
  const unit = item.unit?.trim();
  if (qty && unit) return `${qty} ${unit}`;
  return qty ?? unit ?? null;
}

function surfaceCardStyle(theme: ReturnType<typeof useTheme>): ViewStyle {
  return {
    backgroundColor: theme.surfaceElevated,
    borderColor: theme.secondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.xxsmall,
    ...ShadowFloating,
  };
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text variant="h3" style={styles.sectionTitle}>
      {title}
    </Text>
  );
}

function StatSurface({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.statSurface, surfaceCardStyle(theme)]}>
      <Text variant="caption" style={{ color: theme.textMuted }}>
        {label}
      </Text>
      <Text variant="bodyRegBold" style={styles.statValue}>
        {value}
      </Text>
    </View>
  );
}

function NutritionMetric({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.nutritionMetric, surfaceCardStyle(theme)]}>
      <Text variant="caption" style={{ color: theme.textMuted }}>
        {label}
      </Text>
      <Text style={[styles.nutritionValue, { color: theme.text }]}>
        {value}
      </Text>
    </View>
  );
}

export function RecipeDetailContent({ recipe, cookbooks, onRemove }: Props) {
  const theme = useTheme();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { isFavorite, toggleFavorite } = useRecipes();
  const [scheduleOpen, setScheduleOpen] = React.useState(false);
  const favourited = isFavorite(recipe.id);
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

  const safeBottom = Math.max(insets.bottom, Spacing.xxxsmall);
  /** Scroll padding so last content clears the floating schedule button. */
  const scrollBottomPad = safeBottom + FOOTER_CTA_HEIGHT + Spacing.xsmall;
  const footerFadeColors = React.useMemo(
    () =>
      [
        hexToRgba(theme.background, 0),
        hexToRgba(theme.background, 0.88),
        theme.background,
      ] as const,
    [theme.background],
  );

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
        contentContainerStyle={{ paddingBottom: scrollBottomPad }}
      >
        <RecipeHeroBanner
          width={windowWidth}
          height={heroHeight}
          imageUri={recipe.imageUri}
          primary={theme.primary}
        />

        <View
          style={[
            styles.body,
            styles.bodySheet,
            ShadowFloating,
            {
              backgroundColor: theme.surfaceElevated,
              marginTop: -HERO_BODY_OVERLAP,
            },
          ]}
        >
          <View style={styles.titleContainer}>
            <Text variant="h2" style={styles.recipeTitle}>
              {recipe.title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                favourited ? "Remove from favourites" : "Add to favourites"
              }
              onPress={() => toggleFavorite(recipe.id)}
              hitSlop={12}
            >
              <Entypo
                name={favourited ? "heart" : "heart-outlined"}
                size={28}
                color={theme.primary}
              />
            </Pressable>
          </View>

          {recipe.additionalInfo && (
            <View style={styles.metaRow}>
              {recipe.additionalInfo.prepTime && (
                <StatSurface
                  label="Prep"
                  value={recipe.additionalInfo.prepTime}
                />
              )}
              {recipe.additionalInfo.cookTime && (
                <StatSurface
                  label="Cook"
                  value={recipe.additionalInfo.cookTime}
                />
              )}
              {recipe.additionalInfo.servings && (
                <StatSurface
                  label="Servings"
                  value={recipe.additionalInfo.servings}
                />
              )}
            </View>
          )}

          {!!recipe.ingredients?.length && (
            <View style={styles.section}>
              <SectionHeader title="Ingredients" />
              <View style={styles.ingredientList}>
                {recipe.ingredients.map((item) => {
                  const amount = formatIngredientAmount(item);
                  return (
                    <View key={item.id} style={styles.ingredientRow}>
                      <Text variant="bodyReg" style={styles.ingredientName}>
                        {item.name}
                      </Text>
                      {amount ? (
                        <Text
                          variant="bodySmall"
                          style={{ color: theme.textMuted }}
                        >
                          {amount}
                        </Text>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {!!recipe.steps?.length && (
            <View style={styles.section}>
              <SectionHeader title="Instructions" />
              <View style={styles.stepList}>
                {recipe.steps.map((step) => (
                  <View key={step.id} style={styles.stepRow}>
                    <View
                      style={[
                        styles.stepOrder,
                        {
                          backgroundColor: theme.background,
                          borderColor: theme.secondary,
                          borderWidth: StyleSheet.hairlineWidth,
                        },
                      ]}
                    >
                      <Text variant="captionBold" themeColor="textSecondary">
                        {step.order}
                      </Text>
                    </View>
                    <Text variant="bodyReg" style={styles.stepText}>
                      {step.text}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {recipe.nutrition && (
            <View style={styles.section}>
              <SectionHeader title="Nutrition" />
              <View style={styles.nutritionRow}>
                {recipe.nutrition.calories && (
                  <NutritionMetric
                    label="Calories"
                    value={recipe.nutrition.calories.replace(/\s*kcal$/i, "")}
                  />
                )}
                {recipe.nutrition.protein && (
                  <NutritionMetric
                    label="Protein"
                    value={recipe.nutrition.protein.replace(/\s*g$/i, "")}
                  />
                )}
                {recipe.nutrition.carbs && (
                  <NutritionMetric
                    label="Carbs"
                    value={recipe.nutrition.carbs.replace(/\s*g$/i, "")}
                  />
                )}
                {recipe.nutrition.fats && (
                  <NutritionMetric
                    label="Fats"
                    value={recipe.nutrition.fats.replace(/\s*g$/i, "")}
                  />
                )}
              </View>
            </View>
          )}

          {recipeCookbooks.length > 0 && (
            <View style={styles.badges}>
              {recipeCookbooks.map((name) => (
                <View
                  key={name}
                  style={[styles.badge, surfaceCardStyle(theme)]}
                >
                  <Entypo name="open-book" size={15} color={theme.textMuted} />
                  <Text variant="bodySmall" style={{ color: theme.textMuted }}>
                    {name}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {recipe.url && (
            <Button
              variant="outline"
              fullWidth
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

          <Button
            variant="ghost"
            accessibilityLabel="Delete recipe"
            onPress={confirmDelete}
            style={styles.deleteLink}
          >
            <Text variant="bodySmall" style={{ color: "#d32f2f" }}>
              Delete recipe
            </Text>
          </Button>
        </View>
      </ScrollView>

      <View style={styles.footerOverlay} pointerEvents="box-none">
        <LinearGradient
          colors={footerFadeColors}
          locations={[0, 0.55, 1]}
          style={[styles.footerFade, { height: scrollBottomPad + 48 }]}
          pointerEvents="none"
        />
        <View
          style={[
            styles.footerBtnWrap,
            { paddingBottom: safeBottom, maxWidth: MaxContentWidth },
          ]}
        >
          <Button
            variant="primary"
            size="md"
            accessibilityLabel="Schedule recipe"
            leftIcon={
              <Entypo name="calendar" size={18} color={theme.surfaceElevated} />
            }
            onPress={() => setScheduleOpen(true)}
            fullWidth
            style={[styles.scheduleBtn, ShadowFloating]}
          >
            Schedule
          </Button>
        </View>
      </View>

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
  body: {
    alignSelf: "center",
    width: "100%",
    maxWidth: MaxContentWidth,
    paddingHorizontal: CONTENT_PAD,
    gap: Spacing.medium,
    paddingTop: Spacing.medium,
    paddingBottom: Spacing.small,
  },
  bodySheet: {
    borderTopLeftRadius: SHEET_TOP_RADIUS,
    borderTopRightRadius: SHEET_TOP_RADIUS,
    zIndex: 1,
  },
  recipeTitle: {
    flex: 1,
    letterSpacing: -0.5,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: Spacing.xsmall,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xxxsmall,
  },
  statSurface: {
    flex: 1,
    minWidth: "28%",
    gap: Spacing.xxxxxsmall,
    paddingVertical: Spacing.xsmall,
    paddingHorizontal: Spacing.xsmall,
    alignItems: "center",
  },
  statValue: {
    fontWeight: "600",
  },
  section: {
    gap: Spacing.xsmall,
  },
  sectionTitle: {
    letterSpacing: -0.5,
    fontSize: 24,
    lineHeight: 30,
  },
  nutritionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xxxsmall,
  },
  nutritionMetric: {
    flex: 1,
    minWidth: "44%",
    gap: Spacing.xxxxsmall,
    paddingVertical: Spacing.xsmall,
    paddingHorizontal: Spacing.xsmall,
    alignItems: "flex-start",
  },
  nutritionValue: {
    fontSize: 30,
    fontWeight: "700",
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xxxsmall,
  },
  badge: {
    paddingHorizontal: Spacing.xsmall,
    paddingVertical: Spacing.xxxsmall,
    borderRadius: Spacing.xlarge,
    flexDirection: "row",
    gap: Spacing.xxxxsmall,
    alignItems: "center",
  },
  linkBanner: {
    alignSelf: "flex-start",
    marginTop: -Spacing.xxxsmall,
  },
  deleteLink: {
    alignSelf: "center",
  },
  ingredientList: {
    gap: Spacing.xxsmall,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: Spacing.xsmall,
  },
  ingredientName: {
    flex: 1,
    fontWeight: "400",
  },
  stepList: {
    gap: Spacing.small,
  },
  stepRow: {
    flexDirection: "row",
    gap: Spacing.xsmall,
    alignItems: "flex-start",
  },
  stepOrder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    flex: 1,
    lineHeight: 24,
    fontWeight: "400",
  },
  footerOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
  },
  footerFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  footerBtnWrap: {
    width: "100%",
    paddingHorizontal: CONTENT_PAD,
    paddingTop: Spacing.xxsmall,
  },
  scheduleBtn: {
    borderRadius: Spacing.small,
  },
});
