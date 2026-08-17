import React, { useState } from 'react';
import { useReward } from '../context/RewardContext';
import { RewardRule, RewardType } from '../types';
import { 
  SlidersHorizontal, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Power, 
  Percent, 
  Coins, 
  DollarSign,
  Building2,
  Filter,
  Info
} from 'lucide-react';

export const RuleManager: React.FC = () => {
  const { 
    rules, 
    businesses, 
    selectedBusinessId, 
    addRule, 
    updateRule, 
    deleteRule, 
    toggleRuleActive 
  } = useReward();

  const [filterBusiness, setFilterBusiness] = useState<string>('ALL');
  const [filterEventType, setFilterEventType] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);

  // Form fields
  const [formBusinessId, setFormBusinessId] = useState<string>(selectedBusinessId);
  const [formEventType, setFormEventType] = useState<string>('PURCHASE');
  const [formMinAmount, setFormMinAmount] = useState<string>('50');
  const [formRewardType, setFormRewardType] = useState<RewardType>('PERCENTAGE');
  const [formRewardValue, setFormRewardValue] = useState<string>('10');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formDescription, setFormDescription] = useState<string>('');

  const openAddModal = () => {
    setEditingRuleId(null);
    setFormBusinessId(selectedBusinessId);
    setFormEventType('PURCHASE');
    setFormMinAmount('50');
    setFormRewardType('PERCENTAGE');
    setFormRewardValue('10');
    setFormIsActive(true);
    setFormDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (rule: RewardRule) => {
    setEditingRuleId(rule.id);
    setFormBusinessId(rule.businessId);
    setFormEventType(rule.eventType);
    setFormMinAmount(rule.minAmount !== null && rule.minAmount !== undefined ? rule.minAmount.toString() : '');
    setFormRewardType(rule.rewardType);
    setFormRewardValue(rule.rewardValue.toString());
    setFormIsActive(rule.isActive);
    setFormDescription(rule.description || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const minAmountVal = formMinAmount.trim() ? parseFloat(formMinAmount) : null;
    const rewardValueVal = parseFloat(formRewardValue) || 0;

    if (editingRuleId) {
      updateRule(editingRuleId, {
        businessId: formBusinessId,
        eventType: formEventType.toUpperCase().trim(),
        minAmount: minAmountVal,
        rewardType: formRewardType,
        rewardValue: rewardValueVal,
        isActive: formIsActive,
        description: formDescription.trim() || undefined,
      });
    } else {
      addRule({
        businessId: formBusinessId,
        eventType: formEventType.toUpperCase().trim(),
        minAmount: minAmountVal,
        rewardType: formRewardType,
        rewardValue: rewardValueVal,
        isActive: formIsActive,
        description: formDescription.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  // Filtered list
  const filteredRules = rules.filter((r) => {
    const matchBiz = filterBusiness === 'ALL' || r.businessId.toLowerCase() === filterBusiness.toLowerCase();
    const matchEvent = filterEventType === 'ALL' || r.eventType.toUpperCase() === filterEventType.toUpperCase();
    return matchBiz && matchEvent;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <SlidersHorizontal className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">Reward Rules Configuration</h2>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Configured reward policies evaluated by <code className="text-indigo-300 bg-slate-800 px-1.5 py-0.5 rounded font-mono text-xs">RuleEngine.kt</code>. 
              Supports <strong className="text-slate-200">FLAT</strong> point grants and <strong className="text-slate-200">PERCENTAGE</strong> calculation with optional minimum amount conditions.
            </p>
          </div>

          <button
            id="rule-add-new-btn"
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-sm shadow-indigo-600/30 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Rule</span>
          </button>
        </div>

        {/* Filter controls */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter by:</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
            <span className="text-slate-400">Business:</span>
            <select
              id="rules-filter-business"
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

          <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
            <span className="text-slate-400">Event:</span>
            <select
              id="rules-filter-event"
              value={filterEventType}
              onChange={(e) => setFilterEventType(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Event Types</option>
              <option value="PURCHASE" className="bg-slate-900">PURCHASE</option>
              <option value="SIGNUP" className="bg-slate-900">SIGNUP</option>
              <option value="REFERRAL" className="bg-slate-900">REFERRAL</option>
            </select>
          </div>

          <span className="text-slate-400 ml-auto">
            Showing <strong className="text-white">{filteredRules.length}</strong> rules
          </span>
        </div>
      </div>

      {/* Rules Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRules.map((rule) => {
          const biz = businesses.find((b) => b.id.toLowerCase() === rule.businessId.toLowerCase());
          return (
            <div
              key={rule.id}
              className={`bg-slate-900 border rounded-xl p-4 transition-all relative flex flex-col justify-between ${
                rule.isActive
                  ? 'border-slate-800 hover:border-slate-700 shadow-sm'
                  : 'border-slate-800/60 opacity-60 bg-slate-950/40'
              }`}
            >
              <div>
                {/* Header: ID, Status, Tenant */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      #{rule.id}
                    </span>
                    <span className="text-xs font-semibold text-amber-400 font-mono">
                      {biz?.name || rule.businessId}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleRuleActive(rule.id)}
                    title={rule.isActive ? 'Active (click to deactivate)' : 'Inactive (click to activate)'}
                    className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                      rule.isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{rule.isActive ? 'Active' : 'Disabled'}</span>
                  </button>
                </div>

                {/* Event Type Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {rule.eventType}
                  </span>

                  {/* Reward Calculation formula badge */}
                  <div className="flex items-center gap-1 text-sm font-mono font-bold text-white">
                    {rule.rewardType === 'PERCENTAGE' ? (
                      <span className="text-indigo-400 flex items-center gap-0.5">
                        <Percent className="w-4 h-4" />
                        {rule.rewardValue}%
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-0.5">
                        <Coins className="w-4 h-4" />
                        {rule.rewardValue} pts
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-normal ml-0.5">
                      ({rule.rewardType})
                    </span>
                  </div>
                </div>

                {/* Conditions description */}
                <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Min Amount:</span>
                    <span className="font-mono font-semibold text-slate-200">
                      {rule.minAmount !== null && rule.minAmount !== undefined
                        ? `$${rule.minAmount.toFixed(2)}`
                        : 'None (Any amount)'}
                    </span>
                  </div>
                  {rule.description && (
                    <div className="pt-1 text-[11px] text-slate-400 border-t border-slate-800/80">
                      {rule.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
                <button
                  id={`edit-rule-${rule.id}`}
                  onClick={() => openEditModal(rule)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  id={`delete-rule-${rule.id}`}
                  onClick={() => {
                    if (window.confirm(`Delete rule #${rule.id}?`)) {
                      deleteRule(rule.id);
                    }
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingRuleId ? `Edit Rule #${editingRuleId}` : 'Create New Reward Rule'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                {/* Business Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Business (Tenant)
                  </label>
                  <select
                    value={formBusinessId}
                    onChange={(e) => setFormBusinessId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Event Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Event Type
                  </label>
                  <input
                    type="text"
                    value={formEventType}
                    onChange={(e) => setFormEventType(e.target.value.toUpperCase())}
                    placeholder="e.g. PURCHASE, SIGNUP"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Reward Type and Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Reward Type
                  </label>
                  <select
                    value={formRewardType}
                    onChange={(e) => setFormRewardType(e.target.value as RewardType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="PERCENTAGE">PERCENTAGE (% of amount)</option>
                    <option value="FLAT">FLAT (Fixed point quantity)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Reward Value {formRewardType === 'PERCENTAGE' ? '(%)' : '(Points)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formRewardValue}
                    onChange={(e) => setFormRewardValue(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Minimum Amount Condition */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Minimum Amount Condition ($) <span className="text-slate-400 font-normal">(Leave empty for no minimum)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formMinAmount}
                  onChange={(e) => setFormMinAmount(e.target.value)}
                  placeholder="e.g. 50.00"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Rule Description / Label
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. 10% points for orders over $50"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="form-rule-active-checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="form-rule-active-checkbox" className="text-xs text-slate-300">
                  Rule is active and evaluated in rule engine
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="save-rule-submit-btn"
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm shadow-indigo-600/30 transition-all"
                >
                  {editingRuleId ? 'Update Rule' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
