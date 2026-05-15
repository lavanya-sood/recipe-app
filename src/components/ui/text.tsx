import { playfairStyle } from "@/constants/fonts";
import { Fonts, type ThemeColor } from "@/constants/theme";

const headingFont = playfairStyle(600);
import { useTheme } from "@/hooks/use-theme";
import React from "react";
import {
  Platform,
  Text as RNText,
  StyleSheet,
  type TextProps as RNTextProps,
  type TextStyle,
} from "react-native";

const styles = StyleSheet.create({
  display: {
    ...headingFont,
    fontSize: 48,
    lineHeight: 52,
  },
  h1: {
    ...headingFont,
    fontSize: 32,
    lineHeight: 44,
  },
  h2: {
    ...headingFont,
    fontSize: 24,
    lineHeight: 28,
  },
  h3: {
    ...headingFont,
    fontSize: 20,
    lineHeight: 24,
  },
  h4: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 20,
  },
  h5: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 18,
  },
  h6: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 16,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 20,
  },
  bodyReg: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyRegBold: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "bold",
  },
  bodySmall: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  bodySmallBold: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "bold",
  },
  caption: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 16,
  },
  captionBold: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "bold",
  },
  link: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 30,
  },
  linkBold: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 30,
    fontWeight: "bold",
  },
  linkPrimary: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 30,
  },
  linkPrimaryBold: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 30,
    fontWeight: "bold",
  },
  linkSecondary: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  linkSecondaryBold: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "bold",
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: "700" as const, default: "500" as const }),
    fontSize: 12,
    lineHeight: 16,
  },
});

export type TextVariant = keyof typeof styles;

const LINK_COLOR_VARIANTS: Partial<Record<TextVariant, ThemeColor>> = {
  linkPrimary: "primary",
  linkPrimaryBold: "primary",
  linkSecondary: "textSecondary",
  linkSecondaryBold: "textSecondary",
};

export type CustomTextProps = RNTextProps & {
  variant?: TextVariant;
  themeColor?: ThemeColor;
};

export function Text({
  variant = "bodyReg",
  themeColor,
  children,
  style,
  ...props
}: CustomTextProps) {
  const theme = useTheme();
  const linkColorKey = LINK_COLOR_VARIANTS[variant];
  const colorStyle: TextStyle = {
    color: theme[linkColorKey ?? themeColor ?? "text"],
  };

  return (
    <RNText
      style={[styles[variant], colorStyle, style]}
      {...props}
    >
      {children}
    </RNText>
  );
}
