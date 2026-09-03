import React, { useEffect, useState } from 'react';
import { useReward } from '../context/RewardContext';
import { api, RuleDto, SponsorDto, SponsorLocationDto } from '../api/client';
import { SlidersHorizontal, Plus, AlertCircle } from 'lucide-react';

export const RuleManager: React.FC = () => {
  const { selectedBusinessId } = useReward();
  const tenantId = Number(selectedBusinessId || 0);
  const programId = Number(localStorage.getItem('programId') || 0);
  const [sponsors, setSponsors] = useState<SponsorDto[]>([]);
  const [locations, setLocations] = useState<SponsorLocationDto[]>([]);
  const [rules, setRules] = useState<RuleDto[]>([]);
  const [eventTypeFilter, setEventTypeFilter] = useState('PURCHASE');
  const [scope, setScope] = useState<RuleDto['scope']>('PROGRAM');
  const [sponsorId, setSponsorId] = useState(0);
  const [locationId, setLocationId] = useState(0);
  const [name, setName] = useState('');
  const [eventType, setEventType] = useState('PURCHASE');
  const [rewardType, setRewardType] = useState<'PERCENTAGE' | 'FLAT'>('PERCENTAGE');
  const [rewardValue, setRewardValue] = useState('10');
  const [redemptionEarnRate, setRedemptionEarnRate] = useState('');
  const [recognitionEarnRate, setRecognitionEarnRate] = useState('');
  const [priority, setPriority] = useState('0');
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!tenantId || !programId) return;
    void Promise.all([api.getRules(tenantId, eventTypeFilter), api.getSponsors(tenantId, programId)])
      .then(([loadedRules, loadedSponsors]) => {
        setRules(loadedRules);
        setSponsors(loadedSponsors);
      })
      .catch((error: any) => setLoadError(error.message || 'Unable to load rules'));
  }, [tenantId, programId, eventTypeFilter]);

  useEffect(() => {
    if (!tenantId || !sponsorId) {
      setLocations([]);
      return;
    }
    void api.getLocations(tenantId, sponsorId)
      .then(setLocations)
      .catch((error: any) => setLoadError(error.message || 'Unable to load locations'));
  }, [tenantId, sponsorId]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tenantId || !programId || (scope !== 'PROGRAM' && !sponsorId) || (scope === 'LOCATION' && !locationId)) {
      setSaveError('Select a tenant, program, and the required sponsor/location scope.');
      return;
    }
    try {
      setSaveError('');
      await api.createRule({
        tenantId,
        programId,
        scope,
        sponsorId: scope === 'PROGRAM' ? null : sponsorId,
        locationId: scope === 'LOCATION' ? locationId : null,
        name: name.trim(),
        eventType,
        rewardType,
        rewardValue: Number(rewardValue),
        redemptionEarnRate: redemptionEarnRate ? Number(redemptionEarnRate) : null,
        recognitionEarnRate: recognitionEarnRate ? Number(recognitionEarnRate) : null,
        isActive: true,
        priority: Number(priority),
      });
      setName('');
      setRedemptionEarnRate('');
      setRecognitionEarnRate('');
      setRules(await api.getRules(tenantId, eventTypeFilter));
    } catch (error: any) {
      setSaveError(error.message || 'Unable to create rule');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2"><SlidersHorizontal className="w-5 h-5 text-indigo-400" /><h2 className="text-xl font-bold text-white">Program Reward Policies</h2></div>
        <p className="text-sm text-slate-400 mt-1">Rules resolve from most specific to broadest: LOCATION, SPONSOR, then PROGRAM.</p>
      </div>
      <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-1"><Plus className="w-4 h-4" />Create Rule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white" placeholder="Rule name" value={name} onChange={(e) => setName(e.target.value)} required />
          <select className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white" value={scope} onChange={(e) => { setScope(e.target.value as RuleDto['scope']); setSponsorId(0); setLocationId(0); }}><option value="PROGRAM">PROGRAM</option><option value="SPONSOR">SPONSOR</option><option value="LOCATION">LOCATION</option></select>
          <select className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white" value={eventType} onChange={(e) => setEventType(e.target.value)}><option>PURCHASE</option><option>SIGNUP</option><option>REFERRAL</option></select>
          <select className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white" value={rewardType} onChange={(e) => setRewardType(e.target.value as 'PERCENTAGE' | 'FLAT')}><option value="PERCENTAGE">PERCENTAGE</option><option value="FLAT">FLAT</option></select>
          <input className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white" value={rewardValue} onChange={(e) => setRewardValue(e.target.value)} type="number" min="0" placeholder="Reward value" required />
          <input className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white" value={priority} onChange={(e) => setPriority(e.target.value)} type="number" min="0" placeholder="Priority" required />
          <input className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white" value={redemptionEarnRate} onChange={(e) => setRedemptionEarnRate(e.target.value)} type="number" min="0" step="0.01" placeholder="Redemption rate (pts per currency)" />
          <input className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white" value={recognitionEarnRate} onChange={(e) => setRecognitionEarnRate(e.target.value)} type="number" min="0" step="0.01" placeholder="Recognition rate (pts per currency)" />
          {scope !== 'PROGRAM' && <select className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white" value={sponsorId} onChange={(e) => setSponsorId(Number(e.target.value))} required><option value={0}>Select sponsor</option>{sponsors.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.sponsorCode})</option>)}</select>}
          {scope === 'LOCATION' && <select className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white" value={locationId} onChange={(e) => setLocationId(Number(e.target.value))} required><option value={0}>Select location</option>{locations.map((item) => <option key={item.id} value={item.id}>{item.locationName} ({item.locationCode})</option>)}</select>}
        </div>
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded px-4 py-2 text-sm font-semibold">Create Rule</button>
        {saveError && <p className="text-xs text-rose-400">{saveError}</p>}
      </form>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold text-white">Rules</h3><select className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white" value={eventTypeFilter} onChange={(e) => setEventTypeFilter(e.target.value)}><option>PURCHASE</option><option>SIGNUP</option><option>REFERRAL</option></select></div>
        {loadError && <p className="text-xs text-rose-400 inline-flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{loadError}</p>}
        <div className="space-y-2">{rules.map((rule) => { const sponsor = sponsors.find((item) => item.id === rule.sponsorId); return <div key={`${rule.id || rule.name}-${rule.rewardValue}`} className="bg-slate-950 border border-slate-800 rounded p-3"><div className="text-white font-semibold">{rule.name}</div><div className="text-xs text-slate-300 mt-1">{rule.eventType} • {rule.rewardType} {rule.rewardValue} • priority {rule.priority}</div>{(rule.redemptionEarnRate != null || rule.recognitionEarnRate != null) && <div className="text-xs text-cyan-200 mt-1">Redemption: {rule.redemptionEarnRate ?? rule.rewardValue} pts/currency · Recognition: {rule.recognitionEarnRate ?? rule.rewardValue} pts/currency</div>}<div className="text-xs text-slate-400 mt-1">{rule.scope}{sponsor ? `: ${sponsor.name} (${sponsor.sponsorCode})` : ': all sponsors'}</div></div>; })}</div>
        {rules.length === 0 && <p className="text-sm text-slate-400">No rules found for selected program/event.</p>}
      </div>
    </div>
  );
};
