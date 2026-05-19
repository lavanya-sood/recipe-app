/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  light: {
    backgroundElement: "#FFFCFA",
    /** Floating cards / stats — lifts off page background */
    surfaceElevated: "#FFFDFC",
    backgroundSelected: "#E0E1E6",
    textSecondary: "#7A6D67",
    textMuted: "#8B7E77",
    background: "#F6F1EC",
    primary: "#722F37",
    accent: "#C89B63",
    text: "#3A2A26",
    secondary: "#E7D7C9",
    border: "#E8DDD3",
    cardBackground: "#F8F1EC",
    cardText: "#2B211F",
    cardAccent: "#C89B63",
  },
  dark: {
    // text: "#ffffff",
    // background: "#000000",
    surfaceElevated: "#FFFDFC",
    textMuted: "#8B7E77",
    backgroundElement: "#212225",
    backgroundSelected: "#2E3135",
    textSecondary: "#B0B4BA",
    background: "#FFF8F3",
    primary: "#722F37",
    accent: "#D4A373",
    text: "#3A2A26",
    secondary: "#E7D7C9",
    border: "#E8DDD3",
    cardBackground: "#F8F1EC",
    cardText: "#2B211F",
    cardAccent: "#D4A373",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

import { FontFamily } from "@/constants/fonts";

export const Fonts = {
  sans: FontFamily.sans,
  serif: FontFamily.serif,
  mono: Platform.select({
    ios: "ui-monospace",
    web: "var(--font-mono)",
    default: "monospace",
  })!,
};

// Main Background	#F6F1EC
// Surface/Card	#FFFCFA
// Primary Wine	#722F37
// Accent Gold	#C89B63
// Main Text	#3A2A26
// Secondary Text	#7A6D67
// Border	#E8DDD3

export const Spacing = {
  xxxxxsmall: 2,
  xxxxsmall: 4,
  xxxsmall: 8,
  xxsmall: 12,
  xsmall: 16,
  small: 20,
  base: 24,
  medium: 28,
  large: 32,
  xlarge: 36,
  xxlarge: 40,
  xxxlarge: 44,
  xxxxlarge: 48,
  xxxxxxlarge: 56,
  xxxxxxxxlarge: 64,
  xxxxxxxxxlarge: 72,
  xxxxxxxxxxlarge: 80,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/** Warm editorial shadow for floating surfaces */
export const ShadowFloating = Platform.select({
  ios: {
    shadowColor: "#32140A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
  },
  android: {
    elevation: 8,
  },
  default: {},
});
