import React, { useEffect, useState } from 'react';
import { useReward } from '../context/RewardContext';
import { api, BranchDto, ProgramDto } from '../api/client';
import { useRewardStore } from '../store/useRewardStore';
import { Building2, Users as UsersIcon, GitBranch, KeyRound, Hotel, Layers3 } from 'lucide-react';

export const BusinessUserManager: React.FC = () => {
  const {
    businesses,
    users,
    selectedBusinessId,
    selectedUserId,
    setSelectedBusinessId,
    setSelectedUserId,
  } = useReward();
  const refreshDirectory = useRewardStore((state) => state.refreshDirectory);

  const [tenantName, setTenantName] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [programName, setProgramName] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [earningRate, setEarningRate] = useState('10');
  const [redemptionRate, setRedemptionRate] = useState('1');
  const [provisionError, setProvisionError] = useState('');
  const [bootstrapCredentials, setBootstrapCredentials] = useState<{ email: string; username: string; temporaryPassword: string } | null>(null);

  const [programs, setPrograms] = useState<ProgramDto[]>([]);
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [programLoadError, setProgramLoadError] = useState('');
  const [branchLoadError, setBranchLoadError] = useState('');

  const [branchCode, setBranchCode] = useState('');
  const [branchName, setBranchName] = useState('');
  const [branchCity, setBranchCity] = useState('');
  const [parentBranchId, setParentBranchId] = useState('');
  const [branchError, setBranchError] = useState('');

  const [memberId, setMemberId] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberTier, setMemberTier] = useState('SILVER');
  const [memberError, setMemberError] = useState('');

  const selectedBranchCode = localStorage.getItem('branchCode') || '';
  const tenantApiKey = localStorage.getItem('tenantApiKey') || '';

  useEffect(() => {
    if (!selectedBusinessId) {
      setPrograms([]);
      setBranches([]);
      return;
    }

    void (async () => {
      try {
        setProgramLoadError('');
        const data = await api.getPrograms(Number(selectedBusinessId));
        setPrograms(data);
        if (data.length > 0) {
          localStorage.setItem('programId', data[0].id);
        }
      } catch (error: any) {
        setProgramLoadError(error.message || 'Unable to load programs');
        setPrograms([]);
      }

      try {
        setBranchLoadError('');
        const data = await api.getBranches(Number(selectedBusinessId));
        setBranches(data);
        if (!selectedBranchCode && data[0]?.code) {
          localStorage.setItem('branchCode', data[0].code);
        }
      } catch (error: any) {
        setBranchLoadError(error.message || 'Unable to load branches');
        setBranches([]);
      }
    })();
  }, [selectedBusinessId, selectedBranchCode]);

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    setProvisionError('');

    try {
      const response = await api.provisionTenant({
        name: tenantName.trim(),
        slug: tenantSlug.trim(),
        adminEmail: adminEmail.trim(),
        programName: programName.trim(),
        currency: currency.trim().toUpperCase(),
        earningRate: Number(earningRate),
        redemptionRate: Number(redemptionRate),
      });

      await refreshDirectory();
      setSelectedBusinessId(String(response.tenant.id));
      setBootstrapCredentials(response.systemUser || null);

      setTenantName('');
      setTenantSlug('');
      setAdminEmail('');
      setProgramName('');
      setCurrency('INR');
      setEarningRate('10');
      setRedemptionRate('1');
    } catch (error: any) {
      setProvisionError(error.message || 'Tenant provisioning failed');
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusinessId) return;
    setBranchError('');

    try {
      const created = await api.createBranch({
        tenantId: Number(selectedBusinessId),
        parentBranchId: parentBranchId || null,
        code: branchCode.trim().toUpperCase(),
        name: branchName.trim(),
        city: branchCity.trim(),
        status: 'ACTIVE',
      });

      localStorage.setItem('branchCode', created.code);
      setBranchCode('');
      setBranchName('');
      setBranchCity('');
      setParentBranchId('');
      setBranches(await api.getBranches(Number(selectedBusinessId)));
    } catch (error: any) {
      setBranchError(error.message || 'Unable to create branch');
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusinessId) return;
    setMemberError('');

    try {
      await api.createMember({
        tenantId: Number(selectedBusinessId),
        externalUserId: memberId.trim(),
        email: memberEmail.trim() || null,
        tier: memberTier,
      });

      await refreshDirectory();
      setSelectedUserId(memberId.trim());
      setMemberId('');
      setMemberEmail('');
      setMemberTier('SILVER');
    } catch (error: any) {
      setMemberError(error.message || 'Unable to create member');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Tenant Provisioning & Directory</h2>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Provision a tenant, then manage tenant program, branches, and shared members.
        </p>
        <div className="mt-3 text-xs text-slate-300 bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-emerald-400" />
          <span>API key loaded:</span>
          <span className="font-mono text-emerald-300">{tenantApiKey ? `${tenantApiKey.slice(0, 8)}...` : 'Not set'}</span>
        </div>
        {bootstrapCredentials && (
          <div className="mt-3 text-xs text-cyan-200 bg-cyan-950/30 border border-cyan-700/40 rounded-lg p-3">
            <div className="font-semibold">System user created for dashboard login</div>
            <div className="font-mono mt-1">email: {bootstrapCredentials.email}</div>
            <div className="font-mono">username: {bootstrapCredentials.username}</div>
            <div className="font-mono">temporaryPassword: {bootstrapCredentials.temporaryPassword}</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Provision New Tenant</h3>
          <form onSubmit={handleProvision} className="space-y-3">
            <input className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white" placeholder="Business name" value={tenantName} onChange={(e) => setTenantName(e.target.value)} required />
            <input className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white" placeholder="Slug (e.g. indianhotel)" value={tenantSlug} onChange={(e) => setTenantSlug(e.target.value)} required />
            <input className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white" placeholder="Admin email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required />
            <input className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white" placeholder="Program name" value={programName} onChange={(e) => setProgramName(e.target.value)} required />
            <div className="grid grid-cols-3 gap-2">
              <input className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white" placeholder="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} required />
              <input className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white" placeholder="Earning rate" value={earningRate} onChange={(e) => setEarningRate(e.target.value)} required />
              <input className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white" placeholder="Redemption rate" value={redemptionRate} onChange={(e) => setRedemptionRate(e.target.value)} required />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded px-3 py-2 text-sm font-semibold">Provision Tenant</button>
            {provisionError && <p className="text-xs text-rose-400">{provisionError}</p>}
          </form>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Tenant Selection</h3>
          <div className="space-y-2 max-h-72 overflow-auto">
            {businesses.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBusinessId(b.id)}
                className={`w-full text-left px-3 py-2 rounded border ${selectedBusinessId === b.id ? 'bg-indigo-950/40 border-indigo-500/50 text-white' : 'bg-slate-950 border-slate-800 text-slate-300'}`}
              >
                <div className="font-semibold">{b.name}</div>
                <div className="text-xs font-mono text-slate-400">{b.id}</div>
              </button>
            ))}
            {businesses.length === 0 && <p className="text-sm text-slate-400">No tenants available. Provision one first.</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3"><Layers3 className="w-4 h-4 text-sky-400" /><h3 className="text-sm font-semibold text-white">Program</h3></div>
          {programLoadError && <p className="text-xs text-rose-400 mb-2">{programLoadError}</p>}
          {programs.length === 0 ? (
            <p className="text-sm text-slate-400">No program found for selected tenant.</p>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="text-white font-semibold">{programs[0].name}</div>
              <div className="text-slate-300">Currency: {programs[0].currency}</div>
              <div className="text-slate-300">Earning rate: {programs[0].earningRate}</div>
              <div className="text-slate-300">Redemption rate: {programs[0].redemptionRate}</div>
              <div className="text-xs font-mono text-slate-400">Program ID: {programs[0].id}</div>
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3"><GitBranch className="w-4 h-4 text-amber-400" /><h3 className="text-sm font-semibold text-white">Branch Selection</h3></div>
          {branchLoadError && <p className="text-xs text-rose-400 mb-2">{branchLoadError}</p>}
          <div className="space-y-2 mb-4">
            {branches.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => localStorage.setItem('branchCode', b.code)}
                className={`w-full text-left px-3 py-2 rounded border ${selectedBranchCode === b.code ? 'bg-amber-950/30 border-amber-500/50 text-white' : 'bg-slate-950 border-slate-800 text-slate-300'}`}
              >
                <div className="font-semibold">{b.name} ({b.code})</div>
                <div className="text-xs text-slate-400">{b.city || 'No city'} • {b.parentBranchId ? 'Child branch' : 'Root branch'}</div>
              </button>
            ))}
            {branches.length === 0 && <p className="text-sm text-slate-400">No branches yet.</p>}
          </div>

          <form onSubmit={handleCreateBranch} className="space-y-2 border-t border-slate-800 pt-3">
            <h4 className="text-xs text-slate-300 uppercase tracking-wide">Create Branch</h4>
            <div className="grid grid-cols-2 gap-2">
              <input className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white" placeholder="Code (MUM-01)" value={branchCode} onChange={(e) => setBranchCode(e.target.value)} required />
              <input className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white" placeholder="Name" value={branchName} onChange={(e) => setBranchName(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white" placeholder="City" value={branchCity} onChange={(e) => setBranchCity(e.target.value)} />
              <select className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white" value={parentBranchId} onChange={(e) => setParentBranchId(e.target.value)}>
                <option value="">No parent</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 rounded px-3 py-2 text-sm font-semibold">Create Branch</button>
            {branchError && <p className="text-xs text-rose-400">{branchError}</p>}
          </form>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3"><UsersIcon className="w-4 h-4 text-emerald-400" /><h3 className="text-sm font-semibold text-white">Shared Members</h3></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2 max-h-64 overflow-auto">
            {users.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => setSelectedUserId(u.id)}
                className={`w-full text-left px-3 py-2 rounded border ${selectedUserId === u.id ? 'bg-emerald-950/30 border-emerald-500/40 text-white' : 'bg-slate-950 border-slate-800 text-slate-300'}`}
              >
                <div className="font-semibold">{u.name || u.id}</div>
                <div className="text-xs font-mono text-slate-400">{u.id}</div>
              </button>
            ))}
            {users.length === 0 && <p className="text-sm text-slate-400">No members for selected tenant.</p>}
          </div>

          <form onSubmit={handleCreateMember} className="space-y-2">
            <input className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white" placeholder="externalUserId (guest-123)" value={memberId} onChange={(e) => setMemberId(e.target.value)} required />
            <input className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white" placeholder="Email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} />
            <select className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white" value={memberTier} onChange={(e) => setMemberTier(e.target.value)}>
              <option value="SILVER">SILVER</option>
              <option value="GOLD">GOLD</option>
              <option value="PLATINUM">PLATINUM</option>
            </select>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded px-3 py-2 text-sm font-semibold">Create Member</button>
            {memberError && <p className="text-xs text-rose-400">{memberError}</p>}
          </form>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-300">
        <div className="flex items-center gap-2 mb-1"><Hotel className="w-4 h-4 text-indigo-300" /><span className="font-semibold">Current Routing Context</span></div>
        <div className="font-mono">tenantId: {localStorage.getItem('tenantId') || '-'}</div>
        <div className="font-mono">programId: {localStorage.getItem('programId') || '-'}</div>
        <div className="font-mono">branchCode: {localStorage.getItem('branchCode') || '-'}</div>
      </div>
    </div>
  );
};
