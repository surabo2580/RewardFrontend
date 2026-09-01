import React, { useEffect, useMemo, useState } from 'react';
import { useReward } from '../context/RewardContext';
import {
  api,
  ReconciliationBatchDto,
  ReconciliationLineDto,
  ReconciliationRunDto,
  SponsorDto,
} from '../api/client';
import { Layers3, FileSpreadsheet, AlertCircle } from 'lucide-react';

export const ReconciliationManager: React.FC = () => {
  const { selectedBusinessId } = useReward();
  const tenantId = Number(selectedBusinessId || 0);
  const programId = Number(localStorage.getItem('programId') || 0);

  const [sponsors, setSponsors] = useState<SponsorDto[]>([]);
  const [selectedSponsorId, setSelectedSponsorId] = useState(0);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [pointCost, setPointCost] = useState('0.25');

  const [batches, setBatches] = useState<ReconciliationBatchDto[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState(0);
  const [lines, setLines] = useState<ReconciliationLineDto[]>([]);
  const [lastRun, setLastRun] = useState<ReconciliationRunDto | null>(null);
  const [error, setError] = useState('');

  const partnerSponsors = useMemo(
    () => sponsors.filter((sponsor) => sponsor.sponsorType === 'PARTNER'),
    [sponsors]
  );

  const loadSponsors = async () => {
    if (!tenantId || !programId) return;
    const loaded = await api.getSponsors(tenantId, programId);
    setSponsors(loaded);
  };

  const loadBatches = async () => {
    if (!tenantId) return;
    const loaded = await api.getReconciliationBatches(tenantId);
    setBatches(loaded);
  };

  const loadLines = async (batchId: number) => {
    if (!tenantId || !batchId) return;
    const loaded = await api.getReconciliationLines(tenantId, batchId);
    setLines(loaded);
  };

  useEffect(() => {
    void loadSponsors().catch((err: any) => setError(err.message || 'Unable to load sponsors'));
    void loadBatches().catch((err: any) => setError(err.message || 'Unable to load batches'));
  }, [tenantId, programId]);

  useEffect(() => {
    if (!selectedSponsorId && partnerSponsors[0]) {
      setSelectedSponsorId(partnerSponsors[0].id);
    }
  }, [partnerSponsors, selectedSponsorId]);

  useEffect(() => {
    if (!selectedBatchId && batches[0]) {
      setSelectedBatchId(batches[0].id);
      return;
    }
    if (selectedBatchId) {
      void loadLines(selectedBatchId).catch((err: any) => setError(err.message || 'Unable to load batch lines'));
    }
  }, [selectedBatchId, batches]);

  const runBatch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tenantId || !selectedSponsorId) return;

    try {
      setError('');
      const result = await api.createReconciliationBatch({
        tenantId,
        sponsorId: selectedSponsorId,
        periodStart,
        periodEnd,
        pointCost: Number(pointCost),
      });
      setLastRun(result);
      await loadBatches();
      setSelectedBatchId(result.batch.id);
      setLines(result.lines);
    } catch (err: any) {
      setError(err.message || 'Unable to run reconciliation batch');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2">
          <Layers3 className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-bold text-white">Partner Reconciliation</h2>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Run settlement batches for PARTNER sponsors and inspect line-level point costs.
        </p>
      </div>

      {error && (
        <p className="text-sm text-rose-400 inline-flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={runBatch} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white">Run Monthly Batch</h3>

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

          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              required
            />
            <input
              type="date"
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              required
            />
          </div>

          <input
            type="number"
            step="0.01"
            min="0.01"
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
            value={pointCost}
            onChange={(e) => setPointCost(e.target.value)}
            placeholder="Point cost"
            required
          />

          <button className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 rounded px-4 py-2 text-sm font-semibold">
            Run Reconciliation
          </button>

          {lastRun && (
            <div className="rounded border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              Batch {lastRun.batch.id} created with {lastRun.batch.totalPoints} points and amount {lastRun.batch.totalAmount}.
            </div>
          )}
        </form>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-cyan-300" />
            <h3 className="text-sm font-semibold text-white">Existing Batches</h3>
          </div>

          <select
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(Number(e.target.value))}
          >
            {batches.length === 0 && <option value={0}>No batches yet</option>}
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                Batch #{batch.id} | Sponsor {batch.sponsorId} | {batch.periodStart} to {batch.periodEnd}
              </option>
            ))}
          </select>

          <div className="space-y-2 max-h-80 overflow-auto">
            {lines.map((line) => (
              <div key={line.id} className="bg-slate-950 border border-slate-800 rounded px-3 py-2">
                <div className="text-sm text-white font-semibold">Txn {line.transactionId}</div>
                <div className="text-xs text-slate-400">Member {line.memberId} • Points {line.points}</div>
                <div className="text-xs text-cyan-300">Cost {line.pointCost} • Amount {line.amount}</div>
              </div>
            ))}
            {lines.length === 0 && (
              <p className="text-sm text-slate-400">No reconciliation lines available for selected batch.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
