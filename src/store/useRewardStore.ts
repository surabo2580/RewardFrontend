import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Business, RewardRule, Wallet, Transaction } from '../types';

interface RewardStoreState {
  // UI State
  selectedBusinessId: string;
  setSelectedBusinessId: (id: string) => void;
  selectedUserId: string;
  setSelectedUserId: (id: string) => void;

  // Seed Data (for demo mode or fallback)
  users: User[];
  businesses: Business[];
  
  // UI State for Pagination/Filtering
  rulesFilter: {
    businessId?: string;
    eventType?: string;
    isActive?: boolean;
  };
  setRulesFilter: (filter: Partial<RewardStoreState['rulesFilter']>) => void;

  transactionsFilter: {
    businessId?: string;
    userId?: string;
    status?: string;
  };
  setTransactionsFilter: (filter: Partial<RewardStoreState['transactionsFilter']>) => void;

  // Pagination State
  rulesPagination: { page: number; pageSize: number };
  setRulesPagination: (pagination: { page: number; pageSize: number }) => void;

  transactionsPagination: { page: number; pageSize: number };
  setTransactionsPagination: (pagination: { page: number; pageSize: number }) => void;

  // Local cache for demo/offline mode
  localRules: RewardRule[];
  setLocalRules: (rules: RewardRule[]) => void;
  addLocalRule: (rule: RewardRule) => void;
  updateLocalRule: (id: number, updates: Partial<RewardRule>) => void;
  deleteLocalRule: (id: number) => void;

  localWallets: Wallet[];
  setLocalWallets: (wallets: Wallet[]) => void;

  localTransactions: Transaction[];
  setLocalTransactions: (transactions: Transaction[]) => void;

  // Reset
  resetToDefaults: () => void;
}

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
    rewardValue: 10.0,
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
    rewardValue: 200.0,
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
    description: '5% points on electronics purchases over $100',
  },
];

export const useRewardStore = create<RewardStoreState>()(
  persist(
    (set) => ({
      selectedBusinessId: 'taj',
      setSelectedBusinessId: (id: string) => set({ selectedBusinessId: id }),
      selectedUserId: 'user123',
      setSelectedUserId: (id: string) => set({ selectedUserId: id }),

      users: INITIAL_USERS,
      businesses: INITIAL_BUSINESSES,

      rulesFilter: {},
      setRulesFilter: (filter) =>
        set((state) => ({
          rulesFilter: { ...state.rulesFilter, ...filter },
        })),

      transactionsFilter: {},
      setTransactionsFilter: (filter) =>
        set((state) => ({
          transactionsFilter: { ...state.transactionsFilter, ...filter },
        })),

      rulesPagination: { page: 1, pageSize: 20 },
      setRulesPagination: (pagination) => set({ rulesPagination: pagination }),

      transactionsPagination: { page: 1, pageSize: 50 },
      setTransactionsPagination: (pagination) => set({ transactionsPagination: pagination }),

      localRules: INITIAL_RULES,
      setLocalRules: (rules) => set({ localRules: rules }),
      addLocalRule: (rule) =>
        set((state) => ({
          localRules: [...state.localRules, rule],
        })),
      updateLocalRule: (id, updates) =>
        set((state) => ({
          localRules: state.localRules.map((rule) =>
            rule.id === id ? { ...rule, ...updates } : rule
          ),
        })),
      deleteLocalRule: (id) =>
        set((state) => ({
          localRules: state.localRules.filter((rule) => rule.id !== id),
        })),

      localWallets: [],
      setLocalWallets: (wallets) => set({ localWallets: wallets }),

      localTransactions: [],
      setLocalTransactions: (transactions) => set({ localTransactions: transactions }),

      resetToDefaults: () =>
        set({
          selectedBusinessId: 'taj',
          selectedUserId: 'user123',
          localRules: INITIAL_RULES,
          localWallets: [],
          localTransactions: [],
          rulesFilter: {},
          transactionsFilter: {},
          rulesPagination: { page: 1, pageSize: 20 },
          transactionsPagination: { page: 1, pageSize: 50 },
        }),
    }),
    {
      name: 'reward-store-v2',
    }
  )
);
