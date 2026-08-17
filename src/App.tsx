import React, { useState } from 'react';
import { RewardProvider } from './context/RewardContext';
import { Navbar } from './components/Navbar';
import { EventDispatcher } from './components/EventDispatcher';
import { RuleManager } from './components/RuleManager';
import { WalletView } from './components/WalletView';
import { TransactionLedger } from './components/TransactionLedger';
import { ApiSandbox } from './components/ApiSandbox';
import { BusinessUserManager } from './components/BusinessUserManager';
import { KotlinSourceViewer } from './components/KotlinSourceViewer';
import { RepoArchitectureGuide } from './components/RepoArchitectureGuide';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Layers, ShieldCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('events');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {activeTab === 'events' && <EventDispatcher />}
            {activeTab === 'rules' && <RuleManager />}
            {activeTab === 'wallet' && <WalletView />}
            {activeTab === 'transactions' && <TransactionLedger />}
            {activeTab === 'api' && <ApiSandbox />}
            {activeTab === 'entities' && <BusinessUserManager />}
            {activeTab === 'kotlin' && <KotlinSourceViewer />}
            {activeTab === 'repos' && <RepoArchitectureGuide />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>SmartReward Rule Engine • Ported to React & TypeScript</span>
          </div>
          <div className="text-slate-400">
            Multi-Tenant Loyalty & Rewards Infrastructure
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <RewardProvider>
      <AppContent />
    </RewardProvider>
  );
}

export default App;
