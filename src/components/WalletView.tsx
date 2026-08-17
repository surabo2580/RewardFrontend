import React, { useState } from 'react';
import { useReward } from '../context/RewardContext';
import { 
  Wallet as WalletIcon, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Building2, 
  CreditCard, 
  Gift, 
  Coins, 
  AlertCircle,
  TrendingUp,
  UserCheck
} from 'lucide-react';

export const WalletView: React.FC = () => {
  const { 
    wallets, 
    businesses, 
    users, 
    selectedBusinessId, 
    selectedUserId, 
    setSelectedBusinessId,
    getWallet, 
    confirmAllPending, 
    redeemPoints 
  } = useReward();

  const [redeemAmount, setRedeemAmount] = useState<string>('50');
  const [redeemFeedback, setRedeemFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const currentWallet = getWallet(selectedUserId, selectedBusinessId);
  const selectedBusiness = businesses.find((b) => b.id.toLowerCase() === selectedBusinessId.toLowerCase());
  const selectedUser = users.find((u) => u.id.toLowerCase() === selectedUserId.toLowerCase());

  // All wallets belonging to current user across all businesses
  const userWallets = businesses.map((biz) => {
    const w = wallets.find(
      (item) => item.userId.toLowerCase() === selectedUserId.toLowerCase() && item.businessId.toLowerCase() === biz.id.toLowerCase()
    );
    return {
      business: biz,
      availablePoints: w?.availablePoints || 0,
      pendingPoints: w?.pendingPoints || 0,
      updatedAt: w?.updatedAt || null,
    };
  });

  const totalUserAvailable = userWallets.reduce((acc, w) => acc + w.availablePoints, 0);
  const totalUserPending = userWallets.reduce((acc, w) => acc + w.pendingPoints, 0);

  const handleConfirm = () => {
    confirmAllPending(selectedUserId, selectedBusinessId);
  };

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    const pts = parseInt(redeemAmount, 10);
    if (isNaN(pts) || pts <= 0) {
      setRedeemFeedback({ success: false, message: 'Please enter a valid positive number of points.' });
      return;
    }

    const success = redeemPoints(selectedUserId, selectedBusinessId, pts);
    if (success) {
      setRedeemFeedback({ success: true, message: `Successfully redeemed ${pts} points for discount vouchers!` });
      setRedeemAmount('50');
    } else {
      setRedeemFeedback({
        success: false,
        message: `Insufficient available points. You have ${currentWallet.availablePoints} points available.`,
      });
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
                <WalletIcon className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">Wallet & Balance Inquiry</h2>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Simulates the Spring Boot <code className="text-indigo-300 bg-slate-800 px-1.5 py-0.5 rounded font-mono text-xs">GET /wallet/&#123;businessId&#125;/&#123;userId&#125;</code> endpoint. 
              Wallets maintain multi-tenant partitioned point balances per user and business pairing.
            </p>
          </div>

          <div className="bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-700 text-xs flex items-center gap-3">
            <div>
              <span className="text-slate-400">Total Across All Businesses:</span>
              <div className="font-mono font-bold text-white text-sm">
                <span className="text-emerald-400">{totalUserAvailable}</span> avail /{' '}
                <span className="text-amber-400">{totalUserPending}</span> pend
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Wallet Hero Card for Active Context */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            {/* Background glowing orb */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between pb-4 border-b border-indigo-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs uppercase font-bold text-indigo-400 tracking-wider">
                    {selectedBusiness?.name || selectedBusinessId}
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {selectedUser?.name || selectedUserId} <span className="text-xs font-mono text-slate-400">({selectedUserId})</span>
                  </div>
                </div>
              </div>

              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Tenant: {selectedBusinessId}
              </span>
            </div>

            {/* Points Balances */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {/* Available Points */}
              <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-4 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Available Points
                  </span>
                  <span className="text-[10px] text-slate-400">Ready to redeem</span>
                </div>
                <div className="text-3xl font-extrabold font-mono text-emerald-400 tracking-tight">
                  {currentWallet.availablePoints.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Est. value: ${(currentWallet.availablePoints * 0.1).toFixed(2)} USD
                </div>
              </div>

              {/* Pending Points */}
              <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-4 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    Pending Points
                  </span>
                  <span className="text-[10px] text-slate-400">Awaiting settlement</span>
                </div>
                <div className="text-3xl font-extrabold font-mono text-amber-400 tracking-tight">
                  {currentWallet.pendingPoints.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Added from recent events
                </div>
              </div>
            </div>

            {/* Settle / Confirm Button */}
            {currentWallet.pendingPoints > 0 && (
              <div className="mt-5 p-3.5 bg-amber-950/30 border border-amber-500/40 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-xs text-amber-200">
                  You have <strong className="font-mono">{currentWallet.pendingPoints}</strong> points waiting to be confirmed into available balance.
                </div>
                <button
                  id="confirm-pending-points-btn"
                  onClick={handleConfirm}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto cursor-pointer"
                >
                  Confirm & Settle Now
                </button>
              </div>
            )}
          </div>

          {/* Redemption Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Gift className="w-4 h-4 text-pink-400" />
              Redeem Available Loyalty Points
            </h3>

            <form onSubmit={handleRedeem} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Points to Redeem
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Coins className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      id="redeem-points-input"
                      type="number"
                      min="1"
                      max={currentWallet.availablePoints || 1}
                      value={redeemAmount}
                      onChange={(e) => setRedeemAmount(e.target.value)}
                      placeholder="e.g. 50"
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={currentWallet.availablePoints <= 0}
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    Redeem Points
                  </button>
                </div>
              </div>

              {redeemFeedback && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                    redeemFeedback.success
                      ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-700/50 text-rose-200'
                  }`}
                >
                  {redeemFeedback.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span>{redeemFeedback.message}</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: Multi-Tenant Breakdown for this User */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">All Wallets for @{selectedUserId}</h3>
              </div>
              <span className="text-xs text-slate-400">Multi-Tenant Store</span>
            </div>

            <div className="mt-4 space-y-3">
              {userWallets.map((item) => {
                const isSelected = item.business.id.toLowerCase() === selectedBusinessId.toLowerCase();
                return (
                  <div
                    key={item.business.id}
                    onClick={() => setSelectedBusinessId(item.business.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/30 border-indigo-500/60 shadow-md shadow-indigo-950/40'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                        <span>{item.business.name}</span>
                        {isSelected && (
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-500/30">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-slate-400">id: {item.business.id}</span>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400">Available: </span>
                        <strong className="text-emerald-400 font-mono">{item.availablePoints} pts</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Pending: </span>
                        <strong className="text-amber-400 font-mono">+{item.pendingPoints} pts</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
