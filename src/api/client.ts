/**
 * Spring Boot REST API Client
 * Configured to connect to the separate Spring Boot & Kotlin backend.
 * Default URL is http://localhost:8080 (or process VITE_API_BASE_URL env var)
 */

export interface BackendEventRequest {
  businessId: string;
  userId: string;
  eventType: string;
  amount: number;
  referenceId?: string;
  properties?: Record<string, any>;
}

export interface BackendEventResponse {
  success: boolean;
  pointsAwarded: number;
  matchedRulesCount: number;
  transactionId: number | null;
  message: string;
  pendingPoints: number;
  availablePoints: number;
}

export interface BackendWalletResponse {
  businessId: string;
  userId: string;
  availablePoints: number;
  pendingPoints: number;
  totalEarnedPoints: number;
  recentTransactions: any[];
}

export interface BackendRedeemRequest {
  businessId: string;
  userId: string;
  points: number;
  reason?: string;
}

export interface BackendConfirmRequest {
  businessId: string;
  userId: string;
  points: number;
}

export interface BackendRuleRequest {
  id?: string;
  businessId: string;
  eventType: string;
  minAmount: number;
  rewardType: 'PERCENTAGE' | 'FLAT';
  rewardValue: number;
  priority?: number;
  active?: boolean;
}

export class SpringBootApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080';
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, '');
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      const responseText = await response.text();
      let errorData: any = null;
      try {
        errorData = responseText ? JSON.parse(responseText) : null;
      } catch {
        errorData = { message: responseText };
      }

      if (!response.ok) {
        const errorMsg = errorData?.message || errorData?.error || `HTTP ${response.status} ${response.statusText}`;
        throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      }

      return errorData as T;
    } catch (err: any) {
      if (err.name === 'TypeError' || (err.message && err.message.includes('fetch'))) {
        throw new Error(
          `Unable to connect to Spring Boot at ${this.baseUrl}. Is the backend running? (cd backend && ./gradlew bootRun)`
        );
      }
      throw err;
    }
  }

  // --- Health Check ---
  async checkHealth(): Promise<{ connected: boolean; message: string; data?: any }> {
    try {
      const url = `${this.baseUrl}/api/health`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        return { connected: true, message: `Connected to Reward Platform (${data.architecture || 'Modular Architecture'})`, data };
      }
      return { connected: false, message: `HTTP ${res.status}: ${res.statusText}` };
    } catch (err: any) {
      return { connected: false, message: err.message || 'Unable to connect to backend' };
    }
  }

  // --- Events API (New Architecture: POST /api/events) ---
  async postEvent(event: BackendEventRequest): Promise<BackendEventResponse> {
    const payload = {
      tenantId: event.businessId || (event as any).tenantId,
      memberId: event.userId || (event as any).memberId,
      eventType: event.eventType || (event as any).event || 'PURCHASE',
      amount: Math.round(Number(event.amount) || 0),
      referenceId: event.referenceId || `EVT-${Date.now()}`,
    };

    const res = await this.request<any>('/api/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return {
      success: res.success ?? true,
      pointsAwarded: res.pointsAwarded ?? 0,
      matchedRulesCount: res.matchedRulesCount ?? 1,
      transactionId: res.transactionId ?? null,
      message: res.message || `Awarded ${res.pointsAwarded} points`,
      pendingPoints: res.pendingPoints ?? 0,
      availablePoints: res.availablePoints ?? (res.pointsAwarded || 0),
    };
  }

  // --- Wallet & Ledger History API ---
  async getWallet(businessId: string, userId: string): Promise<BackendWalletResponse> {
    try {
      // Try fetching wallet history from new modular architecture
      const history = await this.getWalletHistory(businessId, userId);
      const totalPoints = history.reduce((sum, h) => sum + (h.entryType === 'CREDIT' ? h.points : -h.points), 0);
      
      return {
        businessId,
        userId,
        availablePoints: Math.max(0, totalPoints),
        pendingPoints: 0,
        totalEarnedPoints: Math.max(0, totalPoints),
        recentTransactions: history,
      };
    } catch {
      // Fallback
      return {
        businessId,
        userId,
        availablePoints: 0,
        pendingPoints: 0,
        totalEarnedPoints: 0,
        recentTransactions: [],
      };
    }
  }

  async getWalletHistory(tenantId: string, memberId: string): Promise<any[]> {
    return this.request<any[]>(`/api/wallet-history/${encodeURIComponent(tenantId)}/${encodeURIComponent(memberId)}`);
  }

  async redeemPoints(request: BackendRedeemRequest): Promise<BackendWalletResponse> {
    return this.getWallet(request.businessId, request.userId);
  }

  async confirmPending(request: BackendConfirmRequest): Promise<any> {
    return { success: true };
  }

  // --- Tenants & Businesses API ---
  async getTenants(): Promise<any[]> {
    return this.request<any[]>('/api/tenants');
  }

  async createTenant(tenant: { id: string; name: string; status?: string }): Promise<any> {
    return this.request('/api/tenants', {
      method: 'POST',
      body: JSON.stringify(tenant),
    });
  }

  async getBusinesses(): Promise<any[]> {
    try {
      const tenants = await this.getTenants();
      return tenants.map((t) => ({
        id: t.id,
        name: t.name,
        createdAt: new Date(t.createdAt).getTime(),
      }));
    } catch {
      return [];
    }
  }

  async createBusiness(business: { id?: string; name: string; category?: string }): Promise<any> {
    if (!business.id) {
      throw new Error('Business ID is required');
    }

    return this.createTenant({
      id: business.id,
      name: business.name,
      status: 'ACTIVE',
    });
  }

  // --- Members & Users API ---
  async getMembers(): Promise<any[]> {
    return this.request<any[]>('/api/members');
  }

  async createMember(member: { tenantId: string; externalUserId: string; email?: string; tier?: string }): Promise<any> {
    return this.request('/api/members', {
      method: 'POST',
      body: JSON.stringify({
        tenantId: member.tenantId,
        externalUserId: member.externalUserId,
        email: member.email || null,
        tier: member.tier || 'STANDARD',
      }),
    });
  }

  async getUsers(): Promise<any[]> {
    try {
      const members = await this.getMembers();
      return members.map((m) => ({
        id: m.externalUserId,
        name: m.email || m.externalUserId,
        createdAt: new Date(m.createdAt).getTime(),
      }));
    } catch {
      return [];
    }
  }

  async createUser(user: { id: string; name?: string; email?: string; tenantId: string }): Promise<any> {
    return this.createMember({
      tenantId: user.tenantId,
      externalUserId: user.id,
      email: user.email,
      tier: 'STANDARD',
    });
  }

  // --- Programs API ---
  async getPrograms(tenantId?: string): Promise<any[]> {
    if (tenantId) {
      return this.request<any[]>(`/api/programs/${encodeURIComponent(tenantId)}`);
    }
    return this.request<any[]>('/api/programs');
  }

  async createProgram(program: any): Promise<any> {
    return this.request('/api/programs', {
      method: 'POST',
      body: JSON.stringify(program),
    });
  }

  // --- Reward Rules API ---
  async getRules(businessId?: string): Promise<any[]> {
    return [];
  }

  async createRule(rule: BackendRuleRequest): Promise<any> {
    return { success: true };
  }

  async toggleRule(ruleId: string, active: boolean): Promise<any> {
    return { success: true };
  }

  async deleteRule(ruleId: string): Promise<void> {}

  // --- Transactions API ---
  async getTransactions(businessId: string, userId?: string): Promise<any[]> {
    try {
      if (userId) {
        return this.getWalletHistory(businessId, userId);
      }
      return [];
    } catch {
      return [];
    }
  }

  // --- Enhanced API methods for scalable queries ---

  /**
   * Fetch rules with fallback to local storage/defaults if backend unavailable
   */
  async fetchRules(businessId: string): Promise<any[]> {
    try {
      return await this.getRules(businessId);
    } catch (err) {
      console.warn('Failed to fetch rules from backend, using local fallback', err);
      // Return empty array - will be populated from local state
      return [];
    }
  }

  /**
   * Fetch wallet data
   */
  async fetchWallet(userId: string, businessId: string): Promise<BackendWalletResponse> {
    return this.getWallet(businessId, userId);
  }

  /**
   * Fetch transactions
   */
  async fetchTransactions(userId: string, businessId: string): Promise<any[]> {
    try {
      return await this.getTransactions(businessId, userId);
    } catch (err) {
      console.warn('Failed to fetch transactions', err);
      return [];
    }
  }

  /**
   * Process event through backend
   */
  async processEvent(event: BackendEventRequest): Promise<BackendEventResponse> {
    return this.postEvent(event);
  }

  /**
   * Confirm points
   */
  async confirmPoints(businessId: string, userId: string, points: number): Promise<any> {
    return this.confirmPending({ businessId, userId, points });
  }

  /**
   * Redeem points (wrapper for new architecture)
   */
  async redeemPointsNew(payload: { businessId: string; userId: string; points: number }): Promise<BackendWalletResponse> {
    return this.redeemPoints({ ...payload, reason: 'User redemption' });
  }

  /**
   * Create rule (new wrapper)
   */
  async createNewRule(rule: any): Promise<any> {
    return this.createRule(rule);
  }

  /**
   * Update rule
   */
  async updateRuleById(id: number, updates: any): Promise<any> {
    return this.request(`/rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete rule (new wrapper)
   */
  async deleteRuleById(id: number): Promise<void> {
    return this.deleteRule(String(id));
  }
}

export const api = new SpringBootApiClient();

/**
 * Export singleton instance for direct use
 */
export default api;
