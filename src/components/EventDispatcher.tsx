import React, { useState } from 'react';
import { useReward } from '../context/RewardContext';
import { api } from '../api/client';
import { Send, CheckCircle2, AlertCircle, GitBranch, Building2, UserPlus } from 'lucide-react';

export const EventDispatcher: React.FC = () => {
  const { businesses, users, selectedBusinessId, selectedUserId } = useReward();

  const [tenantId, setTenantId] = useState<string>(selectedBusinessId || localStorage.getItem('tenantId') || '');
  const [memberId, setMemberId] = useState<string>(selectedUserId || localStorage.getItem('memberId') || '');
  const [branchCode, setBranchCode] = useState<string>(localStorage.getItem('branchCode') || '');
  const [eventType, setEventType] = useState<string>('PURCHASE');
  const [amount, setAmount] = useState<string>('5000');
  const [referenceId, setReferenceId] = useState<string>('ORDER-1001');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; pointsAwarded: number; message: string } | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setIsSubmitting(true);

    try {
      localStorage.setItem('tenantId', tenantId);
      localStorage.setItem('memberId', memberId);
      localStorage.setItem('branchCode', branchCode);

      const response = await api.postEvent({
        tenantId,
        branchCode,
        memberId,
        eventType,
        amount: Number(amount),
        referenceId: referenceId || undefined,
      });

      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Unable to process event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2">
          <Send className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Reward Event Processing</h2>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Sends POST /api/events with tenantId, branchCode, memberId, and event payload.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="text-xs text-slate-300 space-y-1 block">
            <span className="inline-flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />Tenant</span>
            <select
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
              required
            >
              <option value="">Select tenant</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>{b.name} ({b.id})</option>
              ))}
            </select>
          </label>

          <label className="text-xs text-slate-300 space-y-1 block">
            <span className="inline-flex items-center gap-1"><UserPlus className="w-3.5 h-3.5" />Member</span>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
              required
            >
              <option value="">Select member</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name || u.id} ({u.id})</option>
              ))}
            </select>
          </label>

          <label className="text-xs text-slate-300 space-y-1 block">
            <span className="inline-flex items-center gap-1"><GitBranch className="w-3.5 h-3.5" />Branch code</span>
            <input
              value={branchCode}
              onChange={(e) => setBranchCode(e.target.value.toUpperCase())}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
              placeholder="MUM-01"
              required
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={eventType}
            onChange={(e) => setEventType(e.target.value.toUpperCase())}
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
            placeholder="Event type"
            required
          />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
            placeholder="Amount"
            required
          />
          <input
            value={referenceId}
            onChange={(e) => setReferenceId(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
            placeholder="Reference ID"
          />
        </div>

        <button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded px-4 py-2 text-sm font-semibold">
          {isSubmitting ? 'Processing...' : 'Process Event'}
        </button>

        {error && (
          <p className="text-sm text-rose-400 inline-flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}

        {result && (
          <div className="text-sm text-emerald-300 inline-flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{result.message} (points: {result.pointsAwarded})</span>
          </div>
        )}
      </form>
    </div>
  );
};
