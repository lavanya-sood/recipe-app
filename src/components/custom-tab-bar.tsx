import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Spacing } from "@/constants/theme";
import { useAddRecipeSheet } from "@/context/add-recipe-sheet-context";
import { useTheme } from "@/hooks/use-theme";
import Entypo from "@expo/vector-icons/Entypo";
import { Text } from "./ui/text";

const ICON_SIZE = 24;
const ADD_ICON_CIRCLE_SIZE = 70;
const ADD_ICON_SIZE = 40;

type EntypoIconName = React.ComponentProps<typeof Entypo>["name"];

const TAB_LABELS: Record<string, string> = {
  index: "Home",
  schedule: "Schedule",
  cookbook: "Cookbooks",
  settings: "Settings",
};

const TAB_ICONS: Record<string, EntypoIconName> = {
  index: "home",
  schedule: "calendar",
  cookbook: "book",
  settings: "tools",
};

/** Insert the + button after this tab route name. */
const ADD_AFTER_ROUTE = "schedule";

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { open: openAddSheet } = useAddRecipeSheet();

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingBottom: Math.max(insets.bottom, Spacing.two),
          backgroundColor: theme.background,
        },
      ]}
    >
      <View style={[styles.bar, { borderTopColor: theme.secondary }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = TAB_LABELS[route.name] ?? options.title ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const tab = (
            <PlatformPressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={label}
              onPress={onPress}
              style={styles.tab}
            >
              <Entypo
                name={TAB_ICONS[route.name] ?? "home"}
                size={ICON_SIZE}
                color={isFocused ? theme.primary : theme.text}
              />
              <Text
                variant={isFocused ? "captionBold" : "caption"}
                style={[
                  styles.label,
                  { color: isFocused ? theme.primary : theme.text },
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </PlatformPressable>
          );

          if (route.name === ADD_AFTER_ROUTE) {
            return (
              <React.Fragment key={route.key}>
                {tab}
                <View key="add-spacer" style={styles.addSpacer} />
              </React.Fragment>
            );
          }

          return tab;
        })}
      </View>

      <View style={styles.fabContainer} pointerEvents="box-none">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add recipe"
          onPress={openAddSheet}
          style={({ pressed }) => [
            styles.addButton,
            {
              backgroundColor: theme.primary,
              borderColor: theme.background,
            },
            pressed && styles.pressed,
          ]}
        >
          <Entypo name="plus" size={ADD_ICON_SIZE} color={theme.background} />
        </Pressable>
      </View>
    </View>
  );
}

const FAB_OVERHANG = ADD_ICON_CIRCLE_SIZE / 2;

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    overflow: "visible",
  },
  bar: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.one,
    overflow: "visible",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.two,
    minHeight: 48,
  },
  label: {
    // fontSize: 11,

    textAlign: "center",
  },
  addSpacer: {
    flex: 1,
  },
  fabContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: -ADD_ICON_CIRCLE_SIZE / 4,
    alignItems: "center",
    zIndex: 1,
  },
  addButton: {
    width: ADD_ICON_CIRCLE_SIZE,
    height: ADD_ICON_CIRCLE_SIZE,
    borderRadius: ADD_ICON_CIRCLE_SIZE / 2,

    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: { elevation: 6 },
      default: {},
    }),
  },
  addIcon: {
    fontSize: ADD_ICON_SIZE,
    fontWeight: "300",
  },
  pressed: {
    opacity: 0.85,
  },
});
