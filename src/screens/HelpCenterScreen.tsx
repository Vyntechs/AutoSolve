import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { Linking } from "react-native";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: "Getting Started",
    question: "How do I scan my vehicle?",
    answer: "To scan your vehicle:\n1. Select your vehicle year, make, model, and engine from the dropdowns\n2. Enter your mileage\n3. Add any diagnostic trouble codes (DTCs) if you have them\n4. Add symptoms you are experiencing\n5. Tap Scan Vehicle to get AI-powered diagnostic analysis",
  },
  {
    category: "Getting Started",
    question: "What information do I need to provide?",
    answer: "For best results, provide:\n• Vehicle year, make, and model (required)\n• Engine type (recommended)\n• Current mileage\n• Any diagnostic trouble codes (DTCs)\n• Detailed symptoms and when they occur\n\nThe more information you provide, the more accurate the diagnostic analysis will be.",
  },
  {
    category: "Features",
    question: "What is the difference between Free and Premium?",
    answer: "Free Tier:\n• 2 diagnostic scans per week\n• No access to history\n• No access to tools (VIN Decoder, OBD Codes, Unit Converter)\n\nPremium Tier ($4.99/week):\n• 20 diagnostic scans per week\n• Full access to diagnostic history\n• Access to all diagnostic tools\n• Priority support",
  },
  {
    category: "Features",
    question: "How accurate are the diagnostic results?",
    answer: "AutoSolve uses advanced AI trained on extensive automotive diagnostic data to provide accurate guidance. However, it is an informational tool and should not replace professional diagnosis. Always consult with a certified technician before performing repairs.\n\nOur AI considers:\n• Vehicle-specific common issues\n• DTC code analysis\n• Symptom patterns\n• Technical service bulletins (TSBs)\n• Manufacturer specifications",
  },
  {
    category: "Features",
    question: "Can I use AutoSolve for any vehicle?",
    answer: "Yes! AutoSolve supports vehicles from 1980 to present, including:\n• Gasoline engines\n• Diesel engines\n• Hybrid vehicles\n• Electric vehicles\n• All major manufacturers\n\nOur database includes detailed information for domestic and import vehicles.",
  },
  {
    category: "Tools",
    question: "How do I use the VIN Decoder?",
    answer: "The VIN Decoder (Premium only) helps you:\n1. Navigate to Tools tab\n2. Select VIN Decoder\n3. Enter your 17-character VIN\n4. Get detailed vehicle information including year, make, model, trim, engine, and more\n\nYour VIN can be found on your dashboard, driver door jamb, or vehicle registration.",
  },
  {
    category: "Tools",
    question: "What are diagnostic trouble codes (DTCs)?",
    answer: "DTCs are codes stored in your vehicles computer when a problem is detected. They typically start with P (Powertrain), B (Body), C (Chassis), or U (Network).\n\nCommon examples:\n• P0300 - Random Misfire\n• P0171 - System Too Lean\n• P0420 - Catalyst Efficiency\n\nAutoSolve can help you understand what these codes mean and how to diagnose them.",
  },
  {
    category: "Subscription",
    question: "How do I cancel my subscription?",
    answer: "To cancel your Premium subscription:\n\nFor iOS:\n1. Open Settings on your iPhone\n2. Tap your name at the top\n3. Tap Subscriptions\n4. Select AutoSolve Premium\n5. Tap Cancel Subscription\n\nYou will retain Premium access until the end of your current billing period.",
  },
  {
    category: "Subscription",
    question: "Can I get a refund?",
    answer: "Subscriptions follow standard app store refund policies. Generally, refunds are not provided for partial subscription periods. However, if you experience technical issues or billing problems, please contact support@Vyntechs.com and we will work to resolve your concern.",
  },
  {
    category: "Troubleshooting",
    question: "The scan button does nothing when I press it",
    answer: "If the scan button is not working:\n1. Make sure you have selected at least a vehicle make and model\n2. Add at least one symptom or DTC code\n3. Check that you have not exceeded your weekly scan limit\n4. Ensure you have an active internet connection\n5. Try force-closing and reopening the app\n\nIf problems persist, contact support@Vyntechs.com",
  },
  {
    category: "Troubleshooting",
    question: "My diagnostic results are not showing",
    answer: "If results do not appear after scanning:\n1. Check your internet connection\n2. Make sure the scan completed (look for success notification)\n3. Scroll down to the AutoSolve Insights section\n4. Try running the scan again\n\nIf the issue continues, please contact support with details about your vehicle and symptoms.",
  },
  {
    category: "Safety",
    question: "Is it safe to perform repairs based on AutoSolve recommendations?",
    answer: "AutoSolve provides diagnostic guidance for informational purposes only. We strongly recommend:\n• Always consult a certified technician for complex repairs\n• Never attempt repairs beyond your skill level\n• Use proper safety equipment\n• Follow manufacturer service procedures\n• Be aware of warranty implications\n\nYour safety is paramount. When in doubt, seek professional help.",
  },
];

export function HelpCenterScreen() {
  const insets = useSafeAreaInsets();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(faqs.map((faq) => faq.category)));

  const filteredFAQs = selectedCategory
    ? faqs.filter((faq) => faq.category === selectedCategory)
    : faqs;

  const handleEmailSupport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL("mailto:support@Vyntechs.com?subject=AutoSolve Help Request");
  };

  return (
    <View className="flex-1 bg-[#F8F9FB]">
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="px-5 pb-4 bg-white border-b border-[#E8EDF2]"
      >
        <Text className="text-2xl font-bold text-[#1A365D] tracking-tight">
          Help Center
        </Text>
        <Text className="text-sm text-[#64748B] mt-0.5">
          Get help with AutoSolve
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact Support Card */}
        <Animated.View
          entering={FadeInDown.duration(400).springify()}
          className="bg-[#2563EB] rounded-2xl p-5 mb-6 shadow-sm"
          style={{
            shadowColor: "#1A365D",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3">
              <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
            </View>
            <Text className="text-white font-bold text-lg flex-1">
              Need More Help?
            </Text>
          </View>
          <Text className="text-white text-sm mb-4 leading-5 opacity-90">
            Cannot find what you are looking for? Our support team is here to help!
          </Text>
          <Pressable
            onPress={handleEmailSupport}
            className="bg-white rounded-xl py-3 px-4 flex-row items-center justify-center"
          >
            <Ionicons name="mail-outline" size={18} color="#2563EB" />
            <Text className="text-[#2563EB] font-semibold text-base ml-2">
              Email Support
            </Text>
          </Pressable>
          <Text className="text-white text-xs text-center mt-3 opacity-70">
            support@Vyntechs.com • Response within 48 hours
          </Text>
        </Animated.View>

        {/* Category Filter */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400).springify()}
          className="mb-4"
        >
          <Text className="text-[#64748B] text-sm font-medium mb-3">
            Browse by category
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedCategory(null);
                setExpandedIndex(null);
              }}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === null
                  ? "bg-[#2563EB]"
                  : "bg-white border border-[#E8EDF2]"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedCategory === null ? "text-white" : "text-[#64748B]"
                }`}
              >
                All
              </Text>
            </Pressable>
            {categories.map((category) => (
              <Pressable
                key={category}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedCategory(category);
                  setExpandedIndex(null);
                }}
                className={`px-4 py-2 rounded-full ${
                  selectedCategory === category
                    ? "bg-[#2563EB]"
                    : "bg-white border border-[#E8EDF2]"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedCategory === category ? "text-white" : "text-[#64748B]"
                  }`}
                >
                  {category}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        {/* FAQ List */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400).springify()}
          className="bg-white rounded-2xl overflow-hidden shadow-sm"
          style={{
            shadowColor: "#1A365D",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          {filteredFAQs.map((faq, index) => (
            <FAQAccordion
              key={index}
              faq={faq}
              index={index}
              isExpanded={expandedIndex === index}
              onToggle={() => {
                Haptics.selectionAsync();
                setExpandedIndex(expandedIndex === index ? null : index);
              }}
              isLast={index === filteredFAQs.length - 1}
            />
          ))}
        </Animated.View>

        {/* Quick Tips */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(400).springify()}
          className="mt-6 bg-[#ECFDF5] rounded-2xl p-5 border border-[#059669]/20"
        >
          <View className="flex-row items-center mb-3">
            <Ionicons name="bulb-outline" size={20} color="#059669" />
            <Text className="text-[#059669] font-bold text-base ml-2">
              Pro Tips
            </Text>
          </View>
          <TipItem text="Provide detailed symptoms for better diagnostic accuracy" />
          <TipItem text="Add DTCs if you have an OBD-II scanner available" />
          <TipItem text="Save your diagnostic history with Premium subscription" />
          <TipItem text="Use the VIN Decoder to verify engine specifications" />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

interface FAQAccordionProps {
  faq: FAQItem;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  isLast: boolean;
}

function FAQAccordion({ faq, isExpanded, onToggle, isLast }: FAQAccordionProps) {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withSpring(isExpanded ? 180 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [isExpanded, rotation]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View>
      <Pressable
        onPress={onToggle}
        className="px-5 py-4"
        style={({ pressed }) => ({
          backgroundColor: pressed ? "#F8F9FB" : "white",
        })}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-[#94A3B8] text-xs font-medium mb-1">
              {faq.category}
            </Text>
            <Text className="text-[#1A365D] font-semibold text-base">
              {faq.question}
            </Text>
          </View>
          <Animated.View style={iconStyle}>
            <Ionicons name="chevron-down" size={20} color="#64748B" />
          </Animated.View>
        </View>
      </Pressable>

      {isExpanded && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="px-5 pb-4"
        >
          <View className="bg-[#F8F9FB] rounded-xl p-4">
            <Text className="text-[#64748B] text-sm leading-6">
              {faq.answer}
            </Text>
          </View>
        </Animated.View>
      )}

      {!isLast && <View className="h-px bg-[#E8EDF2] mx-5" />}
    </View>
  );
}

function TipItem({ text }: { text: string }) {
  return (
    <View className="flex-row items-start mb-2">
      <View className="w-1.5 h-1.5 rounded-full bg-[#059669] mt-2 mr-2" />
      <Text className="text-[#047857] text-sm flex-1">{text}</Text>
    </View>
  );
}
