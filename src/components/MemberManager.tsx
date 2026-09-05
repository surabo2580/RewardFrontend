import React, { useState } from 'react';
import { useReward } from '../context/RewardContext';
import { api, MemberDto } from '../api/client';
import { AlertCircle, CalendarDays, Mail, Search, UserRound, Users } from 'lucide-react';
import { MemberBatchImport } from './MemberBatchImport';

type SearchField = 'memberId' | 'email';

export const MemberManager: React.FC = () => {
  const { businesses, selectedBusinessId, setSelectedUserId } = useReward();
  const [searchField, setSearchField] = useState<SearchField>('memberId');
  const [searchValue, setSearchValue] = useState('');
  const [results, setResults] = useState<MemberDto[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberDto | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const activeBusiness = businesses.find((business) => business.id === selectedBusinessId);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSelectedMember(null);
    setResults([]);
    setHasSearched(true);

    if (!selectedBusinessId) {
      setError('Select a business before searching members.');
      return;
    }

    const normalizedSearch = searchValue.trim().toLowerCase();
    if (!normalizedSearch) {
      setError(`Enter a ${searchField === 'memberId' ? 'Member ID' : 'member email'} to search.`);
      return;
    }

    setIsSearching(true);
    try {
      const members = await api.getMembers(Number(selectedBusinessId));
      const matches = members.filter((member) =>
        searchField === 'memberId'
          ? member.externalUserId.toLowerCase().includes(normalizedSearch) || String(member.id).includes(normalizedSearch)
          : member.email?.toLowerCase().includes(normalizedSearch)
      );
      setResults(matches);
      if (matches.length === 1) {
        setSelectedMember(matches[0]);
      }
    } catch (searchError: any) {
      setError(searchError.message || 'Unable to load members for this business.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectMember = (member: MemberDto) => {
    setSelectedMember(member);
    setSelectedUserId(member.externalUserId);
  };

  return (
    <div className="space-y-6">
      <section className="border border-slate-800 bg-slate-900 rounded-lg p-5">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-300" />
          <div>
            <h2 className="text-xl font-semibold text-white">Member Directory</h2>
            <p className="text-sm text-slate-400 mt-1">Find a loyalty member within {activeBusiness?.name || 'the selected business'}.</p>
          </div>
        </div>
      </section>

      <MemberBatchImport enabled={Boolean(selectedBusinessId)} onCompleted={() => undefined} />

      <section className="border border-slate-800 bg-slate-900 rounded-lg p-5">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-[180px_minmax(0,1fr)_auto] gap-3 items-end">
          <label className="text-xs font-medium text-slate-300 space-y-1.5">
            Search by
            <select
              value={searchField}
              onChange={(event) => setSearchField(event.target.value as SearchField)}
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
            >
              <option value="memberId">Member ID</option>
              <option value="email">Email address</option>
            </select>
          </label>
          <label className="text-xs font-medium text-slate-300 space-y-1.5">
            Search value
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder={searchField === 'memberId' ? 'e.g. guest-123 or numeric ID' : 'e.g. member@example.com'}
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500"
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

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6">
        <section className="border border-slate-800 bg-slate-900 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-white">Search Results</h3>
          {!hasSearched && <p className="mt-4 text-sm text-slate-400">Search by Member ID or email to view member details.</p>}
          {hasSearched && !isSearching && results.length === 0 && !error && <p className="mt-4 text-sm text-slate-400">No members match the search criteria for this business.</p>}
          <div className="mt-4 space-y-2">
            {results.map((member) => (
              <button
                key={member.id || member.externalUserId}
                type="button"
                onClick={() => handleSelectMember(member)}
                className={`w-full rounded-md border p-3 text-left transition-colors ${
                  selectedMember?.id === member.id ? 'border-cyan-500/60 bg-cyan-500/10' : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-slate-100">{member.email || member.externalUserId}</span>
                  <span className="text-xs font-mono text-slate-500">#{member.id}</span>
                </div>
                <div className="mt-1 text-xs text-slate-400">Member ID: {member.externalUserId} · {member.tier || 'STANDARD'}</div>
              </button>
            ))}
          </div>
        </section>

        <aside className="border border-slate-800 bg-slate-900 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-white">Member Details</h3>
          {!selectedMember ? (
            <p className="mt-4 text-sm text-slate-400">Choose a search result to inspect the member profile.</p>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/15 text-cyan-200 grid place-items-center"><UserRound className="w-5 h-5" /></div>
                <div>
                  <div className="font-semibold text-white">{selectedMember.email || selectedMember.externalUserId}</div>
                  <div className="text-xs text-slate-400">Member #{selectedMember.id}</div>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div><div className="text-xs text-slate-500">Member ID</div><div className="font-mono text-slate-200 mt-0.5">{selectedMember.externalUserId}</div></div>
                <div><div className="text-xs text-slate-500">Email</div><div className="text-slate-200 mt-0.5 inline-flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-500" />{selectedMember.email || 'Not provided'}</div></div>
                <div><div className="text-xs text-slate-500">Loyalty tier</div><div className="text-cyan-200 mt-0.5">{selectedMember.tier || 'STANDARD'}</div></div>
                <div><div className="text-xs text-slate-500">Enrolled</div><div className="text-slate-200 mt-0.5 inline-flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-slate-500" />{selectedMember.createdAt ? new Date(selectedMember.createdAt).toLocaleDateString() : 'Not available'}</div></div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
