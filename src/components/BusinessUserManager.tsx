import React, { useState } from 'react';
import { useReward } from '../context/RewardContext';
import { 
  Building2, 
  Users as UsersIcon, 
  Plus, 
  UserCheck, 
  Shield, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export const BusinessUserManager: React.FC = () => {
  const { 
    businesses, 
    users, 
    selectedBusinessId, 
    selectedUserId, 
    setSelectedBusinessId, 
    setSelectedUserId,
    addBusiness, 
    addUser 
  } = useReward();

  // Business form
  const [newBizId, setNewBizId] = useState('');
  const [newBizName, setNewBizName] = useState('');

  // User form
  const [newUserId, setNewUserId] = useState('');
  const [newUserName, setNewUserName] = useState('');

  const handleAddBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizId.trim() || !newBizName.trim()) return;

    addBusiness({
      id: newBizId.trim().toLowerCase().replace(/\s+/g, '_'),
      name: newBizName.trim(),
    });

    setNewBizId('');
    setNewBizName('');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserId.trim()) return;

    addUser({
      id: newUserId.trim().toLowerCase().replace(/\s+/g, '_'),
      name: newUserName.trim() || undefined,
    });

    setNewUserId('');
    setNewUserName('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Building2 className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">Tenants (Businesses) & Users Directory</h2>
        </div>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Multi-tenant reward engine manages distinct business tenants (<code className="text-indigo-300 font-mono text-xs">Business.kt</code>) and customer accounts (<code className="text-indigo-300 font-mono text-xs">User.kt</code>).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Businesses / Tenants Column */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-bold text-white">Registered Businesses ({businesses.length})</h3>
              </div>
            </div>

            {/* List */}
            <div className="mt-4 space-y-3">
              {businesses.map((b) => {
                const isSelected = b.id.toLowerCase() === selectedBusinessId.toLowerCase();
                return (
                  <div
                    key={b.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-indigo-950/30 border-indigo-500/50 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white text-sm flex items-center gap-2">
                        <span>{b.name}</span>
                        {isSelected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Active Tenant
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-slate-400 mt-0.5">
                        id: <span className="text-amber-300">{b.id}</span>
                      </div>
                    </div>

                    {!isSelected && (
                      <button
                        onClick={() => setSelectedBusinessId(b.id)}
                        className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
                      >
                        Set Active
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add Business Form */}
            <form onSubmit={handleAddBusiness} className="mt-6 pt-4 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Add New Business</h4>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Business ID (e.g. coffee_hub)"
                  value={newBizId}
                  onChange={(e) => setNewBizId(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Display Name (e.g. Coffee Hub)"
                  value={newBizName}
                  onChange={(e) => setNewBizName(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                + Register Business Tenant
              </button>
            </form>
          </div>
        </div>

        {/* Users Column */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UsersIcon className="w-4 h-4 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Registered Users ({users.length})</h3>
              </div>
            </div>

            {/* List */}
            <div className="mt-4 space-y-3">
              {users.map((u) => {
                const isSelected = u.id.toLowerCase() === selectedUserId.toLowerCase();
                return (
                  <div
                    key={u.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-indigo-950/30 border-indigo-500/50 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white text-sm flex items-center gap-2">
                        <span>{u.name || u.id}</span>
                        {isSelected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Active User
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-slate-400 mt-0.5">
                        id: <span className="text-indigo-300">@{u.id}</span>
                      </div>
                    </div>

                    {!isSelected && (
                      <button
                        onClick={() => setSelectedUserId(u.id)}
                        className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
                      >
                        Select User
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add User Form */}
            <form onSubmit={handleAddUser} className="mt-6 pt-4 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Register New User</h4>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="User ID (e.g. user_99)"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Full Name (e.g. John Doe)"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                + Register User
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
