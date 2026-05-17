import { router, Stack } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, type ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ManualRecipeForm } from '@/components/manual-recipe-form';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function AddManualRecipeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom + Spacing.xxxxxxxxlarge;

  const headerStyle: ViewStyle = {
    backgroundColor: theme.background,
    borderBottomWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  };

  return (
    <ThemedView style={styles.outer}>
      <Stack.Screen
        options={{
          title: '',
          headerBackTitle: 'Back',
          headerTintColor: theme.text,
          headerShadowVisible: false,
          headerStyle: headerStyle as { backgroundColor?: string },
        }}
      />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
          <SafeAreaView style={styles.safe} edges={['left', 'right']}>
            <ManualRecipeForm
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
