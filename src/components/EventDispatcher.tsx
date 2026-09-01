import React, { useState } from 'react';
import { useReward } from '../context/RewardContext';
import { api, ProgramDto, SponsorDto, SponsorLocationDto } from '../api/client';
import { Send, CheckCircle2, AlertCircle, Building2, UserPlus, MapPin } from 'lucide-react';

export const EventDispatcher: React.FC = () => {
  const { businesses, users, selectedBusinessId, selectedUserId } = useReward();

  const [tenantId, setTenantId] = useState<number>(Number(selectedBusinessId || localStorage.getItem('tenantId') || 0));
  const [programs, setPrograms] = useState<ProgramDto[]>([]);
  const [sponsors, setSponsors] = useState<SponsorDto[]>([]);
  const [locations, setLocations] = useState<SponsorLocationDto[]>([]);
  const [programId, setProgramId] = useState<number>(Number(localStorage.getItem('programId') || 0));
  const [sponsorId, setSponsorId] = useState<number>(Number(localStorage.getItem('sponsorId') || 0));
  const [locationId, setLocationId] = useState<number>(Number(localStorage.getItem('locationId') || 0));
  const [memberId, setMemberId] = useState<string>(selectedUserId || localStorage.getItem('memberId') || '');
  const [eventType, setEventType] = useState<string>('PURCHASE');
  const [amount, setAmount] = useState<string>('5000');
  const [referenceId, setReferenceId] = useState<string>('ORDER-1001');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; pointsAwarded: number; message: string } | null>(null);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (!tenantId) return;
    void Promise.all([api.getPrograms(tenantId), api.getSponsors(tenantId, programId)]).then(([loadedPrograms, loadedSponsors]) => {
      setPrograms(loadedPrograms);
      const activeProgram = loadedPrograms.find((item) => item.id === programId) || loadedPrograms[0];
      if (activeProgram && activeProgram.id !== programId) setProgramId(activeProgram.id);
      setSponsors(loadedSponsors);
      const activeSponsor = loadedSponsors.find((item) => item.id === sponsorId) || loadedSponsors[0];
      if (activeSponsor && activeSponsor.id !== sponsorId) {
        setSponsorId(activeSponsor.id);
      } else if (!activeSponsor) {
        setSponsorId(0);
      }
    }).catch((err) => setError(err.message || 'Unable to load program sponsors'));
  }, [tenantId, programId]);

  React.useEffect(() => {
    if (!tenantId || !sponsorId) {
      setLocations([]);
      setLocationId(0);
      localStorage.removeItem('locationId');
      return;
    }

    void api
      .getLocations(tenantId, sponsorId)
      .then((loadedLocations) => {
        setLocations(loadedLocations);

        // Clear stale location selection when switching tenant/sponsor contexts.
        if (locationId && !loadedLocations.some((item) => item.id === locationId)) {
          setLocationId(0);
          localStorage.removeItem('locationId');
        }
      })
      .catch((err) => setError(err.message || 'Unable to load locations'));
  }, [tenantId, sponsorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setIsSubmitting(true);

    try {
      if (locationId && !locations.some((item) => item.id === locationId)) {
        setError('Selected location is not valid for this sponsor. Please reselect location.');
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem('tenantId', tenantId);
      localStorage.setItem('memberId', memberId);
      localStorage.setItem('programId', String(programId));
      localStorage.setItem('sponsorId', String(sponsorId));
      if (locationId) {
        localStorage.setItem('locationId', String(locationId));
      } else {
        localStorage.removeItem('locationId');
      }

      const response = await api.postEvent({
        tenantId,
        programId,
        sponsorId,
        locationId: locationId || undefined,
        memberId,
        eventType,
        amount: Number(amount),
        referenceId: referenceId || undefined,
        channel: 'POS',
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
              onChange={(e) => {
                setTenantId(Number(e.target.value));
                setProgramId(0);
                setSponsorId(0);
                setLocationId(0);
                setLocations([]);
                localStorage.removeItem('programId');
                localStorage.removeItem('sponsorId');
                localStorage.removeItem('locationId');
              }}
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

          <label className="text-xs text-slate-300 space-y-1 block"><span>Program</span><select value={programId} onChange={(e) => setProgramId(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white" required><option value={0}>Select program</option>{programs.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.id})</option>)}</select></label>
          <label className="text-xs text-slate-300 space-y-1 block"><span> Sponsor</span><select value={sponsorId} onChange={(e) => setSponsorId(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white" required><option value={0}>Select sponsor</option>{sponsors.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.sponsorCode})</option>)}</select></label>
          <label className="text-xs text-slate-300 space-y-1 block"><span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />Location</span><select value={locationId} onChange={(e) => setLocationId(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"><option value={0}>Sponsor-wide</option>{locations.map((item) => <option key={item.id} value={item.id}>{item.locationName} ({item.locationCode})</option>)}</select></label>
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
