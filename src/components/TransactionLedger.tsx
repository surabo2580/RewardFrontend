import React, { useState } from 'react';
import { useReward } from '../context/RewardContext';
import { TransactionStatus } from '../types';
import { 
  History, 
  CheckCircle2, 
  Clock, 
  ArrowDownRight, 
  ArrowUpRight, 
  Filter, 
  Search, 
  Building2, 
  Tag, 
  Check,
  FileText
} from 'lucide-react';

export const TransactionLedger: React.FC = () => {
  const { 
    transactions, 
    businesses, 
    users, 
    confirmPoints 
  } = useReward();

  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterBusiness, setFilterBusiness] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTransactions = transactions.filter((tx) => {
    const matchStatus = filterStatus === 'ALL' || tx.status === filterStatus;
    const matchBiz = filterBusiness === 'ALL' || tx.businessId.toLowerCase() === filterBusiness.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchSearch =
      !query ||
      tx.userId.toLowerCase().includes(query) ||
      tx.businessId.toLowerCase().includes(query) ||
      tx.eventType.toLowerCase().includes(query) ||
      (tx.referenceId && tx.referenceId.toLowerCase().includes(query)) ||
      (tx.evaluatedRulesSummary && tx.evaluatedRulesSummary.toLowerCase().includes(query));

    return matchStatus && matchBiz && matchSearch;
  });

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            CONFIRMED
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            PENDING
          </span>
        );
      case 'REDEEMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30">
            <ArrowDownRight className="w-3 h-3" />
            REDEEMED
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-700 text-slate-300">
            EXPIRED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <History className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">Reward Transactions Ledger</h2>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Audit log of all reward event executions, point calculations, pending settlements, and redemptions across all tenants.
            </p>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Total records: <strong className="text-white">{transactions.length}</strong>
          </div>
        </div>

        {/* Filter controls */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3 text-xs">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user, ref ID, event, note..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
            <span className="text-slate-400">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Statuses</option>
              <option value="PENDING" className="bg-slate-900">PENDING</option>
              <option value="CONFIRMED" className="bg-slate-900">CONFIRMED</option>
              <option value="REDEEMED" className="bg-slate-900">REDEEMED</option>
            </select>
          </div>

          {/* Business Filter */}
          <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
            <span className="text-slate-400">Business:</span>
            <select
              value={filterBusiness}
              onChange={(e) => setFilterBusiness(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Businesses</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id} className="bg-slate-900">
                  {b.name} ({b.id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Ref / ID</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Business</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Points</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Evaluation / Details</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-sm">
                    No transactions match your search or filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const biz = businesses.find((b) => b.id.toLowerCase() === tx.businessId.toLowerCase());
                  const usr = users.find((u) => u.id.toLowerCase() === tx.userId.toLowerCase());
                  const isPositive = tx.points >= 0;

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Ref ID */}
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {tx.referenceId || `#${tx.id}`}
                      </td>

                      {/* User */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{usr?.name || tx.userId}</div>
                        <div className="text-[10px] font-mono text-slate-400">@{tx.userId}</div>
                      </td>

                      {/* Business */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-amber-300">{biz?.name || tx.businessId}</div>
                        <div className="text-[10px] font-mono text-slate-400">{tx.businessId}</div>
                      </td>

                      {/* Event Type */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                          {tx.eventType}
                        </span>
                      </td>

                      {/* Points */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-mono font-bold text-sm ${
                            isPositive ? 'text-emerald-400' : 'text-pink-400'
                          }`}
                        >
                          {isPositive ? `+${tx.points}` : tx.points} pts
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">{getStatusBadge(tx.status)}</td>

                      {/* Evaluation / Properties */}
                      <td className="py-3.5 px-4 max-w-xs truncate text-[11px] text-slate-400">
                        {tx.evaluatedRulesSummary ||
                          (tx.properties ? JSON.stringify(tx.properties) : '—')}
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                        {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {tx.status === 'PENDING' ? (
                          <button
                            id={`confirm-tx-${tx.id}`}
                            onClick={() => confirmPoints(tx.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition-colors shadow-sm cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            Confirm
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
