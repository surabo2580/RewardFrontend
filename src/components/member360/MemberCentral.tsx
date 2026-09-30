import React from 'react';
import { Activity, Award, CalendarDays, Crown, Gift, MapPin, UserRound } from 'lucide-react';
import { api, MemberCentral as MemberCentralData } from '../../api/client';
import { displayName } from './MemberSidebar';
import { ErrorText, fmtDate, fmtDateTime, fmtNum, LoadingState, Panel, useAsync } from './ui';

const signed = (points: number) => `${points > 0 ? '+' : ''}${points.toLocaleString()} pts`;

export const MemberCentral: React.FC<{ memberId: number }> = ({ memberId }) => {
  const central = useAsync(() => api.getMemberCentral(memberId), [memberId]);
  if (central.loading && !central.data) return <LoadingState label="Loading Member Central…" />;
  if (central.error || !central.data) return <ErrorText message={central.error || 'Member Central is unavailable'} />;

  const data = central.data;
  const profile = data.header;

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-2 gap-x-5 gap-y-3 border-b border-slate-800 bg-slate-900/70 px-4 py-4 sm:grid-cols-3 xl:grid-cols-4">
        <MemberMetric icon={UserRound} label="Member" value={displayName(profile)} detail={`ID: ${profile.externalUserId}`} />
        <MemberMetric icon={MapPin} label="Acquiring sponsor" value={profile.enrollingSponsorName || '—'} />
        <MemberMetric icon={Award} label="Email" value={profile.email || '—'} />
        <MemberMetric icon={Activity} label="Mobile" value={profile.phone || '—'} />
        <MemberMetric icon={CalendarDays} label="Date of joining" value={fmtDate(profile.createdAt)} />
        <MemberMetric icon={CalendarDays} label="Date of birth" value={fmtDate(profile.dateOfBirth)} />
        <MemberMetric icon={Crown} label="Membership stage" value={profile.status} detail={`Tier: ${profile.tier}`} />
        <MemberMetric icon={Activity} label="Days since last BIT" value={data.daysSinceLastBit == null ? 'N/A' : String(data.daysSinceLastBit)} />
      </section>

      <Panel title="Last 5 BITs" icon={Activity}>
        {data.last5Bits.length ? <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs text-slate-500">
              <tr>
                <th className="px-2 py-2 font-medium">Sponsor</th>
                <th className="px-2 py-2 font-medium">BIT Type</th>
                <th className="px-2 py-2 font-medium">BIT Date</th>
                <th className="px-2 py-2 text-right font-medium">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data.last5Bits.map((bit) => (
                <tr key={bit.bitId}>
                  <td className="max-w-48 truncate px-2 py-2.5 text-slate-300" title={bit.sponsorName || ''}>{bit.sponsorName || '—'}</td>
                  <td className="px-2 py-2.5 text-slate-100">
                    {bit.bitType.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase())}
                    <span className="ml-2 text-[10px] text-slate-500">{bit.bitCategory.replaceAll('_', ' ')}</span>
                  </td>
                  <td className="px-2 py-2.5 text-slate-400">{fmtDateTime(bit.interactionAt)}</td>
                  <td className={`px-2 py-2.5 text-right font-medium ${bit.pointsDelta == null ? 'text-slate-500' : bit.pointsDelta < 0 ? 'text-rose-300' : 'text-emerald-300'}`}>
                    {bit.pointsDelta == null ? 'N/A' : signed(bit.pointsDelta)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div> : <p className="text-sm text-slate-500">No member activity has been recorded yet.</p>}
      </Panel>

      <Panel title="BIT Span Analyzer" subtitle="Daily activity from the first recorded BIT to the latest" icon={CalendarDays}>
        <BitSpanChart points={data.bitSpan} />
      </Panel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Top 5 Sponsors" icon={MapPin}>
          {data.topSponsors.length ? <div className="space-y-3">
            {data.topSponsors.map((sponsor, index) => {
              const maxCount = Math.max(...data.topSponsors.map((item) => item.bitCount), 1);
              return <div key={sponsor.sponsorId}>
                <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                  <span className="truncate text-slate-200">{index + 1}. {sponsor.sponsorName}</span>
                  <span className="shrink-0 text-slate-400">{fmtNum(sponsor.bitCount)} BITs · {signed(sponsor.points)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded bg-slate-800" title={`${sponsor.totalAmount.toLocaleString()} total gross amount`}>
                  <div className="h-full rounded bg-cyan-500" style={{ width: `${Math.max(6, sponsor.bitCount / maxCount * 100)}%` }} />
                </div>
                <div className="mt-1 text-right text-[10px] text-slate-500">Amount {sponsor.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              </div>;
            })}
          </div> : <p className="text-sm text-slate-500">No sponsor-attributed BITs yet.</p>}
        </Panel>

        <Panel title="Member Privileges Overview" icon={Gift}>
          <div className="mb-3 flex flex-wrap gap-x-6 gap-y-2 text-xs">
            <span className="text-slate-400">Current tier <strong className="ml-1 text-amber-200">{data.privilegesOverview.currentTier}</strong></span>
            <span className="text-slate-400">Eligible <strong className="ml-1 text-slate-100">{data.privilegesOverview.eligibleCount}</strong></span>
            <span className="text-slate-400">Claimed <strong className="ml-1 text-slate-100">{data.privilegesOverview.claimedCount}</strong></span>
          </div>
          {data.privilegesOverview.eligiblePrivileges.length ? <div className="divide-y divide-slate-800 border-y border-slate-800">
            {data.privilegesOverview.eligiblePrivileges.slice(0, 5).map((privilege) => (
              <div key={privilege.id} className="flex items-center justify-between gap-3 py-2 text-xs">
                <span className="truncate text-slate-200">{privilege.name}</span>
                <span className="shrink-0 text-emerald-300">Eligible</span>
              </div>
            ))}
          </div> : <p className="text-sm text-slate-500">No active eligible privileges for this member.</p>}
        </Panel>
      </div>
    </div>
  );
};

const MemberMetric: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail?: string;
}> = ({ icon: Icon, label, value, detail }) => (
  <div className="min-w-0">
    <div className="flex items-center gap-1.5 text-[10px] uppercase text-slate-500"><Icon className="h-3.5 w-3.5 text-cyan-300" />{label}</div>
    <div className="mt-1 truncate text-sm font-medium text-slate-100" title={value}>{value}</div>
    {detail && <div className="mt-0.5 truncate text-[11px] text-slate-500" title={detail}>{detail}</div>}
  </div>
);

const BitSpanChart: React.FC<{ points: MemberCentralData['bitSpan'] }> = ({ points }) => {
  if (!points.length) return <p className="text-sm text-slate-500">A timeline will appear after the first BIT is recorded.</p>;

  const width = 840;
  const height = 220;
  const left = 44;
  const right = 18;
  const top = 16;
  const bottom = 42;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const maxCount = Math.max(...points.map((point) => point.bitCount), 1);
  const firstDay = new Date(`${points[0].date}T00:00:00`).getTime();
  const lastDay = new Date(`${points[points.length - 1].date}T00:00:00`).getTime();
  const coordinates = points.map((point, index) => ({
    ...point,
    x: lastDay === firstDay
      ? left + plotWidth / 2
      : left + (new Date(`${point.date}T00:00:00`).getTime() - firstDay) / (lastDay - firstDay) * plotWidth,
    y: top + plotHeight - point.bitCount / maxCount * plotHeight,
  }));
  const line = coordinates.map((point) => `${point.x},${point.y}`).join(' ');
  const ticks = Array.from({ length: Math.min(maxCount, 4) }, (_, index) => index + 1);

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="BIT count by program-local date" className="h-56 min-w-[640px] w-full text-slate-500">
        <line x1={left} y1={top} x2={left} y2={top + plotHeight} stroke="currentColor" strokeOpacity="0.35" />
        <line x1={left} y1={top + plotHeight} x2={width - right} y2={top + plotHeight} stroke="currentColor" strokeOpacity="0.35" />
        {ticks.map((tick) => {
          const y = top + plotHeight - tick / maxCount * plotHeight;
          return <g key={tick}>
            <line x1={left} y1={y} x2={width - right} y2={y} stroke="currentColor" strokeOpacity="0.12" />
            <text x={left - 10} y={y + 4} textAnchor="end" fill="currentColor" fontSize="10">{tick}</text>
          </g>;
        })}
        {coordinates.length > 1 && <polyline points={line} fill="none" stroke="#38bdf8" strokeWidth="2" />}
        {coordinates.map((point) => {
          const bitTypes = point.bitTypes.join(', ');
          return <g key={point.date}>
            <title>{`${point.date}: ${point.bitCount} BIT${point.bitCount === 1 ? '' : 's'} · ${bitTypes}`}</title>
            <circle cx={point.x} cy={point.y} r="5" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
            <text x={point.x} y={height - 20} textAnchor="middle" fill="currentColor" fontSize="10">{new Date(`${point.date}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</text>
          </g>;
        })}
        <text x={left} y={height - 4} fill="currentColor" fontSize="10">BITs per day</text>
      </svg>
      <div className="text-[11px] text-slate-500">Hover a point to see its date, BIT count, and interaction types.</div>
    </div>
  );
};