import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { hasEntitlement, isRevenueCatEnabled } from "./src/lib/revenuecatClient";
import { useSubscriptionStore } from "./src/state/subscriptionStore";

/*
IMPORTANT NOTICE: DO NOT REMOVE
There are already environment keys in the project.
Before telling the user to add them, check if you already have access to the required keys through bash.
Directly access them with process.env.${key}

Correct usage:
process.env.EXPO_PUBLIC_VIBECODE_{key}
//directly access the key

Incorrect usage:
import { OPENAI_API_KEY } from '@env';
//don't use @env, its depreicated

Incorrect usage:
import Constants from 'expo-constants';
const openai_api_key = Constants.expoConfig.extra.apikey;
//don't use expo-constants, its depreicated

*/

export default function App() {
  const setSubscriptionTier = useSubscriptionStore((s) => s.setSubscriptionTier);

  useEffect(() => {
    // Check subscription status on app launch
    const checkSubscriptionStatus = async () => {
      if (!isRevenueCatEnabled()) {
        return;
      }

      const result = await hasEntitlement("premium");
      if (result.ok && result.data) {
        setSubscriptionTier("premium");
      } else {
        setSubscriptionTier("free");
      }
    };

    checkSubscriptionStatus();
  }, [setSubscriptionTier]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootNavigator />
          <StatusBar style="dark" />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
