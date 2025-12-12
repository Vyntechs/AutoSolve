import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Keyboard,
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
import { getOpenAITextResponse } from "../api/chat-service";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface DTCResult {
  code: string;
  description: string;
  system: string;
  severity: "critical" | "high" | "medium" | "low";
  possibleCauses: string[];
  symptoms: string[];
  diagnosticSteps: string[];
  commonFixes: string[];
}

const COMMON_CODES = [
  { code: "P0300", desc: "Random/Multiple Cylinder Misfire" },
  { code: "P0171", desc: "System Too Lean (Bank 1)" },
  { code: "P0420", desc: "Catalyst System Efficiency Below Threshold" },
  { code: "P0442", desc: "EVAP System Leak Detected (Small)" },
  { code: "P0455", desc: "EVAP System Leak Detected (Large)" },
  { code: "P0128", desc: "Coolant Thermostat Below Temp" },
  { code: "P0401", desc: "EGR Flow Insufficient" },
  { code: "P0440", desc: "EVAP System Malfunction" },
];

export function OBDCodesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [code, setCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<DTCResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const buttonScale = useSharedValue(1);

  const handleSearch = useCallback(async (searchCode?: string) => {
    const codeToSearch = searchCode || code;
    if (!codeToSearch.trim()) {
      setError("Please enter a DTC code");
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    buttonScale.value = withSequence(
      withSpring(0.95, { damping: 10, stiffness: 400 }),
      withSpring(1, { damping: 10, stiffness: 400 })
    );

    Keyboard.dismiss();
    setIsSearching(true);
    setError(null);
    setResult(null);

    try {
      const response = await getOpenAITextResponse(
        [
          {
            role: "system",
            content: `You are an automotive diagnostic expert. Explain the given OBD-II DTC code and return ONLY valid JSON with this exact structure:
{
  "code": "the code",
  "description": "full description of what this code means",
  "system": "affected system (Engine, Transmission, Emissions, etc.)",
  "severity": "critical/high/medium/low",
  "possibleCauses": ["cause 1", "cause 2", "cause 3"],
  "symptoms": ["symptom 1", "symptom 2"],
  "diagnosticSteps": ["step 1", "step 2", "step 3"],
  "commonFixes": ["fix 1", "fix 2"]
}
Be thorough and practical. Focus on the most likely causes first.`,
          },
          {
            role: "user",
            content: `Explain OBD-II code: ${codeToSearch.toUpperCase()}`,
          },
        ],
        { temperature: 0.2, maxTokens: 1024 }
      );

      let decoded: DTCResult;
      try {
        let content = response.content.trim();
        if (content.startsWith("```json")) {
          content = content.slice(7);
        } else if (content.startsWith("```")) {
          content = content.slice(3);
        }
        if (content.endsWith("```")) {
          content = content.slice(0, -3);
        }
        decoded = JSON.parse(content.trim());
      } catch {
        setError("Could not parse code information. Please try again.");
        return;
      }

      setResult(decoded);
      setCode(codeToSearch.toUpperCase());
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error("DTC lookup error:", err);
      setError("Failed to lookup code. Please try again.");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSearching(false);
    }
  }, [code, buttonScale]);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const severityColors = {
    critical: { bg: "#FEE2E2", text: "#DC2626", label: "Critical" },
    high: { bg: "#FEF3C7", text: "#D97706", label: "High" },
    medium: { bg: "#E0E7FF", text: "#4F46E5", label: "Medium" },
    low: { bg: "#ECFDF5", text: "#059669", label: "Low" },
  };

  return (
    <View className="flex-1 bg-[#F8F9FB]">
      {/* Header */}
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="px-5 pb-4 bg-white border-b border-[#E8EDF2]"
      >
        <View className="flex-row items-center">
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              navigation.goBack();
            }}
            className="w-10 h-10 rounded-full bg-[#F8F9FB] items-center justify-center mr-3"
          >
            <Ionicons name="arrow-back" size={20} color="#1A365D" />
          </Pressable>
          <View>
            <Text className="text-xl font-bold text-[#1A365D]">OBD-II Codes</Text>
            <Text className="text-sm text-[#64748B]">
              Diagnostic code reference
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Card */}
        <Animated.View
          entering={FadeInDown.duration(400).springify()}
          className="bg-white rounded-2xl p-5 mb-4"
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
              <Ionicons name="code-working-outline" size={18} color="#D97706" />
            </View>
            <Text className="text-lg font-semibold text-[#1A365D]">
              Search Code
            </Text>
          </View>

          <TextInput
            className="bg-[#F8F9FB] rounded-xl px-4 py-4 text-[#1A365D] text-base border border-[#E8EDF2] font-mono tracking-wider"
            placeholder="Enter code (e.g., P0300)"
            placeholderTextColor="#94A3B8"
            value={code}
            onChangeText={(text) => setCode(text.toUpperCase())}
            autoCapitalize="characters"
            autoCorrect={false}
          />

          <AnimatedPressable
            onPress={() => handleSearch()}
            disabled={isSearching}
            style={buttonAnimatedStyle}
            className={`rounded-xl py-4 items-center justify-center flex-row mt-4 ${
              isSearching ? "bg-[#FCD34D]" : "bg-[#D97706]"
            }`}
          >
            {isSearching ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text className="text-white font-semibold text-base">Searching...</Text>
              </>
            ) : (
              <>
                <Ionicons name="search-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text className="text-white font-semibold text-base">Lookup Code</Text>
              </>
            )}
          </AnimatedPressable>

          {error && (
            <Animated.View entering={FadeIn.duration(200)} className="mt-3">
              <Text className="text-[#DC2626] text-sm text-center">{error}</Text>
            </Animated.View>
          )}
        </Animated.View>

        {/* Results Card */}
        {result && (
          <Animated.View
            entering={FadeInDown.duration(400).springify()}
            className="bg-white rounded-2xl p-5 mb-4"
            style={{
              shadowColor: "#1A365D",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            {/* Code Header */}
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-[#2563EB] text-2xl font-bold font-mono">
                  {result.code}
                </Text>
                <Text className="text-[#64748B] text-sm">{result.system}</Text>
              </View>
              <View
                className="rounded-full px-3 py-1"
                style={{ backgroundColor: severityColors[result.severity].bg }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: severityColors[result.severity].text }}
                >
                  {severityColors[result.severity].label}
                </Text>
              </View>
            </View>

            {/* Description */}
            <View className="bg-[#F8F9FB] rounded-xl p-4 mb-4">
              <Text className="text-[#1A365D] text-sm leading-5">{result.description}</Text>
            </View>

            {/* Possible Causes */}
            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="help-circle-outline" size={16} color="#D97706" style={{ marginRight: 6 }} />
                <Text className="text-[#1A365D] font-semibold text-sm">Possible Causes</Text>
              </View>
              {result.possibleCauses.map((cause, index) => (
                <View key={index} className="flex-row items-start mb-1.5 pl-1">
                  <Text className="text-[#64748B] text-sm mr-2">{index + 1}.</Text>
                  <Text className="text-[#1A365D] text-sm flex-1">{cause}</Text>
                </View>
              ))}
            </View>

            {/* Symptoms */}
            {result.symptoms && result.symptoms.length > 0 && (
              <View className="mb-4">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="warning-outline" size={16} color="#DC2626" style={{ marginRight: 6 }} />
                  <Text className="text-[#1A365D] font-semibold text-sm">Common Symptoms</Text>
                </View>
                {result.symptoms.map((symptom, index) => (
                  <View key={index} className="flex-row items-start mb-1.5 pl-1">
                    <Text className="text-[#94A3B8] mr-2">•</Text>
                    <Text className="text-[#1A365D] text-sm flex-1">{symptom}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Diagnostic Steps */}
            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="list-outline" size={16} color="#2563EB" style={{ marginRight: 6 }} />
                <Text className="text-[#1A365D] font-semibold text-sm">Diagnostic Steps</Text>
              </View>
              {result.diagnosticSteps.map((step, index) => (
                <View key={index} className="flex-row items-start mb-2 pl-1">
                  <View className="w-5 h-5 rounded-full bg-[#EBF4FF] items-center justify-center mr-2 mt-0.5">
                    <Text className="text-[#2563EB] text-xs font-semibold">{index + 1}</Text>
                  </View>
                  <Text className="text-[#1A365D] text-sm flex-1">{step}</Text>
                </View>
              ))}
            </View>

            {/* Common Fixes */}
            <View className="bg-[#ECFDF5] rounded-xl p-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="checkmark-circle-outline" size={16} color="#059669" style={{ marginRight: 6 }} />
                <Text className="text-[#059669] font-semibold text-sm">Common Fixes</Text>
              </View>
              {result.commonFixes.map((fix, index) => (
                <View key={index} className="flex-row items-start mb-1.5">
                  <Text className="text-[#059669] mr-2">•</Text>
                  <Text className="text-[#065F46] text-sm flex-1">{fix}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Common Codes */}
        {!result && (
          <Animated.View
            entering={FadeInDown.delay(100).duration(400).springify()}
            className="bg-white rounded-2xl p-5"
            style={{
              shadowColor: "#1A365D",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 rounded-lg bg-[#E0E7FF] items-center justify-center mr-3">
                <Ionicons name="star-outline" size={18} color="#4F46E5" />
              </View>
              <Text className="text-lg font-semibold text-[#1A365D]">
                Common Codes
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-2">
              {COMMON_CODES.map((item) => (
                <Pressable
                  key={item.code}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setCode(item.code);
                    handleSearch(item.code);
                  }}
                  className="bg-[#F8F9FB] rounded-lg px-3 py-2 border border-[#E8EDF2]"
                >
                  <Text className="text-[#2563EB] font-mono font-semibold text-sm">{item.code}</Text>
                  <Text className="text-[#64748B] text-xs mt-0.5" numberOfLines={1}>{item.desc}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}
