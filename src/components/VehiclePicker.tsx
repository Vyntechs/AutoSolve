import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";

interface VehiclePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  options: string[];
  title: string;
  selectedValue?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function VehiclePicker({
  visible,
  onClose,
  onSelect,
  options,
  title,
  selectedValue,
}: VehiclePickerProps) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter((option) => option.toLowerCase().includes(query));
  }, [options, searchQuery]);

  const handleSelect = (value: string) => {
    Haptics.selectionAsync();
    onSelect(value);
    setSearchQuery("");
    onClose();
  };

  const handleClose = () => {
    Haptics.selectionAsync();
    setSearchQuery("");
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable
        className="flex-1 bg-black/50"
        onPress={handleClose}
      >
        <AnimatedPressable
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          onPress={(e) => e.stopPropagation()}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl"
          style={{
            maxHeight: "80%",
            paddingBottom: insets.bottom + 20,
          }}
        >
          {/* Header */}
          <View className="px-5 pt-4 pb-3 border-b border-[#E8EDF2]">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-xl font-bold text-[#1A365D]">{title}</Text>
              <Pressable
                onPress={handleClose}
                className="w-8 h-8 rounded-full bg-[#E8EDF2] items-center justify-center"
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </Pressable>
            </View>

            {/* Search bar */}
            {options.length > 10 && (
              <View className="flex-row items-center bg-[#F8F9FB] rounded-xl px-4 py-3">
                <Ionicons
                  name="search-outline"
                  size={18}
                  color="#94A3B8"
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={`Search ${title.toLowerCase()}...`}
                  placeholderTextColor="#94A3B8"
                  className="flex-1 text-[#1A365D] text-base"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </Pressable>
                )}
              </View>
            )}
          </View>

          {/* Options List */}
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {filteredOptions.length === 0 ? (
              <View className="py-12 items-center">
                <Ionicons name="search-outline" size={48} color="#E8EDF2" />
                <Text className="text-[#94A3B8] mt-4">No results found</Text>
              </View>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = option === selectedValue;
                return (
                  <Pressable
                    key={option}
                    onPress={() => handleSelect(option)}
                    className={`px-5 py-4 flex-row items-center justify-between ${
                      index !== filteredOptions.length - 1
                        ? "border-b border-[#F8F9FB]"
                        : ""
                    }`}
                    style={({ pressed }) => ({
                      backgroundColor: pressed ? "#F8F9FB" : "white",
                    })}
                  >
                    <Text
                      className={`text-base ${
                        isSelected
                          ? "text-[#2563EB] font-semibold"
                          : "text-[#1A365D]"
                      }`}
                    >
                      {option}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={22} color="#2563EB" />
                    )}
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </AnimatedPressable>
      </Pressable>
    </Modal>
  );
}
