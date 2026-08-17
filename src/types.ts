export interface User {
  id: string; // e.g. "user123"
  name?: string;
  createdAt: number;
}

export interface Business {
  id: string; // e.g. "taj", "club_abc"
  name: string;
  createdAt: number;
}

export type RewardType = 'FLAT' | 'PERCENTAGE';

export interface RewardRule {
  id: number;
  businessId: string;
  eventType: string; // e.g. "PURCHASE", "SIGNUP", "REFERRAL"
  minAmount?: number | null;
  rewardType: RewardType;
  rewardValue: number;
  isActive: boolean;
  createdAt: number;
  description?: string;
}

export interface Wallet {
  id: number;
  userId: string;
  businessId: string;
  availablePoints: number;
  pendingPoints: number;
  updatedAt: number;
}

export type TransactionStatus = 'PENDING' | 'CONFIRMED' | 'REDEEMED' | 'EXPIRED';

export interface Transaction {
  id: number;
  userId: string;
  businessId: string;
  eventType: string;
  points: number;
  status: TransactionStatus;
  referenceId?: string | null;
  createdAt: number;
  properties?: Record<string, any>;
  evaluatedRulesSummary?: string;
}

export interface EventRequest {
  userId: string;
  businessId: string;
  event: string;
  properties?: Record<string, any>;
}

export interface WalletResponse {
  availablePoints: number;
  pendingPoints: number;
}

export interface EvaluationResult {
  totalPoints: number;
  matchedRules: {
    rule: RewardRule;
    amount: number;
    passedCondition: boolean;
    pointsAwarded: number;
    explanation: string;
  }[];
}
