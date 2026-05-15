import { Tabs } from "expo-router";
import React from "react";

import { CustomTabBar } from "@/components/custom-tab-bar";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { overflow: "visible", zIndex: 100, elevation: 100 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Homes" }} />
      <Tabs.Screen name="schedule" options={{ title: "Schedulse" }} />
      <Tabs.Screen name="cookbook" options={{ title: "Cookbook" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
