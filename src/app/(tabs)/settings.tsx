import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function SettingsScreen() {
  return (
    <ThemedView style={styles.outer}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <Text variant="h1">Settings</Text>
        <ThemedView type="backgroundElement" style={styles.card}>
          <Text variant="bodyReg">Coming soon</Text>
          <Text variant="bodySmall" themeColor="textSecondary" style={styles.sub}>
            App preferences and data options will live here.
          </Text>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safe: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xsmall,
    gap: Spacing.xsmall,
  },
  card: {
    padding: Spacing.base,
    borderRadius: Spacing.base,
    gap: Spacing.xxxsmall,
  },
  sub: {
    lineHeight: 22,
  },
});
