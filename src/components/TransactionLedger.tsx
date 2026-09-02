import React, { useEffect, useMemo, useState } from 'react';
import { useReward } from '../context/RewardContext';
import { api } from '../api/client';
import { History } from 'lucide-react';

export const TransactionLedger: React.FC = () => {
  const { selectedBusinessId, selectedUserId } = useReward();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!selectedBusinessId || !selectedUserId) {
      setRows([]);
      return;
    }

    void (async () => {
      setLoading(true);
      try {
        const data = await api.getWalletHistory(selectedBusinessId, selectedUserId);
        setRows(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedBusinessId, selectedUserId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      return (
        String(r.referenceId || '').toLowerCase().includes(q) ||
        String(r.eventType || '').toLowerCase().includes(q) ||
        String(r.branchCode || '').toLowerCase().includes(q)
      );
    });
  }, [rows, search]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Branch-Aware Transaction Ledger</h2>
        </div>
        <p className="text-sm text-slate-400 mt-1">Shows shared member activity with branch tagging.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-80 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white mb-3"
          placeholder="Search by ref/event/branch"
        />

        {loading ? (
          <p className="text-sm text-slate-400">Loading transactions...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="py-2 pr-3">Reference</th>
                  <th className="py-2 pr-3">Event</th>
                  <th className="py-2 pr-3">Points</th>
                  <th className="py-2 pr-3">Branch</th>
                  <th className="py-2 pr-3">Entry Type</th>
                  <th className="py-2 pr-3">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => (
                  <tr key={`${r.id || r.referenceId || idx}-${idx}`} className="border-b border-slate-800/60">
                    <td className="py-2 pr-3 font-mono">{r.referenceId || '-'}</td>
                    <td className="py-2 pr-3">{r.eventType || '-'}</td>
                    <td className="py-2 pr-3">{r.points || 0}</td>
                    <td className="py-2 pr-3">{r.branchCode || r.branchId || '-'}</td>
                    <td className="py-2 pr-3">{r.entryType || '-'}</td>
                    <td className="py-2 pr-3">{r.createdAt || r.timestamp || '-'}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">No transactions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
