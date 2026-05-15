import React from 'react';
import { FlatList, Modal, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useRecipes } from '@/context/recipes-context';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { parseDateKey, weekdayName } from '@/utils/week-calendar';

type Props = {
  visible: boolean;
  dateKey: string;
  onClose: () => void;
  onSelect: (recipeId: string, recipeTitle: string) => void;
};

export function PickRecipeModal({ visible, dateKey, onClose, onSelect }: Props) {
  const theme = useTheme();
  const { recipes } = useRecipes();
  const day = parseDateKey(dateKey);
  const dayLabel = `${weekdayName(day)} ${day.getDate()}`;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.background }]}
          onPress={(e) => e.stopPropagation()}>
          <ThemedText type="smallBold">Add recipe</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {dayLabel}
          </ThemedText>

          {recipes.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              Add a recipe first from the + tab.
            </ThemedText>
          ) : (
            <FlatList
              data={recipes}
              keyExtractor={(item) => item.id}
              style={styles.list}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => onSelect(item.id, item.title)}
                  style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                  <ThemedText type="default" numberOfLines={2}>
                    {item.title}
                  </ThemedText>
                </Pressable>
              )}
            />
          )}

          <Pressable onPress={onClose} style={styles.cancelBtn}>
            <ThemedText type="small" themeColor="textSecondary">
              Cancel
            </ThemedText>
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
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    padding: Spacing.four,
    maxHeight: '70%',
    gap: Spacing.three,
  },
  list: {
    maxHeight: 320,
  },
  row: {
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.25)',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  pressed: {
    opacity: 0.75,
  },
});
