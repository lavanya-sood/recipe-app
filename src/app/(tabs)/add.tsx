import React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ManualRecipeForm } from '@/components/manual-recipe-form';
import { SocialExtractForm } from '@/components/social-extract-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type AddMode = 'manual' | 'social';

export default function AddRecipeScreen() {
  const theme = useTheme();
  const [mode, setMode] = React.useState<AddMode>('manual');
  const [formKey, setFormKey] = React.useState(0);

  function handleSaved() {
    setFormKey((k) => k + 1);
  }

  return (
    <ThemedView style={styles.outer}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
          <ThemedText type="subtitle">Add recipe</ThemedText>

          <ThemedView type="backgroundElement" style={styles.segment}>
            <Pressable
              onPress={() => setMode('manual')}
              style={({ pressed }) => [
                styles.segmentBtn,
                mode === 'manual' && { backgroundColor: theme.backgroundSelected },
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: mode === 'manual' }}>
              <ThemedText
                type="smallBold"
                themeColor={mode === 'manual' ? 'text' : 'textSecondary'}>
                Manual entry
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setMode('social')}
              style={({ pressed }) => [
                styles.segmentBtn,
                mode === 'social' && { backgroundColor: theme.backgroundSelected },
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: mode === 'social' }}>
              <ThemedText
                type="smallBold"
                themeColor={mode === 'social' ? 'text' : 'textSecondary'}>
                From social
              </ThemedText>
            </Pressable>
          </ThemedView>

          <View style={styles.flex}>
            {mode === 'manual' ? (
              <ManualRecipeForm key={`manual-${formKey}`} onSaved={handleSaved} />
            ) : (
              <SocialExtractForm key={`social-${formKey}`} onSaved={handleSaved} />
            )}
          </View>

          {Platform.OS === 'web' && <WebBadge />}
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  segment: {
    flexDirection: 'row',
    padding: Spacing.one,
    borderRadius: Spacing.three,
    gap: Spacing.one,
    alignSelf: 'stretch',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
