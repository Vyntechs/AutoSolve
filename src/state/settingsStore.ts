import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface DefaultVehicle {
  year: string;
  make: string;
  model: string;
  engine: string;
}

export type Language = "en" | "es" | "fr" | "de";
export type Units = "imperial" | "metric";

interface SettingsState {
  defaultVehicle: DefaultVehicle | null;
  language: Language;
  units: Units;
  notifications: boolean;
  hapticFeedback: boolean;
  setDefaultVehicle: (vehicle: DefaultVehicle | null) => void;
  setLanguage: (language: Language) => void;
  setUnits: (units: Units) => void;
  setNotifications: (enabled: boolean) => void;
  setHapticFeedback: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      defaultVehicle: null,
      language: "en",
      units: "imperial",
      notifications: true,
      hapticFeedback: true,
      setDefaultVehicle: (vehicle) => set({ defaultVehicle: vehicle }),
      setLanguage: (language) => set({ language }),
      setUnits: (units) => set({ units }),
      setNotifications: (enabled) => set({ notifications: enabled }),
      setHapticFeedback: (enabled) => set({ hapticFeedback: enabled }),
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
