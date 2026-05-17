import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Text } from "@/components/ui/text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

const DESTRUCTIVE_COLOR = "#d32f2f";

export type ButtonVariant =
  | "primary"
  | "outline"
  | "destructive"
  | "ghost"
  | "chip";

export type ButtonProps = Omit<PressableProps, "style" | "children"> & {
  children?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  /** Chip / toggle styling when `variant` is `chip`. */
  selected?: boolean;
  loading?: boolean;
  size?: "sm" | "md";
  style?: StyleProp<ViewStyle>;
  accessibilityRole?: "button" | "link";
  /** Row alignment for label + icons (`ghost` list rows often use `start`). */
  contentAlign?: "center" | "start";
};

function isStringLike(node: React.ReactNode): node is string | number {
  return typeof node === "string" || typeof node === "number";
}

export function Button({
  children,
  leftIcon,
  rightIcon,
  variant = "primary",
  fullWidth = false,
  selected = false,
  loading = false,
  size = "md",
  disabled,
  style,
  accessibilityRole = "button",
  contentAlign = "center",
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = Boolean(disabled);
  const busy = loading;

  const spinnerColor =
    variant === "primary"
      ? theme.background
      : variant === "chip" && selected
        ? theme.background
        : theme.text;

  const label = busy ? (
    <ActivityIndicator color={spinnerColor} />
  ) : isStringLike(children) ? (
    renderDefaultLabel(children, variant, selected, theme)
  ) : (
    children
  );

  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      disabled={isDisabled || busy}
      style={({ pressed }) => [
        styles.pressable,
        fullWidth && styles.fullWidth,
        variant === "outline" &&
          !fullWidth &&
          size === "sm" &&
          styles.outlineSmInline,
        variantStyles(variant, size, theme, selected, isDisabled || busy),
        pressed && !(isDisabled || busy) && styles.pressed,
        style,
      ]}
      {...rest}
    >
      <View
        style={[
          styles.inner,
          contentAlign === "start" && styles.innerAlignStart,
        ]}
      >
        {leftIcon ? <View style={styles.iconSlot}>{leftIcon}</View> : null}
        {label}
        {rightIcon ? <View style={styles.iconSlot}>{rightIcon}</View> : null}
      </View>
    </Pressable>
  );
}

function renderDefaultLabel(
  text: string | number,
  variant: ButtonVariant,
  selected: boolean,
  theme: ReturnType<typeof useTheme>,
) {
  switch (variant) {
    case "destructive":
      return (
        <Text variant="bodySmallBold" style={{ color: DESTRUCTIVE_COLOR }}>
          {text}
        </Text>
      );
    case "ghost":
      return (
        <Text variant="bodySmall" themeColor="textSecondary">
          {text}
        </Text>
      );
    case "chip":
      return (
        <Text
          variant="bodySmall"
          style={selected ? { color: theme.background } : undefined}
          themeColor={selected ? undefined : "textSecondary"}
        >
          {text}
        </Text>
      );
    case "outline":
      return <Text variant="bodySmallBold">{text}</Text>;
    default:
      return (
        <Text variant="bodySmallBold" style={{ color: theme.background }}>
          {text}
        </Text>
      );
  }
}

function variantStyles(
  variant: ButtonVariant,
  size: "sm" | "md",
  theme: ReturnType<typeof useTheme>,
  selected: boolean,
  faded: boolean,
): ViewStyle {
  const mdVertical = Spacing.xsmall;
  const smVertical = Spacing.xxsmall;
  const vPad = size === "md" ? mdVertical : smVertical;
  const radiusMd = Spacing.small;
  const radiusSm = Spacing.xxsmall;

  switch (variant) {
    case "primary":
      return {
        backgroundColor: theme.primary,
        borderRadius: size === "md" ? radiusMd : radiusSm,
        paddingVertical: vPad,
        paddingHorizontal: Spacing.base,
        alignItems: "center",
        justifyContent: "center",
        opacity: faded ? 0.5 : 1,
      };
    case "outline":
      return {
        backgroundColor: "transparent",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.text,
        borderRadius: size === "md" ? radiusMd : radiusSm,
        paddingVertical: vPad,
        paddingHorizontal: Spacing.base,
        alignItems: "center",
        justifyContent: "center",
        opacity: faded ? 0.45 : 1,
      };
    case "destructive":
      return {
        backgroundColor: "transparent",
        paddingVertical: Spacing.xxsmall,
        paddingHorizontal: Spacing.base,
        borderRadius: radiusMd,
        alignItems: "center",
        justifyContent: "center",
      };
    case "ghost":
      return {
        backgroundColor: "transparent",
        paddingVertical: Spacing.xxxsmall,
        paddingHorizontal: Spacing.xsmall,
        alignItems: "center",
        justifyContent: "center",
      };
    case "chip":
      return {
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.backgroundSelected,
        borderRadius: Spacing.xsmall,
        paddingHorizontal: Spacing.xsmall,
        paddingVertical: Spacing.xxxsmall,
        backgroundColor: selected ? theme.text : "transparent",
        alignItems: "center",
        justifyContent: "center",
      };
    default:
      return {};
  }
}

const styles = StyleSheet.create({
  pressable: {
    alignSelf: "flex-start",
  },
  fullWidth: {
    alignSelf: "stretch",
    width: "100%",
  },
  outlineSmInline: {
    alignSelf: "flex-start",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xxxsmall,
  },
  innerAlignStart: {
    justifyContent: "flex-start",
    width: "100%",
  },
  iconSlot: {
    justifyContent: "center",
    alignItems: "center",
  },
  pressed: {
    opacity: 0.85,
  },
});
