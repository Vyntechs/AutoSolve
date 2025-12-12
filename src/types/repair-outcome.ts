// Types and interfaces for the "What Fixed It" crowdsourced repair database

export type RepairOutcome = "fixed" | "partial" | "not_fixed";
export type RepairType = "diy" | "shop";

export interface RepairPart {
  name: string;
  cost: number;
}

export interface RepairSubmission {
  id: string;
  userId: string; // anonymized user ID from RevenueCat or device ID
  diagnosticId: string; // links to original diagnostic session

  // Vehicle info (for matching)
  vehicle: {
    year: string;
    make: string;
    model: string;
    engine: string;
    mileage: string;
  };

  // Original diagnostic data
  diagnosticData: {
    symptoms: string[];
    dtcCodes: string[];
    aiDiagnosisTitle: string;
    aiDiagnosisPath: string; // which diagnostic path was followed
  };

  // Repair details
  repair: {
    type: RepairType;
    partsReplaced: RepairPart[];
    laborDescription: string;
    totalCost: number;
    timeSpent: number; // hours
    shopName?: string; // if shop repair
  };

  // Outcome
  outcome: RepairOutcome;
  confidence: number; // 1-5, how confident user is this fixed it
  additionalNotes?: string;

  // Timing
  daysToRepair: number; // days between diagnosis and repair
  timestamp: string;
  submittedAt: string;

  // Community validation
  upvotes: number;
  downvotes: number;
  verifiedByExpert: boolean;
  flaggedAsIncorrect: boolean;
}

export interface WhatFixedItStats {
  totalReports: number;
  successRate: number; // percentage that were "fixed"
  averageCost: number;
  averageTime: number;

  // Top solutions ranked by success rate
  topSolutions: RepairSolution[];

  // Vehicle-specific data
  vehicleSpecific: {
    make: string;
    model: string;
    count: number;
    successRate: number;
  }[];

  // Cost breakdown
  costDistribution: {
    under100: number;
    under500: number;
    under1000: number;
    over1000: number;
  };
}

export interface RepairSolution {
  description: string;
  partsUsed: string[];
  successCount: number;
  totalAttempts: number;
  successRate: number;
  averageCost: number;
  diyFriendly: boolean;
  recentReports: number; // reports in last 30 days
}

export interface DiagnosticWithCommunityData {
  diagnosticPath: any; // existing DiagnosticPath from diagnostic-service
  communityStats?: WhatFixedItStats;
}

// Local pending submission (before sync to backend)
export interface PendingRepairSubmission {
  diagnosticId: string;
  scheduledFollowUpDate: string;
  reminderSent: boolean;
  completed: boolean;
}
