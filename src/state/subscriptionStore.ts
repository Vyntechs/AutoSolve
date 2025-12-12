import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type SubscriptionTier = "free" | "premium" | "trial";

export interface UsageStats {
  scansThisWeek: number;
  weekStartDate: string; // ISO string
  totalScansAllTime: number;
}

export interface TrialStats {
  isInTrial: boolean;
  trialStartDate: string | null; // ISO string
  trialScansUsed: number;
}

export interface DiagnosticSession {
  id: string;
  timestamp: string;
  vehicle: {
    year: string;
    make: string;
    model: string;
    mileage: string;
  };
  symptoms: string[];
  dtcCodes: string[];
  summary: string;
}

interface SubscriptionState {
  tier: SubscriptionTier;
  isSubscribed: boolean;
  usageStats: UsageStats;
  trialStats: TrialStats;
  history: DiagnosticSession[];

  // Actions
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  startTrial: () => void;
  endTrial: () => void;
  incrementScanUsage: () => void;
  canScan: () => boolean;
  getRemainingScans: () => number;
  isTrialExpired: () => boolean;
  getTrialDaysRemaining: () => number;
  resetWeeklyUsage: () => void;
  addToHistory: (session: DiagnosticSession) => void;
  clearHistory: () => void;
  getHistory: () => DiagnosticSession[];
}

const WEEKLY_LIMITS = {
  free: 2,
  premium: 20,
  trial: 10, // Trial users get 10 scans during their trial period
};

const TRIAL_DURATION_DAYS = 2;

function getWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek;
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart.toISOString();
}

function isSameWeek(dateStr: string): boolean {
  const weekStart = getWeekStart();
  const stored = new Date(dateStr);
  const current = new Date(weekStart);
  return stored.getTime() === current.getTime();
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      tier: "free",
      isSubscribed: false,
      usageStats: {
        scansThisWeek: 0,
        weekStartDate: getWeekStart(),
        totalScansAllTime: 0,
      },
      trialStats: {
        isInTrial: false,
        trialStartDate: null,
        trialScansUsed: 0,
      },
      history: [],

      setSubscriptionTier: (tier) => {
        set({
          tier,
          isSubscribed: tier === "premium",
        });
      },

      startTrial: () => {
        set({
          tier: "trial",
          isSubscribed: false,
          trialStats: {
            isInTrial: true,
            trialStartDate: new Date().toISOString(),
            trialScansUsed: 0,
          },
        });
      },

      endTrial: () => {
        set((state) => ({
          tier: "free",
          isSubscribed: false,
          trialStats: {
            ...state.trialStats,
            isInTrial: false,
          },
        }));
      },

      incrementScanUsage: () => {
        set((state) => {
          const weekStart = getWeekStart();
          const needsReset = !isSameWeek(state.usageStats.weekStartDate);

          // If in trial, also increment trial scans
          const newTrialStats = state.tier === "trial"
            ? { ...state.trialStats, trialScansUsed: state.trialStats.trialScansUsed + 1 }
            : state.trialStats;

          return {
            usageStats: {
              scansThisWeek: needsReset ? 1 : state.usageStats.scansThisWeek + 1,
              weekStartDate: weekStart,
              totalScansAllTime: state.usageStats.totalScansAllTime + 1,
            },
            trialStats: newTrialStats,
          };
        });
      },

      canScan: () => {
        const state = get();

        // Trial users: check trial scan limit and expiration
        if (state.tier === "trial") {
          const isExpired = get().isTrialExpired();
          if (isExpired) return false;
          return state.trialStats.trialScansUsed < WEEKLY_LIMITS.trial;
        }

        // Regular weekly limit check for free/premium
        const needsReset = !isSameWeek(state.usageStats.weekStartDate);
        if (needsReset) return true;

        const limit = WEEKLY_LIMITS[state.tier];
        return state.usageStats.scansThisWeek < limit;
      },

      getRemainingScans: () => {
        const state = get();

        // Trial users: remaining trial scans
        if (state.tier === "trial") {
          const isExpired = get().isTrialExpired();
          if (isExpired) return 0;
          return Math.max(0, WEEKLY_LIMITS.trial - state.trialStats.trialScansUsed);
        }

        // Regular weekly remaining for free/premium
        const needsReset = !isSameWeek(state.usageStats.weekStartDate);
        if (needsReset) return WEEKLY_LIMITS[state.tier];

        const limit = WEEKLY_LIMITS[state.tier];
        return Math.max(0, limit - state.usageStats.scansThisWeek);
      },

      isTrialExpired: () => {
        const state = get();
        if (!state.trialStats.trialStartDate) return true;

        const trialStart = new Date(state.trialStats.trialStartDate);
        const now = new Date();
        const daysSinceStart = (now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24);

        return daysSinceStart >= TRIAL_DURATION_DAYS;
      },

      getTrialDaysRemaining: () => {
        const state = get();
        if (!state.trialStats.trialStartDate) return 0;

        const trialStart = new Date(state.trialStats.trialStartDate);
        const now = new Date();
        const daysSinceStart = (now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24);
        const daysRemaining = TRIAL_DURATION_DAYS - daysSinceStart;

        return Math.max(0, Math.ceil(daysRemaining));
      },

      resetWeeklyUsage: () => {
        set((state) => ({
          usageStats: {
            ...state.usageStats,
            scansThisWeek: 0,
            weekStartDate: getWeekStart(),
          },
        }));
      },

      addToHistory: (session) => {
        set((state) => ({
          history: [session, ...state.history].slice(0, 50), // Keep last 50
        }));
      },

      clearHistory: () => {
        set({ history: [] });
      },

      getHistory: () => {
        const state = get();
        // Free users cannot access history (trial and premium can)
        if (state.tier === "free") {
          return [];
        }
        return state.history;
      },
    }),
    {
      name: "subscription-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
