import React, { useState, useCallback } from "react";
import { View, Text, TextInput, Pressable, Keyboard } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  FadeIn,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useAutoSolveStore } from "../state/autoSolveStore";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AddSymptomModal() {
  const navigation = useNavigation();
  const addSymptom = useAutoSolveStore((s) => s.addSymptom);
  const [symptomText, setSymptomText] = useState("");

  const buttonScale = useSharedValue(1);

  const handleAddSymptom = useCallback(() => {
    if (symptomText.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      buttonScale.value = withSequence(
        withSpring(0.95, { damping: 10, stiffness: 400 }),
        withSpring(1, { damping: 10, stiffness: 400 })
      );

      addSymptom({
        id: Date.now().toString(),
        text: symptomText.trim(),
      });

      setTimeout(() => {
        navigation.goBack();
      }, 150);
    }
  }, [symptomText, addSymptom, navigation, buttonScale]);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const isDisabled = !symptomText.trim();

  return (
    <View className="flex-1 bg-white px-5 pt-2">
      <Animated.View entering={FadeIn.duration(300)}>
        <Text className="text-xl font-bold text-[#1A365D] mb-1">
          Add Symptom
        </Text>
        <Text className="text-sm text-[#64748B] mb-4">
          Describe what the vehicle is experiencing
        </Text>

        <TextInput
          className="bg-[#F8F9FB] rounded-xl px-4 py-4 text-[#1A365D] text-base border border-[#E8EDF2] mb-4"
          placeholder="e.g., Engine makes knocking sound when accelerating"
          placeholderTextColor="#94A3B8"
          value={symptomText}
          onChangeText={setSymptomText}
          autoFocus
          multiline
          numberOfLines={2}
          textAlignVertical="top"
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
          blurOnSubmit
        />

        <AnimatedPressable
          onPress={handleAddSymptom}
          disabled={isDisabled}
          style={buttonAnimatedStyle}
          className={`rounded-xl py-4 items-center justify-center flex-row ${
            isDisabled ? "bg-[#E8EDF2]" : "bg-[#2563EB]"
          }`}
        >
          <Ionicons
            name="add-circle-outline"
            size={20}
            color={isDisabled ? "#94A3B8" : "#FFFFFF"}
            style={{ marginRight: 8 }}
          />
          <Text
            className={`font-semibold text-base ${
              isDisabled ? "text-[#94A3B8]" : "text-white"
            }`}
          >
            Add Symptom
          </Text>
        </AnimatedPressable>
      </Animated.View>
    </View>
  );
}
