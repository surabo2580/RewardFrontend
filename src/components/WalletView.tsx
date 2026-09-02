import React, { useEffect, useMemo, useState } from 'react';
import { useReward } from '../context/RewardContext';
import { api } from '../api/client';
import { Wallet as WalletIcon, AlertCircle } from 'lucide-react';

export const WalletView: React.FC = () => {
  const { selectedBusinessId, selectedUserId, businesses, users } = useReward();

  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      const points = Number(row.points || 0);
      return row.entryType === 'DEBIT' ? sum - points : sum + points;
    }, 0);
  }, [history]);

  const selectedBusiness = businesses.find((b) => b.id === selectedBusinessId);
  const selectedUser = users.find((u) => u.id === selectedUserId);

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
