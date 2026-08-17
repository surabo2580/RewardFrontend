import React, { CSSProperties } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Transaction } from '../types';

interface VirtualizedTransactionListProps {
  transactions: Transaction[];
  height: number;
  itemHeight: number;
  onSelectTransaction?: (transaction: Transaction) => void;
}

/**
 * Row renderer for virtualized list
 */
const Row = React.memo(
  ({
    index,
    style,
    data,
  }: {
    index: number;
    style: CSSProperties;
    data: Transaction[];
  }) => {
    const transaction = data[index];

    return (
      <div
        style={style}
        className="flex items-center px-4 py-2 border-b border-slate-800 hover:bg-slate-800/50 transition-colors text-sm"
      >
        <div className="flex-1 grid grid-cols-5 gap-4">
          <div className="text-slate-300">
            <span className="text-xs text-slate-400">ID</span>
            <p>#{transaction.id}</p>
          </div>
          <div className="text-slate-300">
            <span className="text-xs text-slate-400">User</span>
            <p className="truncate">{transaction.userId}</p>
          </div>
          <div className="text-slate-300">
            <span className="text-xs text-slate-400">Points</span>
            <p className="text-emerald-400 font-semibold">{transaction.points}</p>
          </div>
          <div className="text-slate-300">
            <span className="text-xs text-slate-400">Status</span>
            <span
              className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                transaction.status === 'CONFIRMED'
                  ? 'bg-emerald-900/30 text-emerald-300'
                  : transaction.status === 'PENDING'
                  ? 'bg-yellow-900/30 text-yellow-300'
                  : transaction.status === 'REDEEMED'
                  ? 'bg-blue-900/30 text-blue-300'
                  : 'bg-red-900/30 text-red-300'
              }`}
            >
              {transaction.status}
            </span>
          </div>
          <div className="text-slate-300">
            <span className="text-xs text-slate-400">Date</span>
            <p>{new Date(transaction.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    );
  }
);

Row.displayName = 'VirtualizedRow';

/**
 * Virtualized transaction list component
 * Efficiently renders large lists by only rendering visible items
 */
export const VirtualizedTransactionList: React.FC<VirtualizedTransactionListProps> = ({
  transactions,
  height = 500,
  itemHeight = 80,
  onSelectTransaction,
}) => {
  if (transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-400">
        <p>No transactions found</p>
      </div>
    );
  }

  return (
    <div className="border border-slate-800 rounded-lg overflow-hidden">
      <List
        height={height}
        itemCount={transactions.length}
        itemSize={itemHeight}
        width="100%"
        itemData={transactions}
      >
        {Row}
      </List>
    </div>
  );
};

export default VirtualizedTransactionList;
