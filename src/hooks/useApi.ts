import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRewardStore } from '../store/useRewardStore';
import { SpringBootApiClient } from '../api/client';
import { BackendEventRequest, BackendEventResponse, BackendWalletResponse } from '../api/client';

const apiClient = new SpringBootApiClient();

/**
 * Hook for fetching paginated rules from backend
 */
export const useRules = (businessId?: string, page = 1, pageSize = 20) => {
  const selectedBusiness = useRewardStore((state) => state.selectedBusinessId);
  const bid = businessId || selectedBusiness;

  return useQuery({
    queryKey: ['rules', bid, page, pageSize],
    queryFn: async () => {
      // In a real backend, this would accept pagination params
      // GET /api/rules?businessId={bid}&page={page}&pageSize={pageSize}
      const allRules = await apiClient.fetchRules(bid);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      return {
        rules: allRules.slice(startIndex, endIndex),
        total: allRules.length,
        page,
        pageSize,
      };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in memory for 10 minutes
  });
};

/**
 * Hook for fetching wallet with pagination of transactions
 */
export const useWallet = (userId?: string, businessId?: string) => {
  const selectedUser = useRewardStore((state) => state.selectedUserId);
  const selectedBusiness = useRewardStore((state) => state.selectedBusinessId);

  const uid = userId || selectedUser;
  const bid = businessId || selectedBusiness;

  return useQuery({
    queryKey: ['wallet', uid, bid],
    queryFn: async () => {
      return apiClient.fetchWallet(uid, bid);
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Hook for fetching paginated transactions
 */
export const useTransactions = (
  userId?: string,
  businessId?: string,
  page = 1,
  pageSize = 50
) => {
  const selectedUser = useRewardStore((state) => state.selectedUserId);
  const selectedBusiness = useRewardStore((state) => state.selectedBusinessId);

  const uid = userId || selectedUser;
  const bid = businessId || selectedBusiness;

  return useQuery({
    queryKey: ['transactions', uid, bid, page, pageSize],
    queryFn: async () => {
      // In real backend: GET /api/transactions?userId={uid}&businessId={bid}&page={page}&pageSize={pageSize}
      const allTransactions = await apiClient.fetchTransactions(uid, bid);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      return {
        transactions: allTransactions.slice(startIndex, endIndex),
        total: allTransactions.length,
        page,
        pageSize,
      };
    },
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Mutation for processing an event
 */
export const useProcessEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventRequest: BackendEventRequest) => {
      return apiClient.processEvent(eventRequest);
    },
    onSuccess: (data) => {
      // Invalidate affected queries
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

/**
 * Mutation for confirming points
 */
export const useConfirmPoints = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { businessId: string; userId: string; points: number }) => {
      return apiClient.confirmPoints(payload.businessId, payload.userId, payload.points);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
};

/**
 * Mutation for redeeming points
 */
export const useRedeemPoints = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { businessId: string; userId: string; points: number }) => {
      return apiClient.redeemPointsNew(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

/**
 * Mutation for creating a rule
 */
export const useCreateRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rule: any) => {
      return apiClient.createNewRule(rule);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['rules', variables.businessId],
      });
    },
  });
};

/**
 * Mutation for updating a rule
 */
export const useUpdateRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: number; updates: any }) => {
      return apiClient.updateRuleById(payload.id, payload.updates);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
};

/**
 * Mutation for deleting a rule
 */
export const useDeleteRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ruleId: number) => {
      return apiClient.deleteRuleById(ruleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
};
