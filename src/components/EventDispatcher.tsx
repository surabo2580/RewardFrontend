import React, { useState } from 'react';
import { useReward } from '../context/RewardContext';
import { RuleEngine } from '../engine/RuleEngine';
import { EventRequest, EvaluationResult } from '../types';
import { 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Code2, 
  Coins, 
  ShoppingCart, 
  UserPlus, 
  Share2, 
  Zap, 
  ArrowRight,
  Info,
  Clock,
  Layers
} from 'lucide-react';

export const EventDispatcher: React.FC = () => {
  const { 
    businesses, 
    users, 
    rules, 
    selectedBusinessId, 
    selectedUserId, 
    processEvent 
  } = useReward();

  // Form state
  const [businessId, setBusinessId] = useState<string>(selectedBusinessId);
  const [userId, setUserId] = useState<string>(selectedUserId);
  const [eventType, setEventType] = useState<string>('PURCHASE');
  const [amount, setAmount] = useState<string>('120');
  const [customKey, setCustomKey] = useState<string>('notes');
  const [customVal, setCustomVal] = useState<string>('Dinner reservation');
  const [isRawJsonMode, setIsRawJsonMode] = useState<boolean>(false);
  const [rawJson, setRawJson] = useState<string>(
    JSON.stringify(
      {
        userId: selectedUserId,
        businessId: selectedBusinessId,
        event: 'PURCHASE',
        properties: { amount: 120, channel: 'mobile_app' },
      },
      null,
      2
    )
  );

  const [lastResult, setLastResult] = useState<{
    success: boolean;
    points: number;
    message: string;
    evaluation: EvaluationResult;
    timestamp: number;
  } | null>(null);

  // Sync with global selections if user wants
  const handleUseGlobalContext = () => {
    setBusinessId(selectedBusinessId);
    setUserId(selectedUserId);
  };

  // Construct current EventRequest
  const currentRequest: EventRequest = isRawJsonMode
    ? (() => {
        try {
          return JSON.parse(rawJson);
        } catch {
          return { userId, businessId, event: eventType, properties: {} };
        }
      })()
    : {
        userId: userId.trim() || 'user123',
        businessId: businessId.trim() || 'taj',
        event: eventType.trim().toUpperCase(),
        properties: {
          ...(amount ? { amount: parseFloat(amount) || 0 } : {}),
          ...(customKey.trim() && customVal.trim() ? { [customKey.trim()]: customVal.trim() } : {}),
        },
      };

  // Real-time live rule matching prediction
  const liveEvaluation = RuleEngine.evaluate(currentRequest, rules);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let reqToProcess: EventRequest;

    if (isRawJsonMode) {
      try {
        reqToProcess = JSON.parse(rawJson);
      } catch (err: any) {
        alert(`Invalid JSON format: ${err.message}`);
        return;
      }
    } else {
      reqToProcess = currentRequest;
    }

    const result = processEvent(reqToProcess);
    setLastResult({
      success: result.success,
      points: result.pointsAwarded,
      message: result.message,
      evaluation: result.evaluation,
      timestamp: Date.now(),
    });
  };

  // Preset scenarios
  const applyPreset = (preset: {
    biz: string;
    usr: string;
    ev: string;
    amt?: string;
    k?: string;
    v?: string;
  }) => {
    setBusinessId(preset.biz);
    setUserId(preset.usr);
    setEventType(preset.ev);
    setAmount(preset.amt || '');
    if (preset.k) setCustomKey(preset.k);
    if (preset.v) setCustomVal(preset.v);
    setIsRawJsonMode(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Concept Explainer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Send className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">Event Ingestion & Rule Processor</h2>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Simulates the Spring Boot <code className="text-indigo-300 bg-slate-800 px-1.5 py-0.5 rounded font-mono text-xs">POST /events</code> controller. 
              The rule engine matches active rules by tenant (<code className="font-mono text-xs text-amber-300">businessId</code>) and <code className="font-mono text-xs text-amber-300">eventType</code>, checks minimum amount conditions, and writes to the transaction ledger & wallet.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2">
            <button
              id="preset-dining-btn"
              type="button"
              onClick={() =>
                applyPreset({
                  biz: 'taj',
                  usr: selectedUserId,
                  ev: 'PURCHASE',
                  amt: '120',
                  k: 'category',
                  v: 'Fine Dining Buffet',
                })
              }
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg border border-slate-700 transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
              <span>Taj $120 Dine (10%)</span>
            </button>

            <button
              id="preset-luxury-btn"
              type="button"
              onClick={() =>
                applyPreset({
                  biz: 'taj',
                  usr: selectedUserId,
                  ev: 'PURCHASE',
                  amt: '650',
                  k: 'category',
                  v: 'Presidential Suite',
                })
              }
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg border border-slate-700 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Taj $650 Suite (+200 flat)</span>
            </button>

            <button
              id="preset-signup-btn"
              type="button"
              onClick={() =>
                applyPreset({
                  biz: 'taj',
                  usr: selectedUserId,
                  ev: 'SIGNUP',
                  amt: '',
                  k: 'channel',
                  v: 'mobile_app',
                })
              }
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg border border-slate-700 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 text-sky-400" />
              <span>Signup Welcome (250 pts)</span>
            </button>

            <button
              id="preset-referral-btn"
              type="button"
              onClick={() =>
                applyPreset({
                  biz: 'taj',
                  usr: selectedUserId,
                  ev: 'REFERRAL',
                  amt: '',
                  k: 'referee',
                  v: 'friend@example.com',
                })
              }
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg border border-slate-700 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Referral (500 pts)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Event Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-400" />
                Dispatch Event Request
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsRawJsonMode(!isRawJsonMode)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md border transition-colors ${
                    isRawJsonMode
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Raw JSON</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {!isRawJsonMode ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Business (Tenant) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Business / Tenant ID
                      </label>
                      <div className="relative">
                        <select
                          id="event-business-select"
                          value={businessId}
                          onChange={(e) => setBusinessId(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        >
                          {businesses.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name} ({b.id})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* User ID */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Target User ID
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="event-user-input"
                          type="text"
                          value={userId}
                          onChange={(e) => setUserId(e.target.value)}
                          placeholder="e.g. user123"
                          required
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={handleUseGlobalContext}
                          title="Use current header user"
                          className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-xs"
                        >
                          Sync
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Event Type */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Event Type (<code className="text-amber-300 font-mono text-[11px]">event</code>)
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
                      {['PURCHASE', 'SIGNUP', 'REFERRAL', 'CUSTOM'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            if (type !== 'CUSTOM') {
                              setEventType(type);
                            } else {
                              const custom = prompt('Enter custom event name (e.g. APP_LOGIN, REVIEW):');
                              if (custom) setEventType(custom.toUpperCase());
                            }
                          }}
                          className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                            eventType === type || (type === 'CUSTOM' && !['PURCHASE', 'SIGNUP', 'REFERRAL'].includes(eventType))
                              ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                              : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          {type === 'CUSTOM' && !['PURCHASE', 'SIGNUP', 'REFERRAL'].includes(eventType)
                            ? eventType
                            : type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Event Properties */}
                  <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 space-y-3">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Event Properties Payload</span>
                      <span className="text-[11px] text-slate-400 font-normal">properties: Map&lt;String, Any&gt;</span>
                    </div>

                    {/* Amount field if applicable */}
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        Amount ($) <span className="text-slate-400">(Required for percentage rules & minAmount checks)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-400 text-sm">$</span>
                        <input
                          id="event-amount-input"
                          type="number"
                          step="0.01"
                          min="0"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="e.g. 120.00"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-7 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Additional key-value property */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Custom Property Key</label>
                        <input
                          type="text"
                          value={customKey}
                          onChange={(e) => setCustomKey(e.target.value)}
                          placeholder="e.g. storeLocation"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Custom Property Value</label>
                        <input
                          type="text"
                          value={customVal}
                          onChange={(e) => setCustomVal(e.target.value)}
                          placeholder="e.g. New York Flagship"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    JSON Body for <code className="font-mono text-indigo-300">POST /events</code>
                  </label>
                  <textarea
                    id="event-raw-json-textarea"
                    value={rawJson}
                    onChange={(e) => setRawJson(e.target.value)}
                    rows={8}
                    className="w-full bg-slate-950 font-mono text-xs text-indigo-200 border border-slate-700 rounded-lg p-3 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                id="event-track-submit-btn"
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-sm font-semibold rounded-lg shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Process Event via Rule Engine</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Live Rule Engine Inspector & Last Execution Result */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Rule Engine Pre-Evaluation Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Live Rule Evaluation Preview</h3>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                Predicted: +{liveEvaluation.totalPoints} pts
              </span>
            </div>

            <div className="mt-3 space-y-2.5">
              <div className="text-xs text-slate-400">
                Matching rules for <span className="font-semibold text-white">{currentRequest.businessId}</span> on{' '}
                <span className="font-mono text-amber-300">{currentRequest.event}</span>:
              </div>

              {liveEvaluation.matchedRules.length === 0 ? (
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
                  <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    No active rules found matching business <code className="text-slate-300">{currentRequest.businessId}</code> and event <code className="text-slate-300">{currentRequest.event}</code>. 
                    Points evaluated will be 0.
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  {liveEvaluation.matchedRules.map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border text-xs transition-colors ${
                        m.passedCondition
                          ? 'bg-emerald-950/20 border-emerald-800/50 text-emerald-200'
                          : 'bg-amber-950/20 border-amber-800/50 text-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="flex items-center gap-1.5">
                          {m.passedCondition ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                          )}
                          Rule #{m.rule.id}: {m.rule.rewardType} ({m.rule.rewardValue}{m.rule.rewardType === 'PERCENTAGE' ? '%' : ' pts'})
                        </span>
                        <span className="font-mono font-bold text-sm">
                          {m.passedCondition ? `+${m.pointsAwarded} pts` : '0 pts'}
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] opacity-80 pl-5">
                        {m.explanation}
                      </div>
                      {m.rule.minAmount !== null && m.rule.minAmount !== undefined && (
                        <div className="mt-0.5 text-[10px] text-slate-400 pl-5">
                          Condition: minAmount = ${m.rule.minAmount} (Current: ${m.amount.toFixed(2)})
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Last Processed Result Card */}
          {lastResult && (
            <div className="bg-gradient-to-b from-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-xl p-5 shadow-lg shadow-indigo-950/30">
              <div className="flex items-center justify-between pb-3 border-b border-indigo-500/20">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Event Processed Successfully</h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Just now
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between bg-slate-950/80 p-3.5 rounded-lg border border-indigo-500/20">
                <div>
                  <div className="text-xs text-slate-400">Awarded Points (Pending)</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    +{lastResult.points} <span className="text-xs font-normal text-slate-400">pts</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Status</div>
                  <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    PENDING
                  </span>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-300">
                {lastResult.message}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
