import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { getOpenAITextResponse } from "../api/chat-service";
import { AIMessage } from "../types/ai";
import { DiagnosticResult } from "../api/diagnostic-service";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface VehicleContext {
  year: string;
  make: string;
  model: string;
  engine: string;
  mileage: string;
}

interface FollowUpChatProps {
  vehicle: VehicleContext;
  issueDescription: string;
  diagnosticResult: DiagnosticResult;
  messages: ChatMessage[];
  onMessagesUpdate: (messages: ChatMessage[]) => void;
  onInputFocus?: () => void;
}

// Helper component to render formatted AI response
function FormattedResponse({ content }: { content: string }) {
  const parseContent = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let currentStepNumber = 0;

    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Check for numbered items (e.g., "1. **Title:**" or "1. Title")
      const numberedMatch = trimmedLine.match(/^(\d+)\.\s*\*?\*?(.+?)\*?\*?:?\s*$/);
      const numberedWithContentMatch = trimmedLine.match(/^(\d+)\.\s*\*?\*?(.+?)\*?\*?:\s*(.+)$/);

      // Check for bullet points
      const bulletMatch = trimmedLine.match(/^[-•]\s*(.+)$/);

      // Check for bold text sections
      const isBoldLine = trimmedLine.startsWith("**") && trimmedLine.endsWith("**");

      if (numberedWithContentMatch) {
        // Numbered item with title and content on same line
        currentStepNumber = parseInt(numberedWithContentMatch[1]);
        const title = numberedWithContentMatch[2].replace(/\*\*/g, "");
        const desc = numberedWithContentMatch[3];

        elements.push(
          <View key={`step-${lineIndex}`} className="mb-3">
            <View className="flex-row items-start">
              <View className="w-6 h-6 rounded-full bg-[#2563EB] items-center justify-center mr-2.5 mt-0.5">
                <Text className="text-white text-xs font-bold">{currentStepNumber}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[#1A365D] font-semibold text-sm">{title}</Text>
                <Text className="text-[#64748B] text-sm mt-1 leading-5">{desc}</Text>
              </View>
            </View>
          </View>
        );
      } else if (numberedMatch) {
        // Numbered item title only
        currentStepNumber = parseInt(numberedMatch[1]);
        const title = numberedMatch[2].replace(/\*\*/g, "").replace(/:$/, "");

        elements.push(
          <View key={`step-title-${lineIndex}`} className="mb-1 mt-2">
            <View className="flex-row items-center">
              <View className="w-6 h-6 rounded-full bg-[#2563EB] items-center justify-center mr-2.5">
                <Text className="text-white text-xs font-bold">{currentStepNumber}</Text>
              </View>
              <Text className="text-[#1A365D] font-semibold text-sm flex-1">{title}</Text>
            </View>
          </View>
        );
      } else if (bulletMatch) {
        // Bullet point
        const bulletContent = bulletMatch[1];
        elements.push(
          <View key={`bullet-${lineIndex}`} className="flex-row items-start ml-8 mb-1.5">
            <View className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] mt-1.5 mr-2" />
            <Text className="text-[#64748B] text-sm flex-1 leading-5">
              {formatInlineText(bulletContent)}
            </Text>
          </View>
        );
      } else if (isBoldLine) {
        // Bold section header
        const headerText = trimmedLine.replace(/\*\*/g, "");
        elements.push(
          <Text key={`header-${lineIndex}`} className="text-[#1A365D] font-semibold text-sm mt-3 mb-1">
            {headerText}
          </Text>
        );
      } else {
        // Regular paragraph
        elements.push(
          <Text key={`para-${lineIndex}`} className="text-[#64748B] text-sm leading-5 mb-2">
            {formatInlineText(trimmedLine)}
          </Text>
        );
      }
    });

    return elements;
  };

  // Format inline bold text
  const formatInlineText = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <Text key={i} className="font-semibold text-[#1A365D]">
            {part.slice(2, -2)}
          </Text>
        );
      }
      return part;
    });
  };

  return <View>{parseContent(content)}</View>;
}

const FOLLOW_UP_SYSTEM_PROMPT = `You are an elite Master Automotive Technician continuing a diagnostic conversation. You have already provided an initial diagnosis and the user is now asking follow-up questions.

Your role:
- Answer follow-up questions about the diagnosis
- Incorporate any new information the user provides
- Adjust your recommendations if new symptoms or context changes things
- Provide specific, actionable guidance
- Be concise but thorough - this is a mobile chat interface

Remember: You have full context of the vehicle, initial symptoms, and your previous diagnosis. Reference them naturally in your responses.

Keep responses focused and practical. Use bullet points for lists. If the new information significantly changes the diagnosis, clearly state that.`;

export function FollowUpChat({
  vehicle,
  issueDescription,
  diagnosticResult,
  messages,
  onMessagesUpdate,
  onInputFocus,
}: FollowUpChatProps) {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const buildContextMessages = (): AIMessage[] => {
    // Build the context from vehicle, issue, and diagnosis
    const contextMessage = `VEHICLE CONTEXT:
- ${vehicle.year} ${vehicle.make} ${vehicle.model}
- Engine: ${vehicle.engine || "Not specified"}
- Mileage: ${vehicle.mileage || "Not specified"}

ORIGINAL ISSUE:
${issueDescription}

YOUR INITIAL DIAGNOSIS:
Summary: ${diagnosticResult.summary}

Diagnostic Paths:
${diagnosticResult.paths.map((path, i) => `${i + 1}. ${path.title} (${path.confidence}% confidence)
   - ${path.description}
   - Severity: ${path.severity}
   ${path.estimatedCost ? `- Est. Cost: ${path.estimatedCost}` : ""}`).join("\n\n")}

${diagnosticResult.quickTips?.length ? `Quick Tips: ${diagnosticResult.quickTips.join(", ")}` : ""}

The user is now asking follow-up questions about this diagnosis.`;

    const aiMessages: AIMessage[] = [
      { role: "system", content: FOLLOW_UP_SYSTEM_PROMPT },
      { role: "user", content: contextMessage },
      { role: "assistant", content: "I understand. I have the full context of your vehicle and my initial diagnosis. What questions do you have, or is there additional information you would like to share that might affect my recommendations?" },
    ];

    // Add previous conversation messages
    messages.forEach((msg) => {
      aiMessages.push({
        role: msg.role,
        content: msg.content,
      });
    });

    return aiMessages;
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputText.trim(),
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    onMessagesUpdate(updatedMessages);
    setInputText("");
    setIsLoading(true);

    try {
      const contextMessages = buildContextMessages();
      contextMessages.push({ role: "user", content: userMessage.content });

      const response = await getOpenAITextResponse(contextMessages, {
        temperature: 0.4,
        maxTokens: 1024,
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
      };

      onMessagesUpdate([...updatedMessages, assistantMessage]);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Follow-up chat error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error processing your question. Please try again.",
        timestamp: new Date(),
      };
      onMessagesUpdate([...updatedMessages, errorMessage]);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "What tools do I need?",
    "Is this safe to drive?",
    "DIY or mechanic?",
  ];

  const handleQuickPrompt = (prompt: string) => {
    setInputText(prompt);
    inputRef.current?.focus();
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(400).duration(400).springify()}
      className="bg-white rounded-2xl p-5 mt-4 shadow-sm"
      style={{
        shadowColor: "#1A365D",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <View className="w-8 h-8 rounded-lg bg-[#F3E8FF] items-center justify-center mr-3">
          <Ionicons name="chatbubbles-outline" size={18} color="#7C3AED" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-[#1A365D]">
            Follow-Up Questions
          </Text>
          <Text className="text-xs text-[#64748B]">
            Ask about your diagnosis or add more details
          </Text>
        </View>
      </View>

      {/* Messages */}
      {messages.length > 0 && (
        <View className="mb-4 gap-3">
          {messages.map((message, index) => (
            <Animated.View
              key={message.id}
              entering={SlideInRight.delay(index * 50).duration(300).springify()}
              className={`rounded-2xl ${
                message.role === "user"
                  ? "bg-[#2563EB] ml-8 rounded-br-sm p-3.5"
                  : "bg-[#F8F9FB] rounded-bl-sm p-4 border border-[#E8EDF2]"
              }`}
            >
              {message.role === "assistant" ? (
                <View>
                  <View className="flex-row items-center mb-3 pb-2.5 border-b border-[#E8EDF2]">
                    <View className="w-6 h-6 rounded-full bg-[#7C3AED] items-center justify-center mr-2">
                      <Ionicons name="sparkles" size={12} color="#FFFFFF" />
                    </View>
                    <Text className="text-sm font-semibold text-[#7C3AED]">
                      AutoSolve AI
                    </Text>
                  </View>
                  <FormattedResponse content={message.content} />
                </View>
              ) : (
                <Text className="text-sm leading-5 text-white">
                  {message.content}
                </Text>
              )}
            </Animated.View>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <Animated.View
              entering={FadeIn.duration(200)}
              className="bg-[#F8F9FB] rounded-2xl rounded-bl-sm p-4 border border-[#E8EDF2] flex-row items-center"
            >
              <ActivityIndicator size="small" color="#7C3AED" />
              <Text className="text-[#64748B] text-sm ml-2">
                Analyzing your question...
              </Text>
            </Animated.View>
          )}
        </View>
      )}

      {/* Quick prompts - only show if no messages yet */}
      {messages.length === 0 && (
        <Animated.View
          entering={FadeInUp.delay(200).duration(300)}
          className="flex-row flex-wrap gap-2 mb-4"
        >
          {quickPrompts.map((prompt, index) => (
            <Pressable
              key={index}
              onPress={() => handleQuickPrompt(prompt)}
              className="bg-[#F1F5F9] rounded-full px-3.5 py-2 border border-[#E8EDF2]"
            >
              <Text className="text-[#64748B] text-sm">{prompt}</Text>
            </Pressable>
          ))}
        </Animated.View>
      )}

      {/* Input area */}
      <View className="flex-row items-end gap-2">
        <View className="flex-1 bg-[#F8F9FB] rounded-2xl border border-[#E8EDF2] px-4 py-2">
          <TextInput
            ref={inputRef}
            className="text-[#1A365D] text-base min-h-[40px] max-h-[100px]"
            placeholder="Ask a follow-up question..."
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={!isLoading}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
            onFocus={onInputFocus}
          />
        </View>
        <Pressable
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
          className={`w-12 h-12 rounded-xl items-center justify-center ${
            inputText.trim() && !isLoading ? "bg-[#2563EB]" : "bg-[#E8EDF2]"
          }`}
          style={{
            shadowColor: inputText.trim() && !isLoading ? "#2563EB" : "transparent",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: inputText.trim() && !isLoading ? 3 : 0,
          }}
        >
          <Ionicons
            name="send"
            size={20}
            color={inputText.trim() && !isLoading ? "#FFFFFF" : "#94A3B8"}
          />
        </Pressable>
      </View>

      {/* Hint text */}
      <Text className="text-xs text-[#94A3B8] mt-2 text-center">
        AI remembers your vehicle and diagnosis context
      </Text>
    </Animated.View>
  );
}
