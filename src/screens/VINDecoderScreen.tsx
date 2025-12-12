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

interface VINDecodeResult {
  year: string;
  make: string;
  model: string;
  trim: string;
  engine: string;
  transmission: string;
  drivetrain: string;
  bodyStyle: string;
  fuelType: string;
  manufacturingPlant: string;
  country: string;
  doors: string;
  rawResponse?: string;
}

export function VINDecoderScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [vin, setVin] = useState("");
  const [isDecoding, setIsDecoding] = useState(false);
  const [result, setResult] = useState<VINDecodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const buttonScale = useSharedValue(1);

  const handleDecode = useCallback(async () => {
    if (vin.length !== 17) {
      setError("VIN must be exactly 17 characters");
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    buttonScale.value = withSequence(
      withSpring(0.95, { damping: 10, stiffness: 400 }),
      withSpring(1, { damping: 10, stiffness: 400 })
    );

    Keyboard.dismiss();
    setIsDecoding(true);
    setError(null);
    setResult(null);

    try {
      const response = await getOpenAITextResponse(
        [
          {
            role: "system",
            content: `You are a VIN decoder expert. Decode the given VIN and return ONLY valid JSON with this exact structure:
{
  "year": "model year",
  "make": "manufacturer",
  "model": "model name",
  "trim": "trim level or N/A",
  "engine": "engine description",
  "transmission": "transmission type",
  "drivetrain": "FWD/RWD/AWD/4WD",
  "bodyStyle": "body style",
  "fuelType": "fuel type",
  "manufacturingPlant": "plant location",
  "country": "country of origin",
  "doors": "number of doors"
}
Be accurate based on VIN decoding standards. If you cannot determine a field, use "Unknown".`,
          },
          {
            role: "user",
            content: `Decode this VIN: ${vin.toUpperCase()}`,
          },
        ],
        { temperature: 0.1, maxTokens: 512 }
      );

      // Parse the JSON response
      let decoded: VINDecodeResult;
      try {
        let content = response.content.trim();
        // Remove markdown code blocks if present
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
        decoded = {
          year: "Unknown",
          make: "Unknown",
          model: "Unknown",
          trim: "Unknown",
          engine: "Unknown",
          transmission: "Unknown",
          drivetrain: "Unknown",
          bodyStyle: "Unknown",
          fuelType: "Unknown",
          manufacturingPlant: "Unknown",
          country: "Unknown",
          doors: "Unknown",
          rawResponse: response.content,
        };
      }

      setResult(decoded);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error("VIN decode error:", err);
      setError("Failed to decode VIN. Please try again.");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsDecoding(false);
    }
  }, [vin, buttonScale]);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const isValidLength = vin.length === 17;

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
            <Text className="text-xl font-bold text-[#1A365D]">VIN Decoder</Text>
            <Text className="text-sm text-[#64748B]">
              Decode vehicle information
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
        {/* Input Card */}
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
            <View className="w-8 h-8 rounded-lg bg-[#EBF4FF] items-center justify-center mr-3">
              <Ionicons name="barcode-outline" size={18} color="#2563EB" />
            </View>
            <Text className="text-lg font-semibold text-[#1A365D]">
              Enter VIN
            </Text>
          </View>

          <TextInput
            className="bg-[#F8F9FB] rounded-xl px-4 py-4 text-[#1A365D] text-base border border-[#E8EDF2] font-mono tracking-wider"
            placeholder="17-character VIN"
            placeholderTextColor="#94A3B8"
            value={vin}
            onChangeText={(text) => setVin(text.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, ""))}
            maxLength={17}
            autoCapitalize="characters"
            autoCorrect={false}
          />

          <View className="flex-row items-center justify-between mt-2 mb-4">
            <Text className="text-xs text-[#94A3B8]">
              {vin.length}/17 characters
            </Text>
            {isValidLength && (
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={14} color="#059669" />
                <Text className="text-xs text-[#059669] ml-1">Valid length</Text>
              </View>
            )}
          </View>

          <AnimatedPressable
            onPress={handleDecode}
            disabled={isDecoding || !isValidLength}
            style={buttonAnimatedStyle}
            className={`rounded-xl py-4 items-center justify-center flex-row ${
              isDecoding || !isValidLength ? "bg-[#93C5FD]" : "bg-[#2563EB]"
            }`}
          >
            {isDecoding ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text className="text-white font-semibold text-base">Decoding...</Text>
              </>
            ) : (
              <>
                <Ionicons name="search-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text className="text-white font-semibold text-base">Decode VIN</Text>
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
              <View className="w-8 h-8 rounded-lg bg-[#ECFDF5] items-center justify-center mr-3">
                <Ionicons name="car-sport-outline" size={18} color="#059669" />
              </View>
              <Text className="text-lg font-semibold text-[#1A365D]">
                Vehicle Information
              </Text>
            </View>

            {/* Main Info */}
            <View className="bg-[#EBF4FF] rounded-xl p-4 mb-4">
              <Text className="text-[#2563EB] text-2xl font-bold">
                {result.year} {result.make}
              </Text>
              <Text className="text-[#1A365D] text-lg font-medium">
                {result.model} {result.trim !== "N/A" && result.trim !== "Unknown" ? result.trim : ""}
              </Text>
            </View>

            {/* Details Grid */}
            <View className="gap-3">
              <InfoRow icon="speedometer-outline" label="Engine" value={result.engine} />
              <InfoRow icon="cog-outline" label="Transmission" value={result.transmission} />
              <InfoRow icon="git-branch-outline" label="Drivetrain" value={result.drivetrain} />
              <InfoRow icon="car-outline" label="Body Style" value={result.bodyStyle} />
              <InfoRow icon="flash-outline" label="Fuel Type" value={result.fuelType} />
              <InfoRow icon="location-outline" label="Made In" value={result.country} />
              <InfoRow icon="business-outline" label="Plant" value={result.manufacturingPlant} />
              <InfoRow icon="albums-outline" label="Doors" value={result.doors} />
            </View>
          </Animated.View>
        )}

        {/* Info Card */}
        {!result && (
          <Animated.View
            entering={FadeInDown.delay(100).duration(400).springify()}
            className="bg-[#FEF3C7] rounded-xl p-4"
          >
            <View className="flex-row items-start">
              <Ionicons name="information-circle-outline" size={20} color="#D97706" style={{ marginRight: 8, marginTop: 2 }} />
              <View className="flex-1">
                <Text className="text-[#92400E] font-semibold text-sm mb-1">Where to find the VIN?</Text>
                <Text className="text-[#92400E] text-xs leading-5">
                  • Driver side dashboard (visible through windshield){"\n"}
                  • Driver side door jamb sticker{"\n"}
                  • Vehicle registration or insurance card{"\n"}
                  • Vehicle title document
                </Text>
              </View>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  if (value === "Unknown" || !value) return null;

  return (
    <View className="flex-row items-center py-2 border-b border-[#F1F5F9]">
      <Ionicons name={icon} size={16} color="#64748B" style={{ marginRight: 12 }} />
      <Text className="text-[#64748B] text-sm w-24">{label}</Text>
      <Text className="text-[#1A365D] text-sm font-medium flex-1">{value}</Text>
    </View>
  );
}
