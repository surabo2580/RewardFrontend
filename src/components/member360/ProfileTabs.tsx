import React, { useState } from 'react';
import { Activity, Contact, CreditCard, Link2, Pencil, Plus, Trash2, UserRound } from 'lucide-react';
import { api, BitDto, Member360, MemberProfileUpdate } from '../../api/client';
import {
  Badge,
  EmptyState,
  ErrorText,
  Field,
  fmtDate,
  inputClass,
  LoadingState,
  Panel,
  primaryButton,
  secondaryButton,
  useAsync,
} from './ui';

const MEMBER_STATUSES = ['ACTIVE', 'TEMPORARY', 'SUSPENDED', 'BLOCKED', 'CLOSED'];

export const MemberDetailsTab: React.FC<{ data: Member360; onUpdated: () => void }> = ({ data, onUpdated }) => {
  const p = data.profile;
  const activity = useAsync(() => api.getMemberBits(p.id, 20), [p.id]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<MemberProfileUpdate>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const startEdit = () => {
    setForm({
      firstName: p.firstName, lastName: p.lastName, email: p.email, phone: p.phone, alternatePhone: p.alternatePhone,
      dateOfBirth: p.dateOfBirth, gender: p.gender, nationality: p.nationality, preferredLanguage: p.preferredLanguage, status: p.status,
    });
    setError('');
    setEditing(true);
  };

  const set = (key: keyof MemberProfileUpdate) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value || null }));

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.updateMemberProfile(p.id, form);
      setEditing(false);
      onUpdated();
    } catch (err: any) {
      setError(err?.message || 'Unable to update member');
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    const text = (key: keyof MemberProfileUpdate, label: string, type = 'text') => (
      <label className="space-y-1.5 text-xs font-medium text-slate-300">
        {label}
        <input type={type} value={(form[key] as string) ?? ''} onChange={set(key)} className={inputClass} />
      </label>
    );
    return (
      <Panel title="Edit Member Details" icon={Pencil}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {text('firstName', 'First name')}
            {text('lastName', 'Last name')}
            {text('email', 'Email', 'email')}
            {text('phone', 'Mobile')}
            {text('alternatePhone', 'Alternate phone')}
            {text('dateOfBirth', 'Date of birth', 'date')}
            {text('gender', 'Gender')}
            {text('nationality', 'Nationality')}
            {text('preferredLanguage', 'Preferred language')}
            <label className="space-y-1.5 text-xs font-medium text-slate-300">
              Stage / Status
              <select value={form.status ?? 'ACTIVE'} onChange={set('status')} className={inputClass}>
                {MEMBER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          </div>
          <ErrorText message={error} />
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className={primaryButton}>{saving ? 'Saving…' : 'Save changes'}</button>
            <button type="button" onClick={() => setEditing(false)} className={secondaryButton}>Cancel</button>
          </div>
        </form>
      </Panel>
    );
  }

  return (
    <div className="space-y-4">
      {data.hotnotes.length > 0 && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">
          <div className="text-xs font-semibold uppercase tracking-wider text-rose-300">Urgent hotnotes</div>
          <ul className="mt-1 space-y-0.5">
            {data.hotnotes.map((n) => <li key={n.id}>• {n.subject} <span className="text-rose-300/70">({n.category})</span></li>)}
          </ul>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Identity" icon={UserRound} actions={<button type="button" onClick={startEdit} className={secondaryButton}><Pencil className="h-3.5 w-3.5" />Edit</button>}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="First name" value={p.firstName} />
            <Field label="Last name" value={p.lastName} />
            <Field label="Member ID" value={<span className="font-mono">{p.externalUserId}</span>} />
            <Field label="Internal ID" value={<span className="font-mono">#{p.id}</span>} />
            <Field label="Date of birth" value={p.dateOfBirth ? fmtDate(p.dateOfBirth) : '—'} />
            <Field label="Gender" value={p.gender} />
            <Field label="Nationality" value={p.nationality} />
            <Field label="Preferred language" value={p.preferredLanguage?.toUpperCase()} />
          </div>
        </Panel>
        <Panel title="Contact & Enrollment" icon={Contact}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email" value={p.email} />
            <Field label="Mobile" value={p.phone} />
            <Field label="Alternate phone" value={p.alternatePhone} />
            <Field label="Stage" value={<Badge>{p.status}</Badge>} />
            <Field label="Enrolled on" value={fmtDate(p.createdAt)} />
            <Field label="Enrolling sponsor" value={p.enrollingSponsorName} />
            <Field label="Program" value={data.programName} />
            <Field label="Tier" value={`${data.tier.tierName} (rank ${data.tier.tierRank})`} />
          </div>
        </Panel>
      </div>
      <Panel title="Recent Member Activity" icon={Activity}>
        {activity.loading ? <LoadingState label="Loading activity…" /> : activity.error ? <ErrorText message={activity.error} /> : !activity.data?.length ? <EmptyState title="No recorded activity" /> : (
          <div className="divide-y divide-slate-800">
            {activity.data.map((bit: BitDto) => (
              <div key={bit.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-slate-100">{bit.bitTypeLabel}</div>
                  <div className="mt-0.5 truncate text-xs text-slate-400">{bit.description || bit.bitReference}</div>
                </div>
                <div className="text-xs text-slate-400">{new Date(bit.interactionAt).toLocaleString()}</div>
                <div className={`text-xs font-medium ${bit.redemptionPointsDelta < 0 ? 'text-rose-300' : 'text-emerald-300'}`}>
                  {bit.redemptionPointsDelta > 0 ? '+' : ''}{bit.redemptionPointsDelta.toLocaleString()} pts
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
};

const RELATION_TYPES = ['SPOUSE', 'CHILD', 'PARENT', 'FAMILY', 'CORPORATE', 'MERGED'];

export const LinkedMembersTab: React.FC<{ memberId: number; onChanged: () => void; onOpenMember: (id: number) => void }> = ({ memberId, onChanged, onOpenMember }) => {
  const links = useAsync(() => api.getMemberLinks(memberId), [memberId]);
  const [identifier, setIdentifier] = useState('');
  const [relationType, setRelationType] = useState('FAMILY');
  const [canSharePoints, setCanSharePoints] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const add = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      links.setData(await api.createMemberLink(memberId, { linkedMemberIdentifier: identifier.trim(), relationType, canSharePoints }));
      setIdentifier('');
      onChanged();
    } catch (err: any) {
      setError(err?.message || 'Unable to link member');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (linkId: number) => {
    if (!window.confirm('Remove this member link?')) return;
    try {
      await api.deleteMemberLink(memberId, linkId);
      await links.reload();
      onChanged();
    } catch (err: any) {
      setError(err?.message || 'Unable to remove link');
    }
  };

  return (
    <div className="space-y-4">
      <Panel title="Link a Member (Household / Family)" icon={Link2}>
        <form onSubmit={add} className="grid grid-cols-1 items-end gap-3 md:grid-cols-[minmax(0,1fr)_160px_auto_auto]">
          <label className="space-y-1.5 text-xs font-medium text-slate-300">
            Member ID, internal ID or email
            <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} required className={inputClass} placeholder="e.g. guest-123 or spouse@example.com" />
          </label>
          <label className="space-y-1.5 text-xs font-medium text-slate-300">
            Relation
            <select value={relationType} onChange={(e) => setRelationType(e.target.value)} className={inputClass}>
              {RELATION_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <label className="flex h-10 items-center gap-2 text-xs text-slate-300">
            <input type="checkbox" checked={canSharePoints} onChange={(e) => setCanSharePoints(e.target.checked)} /> Share points
          </label>
          <button type="submit" disabled={busy} className={primaryButton}><Plus className="h-4 w-4" />Link</button>
        </form>
        <div className="mt-2"><ErrorText message={error} /></div>
      </Panel>

      <Panel title="Linked Members & Partner Memberships" icon={Link2}>
        {links.loading ? <LoadingState /> : links.error ? <ErrorText message={links.error} /> : !links.data?.length ? (
          <EmptyState message="No linked members or partner memberships." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-500">
                <tr><th className="py-2">Member</th><th>Relation</th><th>Source</th><th>Tier</th><th>Share points</th><th>Status</th><th>Linked on</th><th /></tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {links.data.map((l) => (
                  <tr key={`${l.linkSource}-${l.id}`} className="text-slate-200">
                    <td className="py-2">
                      {l.memberId ? (
                        <button type="button" onClick={() => onOpenMember(l.memberId!)} className="text-left text-cyan-300 hover:underline">
                          {l.email || l.externalUserId}
                        </button>
                      ) : (
                        <span className="font-mono">{l.externalUserId}</span>
                      )}
                      {l.sponsorName && <div className="text-xs text-slate-500">{l.sponsorName}</div>}
                    </td>
                    <td>{l.relationType}{l.direction === 'LINKED_TO' && <span className="text-xs text-slate-500"> (of)</span>}</td>
                    <td><Badge tone={l.linkSource === 'PARTNER' ? 'blue' : 'slate'}>{l.linkSource}</Badge></td>
                    <td>{l.tier || '—'}</td>
                    <td>{l.canSharePoints ? 'Yes' : 'No'}</td>
                    <td><Badge>{l.status}</Badge></td>
                    <td>{fmtDate(l.createdAt)}</td>
                    <td className="text-right">
                      {l.linkSource === 'HOUSEHOLD' && (
                        <button type="button" onClick={() => void remove(l.id)} className="text-slate-500 hover:text-rose-400" title="Remove link">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
};

const CARD_TYPES = ['DIGITAL', 'PHYSICAL', 'APPLE_WALLET', 'GOOGLE_WALLET'];

export const MembershipCardsTab: React.FC<{ memberId: number; tierName: string; onChanged: () => void }> = ({ memberId, tierName, onChanged }) => {
  const cards = useAsync(() => api.getMemberCards(memberId), [memberId]);
  const [cardType, setCardType] = useState('DIGITAL');
  const [replaceExisting, setReplaceExisting] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const issue = async () => {
    setBusy(true);
    setError('');
    try {
      await api.issueMemberCard(memberId, { cardType, validityMonths: 36, replaceExisting });
      await cards.reload();
      onChanged();
    } catch (err: any) {
      setError(err?.message || 'Unable to issue card');
    } finally {
      setBusy(false);
    }
  };

  const setStatus = async (cardId: number, status: string) => {
    try {
      await api.updateMemberCardStatus(memberId, cardId, status);
      await cards.reload();
      onChanged();
    } catch (err: any) {
      setError(err?.message || 'Unable to update card');
    }
  };

  return (
    <div className="space-y-4">
      <Panel
        title="Membership Cards"
        icon={CreditCard}
        actions={
          <div className="flex items-center gap-2">
            <select value={cardType} onChange={(e) => setCardType(e.target.value)} className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1.5 text-xs text-white">
              {CARD_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
            <label className="flex items-center gap-1 text-xs text-slate-400">
              <input type="checkbox" checked={replaceExisting} onChange={(e) => setReplaceExisting(e.target.checked)} /> Replace existing
            </label>
            <button type="button" onClick={() => void issue()} disabled={busy} className={primaryButton}><Plus className="h-4 w-4" />Issue card</button>
          </div>
        }
      >
        <ErrorText message={error} />
        {cards.loading ? <LoadingState /> : cards.error ? <ErrorText message={cards.error} /> : !cards.data?.length ? (
          <EmptyState message="No membership cards issued yet." />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {cards.data.map((card) => (
              <div key={card.id} className={`rounded-xl border p-4 ${card.status === 'ACTIVE' ? 'border-cyan-500/40 bg-gradient-to-br from-slate-800 to-cyan-950/60' : 'border-slate-800 bg-slate-900 opacity-70'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-widest text-slate-300">BENEVO • {tierName}</span>
                  <Badge>{card.status}</Badge>
                </div>
                <div className="mt-5 font-mono text-lg tracking-widest text-white">{card.cardNumber.replace(/(.{4})/g, '$1 ').trim()}</div>
                <div className="mt-3 flex h-10 items-end gap-[2px] rounded bg-white px-2 py-1" aria-label={`Barcode ${card.barcodePayload}`}>
                  {card.barcodePayload.split('').map((ch, i) => (
                    <span key={i} className="bg-black" style={{ width: (ch.charCodeAt(0) % 3) + 1, height: '100%' }} />
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{card.cardType.replace('_', ' ')}</span>
                  <span>Issued {fmtDate(card.issuedAt)} · Exp {fmtDate(card.expiresAt)}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  {card.status === 'ACTIVE' ? (
                    <button type="button" onClick={() => void setStatus(card.id, 'BLOCKED')} className={secondaryButton}>Block</button>
                  ) : card.status === 'BLOCKED' ? (
                    <button type="button" onClick={() => void setStatus(card.id, 'ACTIVE')} className={secondaryButton}>Unblock</button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
};
