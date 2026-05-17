import React from 'react';
import { FlatList, Modal, Pressable, StyleSheet } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
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
          <Text variant="bodySmallBold">Add recipe</Text>
          <Text variant="bodySmall" themeColor="textSecondary">
            {dayLabel}
          </Text>

          {recipes.length === 0 ? (
            <Text variant="bodySmall" themeColor="textSecondary">
              Add a recipe first using the + button.
            </Text>
          ) : (
            <FlatList
              data={recipes}
              keyExtractor={(item) => item.id}
              style={styles.list}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => onSelect(item.id, item.title)}
                  style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                  <Text variant="bodyReg" numberOfLines={2}>
                    {item.title}
                  </Text>
                </Pressable>
              )}
            />
          )}

          <Button variant="ghost" fullWidth onPress={onClose} style={styles.cancelBtn}>
            Cancel
          </Button>
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
    maxHeight: '70%',
    gap: Spacing.xsmall,
  },
  list: {
    maxHeight: 320,
  },
  row: {
    paddingVertical: Spacing.xsmall,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.25)',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxsmall,
  },
  pressed: {
    opacity: 0.75,
  },
});
