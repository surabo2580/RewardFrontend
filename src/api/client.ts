export const API_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080';
let apiBaseUrl = API_URL;

export interface ProvisionTenantRequest {
  name: string;
  slug: string;
  adminEmail: string;
  programName: string;
  currency: string;
  earningRate: number;
  redemptionRate: number;
}

export interface TenantDto {
  id: string;
  name: string;
  slug: string | null;
  baseUrl: string | null;
  schemaName: string | null;
  adminEmail: string | null;
  status: string;
  createdAt?: string;
}

export interface ProgramDto {
  id: string;
  tenantId: string;
  name: string;
  currency: string;
  timezone?: string;
  status?: string;
  earningRate: number;
  redemptionRate: number;
}

export interface BranchDto {
  id: string;
  tenantId: string;
  parentBranchId: string | null;
  code: string;
  name: string;
  city?: string;
  status?: string;
}

export interface RuleDto {
  id?: string;
  tenantId: string;
  branchId?: string | null;
  programId: string;
  name: string;
  eventType: string;
  rewardType: 'PERCENTAGE' | 'FLAT';
  rewardValue: number;
  isActive: boolean;
}

export interface MemberDto {
  id?: string;
  tenantId: string;
  externalUserId: string;
  email?: string | null;
  tier?: string;
  createdAt?: string;
}

export interface EventRequest {
  tenantId: string;
  branchCode: string;
  memberId: string;
  eventType: string;
  amount: number;
  referenceId?: string;
}

export interface EventResponse {
  success: boolean;
  pointsAwarded: number;
  message: string;
}

export interface ProvisioningResponse {
  tenant: TenantDto;
  program: ProgramDto;
  tiers: Array<{ id: string; name: string }>;
  apiKey: string;
}

function getStoredApiKey(): string {
  return localStorage.getItem('tenantApiKey') || '';
}

async function apiFetch<T>(path: string, options: RequestInit = {}, includeApiKey = true): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (includeApiKey) {
    const apiKey = getStoredApiKey();
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || data?.error || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

export class SpringBootApiClient {
  getBaseUrl(): string {
    return apiBaseUrl;
  }

  setBaseUrl(url: string): void {
    apiBaseUrl = url.replace(/\/$/, '');
  }

  getApiKey(): string {
    return getStoredApiKey();
  }

  setApiKey(apiKey: string): void {
    localStorage.setItem('tenantApiKey', apiKey);
  }

  clearApiKey(): void {
    localStorage.removeItem('tenantApiKey');
  }

  async checkHealth(): Promise<{ connected: boolean; message: string; data?: any }> {
    try {
      const data = await apiFetch<any>('/api/health', { method: 'GET' }, false);
      return {
        connected: true,
        message: 'Connected to backend',
        data,
      };
    } catch (error: any) {
      return {
        connected: false,
        message: error?.message || 'Unable to connect to backend',
      };
    }
  }

  async provisionTenant(payload: ProvisionTenantRequest): Promise<ProvisioningResponse> {
    const response = await apiFetch<ProvisioningResponse>(
      '/api/provisioning/tenants',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      false
    );

    localStorage.setItem('tenantApiKey', response.apiKey);
    localStorage.setItem('tenantId', response.tenant.id);
    localStorage.setItem('programId', response.program.id);

    return response;
  }

  async getTenants(): Promise<TenantDto[]> {
    return apiFetch<TenantDto[]>('/api/tenants', { method: 'GET' });
  }

  async getBusinesses(): Promise<Array<{ id: string; name: string; createdAt: number }>> {
    const tenants = await this.getTenants();
    return tenants.map((t) => ({
      id: t.id,
      name: t.name,
      createdAt: t.createdAt ? new Date(t.createdAt).getTime() : Date.now(),
    }));
  }

  async getPrograms(tenantId: string): Promise<ProgramDto[]> {
    return apiFetch<ProgramDto[]>(`/api/programs/${encodeURIComponent(tenantId)}`, { method: 'GET' });
  }

  async createProgram(payload: ProgramDto): Promise<ProgramDto> {
    return apiFetch<ProgramDto>('/api/programs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getBranches(tenantId: string): Promise<BranchDto[]> {
    return apiFetch<BranchDto[]>(`/api/branches?tenantId=${encodeURIComponent(tenantId)}`, { method: 'GET' });
  }

  async createBranch(payload: {
    tenantId: string;
    parentBranchId?: string | null;
    code: string;
    name: string;
    city?: string;
    status?: string;
  }): Promise<BranchDto> {
    return apiFetch<BranchDto>('/api/branches', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getRules(tenantId: string, eventType?: string): Promise<RuleDto[]> {
    const qs = new URLSearchParams({ tenantId });
    if (eventType) {
      qs.set('eventType', eventType);
    }
    return apiFetch<RuleDto[]>(`/api/rules?${qs.toString()}`, { method: 'GET' });
  }

  async createRule(payload: RuleDto): Promise<RuleDto> {
    return apiFetch<RuleDto>('/api/rules', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getMembers(tenantId?: string): Promise<MemberDto[]> {
    if (!tenantId) {
      return apiFetch<MemberDto[]>('/api/members', { method: 'GET' });
    }
    return apiFetch<MemberDto[]>(`/api/members?tenantId=${encodeURIComponent(tenantId)}`, { method: 'GET' });
  }

  async getUsers(tenantId?: string): Promise<Array<{ id: string; name: string; createdAt: number }>> {
    const members = await this.getMembers(tenantId);
    return members.map((m) => ({
      id: m.externalUserId,
      name: m.email || m.externalUserId,
      createdAt: m.createdAt ? new Date(m.createdAt).getTime() : Date.now(),
    }));
  }

  async createMember(payload: MemberDto): Promise<MemberDto> {
    return apiFetch<MemberDto>('/api/members', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async createUser(payload: { id: string; tenantId: string; email?: string; name?: string }): Promise<MemberDto> {
    return this.createMember({
      tenantId: payload.tenantId,
      externalUserId: payload.id,
      email: payload.email || payload.name || null,
      tier: 'SILVER',
    });
  }

  async createBusiness(payload: { id?: string; name: string; category?: string }): Promise<any> {
    const slugBase = (payload.id || payload.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return this.provisionTenant({
      name: payload.name,
      slug: slugBase,
      adminEmail: `admin@${slugBase || 'tenant'}.com`,
      programName: `${payload.name} Rewards`,
      currency: 'INR',
      earningRate: 10,
      redemptionRate: 1,
    });
  }

  async postEvent(payload: EventRequest): Promise<EventResponse> {
    return apiFetch<EventResponse>('/api/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getWallet(businessId: string, userId: string): Promise<{ businessId: string; userId: string; availablePoints: number; pendingPoints: number; totalEarnedPoints: number; recentTransactions: any[] }> {
    const history = await this.getWalletHistory(businessId, userId);
    const availablePoints = history.reduce((sum, item) => {
      const points = Number(item.points || 0);
      return item.entryType === 'DEBIT' ? sum - points : sum + points;
    }, 0);

    return {
      businessId,
      userId,
      availablePoints: Math.max(0, availablePoints),
      pendingPoints: 0,
      totalEarnedPoints: Math.max(0, availablePoints),
      recentTransactions: history,
    };
  }

  async getWalletHistory(tenantId: string, memberId: string): Promise<any[]> {
    return apiFetch<any[]>(`/api/wallet-history/${encodeURIComponent(tenantId)}/${encodeURIComponent(memberId)}`, {
      method: 'GET',
    });
  }
}

export const api = new SpringBootApiClient();
export default api;
