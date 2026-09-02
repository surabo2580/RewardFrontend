import React, { useEffect, useMemo, useState } from 'react';
import { api, SponsorDto, SponsorLocationDto } from '../api/client';
import { useReward } from '../context/RewardContext';
import { Network, Plus, MapPin, AlertCircle } from 'lucide-react';

export const SponsorManager: React.FC = () => {
  const { selectedBusinessId } = useReward();
  const tenantId = Number(selectedBusinessId || 0);
  const programId = Number(localStorage.getItem('programId') || 0);

  const [sponsors, setSponsors] = useState<SponsorDto[]>([]);
  const [locations, setLocations] = useState<SponsorLocationDto[]>([]);
  const [selectedSponsorId, setSelectedSponsorId] = useState(0);

  const [name, setName] = useState('');
  const [sponsorCode, setSponsorCode] = useState('');
  const [sponsorType, setSponsorType] = useState<'HOST' | 'CHILD' | 'PARTNER'>('CHILD');
  const [parentSponsorId, setParentSponsorId] = useState(0);

  const [locationName, setLocationName] = useState('');
  const [locationCode, setLocationCode] = useState('');
  const [locationPin, setLocationPin] = useState('');

  const [error, setError] = useState('');

  const selectableParents = useMemo(
    () => sponsors.filter((item) => item.sponsorType !== 'PARTNER'),
    [sponsors]
  );

  const loadSponsors = async () => {
    if (!tenantId || !programId) return;
    const loaded = await api.getSponsors(tenantId, programId);
    setSponsors(loaded);
    if (!selectedSponsorId && loaded[0]) {
      setSelectedSponsorId(loaded[0].id);
    }
  };

  useEffect(() => {
    void loadSponsors().catch((err: any) => setError(err.message || 'Unable to load sponsors'));
  }, [tenantId, programId]);

  useEffect(() => {
    if (!tenantId || !selectedSponsorId) return;
    void api
      .getLocations(tenantId, selectedSponsorId)
      .then(setLocations)
      .catch((err: any) => setError(err.message || 'Unable to load locations'));
  }, [tenantId, selectedSponsorId]);

  useEffect(() => {
    if (sponsorType === 'HOST' || sponsorType === 'PARTNER') {
      setParentSponsorId(0);
    }
  }, [sponsorType]);

  const createSponsor = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tenantId || !programId) return;

    try {
      setError('');
      const created = await api.createSponsor({
        tenantId,
        programId,
        parentSponsorId: sponsorType === 'CHILD' ? parentSponsorId || null : null,
        name: name.trim(),
        sponsorCode: sponsorCode.trim().toUpperCase(),
        sponsorType,
        status: 'ACTIVE',
      });

      setName('');
      setSponsorCode('');
      setSponsorType('CHILD');
      setParentSponsorId(0);
      setSelectedSponsorId(created.id);
      await loadSponsors();
    } catch (err: any) {
      setError(err.message || 'Unable to create sponsor');
    }
  };

  const createLocation = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tenantId || !selectedSponsorId) return;

    try {
      setError('');
      await api.createLocation({
        tenantId,
        sponsorId: selectedSponsorId,
        locationName: locationName.trim(),
        locationCode: locationCode.trim().toUpperCase(),
        locationPin: locationPin.trim() || undefined,
        status: 'ACTIVE',
      });

      setLocationName('');
      setLocationCode('');
      setLocationPin('');
      setLocations(await api.getLocations(tenantId, selectedSponsorId));
    } catch (err: any) {
      setError(err.message || 'Unable to create location');
    }
  };

  const childrenOf = (parentId: number | null) =>
    sponsors.filter((item) => item.parentSponsorId === parentId);

  const renderTree = (parentId: number | null, depth = 0): React.ReactNode =>
    childrenOf(parentId).map((item) => (
      <React.Fragment key={item.id}>
        <button
          type="button"
          onClick={() => setSelectedSponsorId(item.id)}
          className={`w-full text-left px-3 py-2 rounded border ${
            selectedSponsorId === item.id
              ? 'border-cyan-500/60 bg-cyan-500/10'
              : 'border-slate-800 bg-slate-950'
          } text-white`}
          style={{ marginLeft: `${depth * 16}px`, width: `calc(100% - ${depth * 16}px)` }}
        >
          <div className="font-semibold">{item.name}</div>
          <div className="text-xs text-slate-400">
            ID {item.id} | {item.sponsorCode} | {item.sponsorType}
          </div>
        </button>
        {renderTree(item.id, depth + 1)}
      </React.Fragment>
    ));

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Benevo Sponsors and Locations</h2>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Create HOST, CHILD, and PARTNER sponsors and attach locations with optional PINs.
        </p>
      </div>

      {error && (
        <p className="text-sm text-rose-400 inline-flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={createSponsor} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-1">
            <Plus className="w-4 h-4" />
            Add Sponsor
          </h3>

          <input
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
            placeholder="Sponsor name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
            placeholder="Sponsor code (e.g. GARAGE_AIRLINE)"
            value={sponsorCode}
            onChange={(e) => setSponsorCode(e.target.value)}
            required
          />

          <select
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
            value={sponsorType}
            onChange={(e) => setSponsorType(e.target.value as 'HOST' | 'CHILD' | 'PARTNER')}
          >
            <option value="CHILD">CHILD</option>
            <option value="PARTNER">PARTNER</option>
            <option value="HOST">HOST</option>
          </select>

          <select
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
            value={parentSponsorId}
            disabled={sponsorType !== 'CHILD'}
            onChange={(e) => setParentSponsorId(Number(e.target.value))}
          >
            <option value={0}>No parent sponsor</option>
            {selectableParents.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.id})
              </option>
            ))}
          </select>

          <button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded px-4 py-2 text-sm font-semibold">
            Create Sponsor
          </button>
        </form>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Sponsor hierarchy</h3>
          <div className="space-y-2">
            {renderTree(null)}
            {sponsors.length === 0 && (
              <p className="text-sm text-slate-400">No sponsors found. Provision a tenant first.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={createLocation} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            Add Location
          </h3>

          <select
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
            value={selectedSponsorId}
            onChange={(e) => setSelectedSponsorId(Number(e.target.value))}
            required
          >
            {sponsors.length === 0 && <option value={0}>Select sponsor</option>}
            {sponsors.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.sponsorCode})
              </option>
            ))}
          </select>

          <input
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
            placeholder="Location name"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            required
          />

          <input
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
            placeholder="Location code (e.g. GAR-BAR-01)"
            value={locationCode}
            onChange={(e) => setLocationCode(e.target.value)}
            required
          />

          <input
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
            placeholder="Location PIN (optional)"
            value={locationPin}
            onChange={(e) => setLocationPin(e.target.value)}
          />

          <button className="bg-cyan-600 hover:bg-cyan-500 text-white rounded px-4 py-2 text-sm font-semibold">
            Create Location
          </button>
        </form>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white">Locations</h3>
          <div className="mt-3 space-y-2 max-h-80 overflow-auto">
            {locations.map((item) => (
              <div key={item.id} className="bg-slate-950 border border-slate-800 rounded p-3 text-sm text-white">
                {item.locationName}
                <span className="text-xs text-slate-400 ml-2">
                  {item.locationCode} | PIN {item.locationPin} | ID {item.id}
                </span>
              </div>
            ))}
            {locations.length === 0 && (
              <p className="text-sm text-slate-400">Select a sponsor to view locations.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
