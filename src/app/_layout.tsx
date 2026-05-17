import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { fontAssets } from "@/constants/fonts";
import { AddRecipeSheetProvider } from "@/context/add-recipe-sheet-context";
import { RecipesProvider } from "@/context/recipes-context";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <RecipesProvider>
          <AddRecipeSheetProvider>
            <AnimatedSplashOverlay />
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="add/manual" />
              <Stack.Screen
                name="add/social"
                options={{
                  headerBackTitle: "Back",
                  title: "From social",
                }}
              />
              <Stack.Screen
                name="recipe/[id]"
                options={{
                  headerBackTitle: "Back",
                  title: "Recipe",
                }}
              />
              <Stack.Screen
                name="recipe/edit/[id]"
                options={{
                  headerBackTitle: "Back",
                  title: "Edit recipe",
                }}
              />
              <Stack.Screen
                name="cookbook/[id]"
                options={{
                  headerBackTitle: "Back",
                  title: "Cookbook",
                }}
              />
            </Stack>
          </AddRecipeSheetProvider>
        </RecipesProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
