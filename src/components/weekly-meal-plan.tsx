import { router } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { PickRecipeModal } from '@/components/pick-recipe-modal';
import { ScheduleDatetimeModal } from '@/components/schedule-datetime-modal';
import { Text } from '@/components/ui/text';
import { useRecipes } from '@/context/recipes-context';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ScheduleEntry } from '@/types/schedule';
import { formatTimeLabel, scheduleSortKey } from '@/utils/schedule';
import {
  formatWeekRangeLong,
  getWeekDates,
  getWeekStart,
  isToday,
  toDateKey,
  weekdayName,
} from '@/utils/week-calendar';

const DAY_MS = 24 * 60 * 60 * 1000;

type PendingSchedule = {
  recipeId: string;
  recipeTitle: string;
  dateKey: string;
};

export function WeeklyMealPlan() {
  const theme = useTheme();
  const { recipes, schedule, removeSchedule } = useRecipes();
  const [weekStart, setWeekStart] = React.useState(() => getWeekStart(new Date()));
  const [pickDateKey, setPickDateKey] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState<PendingSchedule | null>(null);

  const weekDates = getWeekDates(weekStart);

  const entriesByDate = React.useMemo(() => {
    const map = new Map<string, ScheduleEntry[]>();
    for (const entry of schedule) {
      const list = map.get(entry.date) ?? [];
      list.push(entry);
      map.set(entry.date, list);
    }
    for (const [, list] of map) {
      list.sort((a, b) => scheduleSortKey(a) - scheduleSortKey(b));
    }
    return map;
  }, [schedule]);

  function shiftWeek(delta: number) {
    setWeekStart((prev) => new Date(prev.getTime() + delta * 7 * DAY_MS));
  }

  const swipeWeek = Gesture.Pan()
    .activeOffsetX([-24, 24])
    .onEnd((e) => {
      if (e.translationX < -48) runOnJS(shiftWeek)(1);
      else if (e.translationX > 48) runOnJS(shiftWeek)(-1);
    });

  function confirmRemove(entry: ScheduleEntry) {
    Alert.alert('Remove from schedule?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeSchedule(entry.id) },
    ]);
  }

  return (
    <>
      <View style={styles.weekNav}>
        <Pressable
          accessibilityLabel="Previous week"
          onPress={() => shiftWeek(-1)}
          hitSlop={12}
          style={({ pressed }) => pressed && styles.pressed}>
          <Text variant="bodySmallBold">‹</Text>
        </Pressable>
        <Text variant="bodySmall" themeColor="textSecondary" style={styles.weekRange}>
          {formatWeekRangeLong(weekStart)}
        </Text>
        <Pressable
          accessibilityLabel="Next week"
          onPress={() => shiftWeek(1)}
          hitSlop={12}
          style={({ pressed }) => pressed && styles.pressed}>
          <Text variant="bodySmallBold">›</Text>
        </Pressable>
      </View>

      <GestureDetector gesture={swipeWeek}>
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}>
          {weekDates.map((date) => {
            const dateKey = toDateKey(date);
            const today = isToday(date);
            const entries = entriesByDate.get(dateKey) ?? [];

            return (
              <View key={dateKey} style={styles.dayBlock}>
                <View style={styles.dayHeader}>
                  <View style={styles.dayTitleWrap}>
                    {today ? (
                      <View style={styles.todayRow}>
                        <Text variant="bodyReg" style={styles.todayLabel}>
                          Today
                        </Text>
                        <Text variant="bodyReg" style={styles.dayTitle}>
                          {' · '}
                          {weekdayName(date)} {date.getDate()}
                        </Text>
                      </View>
                    ) : (
                      <Text variant="bodyReg" style={styles.dayTitle}>
                        {weekdayName(date)} {date.getDate()}
                      </Text>
                    )}
                  </View>
                  <Pressable
                    accessibilityLabel={`Add recipe for ${weekdayName(date)}`}
                    onPress={() => setPickDateKey(dateKey)}
                    hitSlop={8}
                    style={({ pressed }) => [
                      styles.addBtn,
                      { borderColor: theme.backgroundSelected },
                      pressed && styles.pressed,
                    ]}>
                    <Text variant="bodyReg" style={[styles.addIcon, { color: theme.textSecondary }]}>
                      +
                    </Text>
                  </Pressable>
                </View>

                {entries.length === 0 ? (
                  <Text variant="bodySmall" themeColor="textSecondary" style={styles.emptyDay}>
                    No recipes yet
                  </Text>
                ) : (
                  entries.map((entry) => {
                    const recipe = recipes.find((r) => r.id === entry.recipeId);
                    return (
                      <Pressable
                        key={entry.id}
                        onPress={() => recipe && router.push(`/recipe/${recipe.id}`)}
                        onLongPress={() => confirmRemove(entry)}
                        style={({ pressed }) => [styles.recipeRow, pressed && styles.pressed]}>
                        <Text variant="bodySmall" numberOfLines={2} style={styles.recipeTitle}>
                          {recipe?.title ?? 'Recipe removed'}
                        </Text>
                        <Text variant="bodySmall" themeColor="textSecondary">
                          {formatTimeLabel(entry.time)}
                        </Text>
                      </Pressable>
                    );
                  })
                )}

                {dateKey !== toDateKey(weekDates[6]) && <View style={styles.divider} />}
              </View>
            );
          })}
        </ScrollView>
      </GestureDetector>

      <PickRecipeModal
        visible={!!pickDateKey}
        dateKey={pickDateKey ?? ''}
        onClose={() => setPickDateKey(null)}
        onSelect={(recipeId, recipeTitle) => {
          const dateKey = pickDateKey!;
          setPickDateKey(null);
          setPending({ recipeId, recipeTitle, dateKey });
        }}
      />

      {pending && (
        <ScheduleDatetimeModal
          visible
          recipeId={pending.recipeId}
          recipeTitle={pending.recipeTitle}
          initialDateKey={pending.dateKey}
          dateLocked
          onClose={() => setPending(null)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xxxsmall,
    marginBottom: Spacing.xxxxsmall,
  },
  weekRange: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Spacing.base,
  },
  dayBlock: {
    paddingVertical: Spacing.xsmall,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.xsmall,
  },
  dayTitleWrap: {
    flex: 1,
  },
  todayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  todayLabel: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
    color: '#208AEF',
  },
  dayTitle: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    fontSize: 22,
    fontWeight: '300',
    lineHeight: 24,
  },
  emptyDay: {
    marginTop: Spacing.xxxxsmall,
    marginLeft: Spacing.xxxxxsmall,
  },
  recipeRow: {
    marginTop: Spacing.xxxsmall,
    marginLeft: Spacing.xxxxxsmall,
    gap: 2,
  },
  recipeTitle: {
    fontWeight: '500',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(128,128,128,0.2)',
    marginTop: Spacing.xsmall,
  },
  pressed: {
    opacity: 0.7,
  },
});
