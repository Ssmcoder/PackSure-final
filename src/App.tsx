import React, { useState } from 'react';
import { NavigationTab, SampleLabel } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { NewScanTerminal } from './components/NewScanTerminal';
import { DashboardView } from './components/DashboardView';
import { HistoryLedgerView } from './components/HistoryLedgerView';
import { RuleReferenceView } from './components/RuleReferenceView';
import { AuditLogsView } from './components/AuditLogsView';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('new-scan');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleSaveToLedger = (sample: SampleLabel) => {
    showToast(`Dossier for ${sample.commodity} officially recorded in Enforcement Ledger.`);
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col antialiased selection:bg-[#86f2e4] selection:text-[#00201d]">
      {/* Fixed Top Header */}
      <Header />

      {/* Fixed Left Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <div className="pl-64">
        <main className="w-full min-h-screen pt-20 px-4 lg:px-8 bg-[#f8f9ff]">
          <div className="max-w-7xl mx-auto py-4">
            {activeTab === 'new-scan' && (
              <NewScanTerminal onSaveToLedger={handleSaveToLedger} />
            )}
            {activeTab === 'dashboard' && (
              <DashboardView onNavigate={setActiveTab} />
            )}
            {activeTab === 'history' && <HistoryLedgerView />}
            {activeTab === 'rule-reference' && <RuleReferenceView />}
            {activeTab === 'audit-logs' && <AuditLogsView />}
          </div>
        </main>
      </div>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#131b2e] text-white px-4 py-3 rounded-xl shadow-lg border border-[#86f2e4]/30 flex items-center gap-3 animate-fade-in text-xs font-medium">
          <span className="material-symbols-outlined text-[18px] text-[#86f2e4]">check_circle</span>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white ml-2"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      )}
    </div>
  );
}

