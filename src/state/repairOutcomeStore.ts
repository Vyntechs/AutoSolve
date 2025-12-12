import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  RepairSubmission,
  PendingRepairSubmission,
  WhatFixedItStats,
  RepairSolution,
} from "../types/repair-outcome";

interface RepairOutcomeState {
  // Local submissions waiting to be synced
  pendingSubmissions: RepairSubmission[];

  // Follow-up reminders for diagnostics
  pendingFollowUps: PendingRepairSubmission[];

  // Cached community stats (refreshed periodically)
  cachedStats: Record<string, WhatFixedItStats>; // key: symptom+dtc hash

  // User's own repair history
  myRepairs: RepairSubmission[];

  // Opt-in status
  contributionEnabled: boolean;

  // Actions
  addPendingSubmission: (submission: RepairSubmission) => void;
  scheduleDiagnosticFollowUp: (diagnosticId: string, daysLater: number) => void;
  markFollowUpCompleted: (diagnosticId: string) => void;
  cacheStats: (key: string, stats: WhatFixedItStats) => void;
  getCachedStats: (key: string) => WhatFixedItStats | null;
  addMyRepair: (submission: RepairSubmission) => void;
  setContributionEnabled: (enabled: boolean) => void;
  getPendingFollowUps: () => PendingRepairSubmission[];
  clearPendingSubmissions: () => void;
}

export const useRepairOutcomeStore = create<RepairOutcomeState>()(
  persist(
    (set, get) => ({
      pendingSubmissions: [],
      pendingFollowUps: [],
      cachedStats: {},
      myRepairs: [],
      contributionEnabled: true,

      addPendingSubmission: (submission) =>
        set((state) => ({
          pendingSubmissions: [...state.pendingSubmissions, submission],
          myRepairs: [...state.myRepairs, submission],
        })),

      scheduleDiagnosticFollowUp: (diagnosticId, daysLater) => {
        const followUpDate = new Date();
        followUpDate.setDate(followUpDate.getDate() + daysLater);

        set((state) => ({
          pendingFollowUps: [
            ...state.pendingFollowUps,
            {
              diagnosticId,
              scheduledFollowUpDate: followUpDate.toISOString(),
              reminderSent: false,
              completed: false,
            },
          ],
        }));
      },

      markFollowUpCompleted: (diagnosticId) =>
        set((state) => ({
          pendingFollowUps: state.pendingFollowUps.map((followUp) =>
            followUp.diagnosticId === diagnosticId
              ? { ...followUp, completed: true }
              : followUp
          ),
        })),

      cacheStats: (key, stats) =>
        set((state) => ({
          cachedStats: {
            ...state.cachedStats,
            [key]: stats,
          },
        })),

      getCachedStats: (key) => {
        return get().cachedStats[key] || null;
      },

      addMyRepair: (submission) =>
        set((state) => ({
          myRepairs: [...state.myRepairs, submission],
        })),

      setContributionEnabled: (enabled) =>
        set({ contributionEnabled: enabled }),

      getPendingFollowUps: () => {
        const now = new Date();
        return get().pendingFollowUps.filter((followUp) => {
          const followUpDate = new Date(followUp.scheduledFollowUpDate);
          return (
            !followUp.completed &&
            followUpDate <= now &&
            !followUp.reminderSent
          );
        });
      },

      clearPendingSubmissions: () => set({ pendingSubmissions: [] }),
    }),
    {
      name: "repair-outcome-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Helper function to generate a cache key from symptoms and DTCs
export function generateStatsKey(symptoms: string[], dtcCodes: string[]): string {
  const combined = [...symptoms.sort(), ...dtcCodes.sort()].join("|");
  // Simple hash function for cache key
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `stats_${Math.abs(hash)}`;
}

// Calculate community stats from repair submissions
export function calculateWhatFixedItStats(
  submissions: RepairSubmission[]
): WhatFixedItStats {
  if (submissions.length === 0) {
    return {
      totalReports: 0,
      successRate: 0,
      averageCost: 0,
      averageTime: 0,
      topSolutions: [],
      vehicleSpecific: [],
      costDistribution: {
        under100: 0,
        under500: 0,
        under1000: 0,
        over1000: 0,
      },
    };
  }

  const fixedCount = submissions.filter((s) => s.outcome === "fixed").length;
  const successRate = (fixedCount / submissions.length) * 100;

  const totalCost = submissions.reduce((sum, s) => sum + s.repair.totalCost, 0);
  const averageCost = totalCost / submissions.length;

  const totalTime = submissions.reduce((sum, s) => sum + s.repair.timeSpent, 0);
  const averageTime = totalTime / submissions.length;

  // Group by repair description to find top solutions
  const solutionMap = new Map<string, RepairSubmission[]>();
  submissions.forEach((sub) => {
    const key = sub.repair.laborDescription || "Unknown repair";
    if (!solutionMap.has(key)) {
      solutionMap.set(key, []);
    }
    solutionMap.get(key)!.push(sub);
  });

  const topSolutions: RepairSolution[] = Array.from(solutionMap.entries())
    .map(([description, subs]) => {
      const successCount = subs.filter((s) => s.outcome === "fixed").length;
      const totalAttempts = subs.length;
      const avgCost =
        subs.reduce((sum, s) => sum + s.repair.totalCost, 0) / subs.length;
      const partsUsed = Array.from(
        new Set(subs.flatMap((s) => s.repair.partsReplaced.map((p) => p.name)))
      );

      return {
        description,
        partsUsed,
        successCount,
        totalAttempts,
        successRate: (successCount / totalAttempts) * 100,
        averageCost: avgCost,
        diyFriendly: subs.filter((s) => s.repair.type === "diy").length > subs.length / 2,
        recentReports: subs.filter((s) => {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return new Date(s.timestamp) >= thirtyDaysAgo;
        }).length,
      };
    })
    .sort((a, b) => b.successRate - a.successRate)
    .slice(0, 5);

  // Cost distribution
  const costDistribution = {
    under100: submissions.filter((s) => s.repair.totalCost < 100).length,
    under500: submissions.filter(
      (s) => s.repair.totalCost >= 100 && s.repair.totalCost < 500
    ).length,
    under1000: submissions.filter(
      (s) => s.repair.totalCost >= 500 && s.repair.totalCost < 1000
    ).length,
    over1000: submissions.filter((s) => s.repair.totalCost >= 1000).length,
  };

  return {
    totalReports: submissions.length,
    successRate,
    averageCost,
    averageTime,
    topSolutions,
    vehicleSpecific: [],
    costDistribution,
  };
}
