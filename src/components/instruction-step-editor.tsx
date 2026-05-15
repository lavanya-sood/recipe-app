import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { Text } from '@/components/ui/text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useFormInputStyle } from '@/hooks/use-form-input-style';
import { useTheme } from '@/hooks/use-theme';
import type { RecipeInstructionStep } from '@/types/recipe';
import { newStepId, reindexSteps } from '@/utils/normalize-recipe';

type Props = {
  steps: RecipeInstructionStep[];
  onChange: (steps: RecipeInstructionStep[]) => void;
};

export function InstructionStepEditor({ steps, onChange }: Props) {
  const theme = useTheme();
  const inputStyle = useFormInputStyle();
  const [draft, setDraft] = React.useState('');

  function addStep() {
    const text = draft.trim();
    if (!text) return;
    onChange(
      reindexSteps([
        ...steps,
        {
          id: newStepId(),
          order: steps.length + 1,
          text,
        },
      ]),
    );
    setDraft('');
  }

  function updateStep(id: string, text: string) {
    onChange(steps.map((s) => (s.id === id ? { ...s, text } : s)));
  }

  function removeStep(id: string) {
    onChange(reindexSteps(steps.filter((s) => s.id !== id)));
  }

  function renderStep(step: RecipeInstructionStep) {
    const row = (
      <ThemedView type="backgroundElement" style={styles.row}>
        <View style={[styles.orderBadge, { backgroundColor: theme.backgroundSelected }]}>
          <Text variant="bodySmallBold">{step.order}</Text>
        </View>
        <TextInput
          value={step.text}
          onChangeText={(text) => updateStep(step.id, text)}
          placeholder="Describe this step…"
          placeholderTextColor={theme.textSecondary}
          style={[styles.stepInput, inputStyle]}
          multiline
          accessibilityLabel={`Instruction step ${step.order}`}
        />
        {Platform.OS === 'web' && (
          <Pressable
            accessibilityLabel={`Remove step ${step.order}`}
            onPress={() => removeStep(step.id)}
            hitSlop={8}
            style={({ pressed }) => [styles.webRemove, pressed && styles.pressed]}>
            <Text variant="bodySmall" themeColor="textSecondary">
              Remove
            </Text>
          </Pressable>
        )}
      </ThemedView>
    );

    if (Platform.OS === 'web') return <View key={step.id}>{row}</View>;

    return (
      <Swipeable
        key={step.id}
        overshootRight={false}
        renderRightActions={() => (
          <Pressable
            accessibilityLabel={`Remove step ${step.order}`}
            onPress={() => removeStep(step.id)}
            style={({ pressed }) => [styles.deleteAction, pressed && styles.pressed]}>
            <Text style={styles.deleteLabel}>Delete</Text>
          </Pressable>
        )}>
        {row}
      </Swipeable>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text variant="bodySmallBold">Instructions</Text>
      <Text variant="bodySmall" themeColor="textSecondary" style={styles.hint}>
        Add each step separately — they are numbered automatically. Swipe left to remove.
      </Text>

      <View style={styles.addRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Add a step…"
          placeholderTextColor={theme.textSecondary}
          style={[styles.draftInput, inputStyle]}
          multiline
          accessibilityLabel="New instruction step"
          onSubmitEditing={addStep}
          blurOnSubmit
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add instruction step"
          disabled={!draft.trim()}
          onPress={addStep}
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: theme.text, opacity: draft.trim() ? 1 : 0.4 },
            pressed && draft.trim() && styles.pressed,
          ]}>
          <Text style={[styles.addBtnLabel, { color: theme.background }]}>Add</Text>
        </Pressable>
      </View>

      {steps.length > 0 && (
        <View style={styles.list}>{steps.map((step) => renderStep(step))}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.xxxsmall,
  },
  hint: {
    lineHeight: 20,
    marginTop: -Spacing.xxxxsmall,
  },
  addRow: {
    gap: Spacing.xxxsmall,
  },
  draftInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.xxxsmall,
    paddingHorizontal: Spacing.xsmall,
    paddingVertical: Spacing.xxsmall,
    fontSize: 16,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  addBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xxsmall,
    borderRadius: Spacing.xxxsmall,
  },
  addBtnLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  list: {
    gap: Spacing.xxxsmall,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.xxxsmall,
    borderRadius: Spacing.xxxsmall,
    gap: Spacing.xxxsmall,
  },
  orderBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xxxxsmall,
  },
  stepInput: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.xxxsmall,
    paddingHorizontal: Spacing.xsmall,
    paddingVertical: Spacing.xxxsmall,
    fontSize: 15,
    minHeight: 44,
    textAlignVertical: 'top',
  },
  webRemove: {
    paddingTop: Spacing.xxxsmall,
  },
  deleteAction: {
    backgroundColor: '#d32f2f',
    justifyContent: 'center',
    alignItems: 'center',
    width: 88,
    borderRadius: Spacing.xxxsmall,
    marginLeft: Spacing.xxxsmall,
  },
  deleteLabel: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  pressed: {
    opacity: 0.75,
  },
});
