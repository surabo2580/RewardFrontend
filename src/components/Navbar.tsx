import React from 'react';
import { useReward } from '../context/RewardContext';
import { 
  Gift, 
  Send, 
  SlidersHorizontal, 
  Wallet as WalletIcon, 
  History, 
  Terminal, 
  Building2, 
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Cpu,
  GitBranch
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { 
    businesses, 
    users, 
    selectedBusinessId, 
    setSelectedBusinessId, 
    selectedUserId, 
    setSelectedUserId,
    getWallet,
    resetToDefaults
  } = useReward();

  const currentWallet = getWallet(selectedUserId, selectedBusinessId);
  const navItems = [
    { id: 'events', label: 'Track Events', icon: Send, count: null },
    { id: 'rules', label: 'Reward Rules', icon: SlidersHorizontal, count: null },
    { id: 'wallet', label: 'User Wallet', icon: WalletIcon, count: null },
    { id: 'transactions', label: 'Transactions', icon: History, count: null },
    { id: 'api', label: 'REST API & Sandbox', icon: Terminal, count: null },
    { id: 'entities', label: 'Businesses & Users', icon: Building2, count: null },
    { id: 'kotlin', label: 'Kotlin Source', icon: Cpu, count: null },
    { id: 'repos', label: '2-Repo Architecture', icon: GitBranch, count: null },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar: Brand & Tenant/User context */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3 border-b border-slate-800/60">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">Smart Reward Engine</h1>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Multi-Tenant
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Spring Boot & Kotlin architecture ported to React
              </p>
            </div>
          </div>

          {/* Quick context selectors */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs">
            {/* Business Selector */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
              <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-slate-400 hidden sm:inline">Business:</span>
              <select
                id="header-business-selector"
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-2"
              >
                {businesses.length === 0 && (
                  <option value="" className="bg-slate-900 text-white">
                    No tenants
                  </option>
                )}
                {businesses.map((b) => (
                  <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                    {b.name} ({b.id})
                  </option>
                ))}
              </select>
            </div>

            {/* User Selector */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
              <span className="text-indigo-400 font-bold shrink-0">@</span>
              <span className="text-slate-400 hidden sm:inline">User:</span>
              <select
                id="header-user-selector"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-2"
              >
                {users.length === 0 && (
                  <option value="" className="bg-slate-900 text-white">
                    No members
                  </option>
                )}
                {users.map((u) => (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                    {u.name || u.id} ({u.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Active Wallet Balance Badge */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-950 to-slate-800 px-3 py-1.5 rounded-lg border border-indigo-500/40">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-semibold text-slate-400 leading-none">Wallet</div>
                <div className="font-mono text-xs font-bold text-white">
                  <span className="text-emerald-400">{currentWallet.availablePoints}</span>
                  <span className="text-slate-400 font-normal"> avail</span>
                  {currentWallet.pendingPoints > 0 && (
                    <span className="text-amber-400 ml-1.5 font-semibold">
                      +{currentWallet.pendingPoints} pend
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Reset Defaults */}
            <button
              id="header-reset-defaults-btn"
              onClick={() => {
                if (window.confirm('Reset all rules, wallets, transactions, and tenants to initial demo state?')) {
                  resetToDefaults();
                }
              }}
              title="Reset state to initial Spring Boot demo values"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md border border-slate-700/60 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom bar: Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none" aria-label="Tabs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
