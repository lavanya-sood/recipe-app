import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";
import { addMenuBottom } from "@/constants/tab-bar-layout";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type Props = {
  onClose: () => void;
};

export function AddRecipeMenu({ onClose }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  function goManual() {
    onClose();
    router.push("/add/manual");
  }

  function goSocial() {
    onClose();
    router.push("/add/social");
  }

  return (
    <View
      style={[styles.anchor, { bottom: addMenuBottom(insets.bottom) }]}
      pointerEvents="box-none"
    >
      <Pressable
        style={[
          styles.card,
          {
            backgroundColor: theme.background,
            borderColor: theme.backgroundSelected,
            shadowColor: theme.text,
          },
        ]}
        onPress={(e) => e.stopPropagation()}
      >
        <Text variant="h2" style={styles.heading}>
          Add a recipe
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={goManual}
          style={({ pressed }) => [
            styles.option,
            {
              backgroundColor: theme.secondary,
              borderColor: theme.secondary,
            },
            pressed && styles.pressed,
          ]}
        >
          <Text variant="h4">Manual entry</Text>
          <Text variant="bodySmall" themeColor="textSecondary">
            Type ingredients, steps, and details yourself
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={goSocial}
          style={({ pressed }) => [
            styles.option,
            {
              backgroundColor: theme.secondary,
              borderColor: theme.secondary,
            },
            pressed && styles.pressed,
          ]}
        >
          <Text variant="h4">From social</Text>
          <Text variant="bodySmall" themeColor="textSecondary">
            Paste a link from Instagram, TikTok, and more
          </Text>
        </Pressable>
      </Pressable>

      <View
        style={[
          styles.caret,
          {
            borderTopColor: theme.background,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: "absolute",
    left: Spacing.base,
    right: Spacing.base,
    alignItems: "center",
    zIndex: 2,
  },
  card: {
    width: "100%",
    maxWidth: 500,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.base,
    padding: Spacing.base,
    gap: Spacing.xsmall,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  heading: {
    textAlign: "center",
  },
  option: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.xsmall,
    padding: Spacing.base,
    gap: Spacing.xxxxsmall,
  },
  caret: {
    width: 0,
    height: 0,
    marginTop: -1,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  pressed: {
    opacity: 0.85,
  },
});
