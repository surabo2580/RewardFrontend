/**
 * SCALABLE CONTEXT - Uses Zustand Store Internally
 * Backward compatible with existing component code
 * Migrates from Context API to Zustand + TanStack Query
 */

import React, { createContext, useContext } from 'react';
import { User, Business, RewardRule, Wallet, Transaction, EventRequest, WalletResponse } from '../types';
import { RuleEngine } from '../engine/RuleEngine';
import { useRewardStore } from '../store/useRewardStore';

interface ProcessEventResult {
  success: boolean;
  pointsAwarded: number;
  wallet: Wallet;
  transaction: Transaction;
  message: string;
}

interface RewardContextType {
  users: User[];
  businesses: Business[];
  rules: RewardRule[];
  wallets: Wallet[];
  transactions: Transaction[];
  selectedBusinessId: string;
  setSelectedBusinessId: (id: string) => void;
  selectedUserId: string;
  setSelectedUserId: (id: string) => void;
  processEvent: (request: EventRequest) => ProcessEventResult;
  getWallet: (userId: string, businessId: string) => WalletResponse;
  confirmPoints: (transactionId: number) => void;
  confirmAllPending: (userId: string, businessId: string) => void;
  redeemPoints: (userId: string, businessId: string, points: number) => boolean;
  addRule: (rule: Omit<RewardRule, 'id' | 'createdAt'>) => RewardRule;
  updateRule: (id: number, rule: Partial<RewardRule>) => void;
  deleteRule: (id: number) => void;
  toggleRuleActive: (id: number) => void;
  addBusiness: (business: Omit<Business, 'createdAt'>) => Business;
  addUser: (user: Omit<User, 'createdAt'>) => User;
  resetToDefaults: () => void;
}

const RewardContext = createContext<RewardContextType | undefined>(undefined);

/**
 * Provider component that wraps Zustand store
 * Maintains backward compatibility with existing components
 */
export const RewardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = useRewardStore();

  const contextValue: RewardContextType = {
    // Selection
    selectedBusinessId: store.selectedBusinessId,
    setSelectedBusinessId: store.setSelectedBusinessId,
    selectedUserId: store.selectedUserId,
    setSelectedUserId: store.setSelectedUserId,

    // Data access
    users: store.users,
    businesses: store.businesses,
    rules: store.localRules,
    wallets: store.localWallets,
    transactions: store.localTransactions,

    // Operations
    processEvent: (request: EventRequest) => {
      const evaluation = RuleEngine.evaluate(request, store.localRules);

      // Create transaction
      const transaction: Transaction = {
        id: Date.now(),
        userId: request.userId,
        businessId: request.businessId,
        eventType: request.event,
        points: evaluation.totalPoints,
        status: 'PENDING',
        createdAt: Date.now(),
        properties: request.properties,
        evaluatedRulesSummary: evaluation.matchedRules.length + ' rules matched',
      };

      // Update wallet
      const existingWallet = store.localWallets.find(
        (w) => w.userId === request.userId && w.businessId === request.businessId
      );

      if (existingWallet) {
        store.setLocalWallets(
          store.localWallets.map((w) =>
            w.userId === request.userId && w.businessId === request.businessId
              ? {
                  ...w,
                  pendingPoints: w.pendingPoints + evaluation.totalPoints,
                  updatedAt: Date.now(),
                }
              : w
          )
        );
      } else {
        store.setLocalWallets([
          ...store.localWallets,
          {
            id: Date.now(),
            userId: request.userId,
            businessId: request.businessId,
            availablePoints: 0,
            pendingPoints: evaluation.totalPoints,
            updatedAt: Date.now(),
          },
        ]);
      }

      store.setLocalTransactions([...store.localTransactions, transaction]);

      return {
        success: true,
        pointsAwarded: evaluation.totalPoints,
        wallet: existingWallet || store.localWallets[store.localWallets.length - 1],
        transaction,
        message: `Processed ${request.event} event successfully`,
      };
    },

    getWallet: (userId: string, businessId: string) => {
      const wallet = store.localWallets.find(
        (w) => w.userId === userId && w.businessId === businessId
      );
      return {
        availablePoints: wallet?.availablePoints || 0,
        pendingPoints: wallet?.pendingPoints || 0,
      };
    },

    confirmPoints: (transactionId: number) => {
      store.setLocalTransactions(
        store.localTransactions.map((t) =>
          t.id === transactionId ? { ...t, status: 'CONFIRMED' } : t
        )
      );
    },

    confirmAllPending: (userId: string, businessId: string) => {
      const pendingTransactions = store.localTransactions.filter(
        (t) => t.userId === userId && t.businessId === businessId && t.status === 'PENDING'
      );

      const totalPoints = pendingTransactions.reduce((sum, t) => sum + t.points, 0);

      store.setLocalTransactions(
        store.localTransactions.map((t) =>
          t.userId === userId && t.businessId === businessId && t.status === 'PENDING'
            ? { ...t, status: 'CONFIRMED' }
            : t
        )
      );

      store.setLocalWallets(
        store.localWallets.map((w) =>
          w.userId === userId && w.businessId === businessId
            ? {
                ...w,
                availablePoints: w.availablePoints + totalPoints,
                pendingPoints: 0,
                updatedAt: Date.now(),
              }
            : w
        )
      );
    },

    redeemPoints: (userId: string, businessId: string, points: number) => {
      const wallet = store.localWallets.find(
        (w) => w.userId === userId && w.businessId === businessId
      );

      if (!wallet || wallet.availablePoints < points) {
        return false;
      }

      store.setLocalWallets(
        store.localWallets.map((w) =>
          w.userId === userId && w.businessId === businessId
            ? { ...w, availablePoints: w.availablePoints - points, updatedAt: Date.now() }
            : w
        )
      );

      const transaction: Transaction = {
        id: Date.now(),
        userId,
        businessId,
        eventType: 'REDEMPTION',
        points: -points,
        status: 'REDEEMED',
        createdAt: Date.now(),
      };

      store.setLocalTransactions([...store.localTransactions, transaction]);
      return true;
    },

    addRule: (rule) => {
      const newRule: RewardRule = {
        ...rule,
        id: Math.max(...store.localRules.map((r) => r.id), 0) + 1,
        createdAt: Date.now(),
      };
      store.addLocalRule(newRule);
      return newRule;
    },

    updateRule: (id, updates) => {
      store.updateLocalRule(id, updates);
    },

    deleteRule: (id) => {
      store.deleteLocalRule(id);
    },

    toggleRuleActive: (id) => {
      const rule = store.localRules.find((r) => r.id === id);
      if (rule) {
        store.updateLocalRule(id, { isActive: !rule.isActive });
      }
    },

    addBusiness: (business) => ({
      ...business,
      createdAt: Date.now(),
    }),

    addUser: (user) => ({
      ...user,
      createdAt: Date.now(),
    }),

    resetToDefaults: () => {
      store.resetToDefaults();
    },
  };

  return (
    <RewardContext.Provider value={contextValue}>
      {children}
    </RewardContext.Provider>
  );
};

/**
 * Hook to use the context
 */
export const useRewardContext = (): RewardContextType => {
  const context = useContext(RewardContext);
  if (!context) {
    throw new Error('useRewardContext must be used within RewardProvider');
  }
  return context;
};

/**
 * Legacy hook alias for backward compatibility
 */
export const useReward = useRewardContext;
