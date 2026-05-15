import { router } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { SocialExtractForm } from '@/components/social-extract-form';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function AddSocialRecipeScreen() {
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom + Spacing.xxxxxxxxlarge;

  return (
    <ThemedView style={styles.outer}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
          <SafeAreaView style={styles.safe} edges={['left', 'right']}>
            <SocialExtractForm
              contentPaddingBottom={bottomPadding}
              onSaved={() => router.back()}
            />
          </SafeAreaView>
        </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
  safe: {
    flex: 1,
    alignSelf: 'stretch',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.base,
  },
});
