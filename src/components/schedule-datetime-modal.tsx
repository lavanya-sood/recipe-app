import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React from 'react';
import { Modal, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useRecipes } from '@/context/recipes-context';
import { Spacing } from '@/constants/theme';
import { useFormInputStyle } from '@/hooks/use-form-input-style';
import { useTheme } from '@/hooks/use-theme';
import { parseDateKey, toDateKey } from '@/utils/week-calendar';
import { toTimeString } from '@/utils/schedule';

type Props = {
  visible: boolean;
  recipeId: string;
  recipeTitle: string;
  /** Lock scheduling to this day (YYYY-MM-DD) */
  initialDateKey?: string;
  dateLocked?: boolean;
  onClose: () => void;
  onScheduled?: () => void;
};

function defaultWhen(dateKey?: string) {
  const base = dateKey ? parseDateKey(dateKey) : new Date();
  const d = new Date(base);
  if (!dateKey) {
    d.setMinutes(d.getMinutes() + 30 - (d.getMinutes() % 15));
  } else {
    d.setHours(18, 30, 0, 0);
  }
  return d;
}

export function ScheduleDatetimeModal({
  visible,
  recipeId,
  recipeTitle,
  initialDateKey,
  dateLocked = false,
  onClose,
  onScheduled,
}: Props) {
  const theme = useTheme();
  const inputStyle = useFormInputStyle();
  const { addSchedule } = useRecipes();

  const [when, setWhen] = React.useState(() => defaultWhen(initialDateKey));
  const [showDate, setShowDate] = React.useState(Platform.OS === 'ios' && !dateLocked);
  const [showTime, setShowTime] = React.useState(Platform.OS === 'ios');

  React.useEffect(() => {
    if (visible) setWhen(defaultWhen(initialDateKey));
  }, [visible, initialDateKey]);

  function onChange(_: DateTimePickerEvent, selected?: Date) {
    if (selected) setWhen(selected);
  }

  function confirm() {
    addSchedule(recipeId, toDateKey(when), toTimeString(when));
    onScheduled?.();
    onClose();
  }

  const dateLabel = when.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const timeLabel = when.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.background }]}
          onPress={(e) => e.stopPropagation()}>
          <Text variant="bodySmallBold">Schedule</Text>
          <Text variant="bodyReg" style={styles.recipeName}>
            {recipeTitle}
          </Text>

          {dateLocked && initialDateKey && (
            <Text variant="bodySmall" themeColor="textSecondary">
              {when.toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          )}

          {Platform.OS === 'web' ? (
            <View style={styles.webRow}>
              <View style={styles.webField}>
                <Text variant="bodySmall" themeColor="textSecondary">
                  Date
                </Text>
                <TextInput
                  value={toDateKey(when)}
                  onChangeText={(v) => {
                    const [y, m, d] = v.split('-').map(Number);
                    if (y && m && d) {
                      const next = new Date(when);
                      next.setFullYear(y, m - 1, d);
                      setWhen(next);
                    }
                  }}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.input, inputStyle]}
                />
              </View>
              <View style={styles.webField}>
                <Text variant="bodySmall" themeColor="textSecondary">
                  Time
                </Text>
                <TextInput
                  value={toTimeString(when)}
                  onChangeText={(v) => {
                    const match = v.match(/^(\d{1,2}):(\d{2})$/);
                    if (match) {
                      const next = new Date(when);
                      next.setHours(Number(match[1]), Number(match[2]), 0, 0);
                      setWhen(next);
                    }
                  }}
                  placeholder="HH:mm"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.input, inputStyle]}
                />
              </View>
            </View>
          ) : (
            <>
              {!dateLocked && (
                <>
                  <Pressable
                    onPress={() => {
                      setShowDate(true);
                      setShowTime(false);
                    }}
                    style={[styles.pickerTrigger, { borderColor: theme.backgroundSelected }]}>
                    <Text variant="bodySmall" themeColor="textSecondary">
                      Date
                    </Text>
                    <Text variant="bodyReg">{dateLabel}</Text>
                  </Pressable>
                  {showDate && (
                    <DateTimePicker
                      value={when}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'inline' : 'default'}
                      onChange={onChange}
                      minimumDate={new Date()}
                    />
                  )}
                </>
              )}

              <Pressable
                onPress={() => {
                  setShowTime(true);
                  setShowDate(false);
                }}
                style={[styles.pickerTrigger, { borderColor: theme.backgroundSelected }]}>
                <Text variant="bodySmall" themeColor="textSecondary">
                  Time
                </Text>
                <Text variant="bodyReg">{timeLabel}</Text>
              </Pressable>
              {showTime && (
                <DateTimePicker
                  value={when}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onChange}
                />
              )}
            </>
          )}

          <Pressable
            onPress={confirm}
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: theme.text },
              pressed && styles.pressed,
            ]}>
            <Text variant="bodySmallBold" style={{ color: theme.background }}>
              Add to schedule
            </Text>
          </Pressable>

          <Pressable onPress={onClose} style={styles.cancelBtn}>
            <Text variant="bodySmall" themeColor="textSecondary">
              Cancel
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Spacing.base,
    borderTopRightRadius: Spacing.base,
    padding: Spacing.base,
    gap: Spacing.xsmall,
  },
  recipeName: {
    fontWeight: '600',
  },
  pickerTrigger: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.xxxsmall,
    padding: Spacing.xsmall,
    gap: Spacing.xxxxsmall,
  },
  webRow: {
    gap: Spacing.xsmall,
  },
  webField: {
    gap: Spacing.xxxxsmall,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.xxxsmall,
    paddingHorizontal: Spacing.xsmall,
    paddingVertical: Spacing.xxsmall,
    fontSize: 16,
  },
  primaryBtn: {
    paddingVertical: Spacing.xsmall,
    borderRadius: Spacing.xsmall,
    alignItems: 'center',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxsmall,
  },
  pressed: {
    opacity: 0.75,
  },
});
