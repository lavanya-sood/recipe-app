import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import React from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  imageUri: string | null;
  onChange: (uri: string | null) => void;
};

export function RecipeImagePicker({ imageUri, onChange }: Props) {
  const theme = useTheme();

  async function pickImage() {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Allow photo access to attach a recipe image.');
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      onChange(result.assets[0].uri);
    }
  }

  return (
    <View style={styles.wrap}>
      <Text variant="bodySmallBold">Image</Text>
      <Text variant="bodySmall" themeColor="textSecondary" style={styles.hint}>
        Optional — add a photo of the finished dish.
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={imageUri ? 'Change recipe image' : 'Add recipe image'}
        onPress={() => void pickImage()}
        style={({ pressed }) => [
          styles.frame,
          { borderColor: theme.backgroundSelected, backgroundColor: theme.backgroundElement },
          pressed && styles.pressed,
        ]}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
        ) : (
          <Text variant="bodySmall" themeColor="textSecondary">
            Tap to choose a photo
          </Text>
        )}
      </Pressable>
      {imageUri && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Remove recipe image"
          onPress={() => onChange(null)}
          style={({ pressed }) => [styles.removeLink, pressed && styles.pressed]}>
          <Text variant="bodySmall" themeColor="textSecondary">
            Remove image
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.two,
  },
  hint: {
    lineHeight: 20,
    marginTop: -Spacing.one,
  },
  frame: {
    height: 180,
    borderRadius: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeLink: {
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.8,
  },
});
