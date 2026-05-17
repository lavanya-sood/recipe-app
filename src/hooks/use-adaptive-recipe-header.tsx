import { router, useNavigation } from 'expo-router';
import React from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';
import { isHeroImageLight } from '@/utils/hero-image-luminance';

const HEADER_BAR_HEIGHT = 44;

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '');
  return [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16),
  ];
}

function mixHex(from: string, to: string, amount: number): string {
  const parse = (hex: string) => {
    const n = hex.replace('#', '');
    return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
  };
  const [r1, g1, b1] = parse(from);
  const [r2, g2, b2] = parse(to);
  const t = Math.min(Math.max(amount, 0), 1);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

type Options = {
  enabled: boolean;
  heroHeight: number;
  imageUri?: string;
  recipeId: string;
};

export function useAdaptiveRecipeHeader({ enabled, heroHeight, imageUri, recipeId }: Options) {
  const navigation = useNavigation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [scrollY, setScrollY] = React.useState(0);
  const [heroIsLight, setHeroIsLight] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (!enabled || !imageUri) {
      setHeroIsLight(null);
      return;
    }
    let cancelled = false;
    isHeroImageLight(imageUri).then((isLight) => {
      if (!cancelled) setHeroIsLight(isLight);
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, imageUri]);

  const headerMetrics = React.useMemo(() => {
    const headerZone = insets.top + HEADER_BAR_HEIGHT;
    const fadeDistance = Math.max(heroHeight - headerZone, 80);
    const scrollProgress = Math.min(Math.max(scrollY / fadeDistance, 0), 1);

    const imageUnknown = heroIsLight === null;
    const imageForeground =
      heroIsLight === true ? theme.text : '#ffffff';
    const bodyForeground = theme.text;
    const foreground =
      scrollProgress >= 1 ? bodyForeground : (
        scrollProgress <= 0 ? imageForeground : mixHex(imageForeground, bodyForeground, scrollProgress)
      );

    const [bgR, bgG, bgB] = hexToRgb(theme.background);
    const headerBackground =
      scrollProgress <= 0 ?
        imageUnknown ? 'rgba(0, 0, 0, 0.22)' : 'transparent'
      : `rgba(${bgR}, ${bgG}, ${bgB}, ${Math.min(scrollProgress * 0.96, 0.96)})`;

    const useDarkStatusBar = scrollProgress > 0.35 || heroIsLight === true;

    return {
      foreground,
      headerBackground,
      scrollProgress,
      useDarkStatusBar,
    };
  }, [heroHeight, heroIsLight, insets.top, scrollY, theme.background, theme.text]);

  React.useLayoutEffect(() => {
    if (!enabled) return;

    const { foreground, headerBackground, scrollProgress } = headerMetrics;

    navigation.setOptions({
      headerTintColor: foreground,
      headerStyle: {
        backgroundColor: headerBackground,
      },
      headerShadowVisible: scrollProgress > 0.85,
      headerRight: () => (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Edit recipe"
          onPress={() => router.push(`/recipe/edit/${recipeId}`)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text
            style={{
              color: foreground,
              fontWeight: '600',
            }}>
            Edit
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [enabled, headerMetrics, navigation, recipeId]);

  const onScroll = React.useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollY(event.nativeEvent.contentOffset.y);
  }, []);

  const statusBarStyle: 'light' | 'dark' =
    headerMetrics.useDarkStatusBar ? 'dark' : 'light';

  return { onScroll, statusBarStyle };
}
