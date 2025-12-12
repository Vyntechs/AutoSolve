import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  FadeInDown,
  FadeInRight,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { WhatFixedItStats } from "../types/repair-outcome";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface WhatFixedItCardProps {
  stats: WhatFixedItStats;
  onViewDetails?: () => void;
}

export function WhatFixedItCard({ stats, onViewDetails }: WhatFixedItCardProps) {
  const progressWidth = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    progressWidth.value = withDelay(
      300,
      withTiming(stats.successRate, {
        duration: 800,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    );
  }, [stats.successRate]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  if (!stats || stats.totalReports === 0) {
    return null;
  }

  const handleViewDetails = () => {
    Haptics.selectionAsync();
    buttonScale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
    setTimeout(() => {
      buttonScale.value = withSpring(1, { damping: 15, stiffness: 400 });
    }, 100);
    onViewDetails?.();
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(400).duration(400).springify()}
      className="bg-[#ECFDF5] rounded-2xl p-5 mt-4 border border-[#059669]/20"
      style={{
        shadowColor: "#059669",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <Animated.View
          entering={ZoomIn.delay(500).duration(300).springify()}
          className="w-10 h-10 rounded-full bg-[#059669] items-center justify-center mr-3"
          style={{
            shadowColor: "#059669",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
          }}
        >
          <Ionicons name="people" size={20} color="#FFFFFF" />
        </Animated.View>
        <View className="flex-1">
          <Text className="text-[#059669] font-bold text-lg">
            Community Data
          </Text>
          <Text className="text-[#047857] text-xs">
            {stats.totalReports} real user{stats.totalReports !== 1 ? "s" : ""} reported
          </Text>
        </View>
        <Animated.View
          entering={ZoomIn.delay(600).duration(300)}
          className="bg-[#059669]/20 rounded-full px-3 py-1.5"
        >
          <Text className="text-[#059669] font-bold text-sm">
            {Math.round(stats.successRate)}% Fixed
          </Text>
        </Animated.View>
      </View>

      {/* Animated Success Rate Bar */}
      <View className="mb-4">
        <View className="bg-[#047857]/20 rounded-full h-3.5 overflow-hidden">
          <Animated.View
            className="bg-[#059669] h-full rounded-full"
            style={progressStyle}
          />
        </View>
      </View>

      {/* Quick Stats */}
      <View className="flex-row mb-4">
        <Animated.View
          entering={FadeInRight.delay(450).duration(300).springify()}
        >
          <StatPill
            icon="cash-outline"
            label="Avg Cost"
            value={`$${Math.round(stats.averageCost)}`}
          />
        </Animated.View>
        <Animated.View
          entering={FadeInRight.delay(550).duration(300).springify()}
        >
          <StatPill
            icon="time-outline"
            label="Avg Time"
            value={`${stats.averageTime.toFixed(1)}h`}
          />
        </Animated.View>
      </View>

      {/* Top Solutions */}
      {stats.topSolutions.length > 0 && (
        <View className="mb-3">
          <Text className="text-[#047857] font-semibold text-sm mb-2">
            What Fixed It:
          </Text>
          {stats.topSolutions.slice(0, 3).map((solution, index) => (
            <Animated.View
              key={index}
              entering={FadeInRight.delay(600 + index * 100).duration(300).springify()}
              className="bg-white/80 rounded-xl p-3.5 mb-2 flex-row items-center"
              style={{
                shadowColor: "#1A365D",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 3,
              }}
            >
              <View className="w-6 h-6 rounded-full bg-[#059669]/10 items-center justify-center mr-3">
                <Text className="text-[#059669] font-bold text-xs">{index + 1}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[#1A365D] font-medium text-sm">
                  {solution.description}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Text className="text-[#64748B] text-xs">
                    {solution.successCount} of {solution.totalAttempts} users
                  </Text>
                  {solution.diyFriendly && (
                    <View className="flex-row items-center ml-2 bg-[#EBF4FF] rounded-full px-2 py-0.5">
                      <Ionicons name="construct-outline" size={10} color="#2563EB" />
                      <Text className="text-[#2563EB] text-xs ml-0.5 font-medium">DIY</Text>
                    </View>
                  )}
                </View>
              </View>
              <View className="ml-3 bg-[#059669]/10 rounded-lg px-2 py-1">
                <Text className="text-[#059669] font-bold text-base">
                  {Math.round(solution.successRate)}%
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>
      )}

      {/* Cost Distribution */}
      <Animated.View
        entering={FadeInDown.delay(800).duration(300).springify()}
        className="bg-white/60 rounded-xl p-3.5 mb-4"
      >
        <Text className="text-[#047857] font-semibold text-xs mb-2">
          Cost Breakdown
        </Text>
        <View className="flex-row gap-2 flex-wrap">
          {stats.costDistribution.under100 > 0 && (
            <CostChip
              label="<$100"
              count={stats.costDistribution.under100}
              total={stats.totalReports}
            />
          )}
          {stats.costDistribution.under500 > 0 && (
            <CostChip
              label="$100-500"
              count={stats.costDistribution.under500}
              total={stats.totalReports}
            />
          )}
          {stats.costDistribution.under1000 > 0 && (
            <CostChip
              label="$500-1k"
              count={stats.costDistribution.under1000}
              total={stats.totalReports}
            />
          )}
          {stats.costDistribution.over1000 > 0 && (
            <CostChip
              label="$1k+"
              count={stats.costDistribution.over1000}
              total={stats.totalReports}
            />
          )}
        </View>
      </Animated.View>

      {/* View Details Button */}
      {onViewDetails && (
        <AnimatedPressable
          onPress={handleViewDetails}
          style={buttonAnimatedStyle}
          className="bg-[#059669] rounded-xl py-3.5 flex-row items-center justify-center active:opacity-90"
        >
          <Ionicons name="analytics-outline" size={18} color="#FFFFFF" />
          <Text className="text-white font-semibold text-base ml-2">
            View Detailed Stats
          </Text>
        </AnimatedPressable>
      )}

      {/* Community Badge */}
      <View className="mt-4 flex-row items-center justify-center">
        <Ionicons name="shield-checkmark" size={14} color="#047857" />
        <Text className="text-[#047857] text-xs ml-1 font-medium">
          Verified community data
        </Text>
      </View>
    </Animated.View>
  );
}

interface StatPillProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

function StatPill({ icon, label, value }: StatPillProps) {
  return (
    <View className="bg-white/70 rounded-full px-4 py-2 mr-2 flex-row items-center">
      <Ionicons name={icon} size={16} color="#059669" />
      <View className="ml-2">
        <Text className="text-[#64748B] text-xs">{label}</Text>
        <Text className="text-[#1A365D] font-bold text-sm">{value}</Text>
      </View>
    </View>
  );
}

interface CostChipProps {
  label: string;
  count: number;
  total: number;
}

function CostChip({ label, count, total }: CostChipProps) {
  const percentage = Math.round((count / total) * 100);
  return (
    <View className="bg-[#059669]/10 rounded-full px-3 py-1">
      <Text className="text-[#047857] text-xs font-medium">
        {label}: {percentage}%
      </Text>
    </View>
  );
}

interface NoDataYetCardProps {
  onReportFix?: () => void;
}

// Component for when there's NO community data yet
export function NoDataYetCard({ onReportFix }: NoDataYetCardProps) {
  const buttonScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleReportPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    buttonScale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
    setTimeout(() => {
      buttonScale.value = withSpring(1, { damping: 15, stiffness: 400 });
    }, 100);
    onReportFix?.();
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(400).duration(400).springify()}
      className="bg-white rounded-2xl p-5 mt-4"
      style={{
        shadowColor: "#1A365D",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center mb-3">
        <Animated.View
          entering={ZoomIn.delay(500).duration(300).springify()}
          className="w-10 h-10 rounded-full bg-[#EBF4FF] items-center justify-center mr-3"
        >
          <Ionicons name="people-outline" size={20} color="#2563EB" />
        </Animated.View>
        <View className="flex-1">
          <Text className="text-[#1A365D] font-bold text-base">
            Community Repairs
          </Text>
          <Text className="text-[#64748B] text-xs">
            No data yet for this issue
          </Text>
        </View>
      </View>

      {/* Explanation */}
      <Animated.View
        entering={FadeInDown.delay(550).duration(300).springify()}
        className="bg-[#F8F9FB] rounded-xl p-4 mb-4"
      >
        <Text className="text-[#64748B] text-sm leading-5">
          Be the first to share what fixed this issue! Your feedback helps other
          car owners facing the same problem.
        </Text>
      </Animated.View>

      {/* Report Button */}
      {onReportFix && (
        <AnimatedPressable
          onPress={handleReportPress}
          style={buttonAnimatedStyle}
          className="bg-[#2563EB] rounded-xl py-3.5 flex-row items-center justify-center active:opacity-90"
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
          <Text className="text-white font-semibold text-base ml-2">
            Report Your Fix
          </Text>
        </AnimatedPressable>
      )}

      {/* Info Footer */}
      <View className="mt-4 flex-row items-center justify-center">
        <Ionicons name="shield-checkmark-outline" size={14} color="#94A3B8" />
        <Text className="text-[#94A3B8] text-xs ml-1">
          All submissions are anonymous
        </Text>
      </View>
    </Animated.View>
  );
}
