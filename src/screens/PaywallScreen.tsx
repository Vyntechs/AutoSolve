import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  hasEntitlement,
  isRevenueCatEnabled,
} from "../lib/revenuecatClient";
import { useSubscriptionStore } from "../state/subscriptionStore";
import type { PurchasesPackage } from "react-native-purchases";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const setSubscriptionTier = useSubscriptionStore((s) => s.setSubscriptionTier);
  const startTrial = useSubscriptionStore((s) => s.startTrial);

  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [packageToPurchase, setPackageToPurchase] = useState<PurchasesPackage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [hasTrialOffer, setHasTrialOffer] = useState(false);

  const buttonScale = useSharedValue(1);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    setIsLoading(true);
    setError(null);

    if (!isRevenueCatEnabled()) {
      setError("Subscriptions are not available at this time");
      setIsLoading(false);
      return;
    }

    const result = await getOfferings();
    if (result.ok && result.data.current) {
      const pkg = result.data.current.availablePackages.find(
        (p) => p.identifier === "$rc_weekly"
      );
      setPackageToPurchase(pkg || null);

      // Check if package has a trial offer
      if (pkg?.product.introPrice) {
        setHasTrialOffer(true);
      }
    } else {
      setError("Unable to load subscription options");
    }
    setIsLoading(false);
  };

  const handlePurchase = useCallback(async () => {
    if (!packageToPurchase) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    buttonScale.value = withSequence(
      withSpring(0.95, { damping: 10, stiffness: 400 }),
      withSpring(1, { damping: 10, stiffness: 400 })
    );

    setIsPurchasing(true);
    setError(null);
    setStatusMessage(null);

    const result = await purchasePackage(packageToPurchase);
    if (result.ok) {
      const hasPremium = result.data.entitlements.active?.["premium"];
      if (hasPremium) {
        // Check if user is in trial period
        const entitlement = result.data.entitlements.active?.["premium"];
        if (entitlement?.periodType === "TRIAL") {
          startTrial();
        } else {
          setSubscriptionTier("premium");
        }
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        navigation.goBack();
      }
    } else {
      setError("Purchase failed. Please try again.");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setIsPurchasing(false);
  }, [packageToPurchase, navigation, setSubscriptionTier, startTrial, buttonScale]);

  const handleRestore = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRestoring(true);
    setError(null);
    setStatusMessage(null);

    if (!isRevenueCatEnabled()) {
      setError("Restore unavailable right now. Please try again later.");
      setIsRestoring(false);
      return;
    }

    try {
      const result = await restorePurchases();
      if (result.ok) {
        const hasPremium = result.data.entitlements.active?.["premium"];
        if (hasPremium) {
          const entitlement = result.data.entitlements.active?.["premium"];
          if (entitlement?.periodType === "TRIAL") {
            startTrial();
          } else {
            setSubscriptionTier("premium");
          }
          setStatusMessage("Purchases restored");
          Alert.alert("Purchases restored");
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          navigation.goBack();
        } else {
          setStatusMessage("No purchases to restore");
        }
      } else {
        setError("Unable to restore purchases. Please try again.");
      }
    } catch (restoreError) {
      console.log("Restore failed", restoreError);
      setError("Unable to restore purchases. Please try again.");
    } finally {
      setIsRestoring(false);
    }
  }, [navigation, setSubscriptionTier, startTrial]);

  const openURL = useCallback(async (url: string) => {
    await Haptics.selectionAsync();
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  }, []);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const price = packageToPurchase?.product.priceString || "$4.99";
  const trialDuration = packageToPurchase?.product.introPrice?.periodNumberOfUnits || 2;
  const trialUnit = packageToPurchase?.product.introPrice?.periodUnit || "DAY";

  return (
    <View className="flex-1 bg-[#F8F9FB]">
      {/* Header */}
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="px-5 pb-4 bg-white border-b border-[#E8EDF2]"
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              navigation.goBack();
            }}
            className="w-10 h-10 rounded-full bg-[#F8F9FB] items-center justify-center"
          >
            <Ionicons name="close" size={24} color="#1A365D" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <Animated.View
          entering={FadeInDown.duration(400).springify()}
          className="items-center mb-8"
        >
          <View className="w-20 h-20 rounded-full bg-[#EBF4FF] items-center justify-center mb-4">
            <Ionicons name="flash" size={40} color="#2563EB" />
          </View>
          <Text className="text-3xl font-bold text-[#1A365D] text-center mb-2">
            {hasTrialOffer ? "Start Your Free Trial" : "Upgrade to Premium"}
          </Text>
          <Text className="text-[#64748B] text-base text-center">
            {hasTrialOffer
              ? `Try Premium free for ${trialDuration} days with 10 diagnostic scans`
              : "Unlock unlimited diagnostics and advanced features"}
          </Text>
        </Animated.View>

        {/* Trial Banner */}
        {hasTrialOffer && (
          <Animated.View
            entering={FadeInDown.delay(50).duration(400).springify()}
            className="bg-[#059669] rounded-2xl p-4 mb-6 flex-row items-center"
          >
            <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mr-4">
              <Ionicons name="gift" size={24} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-lg">2-Day Free Trial</Text>
              <Text className="text-white/90 text-sm">10 AI diagnostic scans included</Text>
            </View>
          </Animated.View>
        )}

        {/* Features */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400).springify()}
          className="bg-white rounded-2xl p-5 mb-6"
          style={{
            shadowColor: "#1A365D",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Feature
            icon="scan-outline"
            title="20 Scans Per Week"
            description="Full AI diagnostic analysis (vs 2 for free)"
          />
          <Feature
            icon="time-outline"
            title="Access History"
            description="Review all past diagnostic sessions"
          />
          <Feature
            icon="construct-outline"
            title="Unlimited Tools"
            description="VIN Decoder, OBD-II Codes, Unit Converter"
          />
          <Feature
            icon="flash-outline"
            title="Priority Support"
            description="Get help when you need it"
            isLast
          />
        </Animated.View>

        {/* Pricing */}
        {isLoading ? (
          <View className="py-8 items-center">
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <>
            <Animated.View
              entering={FadeInDown.delay(200).duration(400).springify()}
              className="bg-gradient-to-br from-[#2563EB] to-[#1E40AF] rounded-2xl p-6 mb-4"
              style={{ backgroundColor: "#2563EB" }}
            >
              {hasTrialOffer ? (
                <>
                  <View className="flex-row items-center justify-center mb-2">
                    <Text className="text-white/70 text-lg line-through mr-2">{price}</Text>
                    <Text className="text-white text-5xl font-bold">$0</Text>
                  </View>
                  <Text className="text-white/90 text-center text-base font-medium mb-1">
                    Free for 2 days
                  </Text>
                  <Text className="text-white/70 text-center text-sm">
                    Then {price}/week • Cancel anytime
                  </Text>
                </>
              ) : (
                <>
                  <View className="flex-row items-end justify-center mb-2">
                    <Text className="text-white text-5xl font-bold">{price}</Text>
                    <Text className="text-white/80 text-xl font-medium mb-2">/week</Text>
                  </View>
                  <Text className="text-white/90 text-center text-sm">
                    Cancel anytime • Full access to all features
                  </Text>
                </>
              )}
            </Animated.View>

            {/* Purchase Button */}
            <AnimatedPressable
              onPress={handlePurchase}
              disabled={isPurchasing || !packageToPurchase}
              style={buttonAnimatedStyle}
              className={`rounded-xl py-5 items-center justify-center mb-4 ${
                isPurchasing || !packageToPurchase ? "bg-[#93C5FD]" : "bg-[#2563EB]"
              }`}
            >
              {isPurchasing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white font-bold text-lg">
                  {hasTrialOffer ? "Start Free Trial" : "Start Premium Access"}
                </Text>
              )}
            </AnimatedPressable>

          </>
        )}

        {/* Terms */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(400).springify()}
          className="mt-6"
        >
          <Text className="text-[#94A3B8] text-xs text-center leading-5">
            {hasTrialOffer
              ? `After your 2-day free trial, you will be charged ${price}/week. `
              : ""}
            Payment will be charged to your App Store account. Subscription
            automatically renews unless auto-renew is turned off at least 24 hours
            before the end of the current period. Manage subscriptions in App Store
            settings.
          </Text>
        </Animated.View>

        {/* Legal Links */}
        <Animated.View
          entering={FadeInDown.delay(350).duration(400).springify()}
          className="mt-6 items-center"
        >
          {statusMessage && (
            <Animated.View entering={FadeIn.duration(200)} className="mb-2">
              <Text className="text-[#065F46] text-sm text-center">{statusMessage}</Text>
            </Animated.View>
          )}
          {error && (
            <Animated.View entering={FadeIn.duration(200)} className="mb-2">
              <Text className="text-[#DC2626] text-sm text-center">{error}</Text>
            </Animated.View>
          )}
          <View className="flex-row items-center justify-center flex-wrap gap-4">
            <Pressable
              onPress={handleRestore}
              disabled={isRestoring}
              className="py-2 px-1"
            >
              <View className="flex-row items-center justify-center">
                {isRestoring && (
                  <ActivityIndicator size="small" color="#2563EB" style={{ marginRight: 8 }} />
                )}
                <Text className="text-[#2563EB] text-sm font-medium underline">
                  Restore Purchases
                </Text>
              </View>
            </Pressable>

            <View className="w-1 h-1 rounded-full bg-[#94A3B8]" />

            <Pressable
              onPress={() => openURL("https://www.forgesights.com/autosolve/privacy")}
              className="py-2 px-1"
            >
              <Text className="text-[#2563EB] text-sm font-medium underline">
                Privacy Policy
              </Text>
            </Pressable>

            <View className="w-1 h-1 rounded-full bg-[#94A3B8]" />

            <Pressable
              onPress={() => openURL("https://www.apple.com/legal/internet-services/itunes/dev/stdeula/")}
              className="py-2 px-1"
            >
              <Text className="text-[#2563EB] text-sm font-medium underline">
                Terms of Use
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

interface FeatureProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  isLast?: boolean;
}

function Feature({ icon, title, description, isLast }: FeatureProps) {
  return (
    <View className={`flex-row items-start py-4 ${!isLast ? "border-b border-[#F1F5F9]" : ""}`}>
      <View className="w-10 h-10 rounded-full bg-[#EBF4FF] items-center justify-center mr-4">
        <Ionicons name={icon} size={20} color="#2563EB" />
      </View>
      <View className="flex-1">
        <Text className="text-[#1A365D] font-semibold text-base">{title}</Text>
        <Text className="text-[#64748B] text-sm mt-0.5">{description}</Text>
      </View>
      <Ionicons name="checkmark-circle" size={24} color="#059669" />
    </View>
  );
}
