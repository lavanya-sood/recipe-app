import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { ThemedView } from '@/components/themed-view';
import { WeeklyMealPlan } from '@/components/weekly-meal-plan';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function ScheduleScreen() {
  return (
    <ThemedView style={styles.outer}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <Text variant="h1">Schedule</Text>
        <WeeklyMealPlan />
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
  },
});
