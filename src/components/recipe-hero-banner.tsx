import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { RecipeHeroGradient } from '@/components/recipe-hero-gradient';

type Props = {
  width: number;
  height: number;
  imageUri?: string;
  primary: string;
};

/** Hero band: photo with calm scrim, or primary gradient when no image. */
export function RecipeHeroBanner({ width, height, imageUri, primary }: Props) {
  if (!imageUri) {
    return <RecipeHeroGradient width={width} height={height} primary={primary} />;
  }

  return (
    <View style={[styles.wrap, { width, height }]}>
      <Image
        source={{ uri: imageUri }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <LinearGradient
        colors={[
          'rgba(58, 42, 38, 0.08)',
          'rgba(58, 42, 38, 0.28)',
          'rgba(58, 42, 38, 0.52)',
        ]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    overflow: 'hidden',
  },
});
