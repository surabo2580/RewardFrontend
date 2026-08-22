import React, { useEffect, useMemo, useState } from 'react';
import { useReward } from '../context/RewardContext';
import { api, BranchDto, RuleDto } from '../api/client';
import { SlidersHorizontal, Plus, AlertCircle } from 'lucide-react';

export const RuleManager: React.FC = () => {
  const { selectedBusinessId } = useReward();

  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [rules, setRules] = useState<RuleDto[]>([]);
  const [eventTypeFilter, setEventTypeFilter] = useState('PURCHASE');
  const [loadError, setLoadError] = useState('');

  const [name, setName] = useState('');
  const [eventType, setEventType] = useState('PURCHASE');
  const [rewardType, setRewardType] = useState<'PERCENTAGE' | 'FLAT'>('PERCENTAGE');
  const [rewardValue, setRewardValue] = useState('10');
  const [branchId, setBranchId] = useState('');
  const [saveError, setSaveError] = useState('');

  const programId = localStorage.getItem('programId') || '';

  useEffect(() => {
    if (!selectedBusinessId) return;

    void (async () => {
      try {
        setLoadError('');
        const [loadedRules, loadedBranches] = await Promise.all([
          api.getRules(selectedBusinessId, eventTypeFilter),
          api.getBranches(selectedBusinessId),
        ]);
        setRules(loadedRules);
        setBranches(loadedBranches);
      } catch (error: any) {
        setLoadError(error.message || 'Unable to load rules');
      }
    })();
  }, [selectedBusinessId, eventTypeFilter]);

  const activeBranchCode = localStorage.getItem('branchCode') || '';

  const currentBranchId = useMemo(() => {
    const selected = branches.find((b) => b.code === activeBranchCode);
    return selected?.id || '';
  }, [activeBranchCode, branches]);

  useEffect(() => {
    if (currentBranchId) {
      setBranchId(currentBranchId);
    }
  }, [currentBranchId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusinessId || !programId) {
      setSaveError('tenantId and programId are required before creating rules.');
      return;
    }

    try {
      setSaveError('');
      await api.createRule({
        tenantId: selectedBusinessId,
        branchId: branchId || null,
        programId,
        name: name.trim(),
        eventType,
        rewardType,
        rewardValue: Number(rewardValue),
        isActive: true,
      });

      setName('');
      setRewardValue('10');
      setBranchId(currentBranchId || '');

      const refreshed = await api.getRules(selectedBusinessId, eventTypeFilter);
      setRules(refreshed);
    } catch (error: any) {
      setSaveError(error.message || 'Unable to create rule');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Branch-Specific Reward Rules</h2>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Create global rules by leaving branch empty, or choose a branch for branch-specific rules.
        </p>
      </div>

      <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-1"><Plus className="w-4 h-4" />Create Rule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white" placeholder="Rule name" value={name} onChange={(e) => setName(e.target.value)} required />
          <select className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white" value={eventType} onChange={(e) => setEventType(e.target.value)}>
            <option value="PURCHASE">PURCHASE</option>
            <option value="SIGNUP">SIGNUP</option>
            <option value="REFERRAL">REFERRAL</option>
          </select>
          <select className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white" value={rewardType} onChange={(e) => setRewardType(e.target.value as 'PERCENTAGE' | 'FLAT')}>
            <option value="PERCENTAGE">PERCENTAGE</option>
            <option value="FLAT">FLAT</option>
          </select>
          <input className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white" value={rewardValue} onChange={(e) => setRewardValue(e.target.value)} type="number" min="0" required />
          <select className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white md:col-span-2" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
            <option value="">Global rule (branchId: null)</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
            ))}
          </select>
        </div>
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded px-4 py-2 text-sm font-semibold">Create Rule</button>
        {saveError && <p className="text-xs text-rose-400">{saveError}</p>}
      </form>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Rules</h3>
          <select className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white" value={eventTypeFilter} onChange={(e) => setEventTypeFilter(e.target.value)}>
            <option value="PURCHASE">PURCHASE</option>
            <option value="SIGNUP">SIGNUP</option>
            <option value="REFERRAL">REFERRAL</option>
          </select>
        </div>

        {loadError && <p className="text-xs text-rose-400 inline-flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{loadError}</p>}

        <div className="space-y-2">
          {rules.map((rule) => {
            const branch = branches.find((b) => b.id === rule.branchId);
            return (
              <div key={`${rule.id || rule.name}-${rule.rewardValue}`} className="bg-slate-950 border border-slate-800 rounded p-3">
                <div className="text-white font-semibold">{rule.name}</div>
                <div className="text-xs text-slate-300 mt-1">{rule.eventType} • {rule.rewardType} {rule.rewardValue}</div>
                <div className="text-xs text-slate-400 mt-1">{branch ? `Branch: ${branch.name} (${branch.code})` : 'Global tenant rule'}</div>
              </div>
            );
          })}
          {rules.length === 0 && <p className="text-sm text-slate-400">No rules found for selected tenant/event.</p>}
        </div>
      </div>
    </div>
  );
};
