import React, { useEffect, useMemo, useState } from 'react';
import { useReward } from '../context/RewardContext';
import { api } from '../api/client';
import { Wallet as WalletIcon, AlertCircle } from 'lucide-react';

export const WalletView: React.FC = () => {
  const { selectedBusinessId, selectedUserId, businesses, users } = useReward();

  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pointsToRedeem, setPointsToRedeem] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redemptionMessage, setRedemptionMessage] = useState('');

  useEffect(() => {
    if (!selectedBusinessId || !selectedUserId) {
      setHistory([]);
      return;
    }

    void (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.getWalletHistory(selectedBusinessId, selectedUserId);
        setHistory(data);
      } catch (err: any) {
        setError(err.message || 'Unable to load wallet history');
        setHistory([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedBusinessId, selectedUserId]);

  const availablePoints = useMemo(() => {
    return history.reduce((sum, row) => {
      if (row.accountType === 'RECOGNITION') return sum;
      const points = Number(row.points || 0);
      return row.entryType === 'DEBIT' ? sum - points : sum + points;
    }, 0);
  }, [history]);

  const selectedBusiness = businesses.find((b) => b.id === selectedBusinessId);
  const selectedUser = users.find((u) => u.id === selectedUserId);

  const refreshHistory = async () => {
    if (!selectedBusinessId || !selectedUserId) return;
    const data = await api.getWalletHistory(selectedBusinessId, selectedUserId);
    setHistory(data);
  };

  const handleRedeem = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setRedemptionMessage('');
    const parsedPoints = Number(pointsToRedeem);
    const programId = Number(localStorage.getItem('programId') || 0);
    const sponsorId = Number(localStorage.getItem('sponsorId') || 0);

    if (!selectedBusinessId || !selectedUserId || !programId || !sponsorId || !Number.isInteger(parsedPoints) || parsedPoints <= 0 || !referenceId.trim()) {
      setError('Select a tenant and member, then enter points and a reference ID.');
      return;
    }

    setIsRedeeming(true);
    try {
      const response = await api.redeemPoints({
        tenantId: Number(selectedBusinessId),
        programId,
        sponsorId,
        memberId: selectedUserId,
        pointsToRedeem: parsedPoints,
        referenceId: referenceId.trim(),
        channel: 'DASHBOARD',
      });
      setRedemptionMessage(`${response.message} Remaining balance: ${response.remainingBalance} pts.`);
      setPointsToRedeem('');
      setReferenceId('');
      await refreshHistory();
    } catch (redemptionError: any) {
      setError(redemptionError.message || 'Unable to redeem points');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2">
          <WalletIcon className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Shared Wallet & History</h2>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          GET /api/wallet-history/{'{tenantId}'}/{'{memberId}'} across all branches.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="text-sm text-slate-300">Tenant: <span className="text-white font-semibold">{selectedBusiness?.name || selectedBusinessId || '-'}</span></div>
        <div className="text-sm text-slate-300">Member: <span className="text-white font-semibold">{selectedUser?.name || selectedUserId || '-'}</span></div>
        <div className="mt-3 text-3xl font-bold text-emerald-400">{Math.max(0, availablePoints)} pts</div>
        <div className="text-xs text-slate-400">Shared balance across branches</div>
      </div>

      <form onSubmit={handleRedeem} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white">Redeem Points</h3>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] gap-3">
          <input
            type="number"
            min="1"
            max={Math.max(0, availablePoints)}
            value={pointsToRedeem}
            onChange={(event) => setPointsToRedeem(event.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
            placeholder="Points to redeem"
            required
          />
          <input
            value={referenceId}
            onChange={(event) => setReferenceId(event.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
            placeholder="Checkout reference ID"
            required
          />
          <button type="submit" disabled={isRedeeming || availablePoints <= 0} className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white rounded px-4 py-2 text-sm font-semibold">
            {isRedeeming ? 'Redeeming...' : 'Redeem'}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-400">Redemption uses the selected program's configured point value and requires a unique checkout reference.</p>
        {redemptionMessage && <p className="mt-3 text-sm text-emerald-400">{redemptionMessage}</p>}
      </form>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Wallet Activity</h3>

        {loading && <p className="text-sm text-slate-400">Loading history...</p>}
        {error && <p className="text-sm text-rose-400 inline-flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}

        {!loading && history.length === 0 && !error && (
          <p className="text-sm text-slate-400">No wallet history for this member yet.</p>
        )}

        <div className="space-y-2">
          {history.map((row, idx) => (
            <div key={`${row.id || row.referenceId || 'row'}-${idx}`} className="bg-slate-950 border border-slate-800 rounded p-3 text-xs">
              <div className="text-white font-semibold">{row.eventType || row.entryType || 'ENTRY'} • {row.points || 0} pts</div>
              <div className="text-slate-400 mt-1">Branch: {row.branchCode || row.branchId || '-'}</div>
              <div className="text-slate-400">Reference: {row.referenceId || '-'}</div>
              <div className="text-slate-500">{row.createdAt || row.timestamp || '-'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
