import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  interpolate,
  Easing,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface AnimatedScanButtonProps {
  isScanning: boolean;
  scanStep: number; // 0-4 for different scan phases
  onPress: () => void;
  disabled?: boolean;
}

const SCAN_STEPS = [
  { label: "Initializing", icon: "hardware-chip-outline" as const },
  { label: "Reading Data", icon: "reader-outline" as const },
  { label: "Analyzing", icon: "analytics-outline" as const },
  { label: "Processing", icon: "cog-outline" as const },
  { label: "Finalizing", icon: "checkmark-circle-outline" as const },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AnimatedScanButton({
  isScanning,
  scanStep,
  onPress,
  disabled,
}: AnimatedScanButtonProps) {
  const scale = useSharedValue(1);
  const progress = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const iconRotation = useSharedValue(0);
  const shimmerPosition = useSharedValue(-1);

  // Update progress when scanning
  useEffect(() => {
    if (isScanning) {
      progress.value = withTiming((scanStep + 1) / SCAN_STEPS.length, {
        duration: 400,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });

      // Pulse animation during scan
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        true
      );

      // Rotate icon
      iconRotation.value = withRepeat(
        withTiming(360, { duration: 1500, easing: Easing.linear }),
        -1,
        false
      );

      // Shimmer effect
      shimmerPosition.value = withRepeat(
        withTiming(1, { duration: 1500, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      progress.value = withTiming(0, { duration: 300 });
      pulseScale.value = withTiming(1, { duration: 200 });
      iconRotation.value = withTiming(0, { duration: 200 });
      shimmerPosition.value = -1;
    }
  }, [isScanning, scanStep]);

  const handlePressIn = () => {
    if (!isScanning && !disabled) {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    if (!isScanning && !disabled) {
      scale.value = withSequence(
        withSpring(0.95, { damping: 10, stiffness: 400 }),
        withSpring(1, { damping: 10, stiffness: 400 })
      );
      onPress();
    }
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value * pulseScale.value },
    ],
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotation.value}deg` }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          shimmerPosition.value,
          [-1, 1],
          [-200, 400]
        ),
      },
    ],
  }));

  const currentStep = SCAN_STEPS[Math.min(scanStep, SCAN_STEPS.length - 1)];

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || isScanning}
      style={buttonAnimatedStyle}
      className="overflow-hidden rounded-2xl"
    >
      <LinearGradient
        colors={isScanning ? ["#1D4ED8", "#3B82F6"] : ["#2563EB", "#1D4ED8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingVertical: isScanning ? 20 : 18,
          paddingHorizontal: 24,
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        {/* Shimmer overlay */}
        {isScanning && (
          <Animated.View
            style={[
              {
                position: "absolute",
                top: 0,
                bottom: 0,
                width: 100,
                backgroundColor: "rgba(255,255,255,0.15)",
                transform: [{ skewX: "-20deg" }],
              },
              shimmerStyle,
            ]}
          />
        )}

        {/* Main content */}
        <View className="items-center justify-center">
          {isScanning ? (
            <View className="items-center">
              {/* Animated icon */}
              <View className="flex-row items-center mb-2">
                <Animated.View style={iconAnimatedStyle}>
                  <Ionicons
                    name={currentStep.icon}
                    size={22}
                    color="#FFFFFF"
                  />
                </Animated.View>
                <Text className="text-white font-semibold text-base ml-2">
                  {currentStep.label}
                </Text>
              </View>

              {/* Progress bar */}
              <View className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <Animated.View
                  className="h-full bg-white rounded-full"
                  style={progressBarStyle}
                />
              </View>

              {/* Step indicators */}
              <View className="flex-row items-center justify-center mt-3 gap-2">
                {SCAN_STEPS.map((step, index) => (
                  <View
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index <= scanStep ? "bg-white" : "bg-white/30"
                    }`}
                  />
                ))}
              </View>
            </View>
          ) : (
            <View className="flex-row items-center justify-center">
              <Ionicons name="scan-outline" size={22} color="#FFFFFF" />
              <Text className="text-white font-semibold text-base ml-2">
                Scan Vehicle
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </AnimatedPressable>
  );
}
