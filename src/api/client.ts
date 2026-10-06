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
  sponsorId?: number | null;
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
  redemptionEarnRate?: number | null;
  recognitionEarnRate?: number | null;
  isActive: boolean;
  priority: number;
  validFrom?: string | null;
  validUntil?: string | null;
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

export interface BitTypeOption {
  type: string;
  label: string;
  category: string;
}

export interface BitDto {
  id: number;
  bitReference: string;
  bitType: string;
  bitTypeLabel: string;
  bitCategory: string;
  status: string;
  errorCode: string | null;
  errorMessage: string | null;
  memberId: number;
  programId: number | null;
  bitSponsorId: number | null;
  bitSponsorName: string | null;
  billingSponsorId: number | null;
  billingSponsorName: string | null;
  locationId: number | null;
  branchId: number | null;
  channel: string;
  bitSource: string | null;
  grossAmount: number;
  discountAmount: number;
  netAmount: number;
  currency: string | null;
  redemptionPointsDelta: number;
  recognitionPointsDelta: number;
  appliedPolicyId: number | null;
  appliedOfferIds: number[];
  originalBitId: number | null;
  description: string | null;
  payload: Record<string, unknown> | null;
  createdByUserId: number | null;
  interactionAt: string;
  createdAt: string;
}

export interface BitListRowDto {
  bitId: number;
  bitReference: string;
  interactionDate: string;
  sponsorName: string | null;
  memberCode: string;
  bitCategory: string;
  bitType: string;
  bitTypeLabel: string;
  offerName: string | null;
  pointsDelta: number | null;
  redemptionPoints: number;
  recognitionPoints: number;
  rewardsEarned: number;
  rewardsAvailed: number | null;
  status: string;
  errorCode: string | null;
  errorMessage: string | null;
  source: string;
}

export interface BitPageDto {
  items: BitListRowDto[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface BitLedgerEntryDto {
  transactionId: number;
  transactionType: string;
  points: number;
  recognitionPoints: number;
  status: string;
  createdAt: string;
}

export interface BitDetailDto {
  bit: BitDto;
  ledger: BitLedgerEntryDto[];
  reversals: BitDto[];
  offers: Array<{ id: number; offerCode: string; name: string; category: string }>;
  vouchers: Array<{ id: number; offerId: number; voucherCode: string; status: string; expiresAt: string | null }>;
}

export interface MemberDto {
  id?: number;
  tenantId: number;
  externalUserId: string;
  email?: string | null;
  tier?: string;
  createdAt?: string;
}

export interface MemberSearchResult {
  id: number;
  externalUserId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  tier: string;
  status: string;
  accountBalance: number;
}

export interface MemberProfile {
  id: number;
  tenantId: number;
  externalUserId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  alternatePhone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  nationality: string | null;
  preferredLanguage: string | null;
  enrollingSponsorId: number | null;
  enrollingSponsorName: string | null;
  tier: string;
  status: string;
  createdAt: string;
}

export type MemberProfileUpdate = Partial<Omit<MemberProfile, 'id' | 'tenantId' | 'externalUserId' | 'enrollingSponsorName' | 'tier' | 'createdAt'>>;

export interface TierSummary {
  tierName: string;
  tierRank: number;
  multiplier: number;
  thresholdPoints: number;
  nextTierName: string | null;
  nextTierThreshold: number | null;
  pointsToNextTier: number | null;
  progressPercent: number;
}

export interface MemberBalances {
  spendablePoints: number;
  pendingPoints: number;
  redeemedPoints: number;
  lifetimeEarnedPoints: number;
  recognitionPoints: number;
  lifetimeRecognitionPoints: number;
  pointsExpiringSoon: number;
  expiryWarningDays: number;
  nextExpiryDate: string | null;
}

export interface ServiceTicket {
  id: number;
  memberId: number;
  ticketReference: string;
  category: string;
  priority: string;
  status: string;
  subject: string;
  description: string | null;
  isHotnote: boolean;
  createdByUserId: number | null;
  pointsAdjusted: number;
  resolutionNotes: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface Member360 {
  profile: MemberProfile;
  programId: number | null;
  programName: string | null;
  currency: string | null;
  tier: TierSummary;
  balances: MemberBalances;
  counts: {
    transactions: number;
    activeVouchers: number;
    eligibleOffers: number;
    bookings: number;
    openTickets: number;
    linkedMembers: number;
    activeCards: number;
  };
  hotnotes: ServiceTicket[];
}

export interface MemberCentral {
  header: MemberProfile;
  daysSinceLastBit: number | null;
  firstBitAt: string | null;
  lastBitAt: string | null;
  last5Bits: Array<{
    bitId: number;
    sponsorName: string | null;
    bitType: string;
    bitCategory: string;
    interactionAt: string;
    pointsDelta: number | null;
  }>;
  bitSpan: Array<{ date: string; bitCount: number; bitTypes: string[] }>;
  topSponsors: Array<{ sponsorId: number; sponsorName: string; bitCount: number; totalAmount: number; points: number }>;
  privilegesOverview: {
    currentTier: string;
    eligibleCount: number;
    claimedCount: number;
    eligiblePrivileges: MemberOffer[];
  };
}

export interface PointLot {
  id: number;
  accountType: string;
  entryType: string;
  points: number;
  remainingPoints: number;
  description: string | null;
  createdAt: string;
  expiresAt: string | null;
  expiredAt: string | null;
  lotStatus: 'ACTIVE' | 'EXPIRED' | 'CONSUMED' | 'DEBIT';
}

export interface MemberTransaction {
  id: number;
  transactionType: string;
  eventType: string;
  status: string;
  amount: number;
  points: number;
  recognitionPoints: number;
  offerBonusPoints: number;
  offerMultiplier: number | null;
  discountAmount: number | null;
  sponsorId: number | null;
  sponsorName: string | null;
  locationId: number | null;
  referenceId: string | null;
  channel: string;
  policyScope: string | null;
  originalTransactionId: number | null;
  createdAt: string;
}

export interface MemberVoucher {
  id: number;
  voucherCode: string;
  offerId: number;
  offerName: string | null;
  offerCategory: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  referenceId: string | null;
  status: 'ACTIVE' | 'EXPIRED';
}

export interface MemberOffer {
  id: number;
  offerCode: string;
  name: string;
  description: string | null;
  category: string;
  offerType: string;
  status: string;
  isMto: boolean;
  isTargeted: boolean;
  multiplier: number;
  bonusPoints: number;
  pointsRequired: number;
  minTierRank: number;
  maxUsesPerMember: number | null;
  usesByMember: number;
  startDate: string;
  endDate: string;
  eligible: boolean;
  ineligibleReason: string | null;
}

export interface MemberLink {
  id: number;
  linkSource: 'HOUSEHOLD' | 'PARTNER';
  relationType: string;
  canSharePoints: boolean;
  direction: string;
  memberId: number | null;
  externalUserId: string | null;
  email: string | null;
  tier: string | null;
  sponsorId: number | null;
  sponsorName: string | null;
  status: string;
  createdAt: string;
}

export interface MembershipCard {
  id: number;
  cardNumber: string;
  cardType: string;
  status: string;
  barcodePayload: string;
  issuedAt: string;
  expiresAt: string | null;
}

export interface MemberBooking {
  id: number;
  bookingReference: string;
  sponsorId: number | null;
  sponsorName: string | null;
  locationId: number | null;
  bookingType: string;
  status: string;
  checkInDate: string | null;
  checkOutDate: string | null;
  nights: number | null;
  roomType: string | null;
  roomNumber: string | null;
  totalAmount: number;
  currency: string;
  pointsEarned: number;
  notes: string | null;
  createdAt: string;
}

export interface MemberBookingCreate {
  bookingReference: string;
  sponsorId?: number | null;
  bookingType: string;
  status: string;
  checkInDate?: string | null;
  checkOutDate?: string | null;
  roomType?: string | null;
  roomNumber?: string | null;
  totalAmount: number;
  currency?: string | null;
  notes?: string | null;
}

export interface HotnoteDto {
  ticket: ServiceTicket;
  memberExternalUserId: string | null;
  memberEmail: string | null;
}

export interface MemberKpis {
  lifetimeSpend: number;
  earnTransactions: number;
  averageOrderValue: number;
  lifetimePointsEarned: number;
  lifetimePointsRedeemed: number;
  lifetimePointsExpired: number;
  redemptionRatePercent: number;
  visitsLast90Days: number;
  daysSinceLastActivity: number | null;
  firstActivityAt: string | null;
  lastActivityAt: string | null;
  totalBookings: number;
  completedStays: number;
  totalNights: number;
  bookingRevenue: number;
  offersRedeemed: number;
  openTickets: number;
  tier: TierSummary;
  monthly: Array<{ month: string; spend: number; pointsEarned: number; pointsRedeemed: number; transactions: number }>;
}

export interface PointAdjustmentResult {
  transactionId: number;
  direction: 'CREDIT' | 'DEBIT';
  points: number;
  newBalance: number;
  ticket: ServiceTicket;
}

export interface MemberImportJobDto {
  id: number;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  fileName: string;
  totalRecords: number;
  processedRecords: number;
  importedRecords: number;
  duplicateRecords: number;
  failedRecords: number;
  errorSummary?: string | null;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
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
  recognitionPointsAwarded?: number;
  policyId?: number | null;
  policyScope?: string | null;
  currentTier?: string | null;
  tierUpgraded?: boolean;
  message: string;
}

export interface OfferKpiTarget {
  kpiCode: string;
  targetValue: number;
}

export interface OfferDto {
  id: number;
  tenantId: number;
  programId: number;
  offerCode: string;
  name: string;
  subtitle?: string | null;
  description?: string | null;
  category: 'AWARD' | 'REWARD' | 'PRIVILEGE' | 'DEAL';
  status: 'DRAFT' | 'SCHEDULED' | 'LAUNCHED' | 'PAUSED' | 'EXPIRED' | 'ARCHIVED';
  scope: 'PROGRAM' | 'SPONSOR' | 'LOCATION' | 'PARENT' | 'PARTNER';
  sponsorId?: number | null;
  sponsorIds: number[];
  bitSponsorIds: number[];
  locationId?: number | null;
  locationIds: number[];
  allLocations: boolean;
  billingType: 'BILLING_SPONSOR' | 'BIT_SPONSOR';
  billingSponsorId?: number | null;
  memberVisibility: boolean;
  offerVisibility: 'ON_OFFER_LAUNCH' | 'ON_ACTIVATION' | 'HIDDEN';
  maxRewardLimitPoints?: number | null;
  requiresAcceptance: boolean;
  targetAccount: 'REDEMPTION' | 'RECOGNITION' | 'BOTH';
  fulfillmentType?: string | null;
  kpis: OfferKpiTarget[];
  offerType: 'MULTIPLIER' | 'BONUS_POINTS' | 'HYBRID';
  multiplier: number;
  bonusPoints: number;
  minSpend: number;
  minTierRank: number;
  eligibleDays?: string | null;
  maxUsesPerMember?: number | null;
  maxTotalClaims?: number | null;
  totalClaimsCount: number;
  isMto: boolean;
  isFeatured: boolean;
  targetMemberIds: number[];
  pointsRequired: number;
  benefitCode?: string | null;
  targetTierId?: number | null;
  discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT' | null;
  discountValue?: number | null;
  promoCode?: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export type OfferCreateRequest = Omit<OfferDto, 'id' | 'totalClaimsCount'>;

export interface TierDto {
  id: number;
  tenantId: number;
  programId: number;
  name: string;
  rank: number;
  thresholdPoints: number;
  multiplier: number;
}

export interface OfferSimulationRequest {
  category: OfferDto['category'];
  scope: OfferDto['scope'];
  sponsorId?: number | null;
  bitSponsorIds: number[];
  allLocations: boolean;
  locationIds: number[];
  multiplier: number;
  bonusPoints: number;
  pointsRequired: number;
  discountType?: OfferDto['discountType'];
  discountValue?: number | null;
  minSpend: number;
  minTierRank: number;
  eligibleDays?: string | null;
  maxRewardLimitPoints?: number | null;
  isMto: boolean;
  targetMemberIds: number[];
  startDate: string;
  endDate: string;
  sampleAmount: number;
  sampleTierRank: number;
  sampleSponsorId?: number | null;
  sampleLocationId?: number | null;
  sampleMemberId?: number | null;
  sampleOccurredAt: string;
  basePointsPerUnit: number;
}

export interface OfferSimulationCheck {
  label: string;
  passed: boolean;
  detail: string;
}

export interface OfferSimulationResponse {
  qualifies: boolean;
  checks: OfferSimulationCheck[];
  basePoints: number;
  bonusPoints: number;
  totalPoints: number;
  pointsBurned: number;
  discountAmount: number;
  netPayableAmount: number;
  summary: string;
}

export interface OfferImportSummary {
  imported: number;
  failed: number;
  errors: string[];
}

export interface RedemptionRequest {
  tenantId: number;
  programId: number;
  sponsorId: number;
  locationId?: number;
  memberId: string;
  pointsToRedeem: number;
  referenceId: string;
  channel?: string;
}

export interface RedemptionResponse {
  success: boolean;
  status: 'SUCCESS' | 'ALREADY_PROCESSED' | 'MEMBER_NOT_FOUND' | 'ACCOUNT_NOT_FOUND' | 'INSUFFICIENT_BALANCE';
  transactionId?: number | null;
  pointsRedeemed: number;
  discountAmount: string;
  remainingBalance: number;
  message: string;
}

export interface ProvisioningResponse {
  tenant: TenantDto;
  program: ProgramDto;
  hostSponsor?: SponsorDto;
  tiers: Array<{ id: number; name: string }>;
  apiKey: string;
  systemUser?: {
    email: string;
    username: string;
    temporaryPassword: string;
    role: string;
  };
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface SystemUserProfile {
  userId: number;
  email: string;
  username: string;
  role: string;
  tenantId: number;
  programId: number;
  sponsorId?: number | null;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: SystemUserProfile;
  mustChangePassword: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordResponse {
  message: string;
  resetToken?: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface InviteSystemUserRequest {
  email: string;
  role: string;
  sponsorId?: number;
}

export interface InviteSystemUserResponse {
  userId: number;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  inviteToken: string;
  inviteLink: string;
}

export interface AcceptInviteRequest {
  token: string;
  password: string;
}

export interface SelfServeRegisterRequest {
  businessName: string;
  slug: string;
  adminEmail: string;
  adminPassword: string;
  programName: string;
  currency?: string;
  timezone?: string;
  earningRate?: number;
  redemptionRate?: number;
}

export interface SelfServeRegisterResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: SystemUserProfile;
  tenant: TenantDto;
  program: ProgramDto;
  hostSponsor?: SponsorDto;
  apiKey: string;
  apiKeyHeader: string;
  onboardingType: 'SELF_SERVE';
}

export interface EnterpriseInquiryRequest {
  companyName: string;
  contactName: string;
  contactEmail: string;
  companySize?: string;
  expectedMonthlyMembers?: number;
  expectedMonthlyTransactions?: number;
  notes?: string;
}

export interface EnterpriseInquiryResponse {
  onboardingRequestId: number;
  status: string;
  message: string;
}

function getStoredApiKey(): string {
  return localStorage.getItem('tenantApiKey') || '';
}

function getStoredAccessToken(): string {
  return localStorage.getItem('dashboardAccessToken') || '';
}

function persistSessionToken(response: { accessToken: string; user: SystemUserProfile }): void {
  localStorage.setItem('dashboardAccessToken', response.accessToken);
  localStorage.setItem('tenantId', String(response.user.tenantId));
  localStorage.setItem('programId', String(response.user.programId));
  if (response.user.sponsorId) {
    localStorage.setItem('sponsorId', String(response.user.sponsorId));
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}, includeApiKey = true): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  const accessToken = getStoredAccessToken();
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  if (!accessToken && includeApiKey) {
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
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message = (typeof data === 'object' ? data?.message || data?.error : null) || `HTTP ${response.status}`;
    const error = new Error(message) as Error & {
      status?: number;
      statusText?: string;
      body?: any;
    };
    error.status = response.status;
    error.statusText = response.statusText;
    error.body = data;
    throw error;
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

  getAccessToken(): string {
    return getStoredAccessToken();
  }

  clearAccessToken(): void {
    localStorage.removeItem('dashboardAccessToken');
  }

  async login(payload: LoginRequest): Promise<LoginResponse> {
    const response = await apiFetch<LoginResponse>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      false
    );

    persistSessionToken(response);
    localStorage.setItem('tenantApiKey', response.apiKey);

    return response;
  }

  async changePassword(payload: ChangePasswordRequest): Promise<LoginResponse> {
    const response = await apiFetch<LoginResponse>(
      '/api/auth/change-password',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      false
    );
    persistSessionToken(response);
    return response;
  }

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    return apiFetch<ForgotPasswordResponse>(
      '/api/auth/forgot-password',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      },
      false
    );
  }

  async resetPassword(payload: ResetPasswordRequest): Promise<LoginResponse> {
    const response = await apiFetch<LoginResponse>(
      '/api/auth/reset-password',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      false
    );
    persistSessionToken(response);
    return response;
  }

  async getMe(): Promise<SystemUserProfile> {
    return apiFetch<SystemUserProfile>('/api/auth/me', { method: 'GET' }, false);
  }

  async registerBusinessSelfServe(payload: SelfServeRegisterRequest): Promise<SelfServeRegisterResponse> {
    const response = await apiFetch<SelfServeRegisterResponse>(
      '/api/public/register',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      false
    );

    persistSessionToken(response);
    localStorage.setItem('tenantApiKey', response.apiKey);

    return response;
  }

  async submitEnterpriseInquiry(payload: EnterpriseInquiryRequest): Promise<EnterpriseInquiryResponse> {
    return apiFetch<EnterpriseInquiryResponse>(
      '/api/public/enterprise-inquiries',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      false
    );
  }

  async inviteSystemUser(payload: InviteSystemUserRequest): Promise<InviteSystemUserResponse> {
    return apiFetch<InviteSystemUserResponse>(
      '/api/users/invite',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      false
    );
  }

  async acceptInvite(payload: AcceptInviteRequest): Promise<LoginResponse> {
    const response = await apiFetch<LoginResponse>(
      '/api/users/accept-invite',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      false
    );
    persistSessionToken(response);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' }, false);
    } catch {
      // Keep client logout resilient even if backend session cleanup fails.
    } finally {
      this.clearAccessToken();
    }
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
      id: String(t.id),
      name: t.name,
      createdAt: t.createdAt ? new Date(t.createdAt).getTime() : Date.now(),
    }));
  }

  async getPrograms(tenantId: number): Promise<ProgramDto[]> {
    return apiFetch<ProgramDto[]>(`/api/programs/${encodeURIComponent(tenantId)}`, { method: 'GET' });
  }

  async getBitTypes(): Promise<BitTypeOption[]> {
    return apiFetch<BitTypeOption[]>('/api/bits/types', { method: 'GET' });
  }

  async getBitCategories(): Promise<string[]> {
    return apiFetch<string[]>('/api/bits/categories', { method: 'GET' });
  }

  async getBits(filters: {
    memberId?: number;
    type?: string | string[];
    bitType?: string | string[];
    category?: string | string[];
    sponsorId?: number;
    status?: string | string[];
    source?: string | string[];
    pointsAction?: string | string[];
    from?: string;
    to?: string;
    page?: number;
    size?: number;
  }): Promise<BitPageDto> {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === '') return;
      if (Array.isArray(value)) {
        const joined = value.map(String).map((v) => v.trim()).filter(Boolean).join(',');
        if (!joined) return;
        query.set(key, joined);
        return;
      }
      query.set(key, String(value));
    });
    return apiFetch<BitPageDto>(`/api/bits?${query.toString()}`, { method: 'GET' });
  }

  async getBitDetail(bitId: number): Promise<BitDetailDto> {
    return apiFetch<BitDetailDto>(`/api/bits/${bitId}`, { method: 'GET' });
  }

  async getMemberBits(memberId: number, limit = 100): Promise<BitDto[]> {
    return apiFetch<BitDto[]>(`/api/members/${memberId}/bits?limit=${limit}`, { method: 'GET' });
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

  async getOffers(tenantId: number, programId: number): Promise<OfferDto[]> {
    return apiFetch<OfferDto[]>(`/api/offers?tenantId=${encodeURIComponent(tenantId)}&programId=${encodeURIComponent(programId)}`, { method: 'GET' });
  }

  async createOffer(payload: OfferCreateRequest): Promise<OfferDto> {
    return apiFetch<OfferDto>('/api/offers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async simulateOffer(payload: OfferSimulationRequest): Promise<OfferSimulationResponse> {
    return apiFetch<OfferSimulationResponse>('/api/offers/simulate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getTiers(tenantId: number, programId: number): Promise<TierDto[]> {
    return apiFetch<TierDto[]>(`/api/tiers?tenantId=${encodeURIComponent(tenantId)}&programId=${encodeURIComponent(programId)}`, { method: 'GET' });
  }

  async updateOfferStatus(offerId: number, status: OfferDto['status']): Promise<OfferDto> {
    return apiFetch<OfferDto>(`/api/offers/${encodeURIComponent(offerId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async toggleOfferFeatured(offerId: number): Promise<OfferDto> {
    return apiFetch<OfferDto>(`/api/offers/${encodeURIComponent(offerId)}/featured`, {
      method: 'PATCH',
    });
  }

  async importOfferCampaigns(programId: number, file: File): Promise<OfferImportSummary> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${apiBaseUrl}/api/offers/import-campaigns?programId=${encodeURIComponent(programId)}`, {
      method: 'POST',
      headers: getStoredAccessToken() ? { Authorization: `Bearer ${getStoredAccessToken()}` } : { 'X-API-Key': getStoredApiKey() },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || `HTTP ${response.status}`);
    return data as OfferImportSummary;
  }

  async importOfferVouchers(file: File): Promise<OfferImportSummary> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${apiBaseUrl}/api/offers/import-vouchers`, {
      method: 'POST',
      headers: getStoredAccessToken() ? { Authorization: `Bearer ${getStoredAccessToken()}` } : { 'X-API-Key': getStoredApiKey() },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || `HTTP ${response.status}`);
    return data as OfferImportSummary;
  }

  async getMembers(tenantId?: number): Promise<MemberDto[]> {
    if (!tenantId) {
      return apiFetch<MemberDto[]>('/api/members', { method: 'GET' });
    }
    return apiFetch<MemberDto[]>(`/api/members?tenantId=${encodeURIComponent(tenantId)}`, { method: 'GET' });
  }

  async startMemberImport(file: File): Promise<MemberImportJobDto> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${apiBaseUrl}/api/members/imports`, {
      method: 'POST',
      headers: getStoredAccessToken() ? { Authorization: `Bearer ${getStoredAccessToken()}` } : { 'X-API-Key': getStoredApiKey() },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || `HTTP ${response.status}`);
    return data as MemberImportJobDto;
  }

  async getMemberImportJobs(): Promise<MemberImportJobDto[]> {
    return apiFetch<MemberImportJobDto[]>('/api/members/imports', { method: 'GET' });
  }

  async getMemberImportJob(jobId: number): Promise<MemberImportJobDto> {
    return apiFetch<MemberImportJobDto>(`/api/members/imports/${encodeURIComponent(jobId)}`, { method: 'GET' });
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

  async redeemPoints(payload: RedemptionRequest): Promise<RedemptionResponse> {
    return apiFetch<RedemptionResponse>('/api/transactions/redeem', {
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
      if (item.accountType === 'RECOGNITION') return sum;
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

  // ---------- Member 360 workspace ----------

  async searchMembers(query: string): Promise<MemberSearchResult[]> {
    return apiFetch<MemberSearchResult[]>(`/api/members/search?q=${encodeURIComponent(query)}`, { method: 'GET' });
  }

  async getHotnotes(): Promise<HotnoteDto[]> {
    return apiFetch<HotnoteDto[]>('/api/members/hotnotes', { method: 'GET' });
  }

  async getMember360(memberId: number): Promise<Member360> {
    return apiFetch<Member360>(`/api/members/${memberId}/360`, { method: 'GET' });
  }

  async getMemberCentral(memberId: number): Promise<MemberCentral> {
    return apiFetch<MemberCentral>(`/api/members/${memberId}/central`, { method: 'GET' });
  }

  async updateMemberProfile(memberId: number, payload: MemberProfileUpdate): Promise<MemberProfile> {
    return apiFetch<MemberProfile>(`/api/members/${memberId}/profile`, { method: 'PUT', body: JSON.stringify(payload) });
  }

  async getMemberLinks(memberId: number): Promise<MemberLink[]> {
    return apiFetch<MemberLink[]>(`/api/members/${memberId}/links`, { method: 'GET' });
  }

  async createMemberLink(memberId: number, payload: { linkedMemberIdentifier: string; relationType: string; canSharePoints: boolean }): Promise<MemberLink[]> {
    return apiFetch<MemberLink[]>(`/api/members/${memberId}/links`, { method: 'POST', body: JSON.stringify(payload) });
  }

  async deleteMemberLink(memberId: number, linkId: number): Promise<void> {
    await apiFetch<void>(`/api/members/${memberId}/links/${linkId}`, { method: 'DELETE' });
  }

  async getMemberCards(memberId: number): Promise<MembershipCard[]> {
    return apiFetch<MembershipCard[]>(`/api/members/${memberId}/cards`, { method: 'GET' });
  }

  async issueMemberCard(memberId: number, payload: { cardType: string; validityMonths?: number | null; replaceExisting: boolean }): Promise<MembershipCard> {
    return apiFetch<MembershipCard>(`/api/members/${memberId}/cards`, { method: 'POST', body: JSON.stringify(payload) });
  }

  async updateMemberCardStatus(memberId: number, cardId: number, status: string): Promise<MembershipCard> {
    return apiFetch<MembershipCard>(`/api/members/${memberId}/cards/${cardId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  }

  async getMemberBalance(memberId: number): Promise<{ balances: MemberBalances; lots: PointLot[] }> {
    return apiFetch<{ balances: MemberBalances; lots: PointLot[] }>(`/api/members/${memberId}/balance`, { method: 'GET' });
  }

  async getMemberTransactions(memberId: number): Promise<MemberTransaction[]> {
    return apiFetch<MemberTransaction[]>(`/api/members/${memberId}/transactions`, { method: 'GET' });
  }

  async getMemberVouchers(memberId: number): Promise<MemberVoucher[]> {
    return apiFetch<MemberVoucher[]>(`/api/members/${memberId}/vouchers`, { method: 'GET' });
  }

  async getMemberOffers(memberId: number): Promise<MemberOffer[]> {
    return apiFetch<MemberOffer[]>(`/api/members/${memberId}/offers`, { method: 'GET' });
  }

  async getMemberBookings(memberId: number): Promise<MemberBooking[]> {
    return apiFetch<MemberBooking[]>(`/api/members/${memberId}/bookings`, { method: 'GET' });
  }

  async createMemberBooking(memberId: number, payload: MemberBookingCreate): Promise<MemberBooking> {
    return apiFetch<MemberBooking>(`/api/members/${memberId}/bookings`, { method: 'POST', body: JSON.stringify(payload) });
  }

  async updateMemberBookingStatus(memberId: number, bookingId: number, status: string): Promise<MemberBooking> {
    return apiFetch<MemberBooking>(`/api/members/${memberId}/bookings/${bookingId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  }

  async getMemberTickets(memberId: number): Promise<ServiceTicket[]> {
    return apiFetch<ServiceTicket[]>(`/api/members/${memberId}/services`, { method: 'GET' });
  }

  async createMemberTicket(memberId: number, payload: { subject: string; category: string; priority: string; description?: string; isHotnote: boolean }): Promise<ServiceTicket> {
    return apiFetch<ServiceTicket>(`/api/members/${memberId}/services`, { method: 'POST', body: JSON.stringify(payload) });
  }

  async updateMemberTicket(memberId: number, ticketId: number, payload: { status?: string; priority?: string; resolutionNotes?: string; isHotnote?: boolean }): Promise<ServiceTicket> {
    return apiFetch<ServiceTicket>(`/api/members/${memberId}/services/${ticketId}`, { method: 'PATCH', body: JSON.stringify(payload) });
  }

  async adjustMemberPoints(memberId: number, payload: { direction: 'CREDIT' | 'DEBIT'; points: number; reason: string; category: string }): Promise<PointAdjustmentResult> {
    return apiFetch<PointAdjustmentResult>(`/api/members/${memberId}/adjustments`, { method: 'POST', body: JSON.stringify(payload) });
  }

  async overrideMemberTier(memberId: number, payload: { targetTier: string; reason: string }): Promise<Member360> {
    return apiFetch<Member360>(`/api/members/${memberId}/tier-override`, { method: 'POST', body: JSON.stringify(payload) });
  }

  async getMemberKpis(memberId: number): Promise<MemberKpis> {
    return apiFetch<MemberKpis>(`/api/members/${memberId}/kpis`, { method: 'GET' });
  }
}

export const api = new SpringBootApiClient();
export default api;
