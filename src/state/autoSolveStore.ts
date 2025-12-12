import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DiagnosticResult } from "../api/diagnostic-service";

export interface VehicleInfo {
  vin: string;
  year: string;
  make: string;
  model: string;
  engine: string;
  mileage: string;
}

export interface DTC {
  code: string;
  description: string;
  severity: "critical" | "warning" | "info";
}

export interface Symptom {
  id: string;
  text: string;
}

export interface FollowUpMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AutoSolveState {
  vehicle: VehicleInfo;
  dtcs: DTC[];
  symptoms: Symptom[];
  issueDescription: string; // Combined field for codes and symptoms
  diagnosticResult: DiagnosticResult | null;
  isScanning: boolean;
  scanError: string | null;
  hasSeenOnboarding: boolean;
  followUpMessages: FollowUpMessage[];
  setVehicle: (vehicle: Partial<VehicleInfo>) => void;
  setDTCs: (dtcs: DTC[]) => void;
  addSymptom: (symptom: Symptom) => void;
  removeSymptom: (id: string) => void;
  setIssueDescription: (description: string) => void;
  setDiagnosticResult: (result: DiagnosticResult | null) => void;
  setIsScanning: (isScanning: boolean) => void;
  setScanError: (error: string | null) => void;
  setHasSeenOnboarding: (hasSeen: boolean) => void;
  setFollowUpMessages: (messages: FollowUpMessage[]) => void;
  clearFollowUpMessages: () => void;
  resetVehicle: () => void;
  clearDiagnostic: () => void;
}

const initialVehicle: VehicleInfo = {
  vin: "",
  year: "",
  make: "",
  model: "",
  engine: "",
  mileage: "",
};

export const useAutoSolveStore = create<AutoSolveState>()(
  persist(
    (set) => ({
      vehicle: initialVehicle,
      dtcs: [],
      symptoms: [],
      issueDescription: "",
      diagnosticResult: null,
      isScanning: false,
      scanError: null,
      hasSeenOnboarding: false,
      followUpMessages: [],
      setVehicle: (vehicle) =>
        set((state) => ({ vehicle: { ...state.vehicle, ...vehicle } })),
      setDTCs: (dtcs) => set({ dtcs }),
      addSymptom: (symptom) =>
        set((state) => ({ symptoms: [...state.symptoms, symptom] })),
      removeSymptom: (id) =>
        set((state) => ({
          symptoms: state.symptoms.filter((s) => s.id !== id),
        })),
      setIssueDescription: (description) => set({ issueDescription: description }),
      setDiagnosticResult: (result) => set({ diagnosticResult: result, followUpMessages: [] }),
      setIsScanning: (isScanning) => set({ isScanning }),
      setScanError: (error) => set({ scanError: error }),
      setHasSeenOnboarding: (hasSeen) => set({ hasSeenOnboarding: hasSeen }),
      setFollowUpMessages: (messages) => set({ followUpMessages: messages }),
      clearFollowUpMessages: () => set({ followUpMessages: [] }),
      resetVehicle: () =>
        set({
          vehicle: initialVehicle,
          dtcs: [],
          symptoms: [],
          issueDescription: "",
          diagnosticResult: null,
          scanError: null,
          followUpMessages: [],
        }),
      clearDiagnostic: () => set({ diagnosticResult: null, scanError: null, followUpMessages: [] }),
    }),
    {
      name: "autosolve-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        vehicle: state.vehicle,
        issueDescription: state.issueDescription,
        hasSeenOnboarding: state.hasSeenOnboarding,
      }),
    }
  )
);
