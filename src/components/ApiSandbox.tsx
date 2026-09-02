import React, { useState } from 'react';
import { useReward } from '../context/RewardContext';
import { api } from '../api/client';
import { 
  Terminal, 
  Play, 
  Copy, 
  Check, 
  Code2, 
  Send, 
  Wallet as WalletIcon, 
  Layers, 
  Clock, 
  Globe,
  Server,
  Activity,
  AlertCircle,
  Building2
} from 'lucide-react';

export const ApiSandbox: React.FC = () => {
  const { 
    selectedBusinessId, 
    selectedUserId, 
    processEvent, 
    getWallet 
  } = useReward();

  const [activeEndpoint, setActiveEndpoint] = useState<'events' | 'wallet' | 'health' | 'tenants'>('events');
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);
  const [mode, setMode] = useState<'live' | 'simulator'>('live');
  const [backendUrl, setBackendUrl] = useState<string>('http://localhost:8080');
  const [healthStatus, setHealthStatus] = useState<{ checked: boolean; connected: boolean; message: string }>({
    checked: false,
    connected: false,
    message: '',
  });

  const getDefaultEventPayload = () => ({
    tenantId: Number(selectedBusinessId || localStorage.getItem('tenantId') || 0),
    programId: Number(localStorage.getItem('programId') || 0),
    sponsorId: Number(localStorage.getItem('sponsorId') || 0),
    branchCode: 'DEFAULT_MAIN',
    memberId: selectedUserId || localStorage.getItem('memberId') || '',
    eventType: 'PURCHASE',
    amount: 5000,
    referenceId: 'ORDER-1001',
    channel: 'POS',
  });

  // Events API state (New architecture: tenantId, memberId, eventType, amount, referenceId)
  const [eventPayload, setEventPayload] = useState<string>(
    JSON.stringify(
      getDefaultEventPayload(),
      null,
      2
    )
  );

  // Wallet API state
  const [walletParamBiz, setWalletParamBiz] = useState<string>(selectedBusinessId || localStorage.getItem('tenantId') || '');
  const [walletParamUser, setWalletParamUser] = useState<string>(selectedUserId || localStorage.getItem('memberId') || '');

  // Execution result
  const [apiResponse, setApiResponse] = useState<{
    status: number;
    statusText: string;
    durationMs: number;
    headers: Record<string, string>;
    body: any;
  } | null>(null);

  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  const checkLiveBackendHealth = async () => {
    api.setBaseUrl(backendUrl);
    const health = await api.checkHealth();
    setHealthStatus({ checked: true, connected: health.connected, message: health.message });
  };

  const apiKey = localStorage.getItem('tenantApiKey') || '';

  const curlEvents = `curl -i -X POST ${backendUrl}/api/events \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey}" \\
  -d '${eventPayload.replace(/\n\s*/g, ' ')}'`;

  const curlWallet = `curl -i -X GET ${backendUrl}/api/wallet-history/${walletParamBiz}/${walletParamUser} \\
  -H "X-API-Key: ${apiKey}"`;
  const curlHealth = `curl -i -X GET ${backendUrl}/api/health`;
  const curlTenants = `curl -i -X GET ${backendUrl}/api/tenants \\
  -H "X-API-Key: ${apiKey}"`;

  const currentCurl =
    activeEndpoint === 'events'
      ? curlEvents
      : activeEndpoint === 'wallet'
      ? curlWallet
      : activeEndpoint === 'health'
      ? curlHealth
      : curlTenants;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(currentCurl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleExecuteApi = async () => {
    setIsExecuting(true);
    const start = performance.now();

    if (mode === 'live') {
      api.setBaseUrl(backendUrl);
      try {
        if (activeEndpoint === 'events') {
          const parsed = JSON.parse(eventPayload);

          const missingFields: string[] = [];
          if (!parsed.tenantId) missingFields.push('tenantId');
          if (!parsed.programId) missingFields.push('programId');
          if (!parsed.sponsorId) missingFields.push('sponsorId');
          if (!parsed.memberId) missingFields.push('memberId');
          if (!parsed.eventType) missingFields.push('eventType');
          if (parsed.amount === undefined || parsed.amount === null || Number.isNaN(Number(parsed.amount))) {
            missingFields.push('amount');
          }

          if (missingFields.length > 0) {
            const elapsed = Math.round(performance.now() - start);
            setApiResponse({
              status: 400,
              statusText: 'Bad Request',
              durationMs: elapsed,
              headers: { 'content-type': 'application/json' },
              body: {
                error: 'Missing or invalid required fields',
                message: `Please provide valid values for: ${missingFields.join(', ')}`,
                requiredEventFields: ['tenantId', 'programId', 'sponsorId', 'memberId', 'eventType', 'amount'],
              },
            });
            setIsExecuting(false);
            return;
          }

          const result = await api.postEvent(parsed);
          const elapsed = Math.round(performance.now() - start);

          setApiResponse({
            status: 200,
            statusText: 'OK',
            durationMs: elapsed,
            headers: {
              'content-type': 'application/json',
              'server': 'Spring Boot 3.3 (Modular Architecture)',
            },
            body: result,
          });
        } else if (activeEndpoint === 'wallet') {
          const result = await api.getWallet(walletParamBiz, walletParamUser);
          const elapsed = Math.round(performance.now() - start);

          setApiResponse({
            status: 200,
            statusText: 'OK',
            durationMs: elapsed,
            headers: {
              'content-type': 'application/json',
              'server': 'Spring Boot 3.3 (Modular Architecture)',
            },
            body: result,
          });
        } else if (activeEndpoint === 'health') {
          const result = await api.checkHealth();
          const elapsed = Math.round(performance.now() - start);

          setApiResponse({
            status: 200,
            statusText: 'OK',
            durationMs: elapsed,
            headers: {
              'content-type': 'application/json',
              'server': 'Spring Boot 3.3 (Health Controller)',
            },
            body: result.data || result,
          });
        } else {
          const result = await api.getTenants();
          const elapsed = Math.round(performance.now() - start);

          setApiResponse({
            status: 200,
            statusText: 'OK',
            durationMs: elapsed,
            headers: {
              'content-type': 'application/json',
              'server': 'Spring Boot 3.3 (Tenant Controller)',
            },
            body: result,
          });
        }
      } catch (err: any) {
        const elapsed = Math.round(performance.now() - start);

        const status = typeof err?.status === 'number' ? err.status : 400;
        const statusText = err?.statusText || (status >= 500 ? 'Internal Server Error' : 'Bad Request');
        const errorBody = err?.body && typeof err.body === 'object'
          ? err.body
          : {
              error: err?.message || 'Request failed',
            };

        setApiResponse({
          status,
          statusText,
          durationMs: elapsed,
          headers: { 'content-type': 'application/json' },
          body: errorBody,
        });
      } finally {
        setIsExecuting(false);
      }
    } else {
      // Local simulator execution
      setTimeout(() => {
        if (activeEndpoint === 'events') {
          try {
            const parsed = JSON.parse(eventPayload);
            const result = processEvent({
              userId: parsed.memberId || parsed.userId,
              businessId: parsed.tenantId || parsed.businessId,
              event: parsed.eventType,
              properties: {
                amount: parsed.amount || parsed.properties?.amount || 0,
                ...(parsed.properties || {}),
              },
            });
            const elapsed = Math.round(performance.now() - start);

            setApiResponse({
              status: 200,
              statusText: 'OK',
              durationMs: elapsed,
              headers: {
                'content-type': 'application/json',
                'server': 'SmartReward Engine (Local Simulator)',
              },
              body: result,
            });
          } catch (err: any) {
            setApiResponse({
              status: 400,
              statusText: 'Bad Request',
              durationMs: 12,
              headers: { 'content-type': 'application/json' },
              body: { error: 'Invalid JSON payload', message: err.message },
            });
          }
        } else {
          const walletData = getWallet(walletParamUser, walletParamBiz);
          const elapsed = Math.round(performance.now() - start);

          setApiResponse({
            status: 200,
            statusText: 'OK',
            durationMs: elapsed,
            headers: {
              'content-type': 'application/json',
              'server': 'SmartReward Engine (Local Simulator)',
            },
            body: walletData,
          });
        }
        setIsExecuting(false);
      }, 150);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Terminal className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">REST API Console & Documentation</h2>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Interactive testing console for the Spring Boot Kotlin modular controllers in <code className="text-indigo-300 font-mono text-xs bg-slate-800 px-1 rounded ml-1">reward-api</code>:
              <code className="text-indigo-300 font-mono text-xs bg-slate-800 px-1 rounded ml-1">RewardEventController.kt</code>,
              <code className="text-indigo-300 font-mono text-xs bg-slate-800 px-1 rounded ml-1">WalletHistoryController.kt</code>, and
              <code className="text-indigo-300 font-mono text-xs bg-slate-800 px-1 rounded ml-1">HealthController.kt</code>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveEndpoint('events')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                activeEndpoint === 'events'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>POST /api/events</span>
            </button>

            <button
              onClick={() => setActiveEndpoint('wallet')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                activeEndpoint === 'wallet'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <WalletIcon className="w-3.5 h-3.5" />
              <span>GET /api/wallet-history</span>
            </button>

            <button
              onClick={() => setActiveEndpoint('health')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                activeEndpoint === 'health'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>GET /api/health</span>
            </button>

            <button
              onClick={() => setActiveEndpoint('tenants')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                activeEndpoint === 'tenants'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>GET /api/tenants</span>
            </button>
          </div>
        </div>

        {/* Target Environment Config */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Target Mode:</span>
            <div className="inline-flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setMode('simulator')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  mode === 'simulator'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                In-Memory Simulator
              </button>
              <button
                onClick={() => setMode('live')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  mode === 'live'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Live Spring Boot API
              </button>
            </div>
          </div>

          {mode === 'live' && (
            <div className="flex items-center gap-2 flex-1 sm:justify-end">
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                placeholder="http://localhost:8080"
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono w-48 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={checkLiveBackendHealth}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium border border-slate-700 text-xs flex items-center gap-1"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Test Ping</span>
              </button>
              {healthStatus.checked && (
                <span className={`text-[11px] font-medium flex items-center gap-1 ${
                  healthStatus.connected ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {healthStatus.connected ? '✓ Online' : '⚠ Offline'}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: API Request Builder */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                    activeEndpoint === 'events' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {activeEndpoint === 'events' ? 'POST' : 'GET'}
                </span>
                <span className="font-mono text-sm text-white font-semibold">
                  {activeEndpoint === 'events'
                    ? '/events'
                    : `/wallet/${walletParamBiz}/${walletParamUser}`}
                </span>
              </div>

              <button
                onClick={handleCopyCurl}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 p-1 rounded"
              >
                {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCurl ? 'Copied cURL' : 'Copy cURL'}</span>
              </button>
            </div>

            {activeEndpoint === 'events' ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>Request Body (JSON)</span>
                    <span className="font-mono text-[11px] text-slate-500">• EventRequest DTO</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500">Presets:</span>
                    <button
                      type="button"
                      onClick={() => setEventPayload(JSON.stringify({
                        tenantId: Number(selectedBusinessId || localStorage.getItem('tenantId') || 0),
                        programId: Number(localStorage.getItem('programId') || 0),
                        sponsorId: Number(localStorage.getItem('sponsorId') || 0),
                        branchCode: 'DEFAULT_MAIN',
                        memberId: selectedUserId || localStorage.getItem('memberId') || '',
                        eventType: 'PURCHASE',
                        amount: 5000,
                        referenceId: 'ORDER-1001',
                        channel: 'POS',
                      }, null, 2))}
                      className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-indigo-300 rounded border border-slate-700"
                    >
                      Purchase
                    </button>
                    <button
                      type="button"
                      onClick={() => setEventPayload(JSON.stringify({
                        tenantId: Number(selectedBusinessId || localStorage.getItem('tenantId') || 0),
                        programId: Number(localStorage.getItem('programId') || 0),
                        sponsorId: Number(localStorage.getItem('sponsorId') || 0),
                        branchCode: 'DEFAULT_MAIN',
                        memberId: selectedUserId || localStorage.getItem('memberId') || '',
                        eventType: 'SIGNUP',
                        amount: 0,
                        referenceId: 'USER-INIT-01',
                        channel: 'POS',
                      }, null, 2))}
                      className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-emerald-300 rounded border border-slate-700"
                    >
                      Signup
                    </button>
                    <button
                      type="button"
                      onClick={() => setEventPayload(JSON.stringify({
                        tenantId: Number(selectedBusinessId || localStorage.getItem('tenantId') || 0),
                        programId: Number(localStorage.getItem('programId') || 0),
                        sponsorId: Number(localStorage.getItem('sponsorId') || 0),
                        branchCode: 'DEFAULT_MAIN',
                        memberId: selectedUserId || localStorage.getItem('memberId') || '',
                        eventType: 'REFERRAL',
                        amount: 0,
                        referenceId: 'REF-7721',
                        channel: 'POS',
                      }, null, 2))}
                      className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-amber-300 rounded border border-slate-700"
                    >
                      Referral
                    </button>
                    <button
                      type="button"
                      onClick={() => setEventPayload(JSON.stringify(getDefaultEventPayload(), null, 2))}
                      className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-cyan-300 rounded border border-slate-700"
                    >
                      Reset
                    </button>
                  </div>
                </div>
                <textarea
                  id="api-events-json"
                  value={eventPayload}
                  onChange={(e) => setEventPayload(e.target.value)}
                  rows={9}
                  className="w-full bg-slate-950 font-mono text-xs text-indigo-200 border border-slate-700 rounded-lg p-3 focus:outline-none focus:border-indigo-500"
                />
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="text-xs text-slate-400">Path Parameters</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">
                      &#123;tenantId&#125;
                    </label>
                    <input
                      type="text"
                      value={walletParamBiz}
                      onChange={(e) => setWalletParamBiz(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">
                      &#123;memberId&#125;
                    </label>
                    <input
                      type="text"
                      value={walletParamUser}
                      onChange={(e) => setWalletParamUser(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Execute Button */}
            <div className="mt-5 pt-3 border-t border-slate-800">
              <button
                id="api-send-request-btn"
                onClick={handleExecuteApi}
                disabled={isExecuting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{isExecuting ? 'Sending Request...' : 'Send Request'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: HTTP Response Inspector */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-full min-h-[320px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">HTTP Response</h3>
              </div>

              {apiResponse && (
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span
                    className={`px-2 py-0.5 rounded font-bold ${
                      apiResponse.status === 200
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {apiResponse.status} {apiResponse.statusText}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {apiResponse.durationMs}ms
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 flex-1 flex flex-col">
              {apiResponse ? (
                <div className="space-y-3 flex-1 flex flex-col">
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Response Body
                  </div>
                  <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-emerald-400 overflow-x-auto flex-1">
                    {typeof apiResponse.body === 'string'
                      ? apiResponse.body
                      : JSON.stringify(apiResponse.body, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs">
                  <Terminal className="w-8 h-8 text-slate-400 mb-2" />
                  <p>Click "Send Request" to test the Spring Boot endpoint live.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
