import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

export function TermsOfServiceScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-[#F8F9FB]">
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="px-5 pb-4 bg-white border-b border-[#E8EDF2]"
      >
        <Text className="text-2xl font-bold text-[#1A365D] tracking-tight">
          Terms of Service
        </Text>
        <Text className="text-sm text-[#64748B] mt-0.5">
          Last updated: December 6, 2024
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.duration(400).springify()}
          className="bg-white rounded-2xl p-5 mb-4 shadow-sm"
          style={{
            shadowColor: "#1A365D",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Section
            title="1. Acceptance of Terms"
            content="By accessing and using AutoSolve, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the application."
          />

          <Divider />

          <Section
            title="2. Description of Service"
            content="AutoSolve is an AI-powered automotive diagnostic assistant that provides diagnostic analysis, repair guidance, and vehicle maintenance information. The service uses artificial intelligence to analyze vehicle symptoms and diagnostic trouble codes (DTCs) to provide repair recommendations."
          />

          <Divider />

          <Section
            title="3. Professional Disclaimer"
            content="AutoSolve is an informational tool and should not replace professional automotive diagnosis and repair services. The AI-generated diagnostic information is provided as guidance only. Always consult with a certified automotive technician before performing repairs or making decisions based on AutoSolve recommendations. We are not liable for any damages resulting from the use of this information."
          />

          <Divider />

          <Section
            title="4. User Responsibilities"
            content="You are responsible for:
• Providing accurate vehicle information and symptoms
• Using the application in accordance with these terms
• Maintaining the confidentiality of your account
• All activities that occur under your account
• Complying with all applicable laws and regulations"
          />

          <Divider />

          <Section
            title="5. Subscription Terms"
            content="AutoSolve offers both free and premium subscription tiers:

Free Tier:
• Limited to 2 diagnostic scans per week
• No access to diagnostic history
• No access to diagnostic tools

Premium Tier ($4.99/week):
• Up to 20 diagnostic scans per week
• Full access to diagnostic history
• Complete access to all diagnostic tools
• Cancel anytime through your subscription settings

Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period.

IMPORTANT: All purchases made through the Apple App Store are subject to Apple's Standard End User License Agreement (EULA). For purchases, billing, refunds, and subscription management, Apple's terms and policies apply. View Apple's Standard EULA at: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
          />

          <Divider />

          <Section
            title="6. Data Collection and Privacy"
            content="We collect and process:
• Vehicle information you provide (year, make, model, engine)
• Diagnostic data (symptoms, DTCs)
• Usage statistics and diagnostic history
• Account information

We use this data to provide and improve our services. We do not sell your personal data to third parties. For complete details, please review our Privacy Policy."
          />

          <Divider />

          <Section
            title="7. Intellectual Property"
            content="All content, features, and functionality of AutoSolve are owned by VynTechs and are protected by international copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or reverse engineer any part of the application without express written permission."
          />

          <Divider />

          <Section
            title="8. Limitation of Liability"
            content="TO THE MAXIMUM EXTENT PERMITTED BY LAW:

AutoSolve and VynTechs shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages resulting from:
• Use or inability to use the service
• Unauthorized access to or alteration of your data
• Statements or conduct of any third party
• Vehicle repairs or modifications based on app recommendations
• Any other matter relating to the service

You use AutoSolve at your own risk. The service is provided AS IS without warranties of any kind."
          />

          <Divider />

          <Section
            title="9. Modifications to Service"
            content="We reserve the right to modify, suspend, or discontinue any part of AutoSolve at any time without notice. We may also modify these Terms of Service at any time. Continued use of the application after changes constitutes acceptance of the modified terms."
          />

          <Divider />

          <Section
            title="10. Termination"
            content="We may terminate or suspend your account and access to AutoSolve immediately, without prior notice or liability, for any reason, including breach of these Terms. Upon termination, your right to use the application will immediately cease."
          />

          <Divider />

          <Section
            title="11. Governing Law"
            content="These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions. Any disputes arising from these terms will be resolved in the courts of the United States."
          />

          <Divider />

          <Section
            title="12. Contact Information"
            content="For questions about these Terms of Service, please contact us at:

Email: support@Vyntechs.com
Subject: Terms of Service Inquiry

We will respond to all inquiries within 48 business hours."
          />

          <View className="mt-6 bg-[#EBF4FF] rounded-xl p-4 border border-[#2563EB]/20">
            <Text className="text-[#1A365D] font-semibold text-sm mb-2">
              Important Safety Notice
            </Text>
            <Text className="text-[#64748B] text-sm leading-5">
              AutoSolve provides diagnostic guidance for informational purposes only. Always prioritize safety and consult qualified professionals for vehicle repairs. Never attempt repairs beyond your skill level or without proper safety equipment.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <View className="mb-4">
      <Text className="text-[#1A365D] font-semibold text-base mb-2">
        {title}
      </Text>
      <Text className="text-[#64748B] text-sm leading-6">{content}</Text>
    </View>
  );
}

function Divider() {
  return <View className="h-px bg-[#E8EDF2] my-4" />;
}
