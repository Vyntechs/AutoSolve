import React, { useCallback, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Keyboard,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  FadeInDown,
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideInRight,
  ZoomIn,
  Layout,
  interpolate,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useAutoSolveStore } from "../state/autoSolveStore";
import { useSubscriptionStore } from "../state/subscriptionStore";
import { RootStackParamList } from "../navigation/RootNavigator";
import {
  getDiagnosticAnalysis,
  DiagnosticPath,
} from "../api/diagnostic-service";
import { RepairOutcomeModal } from "../components/RepairOutcomeModal";
import { WhatFixedItCard, NoDataYetCard } from "../components/WhatFixedItCard";
import { useRepairOutcomeStore, generateStatsKey } from "../state/repairOutcomeStore";
import { AnimatedScanButton } from "../components/AnimatedScanButton";
import { OnboardingModal } from "../components/OnboardingModal";
import { FollowUpChat, ChatMessage } from "../components/FollowUpChat";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const vehicle = useAutoSolveStore((s) => s.vehicle);
  const setVehicle = useAutoSolveStore((s) => s.setVehicle);
  const issueDescription = useAutoSolveStore((s) => s.issueDescription);
  const setIssueDescription = useAutoSolveStore((s) => s.setIssueDescription);
  const diagnosticResult = useAutoSolveStore((s) => s.diagnosticResult);
  const setDiagnosticResult = useAutoSolveStore((s) => s.setDiagnosticResult);
  const isScanning = useAutoSolveStore((s) => s.isScanning);
  const setIsScanning = useAutoSolveStore((s) => s.setIsScanning);
  const scanError = useAutoSolveStore((s) => s.scanError);
  const setScanError = useAutoSolveStore((s) => s.setScanError);
  const hasSeenOnboarding = useAutoSolveStore((s) => s.hasSeenOnboarding);
  const setHasSeenOnboarding = useAutoSolveStore((s) => s.setHasSeenOnboarding);
  const followUpMessages = useAutoSolveStore((s) => s.followUpMessages);
  const setFollowUpMessages = useAutoSolveStore((s) => s.setFollowUpMessages);

  const canScan = useSubscriptionStore((s) => s.canScan);
  const incrementScanUsage = useSubscriptionStore((s) => s.incrementScanUsage);
  const getRemainingScans = useSubscriptionStore((s) => s.getRemainingScans);
  const addToHistory = useSubscriptionStore((s) => s.addToHistory);
  const tier = useSubscriptionStore((s) => s.tier);

  // Repair outcome store
  const scheduleDiagnosticFollowUp = useRepairOutcomeStore(
    (s) => s.scheduleDiagnosticFollowUp
  );
  const getCachedStats = useRepairOutcomeStore((s) => s.getCachedStats);
  const getPendingFollowUps = useRepairOutcomeStore((s) => s.getPendingFollowUps);

  // Repair outcome modal state
  const [showRepairOutcomeModal, setShowRepairOutcomeModal] = useState(false);
  const [currentDiagnosticId, setCurrentDiagnosticId] = useState<string | null>(null);
  const [lastSessionId, setLastSessionId] = useState<string | null>(null);
  const [scanStep, setScanStep] = useState(0);

  const scanButtonScale = useSharedValue(1);
  const scanStepInterval = useRef<NodeJS.Timeout | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Function to scroll to bottom when follow-up input is focused
  const handleFollowUpInputFocus = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  // Check for pending follow-ups when screen loads
  useEffect(() => {
    const followUps = getPendingFollowUps();
    if (followUps.length > 0) {
      const firstFollowUp = followUps[0];
      setCurrentDiagnosticId(firstFollowUp.diagnosticId);
      setShowRepairOutcomeModal(true);
    }
  }, [getPendingFollowUps]);

  // Helper function to extract DTC codes from text
  const extractDTCCodes = (text: string): string[] => {
    const dtcPattern = /[PBCU][0-9]{4}/gi;
    const matches = text.match(dtcPattern) || [];
    return [...new Set(matches.map(code => code.toUpperCase()))];
  };

  const handleScanPress = useCallback(async () => {
    // Check if user can scan
    if (!canScan()) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      navigation.navigate("Paywall");
      return;
    }

    // Check if we have minimum required data
    if (!vehicle.make || !vehicle.model) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setScanError("Please enter a vehicle make and model");
      return;
    }

    if (!issueDescription.trim()) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setScanError("Please describe your issue, symptoms, or enter DTC codes");
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Keyboard.dismiss();

    // Clear previous results and start scanning
    setDiagnosticResult(null);
    setScanError(null);
    setIsScanning(true);
    setScanStep(0);

    // Start step progression animation
    let currentStep = 0;
    scanStepInterval.current = setInterval(() => {
      currentStep++;
      if (currentStep < 4) {
        setScanStep(currentStep);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }, 800);

    // Extract DTC codes from the issue description
    const extractedCodes = extractDTCCodes(issueDescription);

    try {
      // Call the AI diagnostic service
      const result = await getDiagnosticAnalysis({
        vehicle: {
          year: vehicle.year || "Unknown",
          make: vehicle.make,
          model: vehicle.model,
          engine: vehicle.engine || "Not specified",
          mileage: vehicle.mileage || "Not specified",
        },
        symptoms: [issueDescription], // Send the full description
        dtcCodes: extractedCodes,
      });

      // Clear the interval and set to final step
      if (scanStepInterval.current) {
        clearInterval(scanStepInterval.current);
      }
      setScanStep(4);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Small delay to show completion state
      await new Promise(resolve => setTimeout(resolve, 500));

      // Store the result
      setDiagnosticResult(result);

      // Increment usage counter
      incrementScanUsage();

      // Save diagnostic session to history
      const session = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        vehicle: {
          year: vehicle.year || "N/A",
          make: vehicle.make || "N/A",
          model: vehicle.model || "N/A",
          mileage: vehicle.mileage || "N/A",
        },
        symptoms: [issueDescription],
        dtcCodes: extractedCodes,
        summary: result.summary,
      };
      addToHistory(session);
      setLastSessionId(session.id);

      // Schedule follow-up for repair outcome (3 days later)
      scheduleDiagnosticFollowUp(session.id, 3);

    } catch (error) {
      console.error("Scan error:", error);
      if (scanStepInterval.current) {
        clearInterval(scanStepInterval.current);
      }
      setScanError("Failed to analyze vehicle. Please try again.");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsScanning(false);
      setScanStep(0);
    }
  }, [
    canScan,
    incrementScanUsage,
    navigation,
    vehicle,
    issueDescription,
    addToHistory,
    setDiagnosticResult,
    setIsScanning,
    setScanError,
  ]);

  const scanButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scanButtonScale.value }],
  }));

  const handleReportFix = useCallback(() => {
    if (lastSessionId) {
      setCurrentDiagnosticId(lastSessionId);
      setShowRepairOutcomeModal(true);
    }
  }, [lastSessionId]);

  const dismissKeyboard = () => Keyboard.dismiss();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F8F9FB]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <View className="flex-1">
        <View
          style={{ paddingTop: insets.top + 8 }}
          className="px-5 pb-4 bg-white border-b border-[#E8EDF2]"
        >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Image
              source={require("../../assets/icon-1765049456934.png")}
              className="w-10 h-10 mr-3"
              resizeMode="contain"
            />
            <View>
              <Text className="text-2xl font-bold text-[#1A365D] tracking-tight">
                AutoSolve
              </Text>
              <Text className="text-sm text-[#64748B] mt-0.5">
                AI Diagnostic Assistant
              </Text>
            </View>
          </View>
          <View className="w-10 h-10 rounded-full bg-[#EBF4FF] items-center justify-center">
            <Ionicons name="car-sport-outline" size={22} color="#2563EB" />
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={dismissKeyboard}
      >
        {/* Vehicle Intake Card */}
        <Animated.View
          entering={FadeInDown.duration(400).springify()}
          className="bg-white rounded-2xl p-5 mb-4 shadow-sm"
          style={{
            shadowColor: "#1A365D",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 rounded-lg bg-[#EBF4FF] items-center justify-center mr-3">
              <Ionicons name="car-outline" size={18} color="#2563EB" />
            </View>
            <Text className="text-lg font-semibold text-[#1A365D]">
              Your Vehicle
            </Text>
          </View>

          <View className="flex-row mb-3 gap-3">
            <View className="flex-1">
              <Text className="text-xs font-medium text-[#64748B] mb-1.5 uppercase tracking-wide">
                Year
              </Text>
              <TextInput
                className="bg-[#F8F9FB] rounded-xl px-4 py-3.5 text-[#1A365D] text-base border border-[#E8EDF2]"
                placeholder="2024"
                placeholderTextColor="#94A3B8"
                cursorColor="#1A365D"
                selectionColor="#2563EB"
                value={vehicle.year}
                onChangeText={(text) => setVehicle({ year: text })}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-medium text-[#64748B] mb-1.5 uppercase tracking-wide">
                Make
              </Text>
              <TextInput
                className="bg-[#F8F9FB] rounded-xl px-4 py-3.5 text-[#1A365D] text-base border border-[#E8EDF2]"
                placeholder="Toyota"
                placeholderTextColor="#94A3B8"
                cursorColor="#1A365D"
                selectionColor="#2563EB"
                value={vehicle.make}
                onChangeText={(text) => setVehicle({ make: text })}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View className="flex-row mb-3 gap-3">
            <View className="flex-1">
              <Text className="text-xs font-medium text-[#64748B] mb-1.5 uppercase tracking-wide">
                Model
              </Text>
              <TextInput
                className="bg-[#F8F9FB] rounded-xl px-4 py-3.5 text-[#1A365D] text-base border border-[#E8EDF2]"
                placeholder="Camry"
                placeholderTextColor="#94A3B8"
                cursorColor="#1A365D"
                selectionColor="#2563EB"
                value={vehicle.model}
                onChangeText={(text) => setVehicle({ model: text })}
                autoCapitalize="words"
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-medium text-[#64748B] mb-1.5 uppercase tracking-wide">
                Engine
              </Text>
              <TextInput
                className="bg-[#F8F9FB] rounded-xl px-4 py-3.5 text-[#1A365D] text-base border border-[#E8EDF2]"
                placeholder="2.5L I4"
                placeholderTextColor="#94A3B8"
                cursorColor="#1A365D"
                selectionColor="#2563EB"
                value={vehicle.engine}
                onChangeText={(text) => setVehicle({ engine: text })}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-xs font-medium text-[#64748B] mb-1.5 uppercase tracking-wide">
              Mileage
            </Text>
            <TextInput
              className="bg-[#F8F9FB] rounded-xl px-4 py-3.5 text-[#1A365D] text-base border border-[#E8EDF2]"
              placeholder="45,000"
              placeholderTextColor="#94A3B8"
              cursorColor="#1A365D"
              selectionColor="#2563EB"
              value={vehicle.mileage}
              onChangeText={(text) => setVehicle({ mileage: text })}
              keyboardType="number-pad"
            />
          </View>

          <AnimatedScanButton
            isScanning={isScanning}
            scanStep={scanStep}
            onPress={handleScanPress}
            disabled={false}
          />

          {/* Error Message */}
          {scanError && (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
              className="mt-3 bg-red-50 rounded-xl p-3.5 flex-row items-center border border-red-100"
            >
              <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center mr-3">
                <Ionicons name="alert-circle" size={18} color="#DC2626" />
              </View>
              <Text className="text-red-700 text-sm flex-1 font-medium">
                {scanError}
              </Text>
              <Pressable
                onPress={() => setScanError(null)}
                className="p-1"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={22} color="#DC2626" />
              </Pressable>
            </Animated.View>
          )}

          {/* Usage Info */}
          <View className="mt-4 flex-row items-center justify-center">
            <View className="flex-row items-center bg-[#F1F5F9] rounded-full px-3 py-1.5">
              <Ionicons name="flash-outline" size={14} color="#64748B" />
              <Text className="text-[#64748B] text-sm ml-1.5 font-medium">
                {getRemainingScans()} scans left
              </Text>
            </View>
            {tier === "free" && (
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync();
                  navigation.navigate("Paywall");
                }}
                className="ml-2"
              >
                <Text className="text-[#2563EB] text-sm font-medium">
                  Upgrade
                </Text>
              </Pressable>
            )}
          </View>
        </Animated.View>

        {/* Issue Description Card */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400).springify()}
          className="bg-white rounded-2xl p-5 mb-4 shadow-sm"
          style={{
            shadowColor: "#1A365D",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 rounded-lg bg-[#FEF3C7] items-center justify-center mr-3">
              <Ionicons name="warning-outline" size={18} color="#D97706" />
            </View>
            <Text className="text-lg font-semibold text-[#1A365D]">
              Describe Your Issue
            </Text>
          </View>

          <Text className="text-xs font-medium text-[#64748B] mb-2 uppercase tracking-wide">
            Symptoms & Codes
          </Text>
          <TextInput
            className="bg-[#F8F9FB] rounded-xl px-4 py-3.5 text-[#1A365D] text-base border border-[#E8EDF2]"
            placeholder="e.g. P0304, engine runs rough, check engine light on, car shakes at idle..."
            placeholderTextColor="#94A3B8"
            cursorColor="#1A365D"
            selectionColor="#2563EB"
            value={issueDescription}
            onChangeText={setIssueDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{ minHeight: 100 }}
          />
          <Text className="text-xs text-[#94A3B8] mt-2">
            Enter any DTC codes (like P0301, P0420) and describe what you are experiencing
          </Text>
        </Animated.View>

        {/* AutoSolve Insight Card */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400).springify()}
          className="bg-white rounded-2xl p-5 shadow-sm"
          style={{
            shadowColor: "#1A365D",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 rounded-lg bg-[#ECFDF5] items-center justify-center mr-3">
              <Ionicons name="eye-outline" size={18} color="#059669" />
            </View>
            <Text className="text-lg font-semibold text-[#1A365D]">
              AutoSolve Insights
            </Text>
          </View>

          {isScanning ? (
            <Animated.View
              entering={FadeIn.duration(300)}
              className="bg-[#EBF4FF] rounded-xl py-8 px-4 items-center border border-[#2563EB]/20"
            >
              <Animated.View
                entering={ZoomIn.duration(400).springify()}
                className="w-14 h-14 rounded-full bg-[#2563EB] items-center justify-center mb-3"
                style={{
                  shadowColor: "#2563EB",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                }}
              >
                <Ionicons name="sync-outline" size={26} color="#FFFFFF" />
              </Animated.View>
              <Text className="text-[#2563EB] text-base text-center font-semibold">
                Analyzing your vehicle...
              </Text>
              <Text className="text-[#64748B] text-xs text-center mt-1">
                AI is processing your diagnostic data
              </Text>
            </Animated.View>
          ) : !diagnosticResult ? (
            <View className="bg-[#F8F9FB] rounded-xl py-8 px-4 items-center border border-dashed border-[#CBD5E1]">
              <View className="w-14 h-14 rounded-full bg-[#E8EDF2] items-center justify-center mb-3">
                <Ionicons name="search-outline" size={26} color="#94A3B8" />
              </View>
              <Text className="text-[#64748B] text-sm text-center font-medium">
                Diagnostics will appear here
              </Text>
              <Text className="text-[#94A3B8] text-xs text-center mt-1">
                after scanning your vehicle
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {/* Summary - Animated Entry */}
              <Animated.View
                entering={FadeInDown.duration(400).springify()}
                className="bg-[#EBF4FF] rounded-xl p-4 border border-[#2563EB]/20"
              >
                <View className="flex-row items-center mb-2">
                  <View className="w-6 h-6 rounded-full bg-[#2563EB] items-center justify-center mr-2">
                    <Ionicons name="bulb" size={14} color="#FFFFFF" />
                  </View>
                  <Text className="text-[#1A365D] font-semibold text-base">
                    Summary
                  </Text>
                </View>
                <Text className="text-[#64748B] text-sm leading-5">
                  {diagnosticResult.summary}
                </Text>
              </Animated.View>

              {/* Diagnostic Paths - Staggered Animated Entry */}
              {diagnosticResult.paths.map((path: DiagnosticPath, index: number) => (
                <Animated.View
                  key={index}
                  entering={FadeInDown.delay(150 + index * 100).duration(400).springify()}
                  className="bg-[#F8F9FB] rounded-xl p-4 border border-[#E8EDF2]"
                  style={{
                    shadowColor: "#1A365D",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.04,
                    shadowRadius: 4,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center flex-1 mr-2">
                      <View className="w-7 h-7 rounded-lg bg-[#E8EDF2] items-center justify-center mr-2">
                        <Text className="text-[#1A365D] font-bold text-sm">{index + 1}</Text>
                      </View>
                      <Text className="text-[#1A365D] font-semibold text-base flex-1">
                        {path.title}
                      </Text>
                    </View>
                    <Animated.View
                      entering={ZoomIn.delay(300 + index * 100).duration(300)}
                      className={`px-2.5 py-1 rounded-full ${
                        path.severity === "critical"
                          ? "bg-red-100"
                          : path.severity === "high"
                          ? "bg-orange-100"
                          : path.severity === "medium"
                          ? "bg-yellow-100"
                          : "bg-green-100"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          path.severity === "critical"
                            ? "text-red-700"
                            : path.severity === "high"
                            ? "text-orange-700"
                            : path.severity === "medium"
                            ? "text-yellow-700"
                            : "text-green-700"
                        }`}
                      >
                        {path.confidence}%
                      </Text>
                    </Animated.View>
                  </View>
                  <Text className="text-[#64748B] text-sm mb-3 leading-5">
                    {path.description}
                  </Text>

                  {/* Common Causes */}
                  {path.commonCauses && path.commonCauses.length > 0 && (
                    <View className="mb-3">
                      <Text className="text-[#1A365D] font-medium text-sm mb-1.5">
                        Common Causes:
                      </Text>
                      {path.commonCauses.map((cause: string, i: number) => (
                        <View key={i} className="flex-row items-start ml-1 mb-0.5">
                          <View className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] mt-1.5 mr-2" />
                          <Text className="text-[#64748B] text-sm flex-1">{cause}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Steps */}
                  {path.steps && path.steps.length > 0 && (
                    <View className="mb-3">
                      <Text className="text-[#1A365D] font-medium text-sm mb-2">
                        Diagnostic Steps:
                      </Text>
                      {path.steps.map((step, i: number) => (
                        <Animated.View
                          key={i}
                          entering={SlideInRight.delay(400 + index * 100 + i * 50).duration(300).springify()}
                          className="bg-white rounded-xl p-3.5 mb-2 border border-[#E8EDF2]"
                          style={{
                            shadowColor: "#1A365D",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.03,
                            shadowRadius: 3,
                          }}
                        >
                          <View className="flex-row items-center mb-1.5">
                            <View className="w-5 h-5 rounded-full bg-[#2563EB] items-center justify-center mr-2">
                              <Text className="text-white font-bold text-xs">{step.step}</Text>
                            </View>
                            <Text className="text-[#1A365D] font-semibold text-sm flex-1">
                              {step.action}
                            </Text>
                          </View>
                          <Text className="text-[#64748B] text-sm leading-5 ml-7">
                            {step.details}
                          </Text>
                          {step.specs && (
                            <View className="flex-row items-center ml-7 mt-1.5">
                              <Ionicons name="speedometer-outline" size={12} color="#059669" />
                              <Text className="text-[#059669] text-xs ml-1 italic">
                                Spec: {step.specs}
                              </Text>
                            </View>
                          )}
                          {step.proTip && (
                            <View className="bg-[#FEF3C7] rounded-lg p-2.5 mt-2 ml-7 flex-row items-start">
                              <Ionicons name="sparkles" size={12} color="#D97706" />
                              <Text className="text-[#D97706] text-xs ml-1.5 flex-1">
                                {step.proTip}
                              </Text>
                            </View>
                          )}
                        </Animated.View>
                      ))}
                    </View>
                  )}

                  {/* Estimated Cost */}
                  {path.estimatedCost && (
                    <View className="flex-row items-center mt-2 bg-[#F1F5F9] rounded-lg px-3 py-2">
                      <Ionicons name="cash-outline" size={16} color="#64748B" />
                      <Text className="text-[#64748B] text-sm ml-2 font-medium">
                        Est. Cost: {path.estimatedCost}
                      </Text>
                    </View>
                  )}

                  {/* Safety Warning */}
                  {path.safetyWarning && (
                    <Animated.View
                      entering={FadeIn.delay(500 + index * 100).duration(300)}
                      className="bg-red-50 rounded-xl p-3.5 mt-3 flex-row items-start border border-red-100"
                    >
                      <View className="w-6 h-6 rounded-full bg-red-100 items-center justify-center mr-2.5">
                        <Ionicons name="warning" size={14} color="#DC2626" />
                      </View>
                      <Text className="text-red-700 text-sm ml-1 flex-1 leading-5">
                        {path.safetyWarning}
                      </Text>
                    </Animated.View>
                  )}
                </Animated.View>
              ))}

              {/* Quick Tips - Animated Entry */}
              {diagnosticResult.quickTips && diagnosticResult.quickTips.length > 0 && (
                <Animated.View
                  entering={FadeInDown.delay(300 + diagnosticResult.paths.length * 100).duration(400).springify()}
                  className="bg-[#ECFDF5] rounded-xl p-4 border border-[#059669]/20"
                >
                  <View className="flex-row items-center mb-2">
                    <View className="w-6 h-6 rounded-full bg-[#059669] items-center justify-center mr-2">
                      <Ionicons name="flash" size={14} color="#FFFFFF" />
                    </View>
                    <Text className="text-[#059669] font-semibold text-sm">
                      Quick Tips
                    </Text>
                  </View>
                  {diagnosticResult.quickTips.map((tip: string, i: number) => (
                    <View key={i} className="flex-row items-start ml-1 mb-1">
                      <View className="w-1.5 h-1.5 rounded-full bg-[#059669] mt-1.5 mr-2" />
                      <Text className="text-[#047857] text-sm flex-1 leading-5">{tip}</Text>
                    </View>
                  ))}
                </Animated.View>
              )}
            </View>
          )}
        </Animated.View>

        {/* What Fixed It Community Data */}
        {diagnosticResult && (() => {
          const extractedCodes = extractDTCCodes(issueDescription);
          const statsKey = generateStatsKey(
            [issueDescription],
            extractedCodes
          );
          const communityStats = getCachedStats(statsKey);

          return communityStats ? (
            <WhatFixedItCard
              stats={communityStats}
              onViewDetails={() => {
                Haptics.selectionAsync();
              }}
            />
          ) : (
            <NoDataYetCard onReportFix={handleReportFix} />
          );
        })()}

        {/* Follow-Up Chat - Only shows after diagnosis */}
        {diagnosticResult && (
          <FollowUpChat
            vehicle={{
              year: vehicle.year || "Unknown",
              make: vehicle.make || "Unknown",
              model: vehicle.model || "Unknown",
              engine: vehicle.engine || "Not specified",
              mileage: vehicle.mileage || "Not specified",
            }}
            issueDescription={issueDescription}
            diagnosticResult={diagnosticResult}
            messages={followUpMessages as ChatMessage[]}
            onMessagesUpdate={(messages) => setFollowUpMessages(messages)}
            onInputFocus={handleFollowUpInputFocus}
          />
        )}
      </ScrollView>

      {/* Repair Outcome Modal */}
      {currentDiagnosticId && (
        <RepairOutcomeModal
          visible={showRepairOutcomeModal}
          onClose={() => {
            setShowRepairOutcomeModal(false);
            setCurrentDiagnosticId(null);
          }}
          diagnosticId={currentDiagnosticId}
          vehicle={{
            year: vehicle.year || "Unknown",
            make: vehicle.make || "Unknown",
            model: vehicle.model || "Unknown",
            engine: vehicle.engine || "Not specified",
            mileage: vehicle.mileage || "Not specified",
          }}
          diagnosticData={{
            symptoms: [issueDescription],
            dtcCodes: extractDTCCodes(issueDescription),
            aiDiagnosisTitle: diagnosticResult?.summary || "Unknown",
            aiDiagnosisPath: diagnosticResult?.paths[0]?.title || "Unknown",
          }}
          suggestedFixes={
            diagnosticResult?.paths?.map((path, index) => ({
              id: `path-${index}`,
              title: path.title,
              description: path.description?.slice(0, 80) + (path.description?.length > 80 ? "..." : ""),
              estimatedCost: path.estimatedCost,
            })) || []
          }
        />
      )}

      {/* First-time User Onboarding */}
      <OnboardingModal
        visible={!hasSeenOnboarding}
        onComplete={() => setHasSeenOnboarding(true)}
      />
      </View>
    </KeyboardAvoidingView>
  );
}
