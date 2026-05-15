import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import React from "react";
import { Modal, Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddRecipeMenu } from "@/components/add-recipe-sheet";
import { Text } from "@/components/ui/text";
import {
  ADD_FAB_SIZE,
  FAB_CONTAINER_TOP_OFFSET,
  fabBottomFromScreen,
} from "@/constants/tab-bar-layout";
import { Spacing } from "@/constants/theme";
import { useAddRecipeSheet } from "@/context/add-recipe-sheet-context";
import { useTheme } from "@/hooks/use-theme";
import Entypo from "@expo/vector-icons/Entypo";

const ICON_SIZE = 24;
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
  const { visible: menuOpen, open, close } = useAddRecipeSheet();
  const fabBottom = fabBottomFromScreen(insets.bottom);

  return (
    <>
      {menuOpen && (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={close}
          statusBarTranslucent
        >
          <View style={styles.modalRoot} pointerEvents="box-none">
            <Pressable
              style={styles.overlay}
              onPress={close}
              accessibilityRole="button"
              accessibilityLabel="Close add menu"
            />
            <AddRecipeMenu onClose={close} />
            <View
              style={[styles.modalFab, { bottom: fabBottom }]}
              pointerEvents="box-none"
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close add menu"
                accessibilityState={{ expanded: true }}
                onPress={close}
                style={({ pressed }) => [
                  styles.addButton,
                  {
                    backgroundColor: theme.primary,
                    borderColor: theme.background,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Entypo name="cross" size={ADD_ICON_SIZE} color={theme.background} />
              </Pressable>
            </View>
          </View>
        </Modal>
      )}

      <View
        style={[
          styles.wrapper,
          {
            paddingBottom: Math.max(insets.bottom, Spacing.xxxsmall),
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
            onPress={open}
            style={({ pressed }) => [
              styles.addButton,
              {
                backgroundColor: theme.primary,
                borderColor: theme.background,
              },
              menuOpen && styles.fabHidden,
              pressed && !menuOpen && styles.pressed,
            ]}
            pointerEvents={menuOpen ? "none" : "auto"}
          >
            <Entypo name="plus" size={ADD_ICON_SIZE} color={theme.background} />
          </Pressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalFab: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 3,
  },
  wrapper: {
    position: "relative",
    overflow: "visible",
  },
  bar: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.xxxsmall,
    paddingHorizontal: Spacing.xxxxsmall,
    overflow: "visible",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxxsmall,
    minHeight: 48,
  },
  label: {
    textAlign: "center",
  },
  addSpacer: {
    flex: 1,
  },
  fabContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: -FAB_CONTAINER_TOP_OFFSET,
    alignItems: "center",
    zIndex: 3,
  },
  addButton: {
    width: ADD_FAB_SIZE,
    height: ADD_FAB_SIZE,
    borderRadius: ADD_FAB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  fabHidden: {
    opacity: 0,
  },
  pressed: {
    opacity: 0.85,
  },
});
