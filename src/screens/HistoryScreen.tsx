import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useSubscriptionStore, DiagnosticSession } from "../state/subscriptionStore";
import { RootStackParamList } from "../navigation/RootNavigator";

export function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const getHistory = useSubscriptionStore((s) => s.getHistory);
  const tier = useSubscriptionStore((s) => s.tier);

  const history = getHistory();
  const isFree = tier === "free";

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
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
              History
            </Text>
            <Text className="text-sm text-[#64748B] mt-0.5">
              Past diagnostic sessions
            </Text>
          </View>
          {isFree && (
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
        {isFree && (
          <View className="mt-3 bg-[#FEF3C7] rounded-lg p-3 flex-row items-center">
            <Ionicons name="lock-closed" size={16} color="#D97706" />
            <Text className="text-[#D97706] text-xs ml-2 flex-1">
              History access requires Premium subscription
            </Text>
          </View>
        )}
      </View>

      {isFree ? (
        <View className="flex-1 items-center justify-center px-8">
          <Animated.View
            entering={FadeInDown.duration(400).springify()}
            className="items-center"
          >
            <View className="w-20 h-20 rounded-full bg-[#FEF3C7] items-center justify-center mb-4">
              <Ionicons name="lock-closed" size={36} color="#D97706" />
            </View>
            <Text className="text-[#1A365D] text-lg font-semibold text-center">
              Premium Feature
            </Text>
            <Text className="text-[#64748B] text-sm text-center mt-2 mb-6">
              Access your diagnostic history with a Premium subscription
            </Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate("Paywall");
              }}
              className="bg-[#2563EB] px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">Upgrade to Premium</Text>
            </Pressable>
          </Animated.View>
        </View>
      ) : history.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Animated.View
            entering={FadeInDown.duration(400).springify()}
            className="items-center"
          >
            <View className="w-16 h-16 rounded-full bg-[#E8EDF2] items-center justify-center mb-4">
              <Ionicons name="time-outline" size={32} color="#94A3B8" />
            </View>
            <Text className="text-[#1A365D] text-lg font-semibold text-center">
              No History Yet
            </Text>
            <Text className="text-[#64748B] text-sm text-center mt-2">
              Your diagnostic sessions will appear here after you complete your first scan
            </Text>
          </Animated.View>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {history.map((session, index) => (
            <Animated.View
              key={session.id}
              entering={FadeInDown.delay(index * 50)
                .duration(400)
                .springify()}
            >
              <HistoryCard session={session} formatDate={formatDate} />
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

interface HistoryCardProps {
  session: DiagnosticSession;
  formatDate: (isoString: string) => string;
}

function HistoryCard({ session, formatDate }: HistoryCardProps) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
      }}
      className="bg-white rounded-2xl p-4 mb-3"
      style={{
        shadowColor: "#1A365D",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-full bg-[#EBF4FF] items-center justify-center mr-3">
            <Ionicons name="car-sport-outline" size={20} color="#2563EB" />
          </View>
          <View className="flex-1">
            <Text className="text-[#1A365D] font-semibold text-base">
              {session.vehicle.year} {session.vehicle.make}
            </Text>
            <Text className="text-[#64748B] text-sm">
              {session.vehicle.model}
            </Text>
          </View>
        </View>
        <Text className="text-[#94A3B8] text-xs">
          {formatDate(session.timestamp)}
        </Text>
      </View>

      {/* Summary */}
      <Text className="text-[#64748B] text-sm mb-3" numberOfLines={2}>
        {session.summary}
      </Text>

      {/* Tags */}
      <View className="flex-row flex-wrap">
        {session.dtcCodes.length > 0 && (
          <View className="bg-[#FEF3C7] rounded-full px-3 py-1 mr-2 mb-2">
            <Text className="text-[#D97706] text-xs font-medium">
              {session.dtcCodes.length} DTC{session.dtcCodes.length > 1 ? "s" : ""}
            </Text>
          </View>
        )}
        {session.symptoms.length > 0 && (
          <View className="bg-[#ECFDF5] rounded-full px-3 py-1 mr-2 mb-2">
            <Text className="text-[#059669] text-xs font-medium">
              {session.symptoms.length} Symptom{session.symptoms.length > 1 ? "s" : ""}
            </Text>
          </View>
        )}
        <View className="bg-[#E8EDF2] rounded-full px-3 py-1 mb-2">
          <Text className="text-[#64748B] text-xs font-medium">
            {session.vehicle.mileage} mi
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
