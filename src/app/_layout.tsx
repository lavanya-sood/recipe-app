import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { RecipesProvider } from '@/context/recipes-context';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RecipesProvider>
          <AnimatedSplashOverlay />
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="recipe/[id]"
              options={{
                headerBackTitle: 'Back',
                title: 'Recipe',
              }}
            />
            <Stack.Screen
              name="recipe/edit/[id]"
              options={{
                headerBackTitle: 'Back',
                title: 'Edit recipe',
              }}
            />
            <Stack.Screen
              name="cookbook/[id]"
              options={{
                headerBackTitle: 'Back',
                title: 'Cookbook',
              }}
            />
          </Stack>
        </RecipesProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
