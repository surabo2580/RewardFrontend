import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

export type MemberModule =
  | 'details'
  | 'linked'
  | 'cards'
  | 'balance'
  | 'transactions'
  | 'vouchers'
  | 'offers'
  | 'bookings'
  | 'services'
  | 'activity'
  | 'kpis';

export function useAsync<T>(loader: () => Promise<T>, deps: React.DependencyList) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const requestId = useRef(0);

  const reload = useCallback(async () => {
    const current = ++requestId.current;
    setLoading(true);
    setError('');
    try {
      const result = await loader();
      if (current === requestId.current) setData(result);
    } catch (err: any) {
      if (current === requestId.current) setError(err?.message || 'Request failed');
    } finally {
      if (current === requestId.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, setData, loading, error, reload };
}

export const fmtNum = (value: number | null | undefined) => (value ?? 0).toLocaleString();

export const fmtDate = (value: string | null | undefined) => (value ? new Date(value).toLocaleDateString() : '—');

export const fmtDateTime = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';

export const inputClass =
  'w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500';

export const primaryButton =
  'inline-flex items-center justify-center gap-2 rounded-md bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-60';

export const secondaryButton =
  'inline-flex items-center justify-center gap-2 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-60';

export const Panel: React.FC<{ title?: string; icon?: React.ComponentType<{ className?: string }>; actions?: React.ReactNode; children: React.ReactNode; className?: string }> = ({
  title,
  icon: Icon,
  actions,
  children,
  className = '',
}) => (
  <section className={`rounded-xl border border-slate-800 bg-slate-900/80 ${className}`}>
    {(title || actions) && (
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {Icon && <Icon className="h-4 w-4 text-cyan-300" />}
          {title}
        </h3>
        {actions}
      </div>
    )}
    <div className="p-4">{children}</div>
  </section>
);

const STAT_TONES = {
  cyan: 'border-cyan-400 text-cyan-300',
  amber: 'border-amber-400 text-amber-300',
  emerald: 'border-emerald-400 text-emerald-300',
  rose: 'border-rose-400 text-rose-300',
  indigo: 'border-indigo-400 text-indigo-300',
};

export const StatCard: React.FC<{ label: string; value: React.ReactNode; hint?: string; tone?: keyof typeof STAT_TONES }> = ({ label, value, hint, tone = 'cyan' }) => {
  const [border, text] = STAT_TONES[tone].split(' ');
  return (
    <div className={`rounded-lg border-l-4 bg-slate-800/70 px-4 py-3 ${border}`}>
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${text}`}>{value}</div>
      {hint && <div className="mt-1 text-[11px] text-slate-500">{hint}</div>}
    </div>
  );
};

const BADGE_TONES: Record<string, string> = {
  green: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  amber: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  red: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
  blue: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  slate: 'bg-slate-700/40 text-slate-300 border-slate-600',
};

const STATUS_TONE: Record<string, keyof typeof BADGE_TONES> = {
  ACTIVE: 'green', APPROVED: 'green', COMPLETED: 'green', RESOLVED: 'green', CHECKED_IN: 'blue', CONFIRMED: 'blue',
  OPEN: 'amber', IN_PROGRESS: 'amber', TEMPORARY: 'amber', PENDING: 'amber', HIGH: 'amber',
  EXPIRED: 'red', BLOCKED: 'red', CANCELLED: 'red', SUSPENDED: 'red', URGENT: 'red', NO_SHOW: 'red', CLOSED: 'slate',
  CONSUMED: 'slate', REPLACED: 'slate', DEBIT: 'slate',
};

export const Badge: React.FC<{ children: React.ReactNode; tone?: keyof typeof BADGE_TONES }> = ({ children, tone }) => {
  const resolved = tone || STATUS_TONE[String(children).toUpperCase()] || 'slate';
  return <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${BADGE_TONES[resolved]}`}>{children}</span>;
};

export const LoadingState: React.FC<{ label?: string }> = ({ label = 'Loading…' }) => (
  <div className="flex items-center gap-2 py-8 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" />{label}</div>
);

export const ErrorText: React.FC<{ message: string }> = ({ message }) =>
  message ? <p className="inline-flex items-center gap-1.5 text-sm text-rose-400"><AlertCircle className="h-4 w-4" />{message}</p> : null;

export const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="rounded-lg border border-dashed border-slate-700 py-10 text-center text-sm text-slate-500">{message}</div>
);

export const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <div className="text-xs text-slate-500">{label}</div>
    <div className="mt-0.5 text-sm font-medium text-slate-100 break-words">{value ?? '—'}</div>
  </div>
);
