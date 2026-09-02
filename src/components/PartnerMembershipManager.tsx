import React, { useEffect, useMemo, useState } from 'react';
import { useReward } from '../context/RewardContext';
import { api, PartnerMembershipDto, SponsorDto } from '../api/client';
import { Link2, Users, AlertCircle } from 'lucide-react';

export const PartnerMembershipManager: React.FC = () => {
  const { selectedBusinessId, users } = useReward();
  const tenantId = Number(selectedBusinessId || 0);
  const programId = Number(localStorage.getItem('programId') || 0);

  const [sponsors, setSponsors] = useState<SponsorDto[]>([]);
  const [selectedSponsorId, setSelectedSponsorId] = useState(0);
  const [externalMembershipId, setExternalMembershipId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [mappings, setMappings] = useState<PartnerMembershipDto[]>([]);
  const [error, setError] = useState('');

  const partnerSponsors = useMemo(
    () => sponsors.filter((s) => s.sponsorType === 'PARTNER'),
    [sponsors]
  );

  const loadSponsors = async () => {
    if (!tenantId || !programId) return;
    const loaded = await api.getSponsors(tenantId, programId);
    setSponsors(loaded);
  };

  const loadMappings = async (sponsorId: number) => {
    if (!tenantId || !sponsorId) return;
    const loaded = await api.getPartnerMemberships(tenantId, sponsorId);
    setMappings(loaded);
  };

  useEffect(() => {
    void loadSponsors().catch((err: any) => setError(err.message || 'Unable to load sponsors'));
  }, [tenantId, programId]);

  useEffect(() => {
    if (!selectedSponsorId && partnerSponsors[0]) {
      setSelectedSponsorId(partnerSponsors[0].id);
      return;
    }
    if (!selectedUserId && users[0]) {
      setSelectedUserId(users[0].id);
    }
  }, [partnerSponsors, selectedSponsorId, users, selectedUserId]);

  useEffect(() => {
    if (!selectedSponsorId) return;
    void loadMappings(selectedSponsorId).catch((err: any) => setError(err.message || 'Unable to load partner memberships'));
  }, [tenantId, selectedSponsorId]);

  const createMapping = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tenantId || !selectedSponsorId) return;

    try {
      setError('');
      await api.createPartnerMembership({
        tenantId,
        sponsorId: selectedSponsorId,
        externalMembershipId: externalMembershipId.trim(),
        memberId: selectedUserId,
        status: 'ACTIVE',
      });

      setExternalMembershipId('');
      await loadMappings(selectedSponsorId);
    } catch (err: any) {
      setError(err.message || 'Unable to create partner membership');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Partner Membership Mapping</h2>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Map external partner IDs to tenant member IDs for partner-based event processing.
        </p>
      </div>

      {error && (
        <p className="text-sm text-rose-400 inline-flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={createMapping} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white">Create Mapping</h3>
          <select
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
            value={selectedSponsorId}
            onChange={(e) => setSelectedSponsorId(Number(e.target.value))}
            required
          >
            {partnerSponsors.length === 0 && <option value={0}>No PARTNER sponsors available</option>}
            {partnerSponsors.map((sponsor) => (
              <option key={sponsor.id} value={sponsor.id}>
                {sponsor.name} ({sponsor.sponsorCode})
              </option>
            ))}
          </select>

          <input
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
            placeholder="External membership ID (e.g. 6E-789456)"
            value={externalMembershipId}
            onChange={(e) => setExternalMembershipId(e.target.value)}
            required
          />

          <select
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            required
          >
            {users.length === 0 && <option value="">No members available</option>}
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.id} ({user.id})
              </option>
            ))}
          </select>

          <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white rounded px-4 py-2 text-sm font-semibold">
            Create Partner Mapping
          </button>
        </form>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Mapped External IDs</h3>
          </div>
          <div className="space-y-2 max-h-96 overflow-auto">
            {mappings.map((item) => (
              <div key={item.id} className="bg-slate-950 border border-slate-800 rounded px-3 py-2">
                <div className="text-sm text-white font-semibold">{item.externalMembershipId}</div>
                <div className="text-xs text-slate-400">Member ID: {item.memberId}</div>
                <div className="text-xs text-slate-500">Status: {item.status}</div>
              </div>
            ))}
            {mappings.length === 0 && (
              <p className="text-sm text-slate-400">No partner memberships mapped for selected sponsor.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
