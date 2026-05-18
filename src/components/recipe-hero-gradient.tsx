import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet } from 'react-native';

import { primaryHeroGradientColors } from '@/utils/color-mix';

type Props = {
  width: number;
  height: number;
  primary: string;
};

export function RecipeHeroGradient({ width, height, primary }: Props) {
  const colors = primaryHeroGradientColors(primary);

  return (
    <LinearGradient
      colors={colors}
      locations={[0, 0.45, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[styles.hero, { width, height }]}
    />
  );
}

const styles = StyleSheet.create({
  hero: {
    alignSelf: 'center',
  },
});
