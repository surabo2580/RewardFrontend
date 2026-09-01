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
  id: number;
  name: string;
  slug: string | null;
  baseUrl: string | null;
  schemaName: string | null;
  adminEmail: string | null;
  status: string;
  createdAt?: string;
}

export interface ProgramDto {
  id: number;
  tenantId: number;
  name: string;
  currency: string;
  timezone?: string;
  status?: string;
  earningRate: number;
  redemptionRate: number;
}

export interface BranchDto {
  id: number;
  tenantId: number;
  parentBranchId: number | null;
  code: string;
  name: string;
  city?: string;
  status?: string;
}

export interface RuleDto {
  id?: number;
  tenantId: number;
  branchId?: number | null;
  programId: number;
  sponsorId?: number | null;
  locationId?: number | null;
  scope: 'PROGRAM' | 'SPONSOR' | 'LOCATION';
  name: string;
  eventType: string;
  rewardType: 'PERCENTAGE' | 'FLAT';
  rewardValue: number;
  isActive: boolean;
  priority: number;
}

export interface SponsorDto {
  id: number;
  tenantId: number;
  programId: number;
  parentSponsorId: number | null;
  name: string;
  sponsorCode: string;
  sponsorType: 'HOST' | 'CHILD' | 'PARTNER';
  status: string;
}

export interface SponsorLocationDto {
  id: number;
  tenantId: number;
  sponsorId: number;
  locationName: string;
  locationCode: string;
  locationPin: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status: string;
}

export interface PartnerMembershipDto {
  id: number;
  tenantId: number;
  sponsorId: number;
  externalMembershipId: string;
  memberId: number;
  status: string;
  createdAt?: string;
}

export interface ReconciliationBatchDto {
  id: number;
  tenantId: number;
  sponsorId: number;
  periodStart: string;
  periodEnd: string;
  pointCost: number;
  totalPoints: number;
  totalAmount: number;
  lineCount: number;
  status: string;
  createdAt?: string;
}

export interface ReconciliationLineDto {
  id: number;
  batchId: number;
  tenantId: number;
  sponsorId: number;
  transactionId: number;
  memberId: number;
  points: number;
  pointCost: number;
  amount: number;
  createdAt?: string;
}

export interface ReconciliationRunDto {
  batch: ReconciliationBatchDto;
  lines: ReconciliationLineDto[];
}

export interface MemberDto {
  id?: number;
  tenantId: number;
  externalUserId: string;
  email?: string | null;
  tier?: string;
  createdAt?: string;
}

export interface EventRequest {
  tenantId: number;
  programId: number;
  sponsorId?: number;
  sponsorCode?: string;
  locationId?: number;
  locationCode?: string;
  branchCode?: string;
  memberId?: string;
  externalMembershipId?: string;
  eventType: string;
  amount: number;
  referenceId?: string;
  channel?: string;
}

export interface EventResponse {
  success: boolean;
  pointsAwarded: number;
  message: string;
}

export interface ProvisioningResponse {
  tenant: TenantDto;
  program: ProgramDto;
  hostSponsor?: SponsorDto;
  tiers: Array<{ id: number; name: string }>;
  apiKey: string;
}

const numericId = (value: string | number): number => Number(value);

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
    localStorage.setItem('tenantId', String(response.tenant.id));
    localStorage.setItem('programId', String(response.program.id));
    if (response.hostSponsor) localStorage.setItem('sponsorId', String(response.hostSponsor.id));

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

  async getPrograms(tenantId: number): Promise<ProgramDto[]> {
    return apiFetch<ProgramDto[]>(`/api/programs/${encodeURIComponent(tenantId)}`, { method: 'GET' });
  }

  async createProgram(payload: ProgramDto): Promise<ProgramDto> {
    return apiFetch<ProgramDto>('/api/programs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getBranches(tenantId: number): Promise<BranchDto[]> {
    return apiFetch<BranchDto[]>(`/api/branches?tenantId=${encodeURIComponent(tenantId)}`, { method: 'GET' });
  }

  async getSponsors(tenantId: number, programId: number): Promise<SponsorDto[]> {
    return apiFetch<SponsorDto[]>(`/api/sponsors?tenantId=${tenantId}&programId=${programId}`, { method: 'GET' });
  }

  async createSponsor(payload: {
    tenantId: number;
    programId: number;
    parentSponsorId?: number | null;
    name: string;
    sponsorCode: string;
    sponsorType?: 'HOST' | 'CHILD' | 'PARTNER';
    status?: string;
  }): Promise<SponsorDto> {
    return apiFetch<SponsorDto>('/api/sponsors', { method: 'POST', body: JSON.stringify(payload) });
  }

  async getLocations(tenantId: number, sponsorId: number): Promise<SponsorLocationDto[]> {
    return apiFetch<SponsorLocationDto[]>(`/api/sponsors/${sponsorId}/locations?tenantId=${tenantId}`, { method: 'GET' });
  }

  async createLocation(payload: {
    tenantId: number;
    sponsorId: number;
    locationName: string;
    locationCode: string;
    locationPin?: string;
    address?: string;
    status?: string;
  }): Promise<SponsorLocationDto> {
    return apiFetch<SponsorLocationDto>(`/api/sponsors/${payload.sponsorId}/locations`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async createBranch(payload: {
    tenantId: number;
    parentBranchId?: number | null;
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

  async getRules(tenantId: number, eventType?: string): Promise<RuleDto[]> {
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

  async getMembers(tenantId?: number): Promise<MemberDto[]> {
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

  async createUser(payload: { id: string; tenantId: number; email?: string; name?: string }): Promise<MemberDto> {
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

  async createPartnerMembership(payload: {
    tenantId: number;
    sponsorId: number;
    externalMembershipId: string;
    memberId: string;
    status?: string;
  }): Promise<PartnerMembershipDto> {
    return apiFetch<PartnerMembershipDto>('/api/partner-memberships', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getPartnerMemberships(tenantId: number, sponsorId: number): Promise<PartnerMembershipDto[]> {
    return apiFetch<PartnerMembershipDto[]>(`/api/partner-memberships?tenantId=${tenantId}&sponsorId=${sponsorId}`, {
      method: 'GET',
    });
  }

  async createReconciliationBatch(payload: {
    tenantId: number;
    sponsorId: number;
    periodStart: string;
    periodEnd: string;
    pointCost: number;
  }): Promise<ReconciliationRunDto> {
    return apiFetch<ReconciliationRunDto>('/api/reconciliation/batches', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getReconciliationBatches(tenantId: number): Promise<ReconciliationBatchDto[]> {
    return apiFetch<ReconciliationBatchDto[]>(`/api/reconciliation/batches?tenantId=${tenantId}`, {
      method: 'GET',
    });
  }

  async getReconciliationLines(tenantId: number, batchId: number): Promise<ReconciliationLineDto[]> {
    return apiFetch<ReconciliationLineDto[]>(`/api/reconciliation/batches/${batchId}/lines?tenantId=${tenantId}`, {
      method: 'GET',
    });
  }

  async getWallet(businessId: number, userId: string): Promise<{ businessId: string; userId: string; availablePoints: number; pendingPoints: number; totalEarnedPoints: number; recentTransactions: any[] }> {
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

  async getWalletHistory(tenantId: number, memberId: string): Promise<any[]> {
    return apiFetch<any[]>(`/api/wallet-history/${encodeURIComponent(tenantId)}/${encodeURIComponent(memberId)}`, {
      method: 'GET',
    });
  }
}

export const api = new SpringBootApiClient();
export default api;
