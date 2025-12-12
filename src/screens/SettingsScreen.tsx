import React from "react";
import { View, Text, Pressable, ScrollView, Switch, Linking, Alert } from "react-native";
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
import { useSettingsStore } from "../state/settingsStore";
import { RootStackParamList } from "../navigation/RootNavigator";

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  color: string;
  bgColor: string;
  hasToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
}

function SettingsRow({
  icon,
  title,
  subtitle,
  color,
  bgColor,
  hasToggle,
  toggleValue,
  onToggle,
  onPress,
}: SettingsRowProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (!hasToggle) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    if (!hasToggle) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress?.();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        className="flex-row items-center py-3"
        disabled={hasToggle}
      >
        <View
          className="w-9 h-9 rounded-lg items-center justify-center mr-3"
          style={{ backgroundColor: bgColor }}
        >
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <View className="flex-1">
          <Text className="text-[#1A365D] font-medium text-base">{title}</Text>
          {subtitle && (
            <Text className="text-[#94A3B8] text-xs mt-0.5">{subtitle}</Text>
          )}
        </View>
        {hasToggle ? (
          <Switch
            value={toggleValue}
            onValueChange={(value) => {
              Haptics.selectionAsync();
              onToggle?.(value);
            }}
            trackColor={{ false: "#E8EDF2", true: "#93C5FD" }}
            thumbColor={toggleValue ? "#2563EB" : "#FFFFFF"}
          />
        ) : (
          <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
        )}
      </Pressable>
    </Animated.View>
  );
}

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const notifications = useSettingsStore((s) => s.notifications);
  const setNotifications = useSettingsStore((s) => s.setNotifications);
  const hapticFeedback = useSettingsStore((s) => s.hapticFeedback);
  const setHapticFeedback = useSettingsStore((s) => s.setHapticFeedback);
  const defaultVehicle = useSettingsStore((s) => s.defaultVehicle);

  const handleContactUs = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL("mailto:support@Vyntechs.com?subject=AutoSolve Support Request");
  };

  const handlePrivacyPolicy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL("https://www.forgesights.com/autosolve/privacy");
  };

  const handleDefaultVehicle = () => {
    Haptics.selectionAsync();
    Alert.alert(
      "Default Vehicle",
      "Set your primary vehicle from the Home screen by filling in your vehicle details. This will auto-populate the form on future scans.",
      [{ text: "OK" }]
    );
  };

  return (
    <View className="flex-1 bg-[#F8F9FB]">
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="px-5 pb-4 bg-white border-b border-[#E8EDF2]"
      >
        <Text className="text-2xl font-bold text-[#1A365D] tracking-tight">
          Settings
        </Text>
        <Text className="text-sm text-[#64748B] mt-0.5">
          App preferences
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* General Section */}
        <Animated.View
          entering={FadeInDown.duration(400).springify()}
          className="bg-white rounded-2xl px-4 py-2 mb-4"
          style={{
            shadowColor: "#1A365D",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide py-3">
            General
          </Text>
          <SettingsRow
            icon="car-outline"
            title="Default Vehicle"
            subtitle={defaultVehicle ? `${defaultVehicle.year} ${defaultVehicle.make} ${defaultVehicle.model}` : "Not set"}
            color="#2563EB"
            bgColor="#EBF4FF"
            onPress={handleDefaultVehicle}
          />
        </Animated.View>

        {/* Preferences Section */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400).springify()}
          className="bg-white rounded-2xl px-4 py-2 mb-4"
          style={{
            shadowColor: "#1A365D",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide py-3">
            Preferences
          </Text>
          <SettingsRow
            icon="notifications-outline"
            title="Notifications"
            color="#7C3AED"
            bgColor="#F3E8FF"
            hasToggle
            toggleValue={notifications}
            onToggle={setNotifications}
          />
          <View className="h-px bg-[#F1F5F9] mx-1" />
          <SettingsRow
            icon="phone-portrait-outline"
            title="Haptic Feedback"
            color="#DC2626"
            bgColor="#FEE2E2"
            hasToggle
            toggleValue={hapticFeedback}
            onToggle={setHapticFeedback}
          />
        </Animated.View>

        {/* Support Section */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400).springify()}
          className="bg-white rounded-2xl px-4 py-2 mb-4"
          style={{
            shadowColor: "#1A365D",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide py-3">
            Support
          </Text>
          <SettingsRow
            icon="help-circle-outline"
            title="Help Center"
            color="#2563EB"
            bgColor="#EBF4FF"
            onPress={() => navigation.navigate("HelpCenter")}
          />
          <View className="h-px bg-[#F1F5F9] mx-1" />
          <SettingsRow
            icon="chatbubble-outline"
            title="Contact Us"
            color="#059669"
            bgColor="#ECFDF5"
            onPress={handleContactUs}
          />
          <View className="h-px bg-[#F1F5F9] mx-1" />
          <SettingsRow
            icon="document-text-outline"
            title="Terms of Service"
            color="#64748B"
            bgColor="#F1F5F9"
            onPress={() => navigation.navigate("TermsOfService")}
          />
          <View className="h-px bg-[#F1F5F9] mx-1" />
          <SettingsRow
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            color="#0891B2"
            bgColor="#ECFEFF"
            onPress={handlePrivacyPolicy}
          />
        </Animated.View>

        {/* App Info */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(400).springify()}
          className="items-center mt-4"
        >
          <Text className="text-[#94A3B8] text-sm">AutoSolve v1.0.0</Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
