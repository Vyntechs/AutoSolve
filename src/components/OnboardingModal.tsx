import React, { useState } from "react";
import { View, Text, Pressable, Dimensions, Image } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface OnboardingStep {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: readonly [string, string];
  title: string;
  description: string;
  highlight?: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    icon: "car-sport",
    iconBg: ["#2563EB", "#1D4ED8"] as const,
    title: "Welcome to AutoSolve",
    description: "Your AI-powered vehicle diagnostic assistant. Get expert-level diagnostics right from your phone.",
    highlight: "No mechanic experience needed",
  },
  {
    icon: "document-text-outline",
    iconBg: ["#059669", "#047857"] as const,
    title: "Enter Your Vehicle Info",
    description: "Start by entering your vehicle details - year, make, model, and mileage. The more info you provide, the better the diagnosis.",
  },
  {
    icon: "warning-outline",
    iconBg: ["#D97706", "#B45309"] as const,
    title: "Describe the Problem",
    description: "Enter any check engine codes (like P0301) and describe what you are experiencing - strange sounds, smells, or behaviors.",
    highlight: "Be as detailed as possible",
  },
  {
    icon: "sparkles",
    iconBg: ["#7C3AED", "#6D28D9"] as const,
    title: "Get AI Diagnostics",
    description: "Tap Scan Vehicle and our AI Master Technician will analyze your issue and provide step-by-step diagnostic guidance.",
    highlight: "40+ years of expertise",
  },
];

interface OnboardingModalProps {
  visible: boolean;
  onComplete: () => void;
}

export function OnboardingModal({ visible, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const progress = useSharedValue(0);

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      progress.value = withSpring((currentStep + 1) / (ONBOARDING_STEPS.length - 1));
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete();
    }
  };

  const handleSkip = async () => {
    await Haptics.selectionAsync();
    onComplete();
  };

  const progressStyle = useAnimatedStyle(() => ({
    width: `${interpolate(
      progress.value,
      [0, 1],
      [25, 100],
      Extrapolation.CLAMP
    )}%`,
  }));

  if (!visible) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      className="absolute inset-0 z-50"
      style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
    >
      <View className="flex-1 justify-center items-center px-6">
        <Animated.View
          entering={FadeIn.delay(100).duration(400)}
          className="bg-white rounded-3xl w-full max-w-sm overflow-hidden"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 20 },
            shadowOpacity: 0.3,
            shadowRadius: 30,
            elevation: 20,
          }}
        >
          {/* Header with gradient */}
          <LinearGradient
            colors={step.iconBg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingTop: 40,
              paddingBottom: 50,
              alignItems: "center",
            }}
          >
            {/* Skip button */}
            {!isLastStep && (
              <Pressable
                onPress={handleSkip}
                className="absolute top-4 right-4 px-3 py-1.5 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                <Text className="text-white text-sm font-medium">Skip</Text>
              </Pressable>
            )}

            {/* Icon */}
            <Animated.View
              key={currentStep}
              entering={SlideInRight.duration(400).springify()}
              exiting={SlideOutLeft.duration(200)}
              className="w-24 h-24 rounded-full bg-white/20 items-center justify-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 16,
              }}
            >
              <View className="w-20 h-20 rounded-full bg-white items-center justify-center">
                <Ionicons name={step.icon} size={40} color={step.iconBg[0]} />
              </View>
            </Animated.View>

            {/* Step indicator dots */}
            <View className="flex-row mt-6 gap-2">
              {ONBOARDING_STEPS.map((_, index) => (
                <View
                  key={index}
                  className={`h-2 rounded-full ${
                    index === currentStep ? "w-6 bg-white" : "w-2 bg-white/40"
                  }`}
                />
              ))}
            </View>
          </LinearGradient>

          {/* Content */}
          <View className="px-6 pt-6 pb-8">
            <Animated.View
              key={`content-${currentStep}`}
              entering={SlideInRight.delay(100).duration(400).springify()}
              exiting={SlideOutLeft.duration(200)}
            >
              <Text className="text-2xl font-bold text-[#1A365D] text-center mb-3">
                {step.title}
              </Text>
              <Text className="text-[#64748B] text-base text-center leading-6 mb-4">
                {step.description}
              </Text>
              {step.highlight && (
                <View className="bg-[#EBF4FF] rounded-xl px-4 py-2.5 self-center">
                  <Text className="text-[#2563EB] text-sm font-semibold text-center">
                    {step.highlight}
                  </Text>
                </View>
              )}
            </Animated.View>

            {/* Progress bar */}
            <View className="h-1.5 bg-[#E8EDF2] rounded-full mt-6 mb-5 overflow-hidden">
              <Animated.View
                className="h-full rounded-full"
                style={[
                  { backgroundColor: step.iconBg[0] },
                  progressStyle,
                ]}
              />
            </View>

            {/* Action button */}
            <Pressable
              onPress={handleNext}
              className="rounded-2xl overflow-hidden"
              style={{
                shadowColor: step.iconBg[0],
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <LinearGradient
                colors={step.iconBg}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 16,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <Text className="text-white text-lg font-semibold mr-2">
                  {isLastStep ? "Get Started" : "Next"}
                </Text>
                <Ionicons
                  name={isLastStep ? "checkmark-circle" : "arrow-forward"}
                  size={22}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
}
