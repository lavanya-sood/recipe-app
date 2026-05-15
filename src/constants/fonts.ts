import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import { Platform, type TextStyle } from 'react-native';

export const fontAssets = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} as const;

export const FontFamily = {
  sans: 'Inter',
  serif: Platform.select({
    web: 'Playfair Display',
    ios: 'Playfair Display',
    default: 'PlayfairDisplay',
  })!,
} as const;

type SansWeight = 400 | 500 | 600 | 700;
type SerifWeight = 400 | 500 | 600 | 700;

const interByWeight: Record<SansWeight, string> = {
  400: 'Inter_400Regular',
  500: 'Inter_500Medium',
  600: 'Inter_600SemiBold',
  700: 'Inter_700Bold',
};

const playfairByWeight: Record<SerifWeight, string> = {
  400: 'PlayfairDisplay_400Regular',
  500: 'PlayfairDisplay_500Medium',
  600: 'PlayfairDisplay_600SemiBold',
  700: 'PlayfairDisplay_700Bold',
};

/** Body UI text (Inter). */
export function interStyle(weight: SansWeight = 500): TextStyle {
  if (Platform.OS === 'web') {
    return {
      fontFamily: FontFamily.sans,
      fontWeight: String(weight) as TextStyle['fontWeight'],
    };
  }
  return { fontFamily: interByWeight[weight], fontWeight: 'normal' };
}

/** Headings and display text (Playfair Display). */
export function playfairStyle(weight: SerifWeight = 600): TextStyle {
  if (Platform.OS === 'web') {
    return {
      fontFamily: FontFamily.serif,
      fontWeight: String(weight) as TextStyle['fontWeight'],
    };
  }
  return { fontFamily: playfairByWeight[weight], fontWeight: 'normal' };
}
