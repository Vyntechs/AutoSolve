import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useSubscriptionStore } from "../state/subscriptionStore";
import { RootStackParamList } from "../navigation/RootNavigator";

interface ToolCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  delay: number;
  onPress: () => void;
}

function ToolCard({ icon, title, description, color, bgColor, delay, onPress }: ToolCardProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(400).springify()}
      style={animatedStyle}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
        style={{
          shadowColor: "#1A365D",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View
          className="w-12 h-12 rounded-xl items-center justify-center mr-4"
          style={{ backgroundColor: bgColor }}
        >
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View className="flex-1">
          <Text className="text-[#1A365D] font-semibold text-base">{title}</Text>
          <Text className="text-[#64748B] text-sm mt-0.5">{description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
      </Pressable>
    </Animated.View>
  );
}

export function ToolsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const tier = useSubscriptionStore((s) => s.tier);

  const tools = [
    {
      icon: "barcode-outline" as const,
      title: "VIN Decoder",
      description: "Decode vehicle information from VIN",
      color: "#2563EB",
      bgColor: "#EBF4FF",
      screen: "VINDecoder" as const,
    },
    {
      icon: "code-working-outline" as const,
      title: "OBD-II Codes",
      description: "Reference guide for diagnostic codes",
      color: "#D97706",
      bgColor: "#FEF3C7",
      screen: "OBDCodes" as const,
    },
    {
      icon: "calculator-outline" as const,
      title: "Unit Converter",
      description: "Convert measurements and values",
      color: "#059669",
      bgColor: "#ECFDF5",
      screen: "UnitConverter" as const,
    },
  ];

  const handleToolPress = (screen: keyof RootStackParamList | null) => {
    // Check if user has premium access
    if (tier === "free") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      navigation.navigate("Paywall");
      return;
    }

    if (screen) {
      navigation.navigate(screen);
    }
  };

  return (
    <View className="flex-1 bg-[#F8F9FB]">
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="px-5 pb-4 bg-white border-b border-[#E8EDF2]"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-[#1A365D] tracking-tight">
              Tools
            </Text>
            <Text className="text-sm text-[#64748B] mt-0.5">
              Diagnostic utilities
            </Text>
          </View>
          {tier === "free" && (
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                navigation.navigate("Paywall");
              }}
              className="bg-[#2563EB] px-3 py-1.5 rounded-full"
            >
              <Text className="text-white text-xs font-semibold">Premium</Text>
            </Pressable>
          )}
        </View>
        {tier === "free" && (
          <View className="mt-3 bg-[#FEF3C7] rounded-lg p-3 flex-row items-center">
            <Ionicons name="lock-closed" size={16} color="#D97706" />
            <Text className="text-[#D97706] text-xs ml-2 flex-1">
              Tools require Premium subscription
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {tools.map((tool, index) => (
          <ToolCard
            key={tool.title}
            icon={tool.icon}
            title={tool.title}
            description={tool.description}
            color={tool.color}
            bgColor={tool.bgColor}
            delay={index * 50}
            onPress={() => handleToolPress(tool.screen)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
