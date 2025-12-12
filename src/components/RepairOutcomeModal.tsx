import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeOut, FadeInDown, ZoomIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { RepairSubmission, RepairOutcome, RepairType } from "../types/repair-outcome";
import { useRepairOutcomeStore } from "../state/repairOutcomeStore";

// Suggested fix from AI diagnosis
interface SuggestedFix {
  id: string;
  title: string;
  description: string;
  estimatedCost?: string;
}

interface RepairOutcomeModalProps {
  visible: boolean;
  onClose: () => void;
  diagnosticId: string;
  vehicle: {
    year: string;
    make: string;
    model: string;
    engine: string;
    mileage: string;
  };
  diagnosticData: {
    symptoms: string[];
    dtcCodes: string[];
    aiDiagnosisTitle: string;
    aiDiagnosisPath: string;
  };
  // New: suggested fixes from the AI diagnosis
  suggestedFixes?: SuggestedFix[];
  daysSinceDiagnosis?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function RepairOutcomeModal({
  visible,
  onClose,
  diagnosticId,
  vehicle,
  diagnosticData,
  suggestedFixes = [],
  daysSinceDiagnosis = 0,
}: RepairOutcomeModalProps) {
  const insets = useSafeAreaInsets();
  const addPendingSubmission = useRepairOutcomeStore(
    (s) => s.addPendingSubmission
  );
  const markFollowUpCompleted = useRepairOutcomeStore(
    (s) => s.markFollowUpCompleted
  );

  // Form state
  const [step, setStep] = useState<"outcome" | "details" | "parts">("outcome");
  const [outcome, setOutcome] = useState<RepairOutcome | null>(null);
  const [repairType, setRepairType] = useState<RepairType>("diy");
  const [laborDescription, setLaborDescription] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [timeSpent, setTimeSpent] = useState("");
  const [confidence, setConfidence] = useState(5);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [shopName, setShopName] = useState("");

  // New state for suggested fix selection
  const [selectedFixId, setSelectedFixId] = useState<string | null>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleClose = () => {
    Haptics.selectionAsync();
    onClose();
  };

  const handleOutcomeSelect = (selected: RepairOutcome) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setOutcome(selected);

    if (selected === "not_fixed") {
      // Skip to submission
      submitRepairOutcome(selected, "", 0, 0);
    } else {
      setStep("details");
    }
  };

  const handleDetailsNext = () => {
    // Check if we have a valid selection
    const hasSelectedFix = selectedFixId && !showCustomInput;
    const hasCustomDescription = showCustomInput && laborDescription.trim();

    if (!hasSelectedFix && !hasCustomDescription) {
      Alert.alert("Required Field", "Please select what fixed the issue or describe it");
      return;
    }

    // If a suggested fix was selected, use its title as the labor description
    if (hasSelectedFix) {
      const selectedFix = suggestedFixes.find(f => f.id === selectedFixId);
      if (selectedFix) {
        setLaborDescription(selectedFix.title);
      }
    }

    Haptics.selectionAsync();
    setStep("parts");
  };

  const submitRepairOutcome = (
    finalOutcome: RepairOutcome,
    labor: string,
    cost: number,
    time: number
  ) => {
    const submission: RepairSubmission = {
      id: Date.now().toString(),
      userId: "anonymous",
      diagnosticId,
      vehicle,
      diagnosticData,
      repair: {
        type: repairType,
        partsReplaced: [], // Will be enhanced in future
        laborDescription: labor,
        totalCost: cost,
        timeSpent: time,
        shopName: repairType === "shop" ? shopName : undefined,
      },
      outcome: finalOutcome,
      confidence,
      additionalNotes,
      daysToRepair: daysSinceDiagnosis,
      timestamp: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      verifiedByExpert: false,
      flaggedAsIncorrect: false,
    };

    addPendingSubmission(submission);
    markFollowUpCompleted(diagnosticId);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Thank You!",
      "Your repair outcome has been submitted and will help other users with similar issues.",
      [{ text: "OK", onPress: onClose }]
    );
  };

  const handleFinalSubmit = () => {
    if (!outcome) return;

    const cost = parseFloat(totalCost) || 0;
    const time = parseFloat(timeSpent) || 0;

    submitRepairOutcome(outcome, laborDescription, cost, time);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <Pressable className="flex-1 bg-black/50" onPress={handleClose}>
          <AnimatedPressable
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            onPress={(e) => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl"
            style={{
              maxHeight: "85%",
              paddingBottom: insets.bottom + 20,
            }}
          >
            {/* Header */}
            <View className="px-5 pt-4 pb-3 border-b border-[#E8EDF2]">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xl font-bold text-[#1A365D]">
                  Did You Fix It?
                </Text>
                <Pressable
                  onPress={handleClose}
                  className="w-8 h-8 rounded-full bg-[#E8EDF2] items-center justify-center"
                >
                  <Ionicons name="close" size={20} color="#64748B" />
                </Pressable>
              </View>
              <Text className="text-[#64748B] text-sm">
                Help others by sharing your repair outcome
              </Text>
            </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Outcome Selection */}
            {step === "outcome" && (
              <View>
                <Text className="text-[#1A365D] font-semibold text-base mb-4">
                  What happened with your vehicle?
                </Text>

                <OutcomeOption
                  icon="checkmark-circle"
                  title="Fixed!"
                  description="Issue is completely resolved"
                  color="#059669"
                  bgColor="#ECFDF5"
                  onPress={() => handleOutcomeSelect("fixed")}
                />

                <OutcomeOption
                  icon="remove-circle"
                  title="Partially Fixed"
                  description="Better but not completely resolved"
                  color="#D97706"
                  bgColor="#FEF3C7"
                  onPress={() => handleOutcomeSelect("partial")}
                />

                <OutcomeOption
                  icon="close-circle"
                  title="Not Fixed"
                  description="Issue still persists"
                  color="#DC2626"
                  bgColor="#FEE2E2"
                  onPress={() => handleOutcomeSelect("not_fixed")}
                />
              </View>
            )}

            {/* Repair Details */}
            {step === "details" && outcome && outcome !== "not_fixed" && (
              <View>
                <Text className="text-[#1A365D] font-semibold text-base mb-4">
                  Tell us about the repair
                </Text>

                {/* Repair Type */}
                <Text className="text-[#64748B] text-sm font-medium mb-2">
                  Who performed the repair?
                </Text>
                <View className="flex-row gap-3 mb-4">
                  <Pressable
                    onPress={() => {
                      Haptics.selectionAsync();
                      setRepairType("diy");
                    }}
                    className={`flex-1 rounded-xl p-4 border-2 ${
                      repairType === "diy"
                        ? "border-[#2563EB] bg-[#EBF4FF]"
                        : "border-[#E8EDF2] bg-white"
                    }`}
                  >
                    <Ionicons
                      name="hammer"
                      size={24}
                      color={repairType === "diy" ? "#2563EB" : "#64748B"}
                    />
                    <Text
                      className={`font-semibold mt-2 ${
                        repairType === "diy" ? "text-[#2563EB]" : "text-[#64748B]"
                      }`}
                    >
                      DIY
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      Haptics.selectionAsync();
                      setRepairType("shop");
                    }}
                    className={`flex-1 rounded-xl p-4 border-2 ${
                      repairType === "shop"
                        ? "border-[#2563EB] bg-[#EBF4FF]"
                        : "border-[#E8EDF2] bg-white"
                    }`}
                  >
                    <Ionicons
                      name="storefront"
                      size={24}
                      color={repairType === "shop" ? "#2563EB" : "#64748B"}
                    />
                    <Text
                      className={`font-semibold mt-2 ${
                        repairType === "shop" ? "text-[#2563EB]" : "text-[#64748B]"
                      }`}
                    >
                      Shop
                    </Text>
                  </Pressable>
                </View>

                {/* Shop Name if applicable */}
                {repairType === "shop" && (
                  <Animated.View
                    entering={FadeInDown.duration(200)}
                    className="mb-4"
                  >
                    <Text className="text-[#64748B] text-sm font-medium mb-2">
                      Shop Name (Optional)
                    </Text>
                    <TextInput
                      className="bg-[#F8F9FB] rounded-xl px-4 py-3 text-[#1A365D] border border-[#E8EDF2]"
                      placeholder="Enter shop name"
                      placeholderTextColor="#94A3B8"
                      cursorColor="#1A365D"
                      selectionColor="#2563EB"
                      value={shopName}
                      onChangeText={setShopName}
                    />
                  </Animated.View>
                )}

                {/* What Fixed It - Suggested Fixes or Custom Input */}
                <View className="mb-4">
                  <Text className="text-[#64748B] text-sm font-medium mb-2">
                    What fixed the issue? *
                  </Text>

                  {/* Suggested Fixes from AI Diagnosis */}
                  {suggestedFixes.length > 0 && !showCustomInput && (
                    <Animated.View entering={FadeInDown.duration(200)}>
                      <Text className="text-xs text-[#94A3B8] mb-2">
                        Select from AI suggestions or describe your own fix
                      </Text>
                      {suggestedFixes.map((fix, index) => (
                        <Animated.View
                          key={fix.id}
                          entering={FadeInDown.delay(index * 50).duration(200)}
                        >
                          <Pressable
                            onPress={() => {
                              Haptics.selectionAsync();
                              setSelectedFixId(fix.id);
                              setShowCustomInput(false);
                            }}
                            className={`rounded-xl p-3.5 mb-2 border-2 ${
                              selectedFixId === fix.id
                                ? "border-[#2563EB] bg-[#EBF4FF]"
                                : "border-[#E8EDF2] bg-[#F8F9FB]"
                            }`}
                          >
                            <View className="flex-row items-center">
                              <View
                                className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                                  selectedFixId === fix.id
                                    ? "border-[#2563EB] bg-[#2563EB]"
                                    : "border-[#CBD5E1]"
                                }`}
                              >
                                {selectedFixId === fix.id && (
                                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                                )}
                              </View>
                              <View className="flex-1">
                                <Text
                                  className={`font-medium text-sm ${
                                    selectedFixId === fix.id
                                      ? "text-[#2563EB]"
                                      : "text-[#1A365D]"
                                  }`}
                                >
                                  {fix.title}
                                </Text>
                                {fix.description && (
                                  <Text className="text-xs text-[#64748B] mt-0.5">
                                    {fix.description}
                                  </Text>
                                )}
                              </View>
                              {fix.estimatedCost && (
                                <Text className="text-xs text-[#64748B] ml-2">
                                  {fix.estimatedCost}
                                </Text>
                              )}
                            </View>
                          </Pressable>
                        </Animated.View>
                      ))}

                      {/* Option to write custom */}
                      <Pressable
                        onPress={() => {
                          Haptics.selectionAsync();
                          setShowCustomInput(true);
                          setSelectedFixId(null);
                        }}
                        className="flex-row items-center justify-center mt-2 py-2"
                      >
                        <Ionicons name="create-outline" size={16} color="#2563EB" />
                        <Text className="text-[#2563EB] font-medium text-sm ml-1.5">
                          Describe something else
                        </Text>
                      </Pressable>
                    </Animated.View>
                  )}

                  {/* Custom Input (shown when no suggestions or user wants custom) */}
                  {(showCustomInput || suggestedFixes.length === 0) && (
                    <Animated.View entering={FadeInDown.duration(200)}>
                      {suggestedFixes.length > 0 && (
                        <Pressable
                          onPress={() => {
                            Haptics.selectionAsync();
                            setShowCustomInput(false);
                            setLaborDescription("");
                          }}
                          className="flex-row items-center mb-2"
                        >
                          <Ionicons name="arrow-back" size={16} color="#2563EB" />
                          <Text className="text-[#2563EB] font-medium text-sm ml-1">
                            Back to suggestions
                          </Text>
                        </Pressable>
                      )}
                      <TextInput
                        className="bg-[#F8F9FB] rounded-xl px-4 py-3.5 text-[#1A365D] border border-[#E8EDF2]"
                        placeholder="e.g., Replaced oxygen sensor, Fixed vacuum leak"
                        placeholderTextColor="#94A3B8"
                        cursorColor="#1A365D"
                        selectionColor="#2563EB"
                        value={laborDescription}
                        onChangeText={setLaborDescription}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                        style={{ minHeight: 80 }}
                      />
                    </Animated.View>
                  )}
                </View>

                {/* Cost */}
                <View className="mb-4">
                  <Text className="text-[#64748B] text-sm font-medium mb-2">
                    Total Cost (USD)
                  </Text>
                  <TextInput
                    className="bg-[#F8F9FB] rounded-xl px-4 py-3 text-[#1A365D] border border-[#E8EDF2]"
                    placeholder="0"
                    placeholderTextColor="#94A3B8"
                    cursorColor="#1A365D"
                    selectionColor="#2563EB"
                    value={totalCost}
                    onChangeText={setTotalCost}
                    keyboardType="decimal-pad"
                  />
                </View>

                {/* Time Spent */}
                <View className="mb-4">
                  <Text className="text-[#64748B] text-sm font-medium mb-2">
                    Time Spent (hours)
                  </Text>
                  <TextInput
                    className="bg-[#F8F9FB] rounded-xl px-4 py-3 text-[#1A365D] border border-[#E8EDF2]"
                    placeholder="0"
                    placeholderTextColor="#94A3B8"
                    cursorColor="#1A365D"
                    selectionColor="#2563EB"
                    value={timeSpent}
                    onChangeText={setTimeSpent}
                    keyboardType="decimal-pad"
                  />
                </View>

                {/* Confidence */}
                <View className="mb-6">
                  <Text className="text-[#64748B] text-sm font-medium mb-2">
                    How confident are you this fixed the issue?
                  </Text>
                  <View className="flex-row justify-between items-center">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Pressable
                        key={rating}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setConfidence(rating);
                        }}
                      >
                        <Ionicons
                          name={rating <= confidence ? "star" : "star-outline"}
                          size={40}
                          color={rating <= confidence ? "#F59E0B" : "#E8EDF2"}
                        />
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Next Button */}
                <Pressable
                  onPress={handleDetailsNext}
                  className="bg-[#2563EB] rounded-xl py-4 items-center"
                >
                  <Text className="text-white font-semibold text-base">
                    Continue
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Final Notes */}
            {step === "parts" && (
              <View>
                <Text className="text-[#1A365D] font-semibold text-base mb-4">
                  Any additional notes?
                </Text>

                <TextInput
                  className="bg-[#F8F9FB] rounded-xl px-4 py-3 text-[#1A365D] border border-[#E8EDF2] mb-6"
                  placeholder="Any tips or advice for others? (Optional)"
                  placeholderTextColor="#94A3B8"
                  value={additionalNotes}
                  onChangeText={setAdditionalNotes}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <View className="bg-[#EBF4FF] rounded-xl p-4 mb-6">
                  <Text className="text-[#2563EB] font-medium text-sm">
                    Your submission helps the community!
                  </Text>
                  <Text className="text-[#64748B] text-xs mt-1">
                    This data is anonymized and used to help other AutoSolve users
                    with similar issues.
                  </Text>
                </View>

                <Pressable
                  onPress={handleFinalSubmit}
                  className="bg-[#2563EB] rounded-xl py-4 items-center"
                >
                  <Text className="text-white font-semibold text-base">
                    Submit
                  </Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
          </AnimatedPressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

interface OutcomeOptionProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  onPress: () => void;
}

function OutcomeOption({
  icon,
  title,
  description,
  color,
  bgColor,
  onPress,
}: OutcomeOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-xl p-4 mb-3 border border-[#E8EDF2] flex-row items-center"
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        className="w-12 h-12 rounded-full items-center justify-center mr-4"
        style={{ backgroundColor: bgColor }}
      >
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-[#1A365D] font-semibold text-base">{title}</Text>
        <Text className="text-[#64748B] text-sm">{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
    </Pressable>
  );
}
