import { router } from 'expo-router';
import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function AddRecipeSheet({ visible, onClose }: Props) {
  const theme = useTheme();

  function goManual() {
    onClose();
    router.push('/add/manual');
  }

  function goSocial() {
    onClose();
    router.push('/add/social');
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.background }]}
          onPress={(e) => e.stopPropagation()}>
          <View style={[styles.handle, { backgroundColor: theme.backgroundSelected }]} />
          <Text variant="bodySmallBold" style={styles.heading}>
            Add recipe
          </Text>
          <Text variant="bodySmall" themeColor="textSecondary">
            How would you like to add it?
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={goManual}
            style={({ pressed }) => [
              styles.option,
              { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
              pressed && styles.pressed,
            ]}>
            <Text variant="h3">Manual entry</Text>
            <Text variant="bodySmall" themeColor="textSecondary">
              Type ingredients, steps, and details yourself
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={goSocial}
            style={({ pressed }) => [
              styles.option,
              { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
              pressed && styles.pressed,
            ]}>
            <Text variant="h3">From social</Text>
            <Text variant="bodySmall" themeColor="textSecondary">
              Paste a link from Instagram, TikTok, and more
            </Text>
          </Pressable>

          <Pressable onPress={onClose} style={styles.cancelBtn} accessibilityRole="button">
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
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
    paddingTop: Spacing.two,
    gap: Spacing.three,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.one,
  },
  heading: {
    textAlign: 'center',
  },
  option: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  pressed: {
    opacity: 0.85,
  },
});
