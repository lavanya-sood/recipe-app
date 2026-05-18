/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  light: {
    // text: '#000000',
    // background: '#ffffff',
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    textSecondary: "#60646C",
    background: "#FFF8F3",
    primary: "#722F37",
    accent: "#D4A373",
    text: "#2B211F",
    secondary: "#E7D7C9",
    border: "#383838",
    cardBackground: "#F8F1EC",
    cardText: "#2B211F",
    cardAccent: "#D4A373",
  },
  dark: {
    // text: "#ffffff",
    // background: "#000000",
    backgroundElement: "#212225",
    backgroundSelected: "#2E3135",
    textSecondary: "#B0B4BA",
    background: "#FFF8F3",
    primary: "#722F37",
    accent: "#D4A373",
    text: "#2B211F",
    secondary: "#E7D7C9",
    border: "#383838",
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
