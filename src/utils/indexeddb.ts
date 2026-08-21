import Dexie, { Table } from 'dexie';
import { RewardRule, Transaction, Wallet } from '../types';

/**
 * IndexedDB database for storing large datasets
 * Replaces localStorage for better capacity and query capabilities
 */

export interface CachedRule extends RewardRule {
  timestamp: number;
}

export interface CachedTransaction extends Transaction {
  timestamp: number;
}

export interface CachedWallet extends Wallet {
  timestamp: number;
}

export class RewardDatabase extends Dexie {
  rules!: Table<CachedRule>;
  transactions!: Table<CachedTransaction>;
  wallets!: Table<CachedWallet>;

  constructor() {
    super('RewardDatabase');
    this.version(1).stores({
      rules: '++id, businessId, eventType, isActive',
      transactions: '++id, userId, businessId, status, createdAt',
      wallets: '++id, userId, businessId',
    });
  }
}

export const db = new RewardDatabase();

/**
 * Rules storage operations
 */
export const rulesDB = {
  async add(rule: RewardRule): Promise<number> {
    return db.rules.add({
      ...rule,
      timestamp: Date.now(),
    });
  },

  async addBulk(rules: RewardRule[]): Promise<void> {
    return db.rules.bulkAdd(
      rules.map((rule) => ({
        ...rule,
        timestamp: Date.now(),
      }))
    );
  },

  async update(id: number, updates: Partial<RewardRule>): Promise<number> {
    return db.rules.update(id, {
      ...updates,
      timestamp: Date.now(),
    });
  },

  async delete(id: number): Promise<void> {
    return db.rules.delete(id);
  },

  async getByBusinessId(businessId: string): Promise<RewardRule[]> {
    return db.rules.where('businessId').equals(businessId).toArray();
  },

  async getByBusinessAndEvent(businessId: string, eventType: string): Promise<RewardRule[]> {
    return db.rules.where('businessId').equals(businessId).and((rule) => rule.eventType === eventType).toArray();
  },

  async getActive(): Promise<RewardRule[]> {
    return db.rules.filter((rule) => !!rule.isActive).toArray();
  },

  async getAll(): Promise<RewardRule[]> {
    return db.rules.toArray();
  },

  async clear(): Promise<void> {
    return db.rules.clear();
  },

  /**
   * Search with pagination
   */
  async search(
    filters: { businessId?: string; eventType?: string; isActive?: boolean },
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ data: RewardRule[]; total: number }> {
    let query = db.rules.toCollection();

    if (filters.businessId) {
      query = query.filter((rule) => rule.businessId === filters.businessId);
    }
    if (filters.eventType) {
      query = query.filter((rule) => rule.eventType === filters.eventType);
    }
    if (filters.isActive !== undefined) {
      query = query.filter((rule) => rule.isActive === filters.isActive);
    }

    const total = await query.count();
    const data = await query
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    return { data, total };
  },
};

/**
 * Transactions storage operations
 */
export const transactionsDB = {
  async add(transaction: Transaction): Promise<number> {
    return db.transactions.add({
      ...transaction,
      timestamp: Date.now(),
    });
  },

  async addBulk(transactions: Transaction[]): Promise<void> {
    return db.transactions.bulkAdd(
      transactions.map((t) => ({
        ...t,
        timestamp: Date.now(),
      }))
    );
  },

  async update(id: number, updates: Partial<Transaction>): Promise<number> {
    return db.transactions.update(id, {
      ...updates,
      timestamp: Date.now(),
    });
  },

  async getByUserId(userId: string): Promise<Transaction[]> {
    return db.transactions.where('userId').equals(userId).toArray();
  },

  async getByBusinessId(businessId: string): Promise<Transaction[]> {
    return db.transactions.where('businessId').equals(businessId).toArray();
  },

  async getByUserAndBusiness(userId: string, businessId: string): Promise<Transaction[]> {
    return db.transactions
      .where('userId')
      .equals(userId)
      .and((t) => t.businessId === businessId)
      .toArray();
  },

  async getAll(): Promise<Transaction[]> {
    return db.transactions.toArray();
  },

  async clear(): Promise<void> {
    return db.transactions.clear();
  },

  /**
   * Search with pagination
   */
  async search(
    filters: { userId?: string; businessId?: string; status?: string },
    page: number = 1,
    pageSize: number = 50
  ): Promise<{ data: Transaction[]; total: number }> {
    let query = db.transactions.toCollection();

    if (filters.userId) {
      query = query.filter((t) => t.userId === filters.userId);
    }
    if (filters.businessId) {
      query = query.filter((t) => t.businessId === filters.businessId);
    }
    if (filters.status) {
      query = query.filter((t) => t.status === filters.status);
    }

    const total = await query.count();
    const data = await query
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .reverse()
      .toArray(); // Most recent first

    return { data, total };
  },
};

/**
 * Wallets storage operations
 */
export const walletsDB = {
  async add(wallet: Wallet): Promise<number> {
    return db.wallets.add({
      ...wallet,
      timestamp: Date.now(),
    });
  },

  async update(id: number, updates: Partial<Wallet>): Promise<number> {
    return db.wallets.update(id, {
      ...updates,
      timestamp: Date.now(),
    });
  },

  async getByUserAndBusiness(userId: string, businessId: string): Promise<Wallet | undefined> {
    return db.wallets
      .where('userId')
      .equals(userId)
      .and((w) => w.businessId === businessId)
      .first();
  },

  async getByUserId(userId: string): Promise<Wallet[]> {
    return db.wallets.where('userId').equals(userId).toArray();
  },

  async getAll(): Promise<Wallet[]> {
    return db.wallets.toArray();
  },

  async clear(): Promise<void> {
    return db.wallets.clear();
  },
};

/**
 * Cleanup old cache entries
 */
export const cleanupOldCache = async (maxAgeMs: number = 24 * 60 * 60 * 1000) => {
  const cutoff = Date.now() - maxAgeMs;

  await db.rules.where('timestamp').below(cutoff).delete();
  await db.transactions.where('timestamp').below(cutoff).delete();
  await db.wallets.where('timestamp').below(cutoff).delete();
};
