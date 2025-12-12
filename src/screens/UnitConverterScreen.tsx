import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";

type ConversionCategory = "length" | "pressure" | "torque" | "temperature" | "volume" | "weight";

interface ConversionUnit {
  name: string;
  abbr: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
}

const CONVERSIONS: Record<ConversionCategory, { name: string; icon: keyof typeof Ionicons.glyphMap; units: ConversionUnit[] }> = {
  length: {
    name: "Length",
    icon: "resize-outline",
    units: [
      { name: "Inches", abbr: "in", toBase: (v) => v * 25.4, fromBase: (v) => v / 25.4 },
      { name: "Feet", abbr: "ft", toBase: (v) => v * 304.8, fromBase: (v) => v / 304.8 },
      { name: "Millimeters", abbr: "mm", toBase: (v) => v, fromBase: (v) => v },
      { name: "Centimeters", abbr: "cm", toBase: (v) => v * 10, fromBase: (v) => v / 10 },
      { name: "Meters", abbr: "m", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    ],
  },
  pressure: {
    name: "Pressure",
    icon: "speedometer-outline",
    units: [
      { name: "PSI", abbr: "psi", toBase: (v) => v * 6894.76, fromBase: (v) => v / 6894.76 },
      { name: "Bar", abbr: "bar", toBase: (v) => v * 100000, fromBase: (v) => v / 100000 },
      { name: "kPa", abbr: "kPa", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { name: "inHg", abbr: "inHg", toBase: (v) => v * 3386.39, fromBase: (v) => v / 3386.39 },
      { name: "Pascal", abbr: "Pa", toBase: (v) => v, fromBase: (v) => v },
    ],
  },
  torque: {
    name: "Torque",
    icon: "sync-outline",
    units: [
      { name: "Foot-Pounds", abbr: "ft-lb", toBase: (v) => v * 1.35582, fromBase: (v) => v / 1.35582 },
      { name: "Newton-Meters", abbr: "Nm", toBase: (v) => v, fromBase: (v) => v },
      { name: "Inch-Pounds", abbr: "in-lb", toBase: (v) => v * 0.112985, fromBase: (v) => v / 0.112985 },
      { name: "Kilogram-Meters", abbr: "kg-m", toBase: (v) => v * 9.80665, fromBase: (v) => v / 9.80665 },
    ],
  },
  temperature: {
    name: "Temperature",
    icon: "thermometer-outline",
    units: [
      { name: "Fahrenheit", abbr: "°F", toBase: (v) => (v - 32) * 5/9, fromBase: (v) => v * 9/5 + 32 },
      { name: "Celsius", abbr: "°C", toBase: (v) => v, fromBase: (v) => v },
      { name: "Kelvin", abbr: "K", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    ],
  },
  volume: {
    name: "Volume",
    icon: "beaker-outline",
    units: [
      { name: "Gallons (US)", abbr: "gal", toBase: (v) => v * 3785.41, fromBase: (v) => v / 3785.41 },
      { name: "Quarts", abbr: "qt", toBase: (v) => v * 946.353, fromBase: (v) => v / 946.353 },
      { name: "Liters", abbr: "L", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { name: "Milliliters", abbr: "mL", toBase: (v) => v, fromBase: (v) => v },
      { name: "Fluid Ounces", abbr: "fl oz", toBase: (v) => v * 29.5735, fromBase: (v) => v / 29.5735 },
    ],
  },
  weight: {
    name: "Weight",
    icon: "scale-outline",
    units: [
      { name: "Pounds", abbr: "lb", toBase: (v) => v * 453.592, fromBase: (v) => v / 453.592 },
      { name: "Ounces", abbr: "oz", toBase: (v) => v * 28.3495, fromBase: (v) => v / 28.3495 },
      { name: "Kilograms", abbr: "kg", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { name: "Grams", abbr: "g", toBase: (v) => v, fromBase: (v) => v },
    ],
  },
};

export function UnitConverterScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [category, setCategory] = useState<ConversionCategory>("torque");
  const [fromUnit, setFromUnit] = useState(0);
  const [toUnit, setToUnit] = useState(1);
  const [inputValue, setInputValue] = useState("");

  const currentConversion = CONVERSIONS[category];
  const units = currentConversion.units;

  const convertedValue = useMemo(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) return "";

    const baseValue = units[fromUnit].toBase(num);
    const result = units[toUnit].fromBase(baseValue);

    // Format to reasonable precision
    if (Math.abs(result) < 0.01 || Math.abs(result) >= 10000) {
      return result.toExponential(4);
    }
    return result.toFixed(4).replace(/\.?0+$/, "");
  }, [inputValue, fromUnit, toUnit, units]);

  const handleSwapUnits = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
    if (convertedValue) {
      setInputValue(convertedValue);
    }
  }, [fromUnit, toUnit, convertedValue]);

  const handleCategoryChange = useCallback((newCategory: ConversionCategory) => {
    Haptics.selectionAsync();
    setCategory(newCategory);
    setFromUnit(0);
    setToUnit(1);
    setInputValue("");
  }, []);

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
            <Text className="text-xl font-bold text-[#1A365D]">Unit Converter</Text>
            <Text className="text-sm text-[#64748B]">
              Automotive measurements
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
        {/* Category Selector */}
        <Animated.View
          entering={FadeInDown.duration(400).springify()}
          className="mb-4"
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {(Object.keys(CONVERSIONS) as ConversionCategory[]).map((cat) => {
              const conv = CONVERSIONS[cat];
              const isActive = category === cat;
              return (
                <CategoryButton
                  key={cat}
                  name={conv.name}
                  icon={conv.icon}
                  isActive={isActive}
                  onPress={() => handleCategoryChange(cat)}
                />
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Converter Card */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400).springify()}
          className="bg-white rounded-2xl p-5 mb-4"
          style={{
            shadowColor: "#1A365D",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          {/* From Section */}
          <View className="mb-4">
            <Text className="text-xs font-medium text-[#64748B] mb-2 uppercase tracking-wide">
              From
            </Text>
            <View className="flex-row gap-3">
              <TextInput
                className="flex-1 bg-[#F8F9FB] rounded-xl px-4 py-4 text-[#1A365D] text-xl font-semibold border border-[#E8EDF2]"
                placeholder="0"
                placeholderTextColor="#94A3B8"
                value={inputValue}
                onChangeText={setInputValue}
                keyboardType="decimal-pad"
              />
              <UnitSelector
                units={units}
                selectedIndex={fromUnit}
                onSelect={setFromUnit}
              />
            </View>
          </View>

          {/* Swap Button */}
          <View className="items-center my-2">
            <Pressable
              onPress={handleSwapUnits}
              className="w-10 h-10 rounded-full bg-[#EBF4FF] items-center justify-center"
            >
              <Ionicons name="swap-vertical" size={20} color="#2563EB" />
            </Pressable>
          </View>

          {/* To Section */}
          <View>
            <Text className="text-xs font-medium text-[#64748B] mb-2 uppercase tracking-wide">
              To
            </Text>
            <View className="flex-row gap-3">
              <View className="flex-1 bg-[#ECFDF5] rounded-xl px-4 py-4 border border-[#A7F3D0]">
                <Text className={`text-xl font-semibold ${convertedValue ? "text-[#059669]" : "text-[#94A3B8]"}`}>
                  {convertedValue || "0"}
                </Text>
              </View>
              <UnitSelector
                units={units}
                selectedIndex={toUnit}
                onSelect={setToUnit}
              />
            </View>
          </View>
        </Animated.View>

        {/* Quick Reference Card */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400).springify()}
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
            <View className="w-8 h-8 rounded-lg bg-[#FEF3C7] items-center justify-center mr-3">
              <Ionicons name="bookmark-outline" size={18} color="#D97706" />
            </View>
            <Text className="text-lg font-semibold text-[#1A365D]">
              Quick Reference
            </Text>
          </View>

          <View className="gap-2">
            {category === "torque" && (
              <>
                <QuickRefRow left="1 ft-lb" right="1.356 Nm" />
                <QuickRefRow left="1 Nm" right="0.738 ft-lb" />
                <QuickRefRow left="12 in-lb" right="1 ft-lb" />
              </>
            )}
            {category === "pressure" && (
              <>
                <QuickRefRow left="1 psi" right="6.895 kPa" />
                <QuickRefRow left="14.7 psi" right="1 atm" />
                <QuickRefRow left="1 bar" right="14.5 psi" />
              </>
            )}
            {category === "temperature" && (
              <>
                <QuickRefRow left="32°F" right="0°C" />
                <QuickRefRow left="212°F" right="100°C" />
                <QuickRefRow left="195°F" right="90.5°C (Thermostat)" />
              </>
            )}
            {category === "volume" && (
              <>
                <QuickRefRow left="1 gal" right="3.785 L" />
                <QuickRefRow left="1 qt" right="0.946 L" />
                <QuickRefRow left="1 L" right="33.8 fl oz" />
              </>
            )}
            {category === "length" && (
              <>
                <QuickRefRow left="1 inch" right="25.4 mm" />
                <QuickRefRow left="1 foot" right="304.8 mm" />
                <QuickRefRow left="1 meter" right="39.37 in" />
              </>
            )}
            {category === "weight" && (
              <>
                <QuickRefRow left="1 lb" right="453.6 g" />
                <QuickRefRow left="1 kg" right="2.205 lb" />
                <QuickRefRow left="1 oz" right="28.35 g" />
              </>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

interface CategoryButtonProps {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  isActive: boolean;
  onPress: () => void;
}

function CategoryButton({ name, icon, isActive, onPress }: CategoryButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        className={`px-4 py-3 rounded-xl flex-row items-center ${
          isActive ? "bg-[#2563EB]" : "bg-white border border-[#E8EDF2]"
        }`}
      >
        <Ionicons
          name={icon}
          size={18}
          color={isActive ? "#FFFFFF" : "#64748B"}
          style={{ marginRight: 8 }}
        />
        <Text className={`font-medium text-sm ${isActive ? "text-white" : "text-[#1A365D]"}`}>
          {name}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

interface UnitSelectorProps {
  units: ConversionUnit[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

function UnitSelector({ units, selectedIndex, onSelect }: UnitSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View className="relative">
      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          setIsOpen(!isOpen);
        }}
        className="bg-[#EBF4FF] rounded-xl px-4 py-4 flex-row items-center min-w-[100px]"
      >
        <Text className="text-[#2563EB] font-semibold text-base flex-1">
          {units[selectedIndex].abbr}
        </Text>
        <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={16} color="#2563EB" />
      </Pressable>

      {isOpen && (
        <View
          className="absolute top-14 right-0 bg-white rounded-xl border border-[#E8EDF2] z-50 min-w-[140px]"
          style={{
            shadowColor: "#1A365D",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          {units.map((unit, index) => (
            <Pressable
              key={unit.abbr}
              onPress={() => {
                Haptics.selectionAsync();
                onSelect(index);
                setIsOpen(false);
              }}
              className={`px-4 py-3 ${index !== units.length - 1 ? "border-b border-[#F1F5F9]" : ""} ${
                index === selectedIndex ? "bg-[#EBF4FF]" : ""
              }`}
            >
              <Text className={`text-sm ${index === selectedIndex ? "text-[#2563EB] font-semibold" : "text-[#1A365D]"}`}>
                {unit.name}
              </Text>
              <Text className="text-xs text-[#94A3B8]">{unit.abbr}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

interface QuickRefRowProps {
  left: string;
  right: string;
}

function QuickRefRow({ left, right }: QuickRefRowProps) {
  return (
    <View className="flex-row items-center py-2 border-b border-[#F1F5F9]">
      <Text className="text-[#1A365D] text-sm font-medium flex-1">{left}</Text>
      <Ionicons name="arrow-forward" size={14} color="#94A3B8" style={{ marginHorizontal: 12 }} />
      <Text className="text-[#059669] text-sm font-medium flex-1 text-right">{right}</Text>
    </View>
  );
}
