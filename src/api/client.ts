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

class SpringBootApiClient {
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
  async checkHealth(): Promise<{ connected: boolean; message: string }> {
    try {
      // Test wallet endpoint directly with fetch to verify connectivity
      const url = `${this.baseUrl}/wallet/taj/user123`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok || res.status < 500) {
        return { connected: true, message: `Connected to Spring Boot at ${this.baseUrl}` };
      }
      return { connected: false, message: `HTTP ${res.status}: ${res.statusText}` };
    } catch (err: any) {
      return { connected: false, message: err.message || 'Unable to connect to backend' };
    }
  }

  // --- Events API ---
  async postEvent(event: BackendEventRequest): Promise<BackendEventResponse> {
    return this.request<BackendEventResponse>('/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  // --- Wallet API ---
  async getWallet(businessId: string, userId: string): Promise<BackendWalletResponse> {
    return this.request<BackendWalletResponse>(`/wallet/${encodeURIComponent(businessId)}/${encodeURIComponent(userId)}`);
  }

  async redeemPoints(request: BackendRedeemRequest): Promise<BackendWalletResponse> {
    return this.request<BackendWalletResponse>('/wallet/redeem', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async confirmPending(request: BackendConfirmRequest): Promise<any> {
    return this.request('/wallet/confirm', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // --- Reward Rules API ---
  async getRules(businessId?: string): Promise<any[]> {
    const query = businessId ? `?businessId=${encodeURIComponent(businessId)}` : '';
    return this.request(`/rules${query}`);
  }

  async createRule(rule: BackendRuleRequest): Promise<any> {
    return this.request('/rules', {
      method: 'POST',
      body: JSON.stringify(rule),
    });
  }

  async toggleRule(ruleId: string, active: boolean): Promise<any> {
    return this.request(`/rules/${encodeURIComponent(ruleId)}/toggle?active=${active}`, {
      method: 'PATCH',
    });
  }

  async deleteRule(ruleId: string): Promise<void> {
    const url = `${this.baseUrl}/rules/${encodeURIComponent(ruleId)}`;
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) {
      throw new Error(`Failed to delete rule (${res.status})`);
    }
  }

  // --- Businesses & Users API ---
  async getBusinesses(): Promise<any[]> {
    return this.request('/businesses');
  }

  async createBusiness(business: { id: string; name: string; category?: string }): Promise<any> {
    return this.request('/businesses', {
      method: 'POST',
      body: JSON.stringify(business),
    });
  }

  async getUsers(): Promise<any[]> {
    return this.request('/users');
  }

  async createUser(user: { id: string; name: string; email: string }): Promise<any> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  // --- Transactions API ---
  async getTransactions(businessId: string, userId?: string): Promise<any[]> {
    if (userId) {
      return this.request(`/transactions/${encodeURIComponent(businessId)}/${encodeURIComponent(userId)}`);
    }
    return this.request(`/transactions/${encodeURIComponent(businessId)}`);
  }
}

export const api = new SpringBootApiClient();
