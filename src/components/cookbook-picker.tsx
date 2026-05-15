import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { Text } from '@/components/ui/text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useFormInputStyle } from '@/hooks/use-form-input-style';
import { useTheme } from '@/hooks/use-theme';
import type { Cookbook } from '@/types/recipe';

type Props = {
  cookbooks: Cookbook[];
  selectedId: string | null;
  onChange: (id: string | null) => void;
  onCreateCookbook: (name: string) => Cookbook;
};

export function CookbookPicker({ cookbooks, selectedId, onChange, onCreateCookbook }: Props) {
  const theme = useTheme();
  const inputStyle = useFormInputStyle();
  const [open, setOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [newName, setNewName] = React.useState('');

  const selectedLabel =
    selectedId != null ? cookbooks.find((c) => c.id === selectedId)?.name ?? 'Cookbook' : 'None';

  function select(id: string | null) {
    onChange(id);
    setOpen(false);
    setCreating(false);
    setNewName('');
  }

  function createAndSelect() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const cookbook = onCreateCookbook(trimmed);
    select(cookbook.id);
  }

  return (
    <View style={styles.wrap}>
      <Text variant="bodySmallBold">Cookbook</Text>
      <Text variant="bodySmall" themeColor="textSecondary" style={styles.hint}>
        Optional — assign this recipe to a cookbook.
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Select cookbook"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          { borderColor: theme.backgroundSelected, backgroundColor: theme.backgroundElement },
          pressed && styles.pressed,
        ]}>
        <Text variant="bodyReg" numberOfLines={1} style={styles.triggerLabel}>
          {selectedLabel}
        </Text>
        <Text variant="bodySmall" themeColor="textSecondary">
          ▾
        </Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: theme.background }]}
            onPress={(e) => e.stopPropagation()}>
            <Text variant="bodySmallBold" style={styles.sheetTitle}>
              Cookbook
            </Text>

            <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
              <Pressable
                onPress={() => select(null)}
                style={({ pressed }) => [styles.option, pressed && styles.pressed]}>
                <Text variant="bodyReg" themeColor={selectedId == null ? 'text' : 'textSecondary'}>
                  None
                </Text>
                {selectedId == null && <Text variant="bodySmall">✓</Text>}
              </Pressable>

              {cookbooks.map((cookbook) => (
                <Pressable
                  key={cookbook.id}
                  onPress={() => select(cookbook.id)}
                  style={({ pressed }) => [styles.option, pressed && styles.pressed]}>
                  <Text
                    variant="bodyReg"
                    themeColor={selectedId === cookbook.id ? 'text' : 'textSecondary'}>
                    {cookbook.name}
                  </Text>
                  {selectedId === cookbook.id && <Text variant="bodySmall">✓</Text>}
                </Pressable>
              ))}

              {!creating ? (
                <Pressable
                  onPress={() => setCreating(true)}
                  style={({ pressed }) => [styles.option, styles.createOption, pressed && styles.pressed]}>
                  <Text variant="linkPrimary">+ Create new cookbook</Text>
                </Pressable>
              ) : (
                <ThemedView type="backgroundElement" style={styles.createForm}>
                  <TextInput
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="Cookbook name"
                    placeholderTextColor={theme.textSecondary}
                    style={[styles.input, inputStyle]}
                    autoFocus
                    onSubmitEditing={createAndSelect}
                    returnKeyType="done"
                  />
                  <View style={styles.createActions}>
                    <Pressable onPress={() => setCreating(false)} hitSlop={8}>
                      <Text variant="bodySmall" themeColor="textSecondary">
                        Cancel
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={createAndSelect}
                      disabled={!newName.trim()}
                      style={({ pressed }) => [
                        styles.createConfirm,
                        { backgroundColor: theme.text, opacity: newName.trim() ? 1 : 0.4 },
                        pressed && newName.trim() && styles.pressed,
                      ]}>
                      <Text
                        variant="bodySmallBold"
                        style={{ color: theme.background }}>
                        Create
                      </Text>
                    </Pressable>
                  </View>
                </ThemedView>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.xxxsmall,
    paddingHorizontal: Spacing.xsmall,
    paddingVertical: Spacing.xxsmall,
    gap: Spacing.xxxsmall,
  },
  triggerLabel: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: Spacing.base,
  },
  sheet: {
    borderRadius: Spacing.xsmall,
    maxHeight: '70%',
    padding: Spacing.xsmall,
  },
  sheetTitle: {
    marginBottom: Spacing.xxxsmall,
    paddingHorizontal: Spacing.xxxxsmall,
  },
  list: {
    maxHeight: 360,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xsmall,
    paddingHorizontal: Spacing.xxxsmall,
    borderRadius: Spacing.xxxsmall,
  },
  createOption: {
    marginTop: Spacing.xxxxsmall,
  },
  createForm: {
    marginTop: Spacing.xxxsmall,
    padding: Spacing.xsmall,
    borderRadius: Spacing.xxxsmall,
    gap: Spacing.xsmall,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.xxxsmall,
    paddingHorizontal: Spacing.xsmall,
    paddingVertical: Spacing.xxxsmall,
    fontSize: 16,
  },
  createActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.xsmall,
  },
  createConfirm: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xxxsmall,
    borderRadius: Spacing.xxxsmall,
  },
  pressed: {
    opacity: 0.75,
  },
});
