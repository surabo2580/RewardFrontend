import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Business, RewardRule, Wallet, Transaction, EventRequest, WalletResponse, EvaluationResult } from '../types';
import { RuleEngine } from '../engine/RuleEngine';

interface ProcessEventResult {
  success: boolean;
  pointsAwarded: number;
  wallet: Wallet;
  transaction: Transaction;
  evaluation: EvaluationResult;
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
  
  // Core Spring Boot backend services ported
  processEvent: (request: EventRequest) => ProcessEventResult;
  getWallet: (userId: string, businessId: string) => WalletResponse;
  
  // Wallet lifecycle operations
  confirmPoints: (transactionId: number) => void;
  confirmAllPending: (userId: string, businessId: string) => void;
  redeemPoints: (userId: string, businessId: string, points: number) => boolean;
  
  // Rule CRUD
  addRule: (rule: Omit<RewardRule, 'id' | 'createdAt'>) => RewardRule;
  updateRule: (id: number, rule: Partial<RewardRule>) => void;
  deleteRule: (id: number) => void;
  toggleRuleActive: (id: number) => void;
  
  // Business and User CRUD
  addBusiness: (business: Omit<Business, 'createdAt'>) => Business;
  addUser: (user: Omit<User, 'createdAt'>) => User;
  
  // Reset/Seed
  resetToDefaults: () => void;
}

const STORAGE_KEY = 'smart_reward_engine_state_v1';

const INITIAL_BUSINESSES: Business[] = [
  { id: 'taj', name: 'Taj Luxury Hotels & Dining', createdAt: Date.now() - 86400000 * 30 },
  { id: 'club_abc', name: 'Club ABC Premier Fitness', createdAt: Date.now() - 86400000 * 20 },
  { id: 'tech_haven', name: 'TechHaven Electronics', createdAt: Date.now() - 86400000 * 10 },
];

const INITIAL_USERS: User[] = [
  { id: 'user123', name: 'Alex Rivera (Original Demo User)', createdAt: Date.now() - 86400000 * 15 },
  { id: 'sophia_chen', name: 'Sophia Chen', createdAt: Date.now() - 86400000 * 10 },
  { id: 'marcus_v', name: 'Marcus Vance', createdAt: Date.now() - 86400000 * 5 },
];

const INITIAL_RULES: RewardRule[] = [
  // Rules for "taj"
  {
    id: 1,
    businessId: 'taj',
    eventType: 'PURCHASE',
    minAmount: 50.0,
    rewardType: 'PERCENTAGE',
    rewardValue: 10.0, // 10% points on purchases >= $50
    isActive: true,
    createdAt: Date.now() - 86400000 * 25,
    description: '10% cashback points for dining or stay above $50',
  },
  {
    id: 2,
    businessId: 'taj',
    eventType: 'PURCHASE',
    minAmount: 500.0,
    rewardType: 'FLAT',
    rewardValue: 200.0, // Extra 200 flat bonus points on purchases >= $500
    isActive: true,
    createdAt: Date.now() - 86400000 * 24,
    description: 'Bonus 200 flat points for luxury suites & banquets >= $500',
  },
  {
    id: 3,
    businessId: 'taj',
    eventType: 'SIGNUP',
    minAmount: null,
    rewardType: 'FLAT',
    rewardValue: 250.0,
    isActive: true,
    createdAt: Date.now() - 86400000 * 22,
    description: 'Welcome bonus of 250 points on joining Taj Rewards',
  },
  {
    id: 4,
    businessId: 'taj',
    eventType: 'REFERRAL',
    minAmount: null,
    rewardType: 'FLAT',
    rewardValue: 500.0,
    isActive: true,
    createdAt: Date.now() - 86400000 * 20,
    description: 'Refer a friend to Taj Privileges and earn 500 points',
  },

  // Rules for "club_abc"
  {
    id: 5,
    businessId: 'club_abc',
    eventType: 'PURCHASE',
    minAmount: 25.0,
    rewardType: 'FLAT',
    rewardValue: 50.0,
    isActive: true,
    createdAt: Date.now() - 86400000 * 18,
    description: 'Flat 50 points on gym sessions or smoothie bar over $25',
  },
  {
    id: 6,
    businessId: 'club_abc',
    eventType: 'SIGNUP',
    minAmount: null,
    rewardType: 'FLAT',
    rewardValue: 150.0,
    isActive: true,
    createdAt: Date.now() - 86400000 * 18,
    description: 'Club ABC new membership welcome pack points',
  },
  {
    id: 7,
    businessId: 'club_abc',
    eventType: 'REFERRAL',
    minAmount: null,
    rewardType: 'FLAT',
    rewardValue: 300.0,
    isActive: true,
    createdAt: Date.now() - 86400000 * 15,
    description: 'Member referral reward: 300 points',
  },

  // Rules for "tech_haven"
  {
    id: 8,
    businessId: 'tech_haven',
    eventType: 'PURCHASE',
    minAmount: 100.0,
    rewardType: 'PERCENTAGE',
    rewardValue: 5.0,
    isActive: true,
    createdAt: Date.now() - 86400000 * 8,
    description: '5% rewards back on electronics purchases over $100',
  },
  {
    id: 9,
    businessId: 'tech_haven',
    eventType: 'SIGNUP',
    minAmount: null,
    rewardType: 'FLAT',
    rewardValue: 100.0,
    isActive: true,
    createdAt: Date.now() - 86400000 * 8,
    description: '100 points welcome promo for TechHaven account creation',
  }
];

const INITIAL_WALLETS: Wallet[] = [
  {
    id: 1,
    userId: 'user123',
    businessId: 'taj',
    availablePoints: 450,
    pendingPoints: 120,
    updatedAt: Date.now() - 3600000 * 4,
  },
  {
    id: 2,
    userId: 'user123',
    businessId: 'club_abc',
    availablePoints: 150,
    pendingPoints: 50,
    updatedAt: Date.now() - 3600000 * 12,
  },
  {
    id: 3,
    userId: 'sophia_chen',
    businessId: 'taj',
    availablePoints: 800,
    pendingPoints: 0,
    updatedAt: Date.now() - 86400000 * 2,
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 101,
    userId: 'user123',
    businessId: 'taj',
    eventType: 'SIGNUP',
    points: 250,
    status: 'CONFIRMED',
    referenceId: 'REF-TX-8801',
    createdAt: Date.now() - 86400000 * 14,
    properties: { source: 'Mobile App' },
    evaluatedRulesSummary: 'Welcome bonus of 250 points on joining Taj Rewards',
  },
  {
    id: 102,
    userId: 'user123',
    businessId: 'taj',
    eventType: 'PURCHASE',
    points: 200,
    status: 'CONFIRMED',
    referenceId: 'REF-TX-8802',
    createdAt: Date.now() - 86400000 * 7,
    properties: { amount: 2000, items: 'Grand Suite Deluxe Booking' },
    evaluatedRulesSummary: '10% on $2000 (capped/evaluated) + Luxury flat rule',
  },
  {
    id: 103,
    userId: 'user123',
    businessId: 'taj',
    eventType: 'PURCHASE',
    points: 120,
    status: 'PENDING',
    referenceId: 'REF-TX-8803',
    createdAt: Date.now() - 3600000 * 4,
    properties: { amount: 1200, items: 'Fine Dining Buffet & Beverages' },
    evaluatedRulesSummary: '10% of $1200 = 120 points',
  },
  {
    id: 104,
    userId: 'user123',
    businessId: 'club_abc',
    eventType: 'SIGNUP',
    points: 150,
    status: 'CONFIRMED',
    referenceId: 'REF-TX-8804',
    createdAt: Date.now() - 86400000 * 5,
    properties: { plan: 'Annual VIP' },
    evaluatedRulesSummary: 'Club ABC new membership welcome pack points',
  },
  {
    id: 105,
    userId: 'user123',
    businessId: 'club_abc',
    eventType: 'PURCHASE',
    points: 50,
    status: 'PENDING',
    referenceId: 'REF-TX-8805',
    createdAt: Date.now() - 3600000 * 12,
    properties: { amount: 45, items: 'Protein Shakes & Gym Gear' },
    evaluatedRulesSummary: 'Flat 50 points on purchases over $25',
  }
];

const RewardContext = createContext<RewardContextType | undefined>(undefined);

export const RewardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [businesses, setBusinesses] = useState<Business[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_businesses`);
    return saved ? JSON.parse(saved) : INITIAL_BUSINESSES;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [rules, setRules] = useState<RewardRule[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_rules`);
    return saved ? JSON.parse(saved) : INITIAL_RULES;
  });

  const [wallets, setWallets] = useState<Wallet[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_wallets`);
    return saved ? JSON.parse(saved) : INITIAL_WALLETS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('taj');
  const [selectedUserId, setSelectedUserId] = useState<string>('user123');

  // Persistence
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_businesses`, JSON.stringify(businesses));
  }, [businesses]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_rules`, JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_wallets`, JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
  }, [transactions]);

  /**
   * Port of com.smartReward.backend.service.WalletService.getWallet(userId, businessId)
   */
  const getWallet = (userId: string, businessId: string): WalletResponse => {
    const wallet = wallets.find(
      (w) => w.userId.toLowerCase() === userId.toLowerCase() && w.businessId.toLowerCase() === businessId.toLowerCase()
    );

    return {
      availablePoints: wallet ? wallet.availablePoints : 0,
      pendingPoints: wallet ? wallet.pendingPoints : 0,
    };
  };

  /**
   * Port of com.smartReward.backend.service.EventService.processEvent(request)
   * 1. Evaluates rule engine
   * 2. Finds or creates wallet
   * 3. Increases wallet.pendingPoints += points
   * 4. Saves Transaction with status = "PENDING"
   */
  const processEvent = (request: EventRequest): ProcessEventResult => {
    const evaluation = RuleEngine.evaluate(request, rules);
    const points = evaluation.totalPoints;

    // Auto-create user if not exists
    if (!users.some((u) => u.id.toLowerCase() === request.userId.toLowerCase())) {
      const newUser: User = {
        id: request.userId,
        name: `User ${request.userId}`,
        createdAt: Date.now(),
      };
      setUsers((prev) => [...prev, newUser]);
    }

    // Auto-create business if not exists
    if (!businesses.some((b) => b.id.toLowerCase() === request.businessId.toLowerCase())) {
      const newBiz: Business = {
        id: request.businessId,
        name: `Business ${request.businessId}`,
        createdAt: Date.now(),
      };
      setBusinesses((prev) => [...prev, newBiz]);
    }

    // Find or create wallet
    let updatedWallet: Wallet;
    const existingIndex = wallets.findIndex(
      (w) =>
        w.userId.toLowerCase() === request.userId.toLowerCase() &&
        w.businessId.toLowerCase() === request.businessId.toLowerCase()
    );

    if (existingIndex >= 0) {
      const current = wallets[existingIndex];
      updatedWallet = {
        ...current,
        pendingPoints: current.pendingPoints + points,
        updatedAt: Date.now(),
      };
      setWallets((prev) => {
        const next = [...prev];
        next[existingIndex] = updatedWallet;
        return next;
      });
    } else {
      updatedWallet = {
        id: Date.now(),
        userId: request.userId,
        businessId: request.businessId,
        availablePoints: 0,
        pendingPoints: points,
        updatedAt: Date.now(),
      };
      setWallets((prev) => [...prev, updatedWallet]);
    }

    // Create transaction log
    const summaries = evaluation.matchedRules
      .filter((r) => r.passedCondition && r.pointsAwarded > 0)
      .map((r) => r.explanation)
      .join('; ');

    const newTransaction: Transaction = {
      id: Date.now(),
      userId: request.userId,
      businessId: request.businessId,
      eventType: request.event,
      points,
      status: 'PENDING',
      referenceId: `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      createdAt: Date.now(),
      properties: request.properties,
      evaluatedRulesSummary: summaries || (points === 0 ? 'No matching active rules satisfied' : undefined),
    };

    setTransactions((prev) => [newTransaction, ...prev]);

    return {
      success: true,
      pointsAwarded: points,
      wallet: updatedWallet,
      transaction: newTransaction,
      evaluation,
      message: points > 0 ? `Successfully awarded ${points} pending points!` : 'Event processed. 0 points awarded (no rules matched).',
    };
  };

  /**
   * Wallet lifecycle: Confirm a single pending transaction into available points
   */
  const confirmPoints = (transactionId: number) => {
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx || tx.status !== 'PENDING') return;

    // Update transaction
    setTransactions((prev) =>
      prev.map((t) => (t.id === transactionId ? { ...t, status: 'CONFIRMED' } : t))
    );

    // Update wallet: pending -> available
    setWallets((prev) =>
      prev.map((w) => {
        if (
          w.userId.toLowerCase() === tx.userId.toLowerCase() &&
          w.businessId.toLowerCase() === tx.businessId.toLowerCase()
        ) {
          return {
            ...w,
            availablePoints: w.availablePoints + tx.points,
            pendingPoints: Math.max(0, w.pendingPoints - tx.points),
            updatedAt: Date.now(),
          };
        }
        return w;
      })
    );
  };

  /**
   * Wallet lifecycle: Confirm all pending points for a user at a business
   */
  const confirmAllPending = (userId: string, businessId: string) => {
    const pendingTxList = transactions.filter(
      (t) =>
        t.status === 'PENDING' &&
        t.userId.toLowerCase() === userId.toLowerCase() &&
        t.businessId.toLowerCase() === businessId.toLowerCase()
    );

    if (pendingTxList.length === 0) return;

    const totalPointsToConfirm = pendingTxList.reduce((acc, t) => acc + t.points, 0);

    // Update transactions
    setTransactions((prev) =>
      prev.map((t) =>
        t.status === 'PENDING' &&
        t.userId.toLowerCase() === userId.toLowerCase() &&
        t.businessId.toLowerCase() === businessId.toLowerCase()
          ? { ...t, status: 'CONFIRMED' }
          : t
      )
    );

    // Update wallet
    setWallets((prev) =>
      prev.map((w) => {
        if (
          w.userId.toLowerCase() === userId.toLowerCase() &&
          w.businessId.toLowerCase() === businessId.toLowerCase()
        ) {
          return {
            ...w,
            availablePoints: w.availablePoints + totalPointsToConfirm,
            pendingPoints: Math.max(0, w.pendingPoints - totalPointsToConfirm),
            updatedAt: Date.now(),
          };
        }
        return w;
      })
    );
  };

  /**
   * Wallet lifecycle: Redeem available points
   */
  const redeemPoints = (userId: string, businessId: string, points: number): boolean => {
    if (points <= 0) return false;

    const walletIndex = wallets.findIndex(
      (w) =>
        w.userId.toLowerCase() === userId.toLowerCase() &&
        w.businessId.toLowerCase() === businessId.toLowerCase()
    );

    if (walletIndex === -1 || wallets[walletIndex].availablePoints < points) {
      return false;
    }

    // Deduct from wallet
    setWallets((prev) => {
      const next = [...prev];
      next[walletIndex] = {
        ...next[walletIndex],
        availablePoints: next[walletIndex].availablePoints - points,
        updatedAt: Date.now(),
      };
      return next;
    });

    // Record REDEEMED transaction
    const redeemTx: Transaction = {
      id: Date.now(),
      userId,
      businessId,
      eventType: 'REDEEM',
      points: -points,
      status: 'REDEEMED',
      referenceId: `RED-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      createdAt: Date.now(),
      evaluatedRulesSummary: `Redeemed ${points} reward points for reward vouchers/discounts`,
    };

    setTransactions((prev) => [redeemTx, ...prev]);
    return true;
  };

  // Rule management
  const addRule = (newRuleData: Omit<RewardRule, 'id' | 'createdAt'>): RewardRule => {
    const newRule: RewardRule = {
      ...newRuleData,
      id: Date.now(),
      createdAt: Date.now(),
    };
    setRules((prev) => [newRule, ...prev]);
    return newRule;
  };

  const updateRule = (id: number, updatedFields: Partial<RewardRule>) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...updatedFields } : r)));
  };

  const deleteRule = (id: number) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleRuleActive = (id: number) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  };

  // Business & User management
  const addBusiness = (businessData: Omit<Business, 'createdAt'>): Business => {
    const biz: Business = {
      ...businessData,
      createdAt: Date.now(),
    };
    setBusinesses((prev) => [...prev, biz]);
    return biz;
  };

  const addUser = (userData: Omit<User, 'createdAt'>): User => {
    const usr: User = {
      ...userData,
      createdAt: Date.now(),
    };
    setUsers((prev) => [...prev, usr]);
    return usr;
  };

  const resetToDefaults = () => {
    setBusinesses(INITIAL_BUSINESSES);
    setUsers(INITIAL_USERS);
    setRules(INITIAL_RULES);
    setWallets(INITIAL_WALLETS);
    setTransactions(INITIAL_TRANSACTIONS);
    setSelectedBusinessId('taj');
    setSelectedUserId('user123');
    localStorage.removeItem(`${STORAGE_KEY}_businesses`);
    localStorage.removeItem(`${STORAGE_KEY}_users`);
    localStorage.removeItem(`${STORAGE_KEY}_rules`);
    localStorage.removeItem(`${STORAGE_KEY}_wallets`);
    localStorage.removeItem(`${STORAGE_KEY}_transactions`);
  };

  return (
    <RewardContext.Provider
      value={{
        users,
        businesses,
        rules,
        wallets,
        transactions,
        selectedBusinessId,
        setSelectedBusinessId,
        selectedUserId,
        setSelectedUserId,
        processEvent,
        getWallet,
        confirmPoints,
        confirmAllPending,
        redeemPoints,
        addRule,
        updateRule,
        deleteRule,
        toggleRuleActive,
        addBusiness,
        addUser,
        resetToDefaults,
      }}
    >
      {children}
    </RewardContext.Provider>
  );
};

export const useReward = () => {
  const context = useContext(RewardContext);
  if (!context) {
    throw new Error('useReward must be used within a RewardProvider');
  }
  return context;
};
