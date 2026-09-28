import React, { useState } from 'react';
import { BarChart3, BedDouble, CalendarDays, Headphones, Plus } from 'lucide-react';
import { api, Member360, MemberBookingCreate } from '../../api/client';
import {
  Badge,
  EmptyState,
  ErrorText,
  fmtDate,
  fmtDateTime,
  fmtNum,
  inputClass,
  LoadingState,
  Panel,
  primaryButton,
  secondaryButton,
  StatCard,
  useAsync,
} from './ui';

const BOOKING_TYPES = ['HOTEL_STAY', 'DINING', 'SPA', 'EVENT', 'POS_RETAIL'];
const BOOKING_STATUSES = ['CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];

const emptyBooking = (): MemberBookingCreate => ({
  bookingReference: '', bookingType: 'HOTEL_STAY', status: 'CONFIRMED', checkInDate: '', checkOutDate: '', roomType: '', roomNumber: '', totalAmount: 0, notes: '',
});

export const BookingsTab: React.FC<{ memberId: number; currency: string | null; onChanged: () => void }> = ({ memberId, currency, onChanged }) => {
  const bookings = useAsync(() => api.getMemberBookings(memberId), [memberId]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<MemberBookingCreate>(emptyBooking);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key: keyof MemberBookingCreate) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: key === 'totalAmount' ? Number(e.target.value) : e.target.value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.createMemberBooking(memberId, {
        ...form,
        checkInDate: form.checkInDate || null,
        checkOutDate: form.checkOutDate || null,
        roomType: form.roomType || null,
        roomNumber: form.roomNumber || null,
        notes: form.notes || null,
      });
      setForm(emptyBooking());
      setShowForm(false);
      await bookings.reload();
      onChanged();
    } catch (err: any) {
      setError(err?.message || 'Unable to create booking');
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (bookingId: number, status: string) => {
    try {
      await api.updateMemberBookingStatus(memberId, bookingId, status);
      await bookings.reload();
    } catch (err: any) {
      setError(err?.message || 'Unable to update booking');
    }
  };

  return (
    <div className="space-y-4">
      {showForm && (
        <Panel title="New Booking / Order" icon={Plus}>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <label className="space-y-1.5 text-xs text-slate-300">Reference<input required value={form.bookingReference} onChange={set('bookingReference')} className={inputClass} placeholder="PMS confirmation #" /></label>
              <label className="space-y-1.5 text-xs text-slate-300">Type<select value={form.bookingType} onChange={set('bookingType')} className={inputClass}>{BOOKING_TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
              <label className="space-y-1.5 text-xs text-slate-300">Status<select value={form.status} onChange={set('status')} className={inputClass}>{BOOKING_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label>
              <label className="space-y-1.5 text-xs text-slate-300">Total amount<input type="number" min={0} step="0.01" value={form.totalAmount} onChange={set('totalAmount')} className={inputClass} /></label>
              <label className="space-y-1.5 text-xs text-slate-300">Check-in<input type="date" value={form.checkInDate || ''} onChange={set('checkInDate')} className={inputClass} /></label>
              <label className="space-y-1.5 text-xs text-slate-300">Check-out<input type="date" value={form.checkOutDate || ''} onChange={set('checkOutDate')} className={inputClass} /></label>
              <label className="space-y-1.5 text-xs text-slate-300">Room type<input value={form.roomType || ''} onChange={set('roomType')} className={inputClass} /></label>
              <label className="space-y-1.5 text-xs text-slate-300">Room #<input value={form.roomNumber || ''} onChange={set('roomNumber')} className={inputClass} /></label>
            </div>
            <label className="block space-y-1.5 text-xs text-slate-300">Notes<input value={form.notes || ''} onChange={set('notes')} className={inputClass} /></label>
            <ErrorText message={error} />
            <div className="flex gap-2">
              <button type="submit" disabled={busy} className={primaryButton}>{busy ? 'Saving…' : 'Save booking'}</button>
              <button type="button" onClick={() => setShowForm(false)} className={secondaryButton}>Cancel</button>
            </div>
          </form>
        </Panel>
      )}

      <Panel
        title="Bookings, Stays & Orders"
        icon={CalendarDays}
        actions={!showForm && <button type="button" onClick={() => setShowForm(true)} className={primaryButton}><Plus className="h-4 w-4" />Add booking</button>}
      >
        {!showForm && <ErrorText message={error} />}
        {bookings.loading ? <LoadingState /> : bookings.error ? <ErrorText message={bookings.error} /> : !bookings.data?.length ? (
          <EmptyState message="No bookings recorded for this member." />
        ) : (
          <div className="space-y-2">
            {bookings.data.map((b) => (
              <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-800/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-cyan-500/10 text-cyan-300"><BedDouble className="h-5 w-5" /></div>
                  <div>
                    <div className="text-sm font-semibold text-white">{b.bookingReference} <span className="text-xs font-normal text-slate-400">· {b.bookingType.replace('_', ' ')}{b.sponsorName ? ` · ${b.sponsorName}` : ''}</span></div>
                    <div className="text-xs text-slate-400">
                      {b.checkInDate ? `${fmtDate(b.checkInDate)} → ${fmtDate(b.checkOutDate)}` : fmtDate(b.createdAt)}
                      {b.nights != null && ` · ${b.nights} night${b.nights === 1 ? '' : 's'}`}
                      {(b.roomType || b.roomNumber) && ` · ${[b.roomType, b.roomNumber].filter(Boolean).join(' #')}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">{b.currency || currency} {fmtNum(b.totalAmount)}</div>
                    {b.pointsEarned > 0 && <div className="text-xs text-emerald-300">+{fmtNum(b.pointsEarned)} pts</div>}
                  </div>
                  <select value={b.status} onChange={(e) => void changeStatus(b.id, e.target.value)} className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white">
                    {BOOKING_STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
};

const TICKET_CATEGORIES = ['NOTE', 'MISSING_POINTS', 'SERVICE_COMPLAINT', 'TIER_INQUIRY', 'RESERVATION', 'F_AND_B', 'GOODWILL'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export const ServicesTab: React.FC<{ memberId: number; onChanged: () => void; onAdjust: () => void; refreshKey: number }> = ({ memberId, onChanged, onAdjust, refreshKey }) => {
  const tickets = useAsync(() => api.getMemberTickets(memberId), [memberId, refreshKey]);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('NOTE');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [isHotnote, setIsHotnote] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.createMemberTicket(memberId, { subject: subject.trim(), category, priority, description: description.trim() || undefined, isHotnote });
      setSubject('');
      setDescription('');
      setIsHotnote(false);
      await tickets.reload();
      onChanged();
    } catch (err: any) {
      setError(err?.message || 'Unable to create service request');
    } finally {
      setBusy(false);
    }
  };

  const update = async (ticketId: number, payload: { status?: string; isHotnote?: boolean }) => {
    try {
      await api.updateMemberTicket(memberId, ticketId, payload);
      await tickets.reload();
      onChanged();
    } catch (err: any) {
      setError(err?.message || 'Unable to update ticket');
    }
  };

  return (
    <div className="space-y-4">
      <Panel title="New Service Request / Note" icon={Headphones} actions={<button type="button" onClick={onAdjust} className={secondaryButton}>Point adjustment</button>}>
        <form onSubmit={create} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_180px_140px]">
            <input required value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass} placeholder="Subject" maxLength={255} />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>{TICKET_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className={inputClass}>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select>
          </div>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={4000} className={inputClass} placeholder="Details for the service team" />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-slate-300">
              <input type="checkbox" checked={isHotnote} onChange={(e) => setIsHotnote(e.target.checked)} /> Mark as urgent hotnote (shown on Member Portal)
            </label>
            <button type="submit" disabled={busy} className={primaryButton}><Plus className="h-4 w-4" />Create</button>
          </div>
          <ErrorText message={error} />
        </form>
      </Panel>

      <Panel title="Service History" icon={Headphones}>
        {tickets.loading ? <LoadingState /> : tickets.error ? <ErrorText message={tickets.error} /> : !tickets.data?.length ? (
          <EmptyState message="No service requests or notes." />
        ) : (
          <div className="space-y-2">
            {tickets.data.map((t) => (
              <div key={t.id} className={`rounded-lg border p-3 ${t.isHotnote && (t.status === 'OPEN' || t.status === 'IN_PROGRESS') ? 'border-rose-500/40 bg-rose-500/5' : 'border-slate-800 bg-slate-800/40'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-500">{t.ticketReference}</span>
                    <span className="text-sm font-semibold text-white">{t.subject}</span>
                    {t.pointsAdjusted !== 0 && (
                      <span className={`text-xs font-semibold ${t.pointsAdjusted > 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{t.pointsAdjusted > 0 ? '+' : ''}{fmtNum(t.pointsAdjusted)} pts</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge tone="blue">{t.category}</Badge>
                    <Badge>{t.priority}</Badge>
                    <select value={t.status} onChange={(e) => void update(t.id, { status: e.target.value })} className="rounded border border-slate-700 bg-slate-900 px-1.5 py-0.5 text-[11px] text-white">
                      {TICKET_STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <button type="button" onClick={() => void update(t.id, { isHotnote: !t.isHotnote })} className={`text-[11px] ${t.isHotnote ? 'text-rose-300' : 'text-slate-500'} hover:underline`}>
                      {t.isHotnote ? 'Unpin hotnote' : 'Pin as hotnote'}
                    </button>
                  </div>
                </div>
                {t.description && <p className="mt-1 whitespace-pre-wrap text-xs text-slate-300">{t.description}</p>}
                <div className="mt-1 text-[11px] text-slate-500">
                  {fmtDateTime(t.createdAt)}{t.createdByUserId ? ` · agent #${t.createdByUserId}` : ''}{t.resolvedAt ? ` · resolved ${fmtDateTime(t.resolvedAt)}` : ''}
                  {t.resolutionNotes ? ` · ${t.resolutionNotes}` : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
};

export const KpisTab: React.FC<{ memberId: number; data: Member360 }> = ({ memberId, data }) => {
  const kpis = useAsync(() => api.getMemberKpis(memberId), [memberId]);
  if (kpis.loading) return <LoadingState />;
  if (kpis.error || !kpis.data) return <ErrorText message={kpis.error || 'KPIs unavailable'} />;
  const k = kpis.data;
  const currency = data.currency || '';
  const maxSpend = Math.max(1, ...k.monthly.map((m) => m.spend));
  const maxPoints = Math.max(1, ...k.monthly.map((m) => Math.max(m.pointsEarned, m.pointsRedeemed)));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Lifetime spend" value={`${currency} ${fmtNum(k.lifetimeSpend)}`} hint={`${fmtNum(k.earnTransactions)} earning transactions`} tone="emerald" />
        <StatCard label="Average order value" value={`${currency} ${fmtNum(k.averageOrderValue)}`} tone="cyan" />
        <StatCard label="Visits (last 90 days)" value={fmtNum(k.visitsLast90Days)} hint={k.daysSinceLastActivity != null ? `Last activity ${k.daysSinceLastActivity} days ago` : 'No activity yet'} tone="indigo" />
        <StatCard label="Redemption rate" value={`${k.redemptionRatePercent}%`} hint={`${fmtNum(k.lifetimePointsRedeemed)} of ${fmtNum(k.lifetimePointsEarned)} pts`} tone="amber" />
        <StatCard label="Points expired" value={fmtNum(k.lifetimePointsExpired)} tone="rose" />
        <StatCard label="Stays / nights" value={`${fmtNum(k.completedStays)} / ${fmtNum(k.totalNights)}`} hint={`${fmtNum(k.totalBookings)} bookings total`} tone="cyan" />
        <StatCard label="Booking revenue" value={`${currency} ${fmtNum(k.bookingRevenue)}`} tone="emerald" />
        <StatCard label="Offers redeemed" value={fmtNum(k.offersRedeemed)} hint={`${fmtNum(k.openTickets)} open service tickets`} tone="indigo" />
      </div>

      <Panel title="Tier progress" icon={BarChart3}>
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-amber-300">{k.tier.tierName}</span>
          <span className="text-slate-400">{k.tier.nextTierName ? `${fmtNum(k.tier.pointsToNextTier)} pts to ${k.tier.nextTierName}` : 'Top tier reached'}</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300" style={{ width: `${k.tier.progressPercent}%` }} />
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-slate-500">
          <span>{fmtNum(k.tier.thresholdPoints)}</span>
          <span>{k.tier.nextTierThreshold != null ? fmtNum(k.tier.nextTierThreshold) : '—'}</span>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Monthly spend (12 months)" icon={BarChart3}>
          <div className="flex h-40 items-end gap-1.5">
            {k.monthly.map((m) => (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-1" title={`${m.month}: ${currency} ${fmtNum(m.spend)} · ${m.transactions} txns`}>
                <div className="w-full rounded-t bg-emerald-400/80" style={{ height: `${(m.spend / maxSpend) * 100}%`, minHeight: m.spend ? 2 : 0 }} />
                <span className="text-[9px] text-slate-500">{m.month.slice(5)}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Points earned vs redeemed" icon={BarChart3}>
          <div className="flex h-40 items-end gap-1.5">
            {k.monthly.map((m) => (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-1" title={`${m.month}: +${fmtNum(m.pointsEarned)} / -${fmtNum(m.pointsRedeemed)}`}>
                <div className="flex h-full w-full items-end gap-[1px]">
                  <div className="flex-1 rounded-t bg-cyan-400/80" style={{ height: `${(m.pointsEarned / maxPoints) * 100}%` }} />
                  <div className="flex-1 rounded-t bg-rose-400/80" style={{ height: `${(m.pointsRedeemed / maxPoints) * 100}%` }} />
                </div>
                <span className="text-[9px] text-slate-500">{m.month.slice(5)}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-3 text-[11px] text-slate-400"><span className="text-cyan-300">■ earned</span><span className="text-rose-300">■ redeemed</span></div>
        </Panel>
      </div>
      <div className="text-[11px] text-slate-500">First activity {fmtDate(k.firstActivityAt)} · Last activity {fmtDate(k.lastActivityAt)}</div>
    </div>
  );
};
