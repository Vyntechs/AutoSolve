import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MainTabs } from "./MainTabs";
import { AddSymptomModal } from "../screens/AddSymptomModal";
import { VINDecoderScreen } from "../screens/VINDecoderScreen";
import { OBDCodesScreen } from "../screens/OBDCodesScreen";
import { UnitConverterScreen } from "../screens/UnitConverterScreen";
import { PaywallScreen } from "../screens/PaywallScreen";
import { TermsOfServiceScreen } from "../screens/TermsOfServiceScreen";
import { HelpCenterScreen } from "../screens/HelpCenterScreen";

export type RootStackParamList = {
  MainTabs: undefined;
  AddSymptomModal: undefined;
  VINDecoder: undefined;
  OBDCodes: undefined;
  UnitConverter: undefined;
  Paywall: undefined;
  TermsOfService: undefined;
  HelpCenter: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#F8F9FB" },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="AddSymptomModal"
        component={AddSymptomModal}
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [0.35],
          sheetCornerRadius: 24,
          sheetGrabberVisible: true,
        }}
      />
      <Stack.Screen
        name="VINDecoder"
        component={VINDecoderScreen}
        options={{
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="OBDCodes"
        component={OBDCodesScreen}
        options={{
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="UnitConverter"
        component={UnitConverterScreen}
        options={{
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="TermsOfService"
        component={TermsOfServiceScreen}
        options={{
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="HelpCenter"
        component={HelpCenterScreen}
        options={{
          animation: "slide_from_right",
        }}
      />
    </Stack.Navigator>
  );
}
