import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const TAB_LABELS: Record<string, string> = {
  index: 'Home',
  schedule: 'Schedule',
  add: '',
  cookbook: 'Cookbook',
  settings: 'Settings',
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: Math.max(insets.bottom, Spacing.two),
          backgroundColor: theme.background,
          borderTopColor: theme.backgroundSelected,
        },
      ]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = TAB_LABELS[route.name] ?? options.title ?? route.name;
        const isFocused = state.index === index;
        const isAdd = route.name === 'add';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        if (isAdd) {
          return (
            <View key={route.key} style={styles.addSlot}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add recipe"
                onPress={onPress}
                style={({ pressed }) => [
                  styles.addButton,
                  { backgroundColor: theme.text },
                  pressed && styles.pressed,
                ]}>
                <Text style={[styles.addIcon, { color: theme.background }]}>+</Text>
              </Pressable>
            </View>
          );
        }

        return (
          <PlatformPressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={label}
            onPress={onPress}
            style={styles.tab}>
            <Text
              style={[
                styles.label,
                { color: isFocused ? theme.text : theme.textSecondary },
                isFocused && styles.labelFocused,
              ]}
              numberOfLines={1}>
              {label}
            </Text>
          </PlatformPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    minHeight: 48,
  },
  label: {
    fontSize: 11,
    textAlign: 'center',
  },
  labelFocused: {
    fontWeight: '600',
  },
  addSlot: {
    flex: 1,
    alignItems: 'center',
    marginTop: -Spacing.four,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: { elevation: 6 },
      default: {},
    }),
  },
  addIcon: {
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 34,
    marginTop: -2,
  },
  pressed: {
    opacity: 0.85,
  },
});
