import React, { useEffect, useState } from 'react';
import { useReward } from '../context/RewardContext';
import { api, HotnoteDto, MemberSearchResult } from '../api/client';
import { AlertCircle, ArrowRight, Flame, Search, Users } from 'lucide-react';
import { MemberBatchImport } from './MemberBatchImport';

export const MemberManager: React.FC<{ onOpenMember: (memberId: number) => void }> = ({ onOpenMember }) => {
  const { businesses, selectedBusinessId } = useReward();
  const [searchValue, setSearchValue] = useState('');
  const [results, setResults] = useState<MemberSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [hotnotes, setHotnotes] = useState<HotnoteDto[]>([]);

  const activeBusiness = businesses.find((business) => business.id === selectedBusinessId);

  useEffect(() => {
    api.getHotnotes().then(setHotnotes).catch(() => setHotnotes([]));
  }, [selectedBusinessId]);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setResults([]);
    setHasSearched(true);

    const query = searchValue.trim();
    if (!query) {
      setError('Enter a Member ID, email, mobile or name to search.');
      return;
    }

    setIsSearching(true);
    try {
      const matches = await api.searchMembers(query);
      setResults(matches);
      if (matches.length === 1) onOpenMember(matches[0].id);
    } catch (searchError: any) {
      setError(searchError.message || 'Unable to search members.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="border border-slate-800 bg-slate-900 rounded-lg p-5">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-300" />
          <div>
            <h2 className="text-xl font-semibold text-white">Member Portal</h2>
            <p className="text-sm text-slate-400 mt-1">Search a member in {activeBusiness?.name || 'the selected business'} to open their 360° workspace.</p>
          </div>
        </div>
        <form onSubmit={handleSearch} className="mt-4 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-3 items-end">
          <label className="text-xs font-medium text-slate-300 space-y-1.5">
            Member ID, email, mobile or name
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="e.g. 1001644762 or suraj.das@example.com"
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500"
              autoFocus
            />
          </label>
          <button
            type="submit"
            disabled={isSearching}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cyan-600 px-4 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-60"
          >
            <Search className="w-4 h-4" />
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>
        {error && <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-rose-400"><AlertCircle className="w-4 h-4" />{error}</p>}
      </section>

      {hasSearched && (
        <section className="border border-slate-800 bg-slate-900 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-white">Search Results</h3>
          {!isSearching && results.length === 0 && !error && <p className="mt-4 text-sm text-slate-400">No members match the search criteria for this business.</p>}
          {results.length > 0 && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-slate-500">
                  <tr><th className="py-2">Member</th><th className="text-right">Account Balance</th><th>Date of Birth</th><th>Mobile</th><th>Email</th><th>Tier</th><th>Stage</th><th /></tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {results.map((member) => {
                    const name = [member.firstName, member.lastName].filter(Boolean).join(' ') || member.email || member.externalUserId;
                    return (
                      <tr key={member.id} onClick={() => onOpenMember(member.id)} className="cursor-pointer text-slate-200 hover:bg-slate-800/60">
                        <td className="py-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-700 text-xs font-semibold uppercase">{name.slice(0, 2)}</div>
                            <div>
                              <div className="font-medium">{name}</div>
                              <div className="text-xs text-slate-500">Member ID: {member.externalUserId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-right font-semibold">{member.accountBalance.toLocaleString()}</td>
                        <td>{member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : '—'}</td>
                        <td>{member.phone || '—'}</td>
                        <td>{member.email || '—'}</td>
                        <td className="text-amber-300">{member.tier}</td>
                        <td>{member.status}</td>
                        <td className="text-right text-cyan-300"><ArrowRight className="inline h-4 w-4" /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <section className="border border-slate-800 bg-slate-900 rounded-lg p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white"><Flame className="h-4 w-4 text-rose-400" />Urgent Hotnotes</h3>
        {hotnotes.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No open hotnotes.</p>
        ) : (
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-xs text-slate-500"><tr><th className="py-2">Member ID</th><th>Note Category</th><th>Note Title</th><th>Priority</th><th /></tr></thead>
            <tbody className="divide-y divide-slate-800">
              {hotnotes.map(({ ticket, memberExternalUserId, memberEmail }) => (
                <tr key={ticket.id} className="text-slate-200">
                  <td className="py-2 font-mono text-xs">{memberExternalUserId || `#${ticket.memberId}`}<div className="font-sans text-slate-500">{memberEmail}</div></td>
                  <td>{ticket.category}</td>
                  <td>{ticket.subject}</td>
                  <td>{ticket.priority}</td>
                  <td className="text-right">
                    <button type="button" onClick={() => onOpenMember(ticket.memberId)} className="text-xs text-cyan-300 hover:underline">Open member</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <MemberBatchImport enabled={Boolean(selectedBusinessId)} onCompleted={() => undefined} />
    </div>
  );
};
