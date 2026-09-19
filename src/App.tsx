import React, { useState, useEffect } from 'react';
import { NavigationTab, SampleLabel, VerifiedItem, Officer } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { NewScanTerminal } from './components/NewScanTerminal';
import { DashboardView } from './components/DashboardView';
import { HistoryLedgerView } from './components/HistoryLedgerView';
import { RuleReferenceView } from './components/RuleReferenceView';
import { VerifiedItemsView } from './components/VerifiedItemsView';
import { OfficerAuthModal } from './components/OfficerAuthModal';
import { getStoredCurrentOfficer, saveStoredCurrentOfficer } from './utils/officers';
import { Language } from './utils/translations';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('new-scan');
  const [currentOfficer, setCurrentOfficer] = useState<Officer | null>(() => getStoredCurrentOfficer());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const [savedSamples, setSavedSamples] = useState<SampleLabel[]>(() => {
    try {
      const stored = localStorage.getItem('packsure_saved_samples');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [verifiedItems, setVerifiedItems] = useState<VerifiedItem[]>(() => {
    try {
      const stored = localStorage.getItem('packsure_verified_items');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('packsure_saved_samples', JSON.stringify(savedSamples));
    } catch (e) {
      console.error(e);
    }
  }, [savedSamples]);

  useEffect(() => {
    try {
      localStorage.setItem('packsure_verified_items', JSON.stringify(verifiedItems));
    } catch (e) {
      console.error(e);
    }
  }, [verifiedItems]);

  // Top tablist functional state: Language & Text Zoom
  const [lang, setLang] = useState<Language>('EN');
  const [fontZoom, setFontZoom] = useState<'small' | 'normal' | 'large'>('normal');

  // Apply font zoom to root document and container
  useEffect(() => {
    const root = document.documentElement;
    if (fontZoom === 'small') {
      root.style.fontSize = '14px';
    } else if (fontZoom === 'large') {
      root.style.fontSize = '18.5px';
    } else {
      root.style.fontSize = '16px';
    }
  }, [fontZoom]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleSaveToLedger = (sample: SampleLabel) => {
    setSavedSamples(prev => [sample, ...prev.filter(s => s.id !== sample.id)]);
    showToast(
      lang === 'EN'
        ? `Dossier for ${sample.commodity} recorded in Enforcement Ledger.`
        : `${sample.commodity} का डोजियर प्रवर्तन लेज़र में दर्ज किया गया।`
    );
  };

  const handleItemVerified = (item: VerifiedItem) => {
    setVerifiedItems(prev => [item, ...prev.filter(i => i.id !== item.id)]);
    showToast(
      lang === 'EN'
        ? `Specimen ${item.commodity} scanned & verified.`
        : `नमूना ${item.commodity} स्कैन व सत्यापित किया गया।`
    );
  };

  const handleOpenAuthModal = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleOfficerAuthSuccess = (officer: Officer) => {
    setCurrentOfficer(officer);
    saveStoredCurrentOfficer(officer);
    showToast(
      lang === 'EN'
        ? `Authenticated as ${officer.name} (${officer.officerId}).`
        : `${officer.name} (${officer.officerId}) के रूप में प्रमाणित।`
    );
  };

  const handleLogout = () => {
    setCurrentOfficer(null);
    saveStoredCurrentOfficer(null);
    showToast(lang === 'EN' ? 'Signed out of officer session.' : 'अधिकारी सत्र से साइन आउट किया गया।');
  };

  return (
    <div
      className={`min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col antialiased selection:bg-[#86f2e4] selection:text-[#00201d] transition-all duration-150 ${
        fontZoom === 'small' ? 'text-[14px]' : fontZoom === 'large' ? 'text-[17px]' : 'text-[15px]'
      }`}
    >
      {/* Fixed Top Header with PackSure branding and functional tablist */}
      <Header
        lang={lang}
        onLanguageChange={setLang}
        fontZoom={fontZoom}
        onFontZoomChange={setFontZoom}
        currentOfficer={currentOfficer || undefined}
        onOpenAuthModal={handleOpenAuthModal}
        onLogout={handleLogout}
      />

      {/* Fixed Left Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} lang={lang} />

      {/* Main Content Area */}
      <div className="pl-64">
        <main className="w-full min-h-screen pt-[104px] px-4 lg:px-8 bg-[#f8f9ff]">
          <div className="max-w-7xl mx-auto py-4">
            {activeTab === 'new-scan' && (
              <NewScanTerminal
                onSaveToLedger={handleSaveToLedger}
                onItemVerified={handleItemVerified}
                lang={lang}
                currentOfficer={currentOfficer || undefined}
              />
            )}
            {activeTab === 'dashboard' && (
              <DashboardView
                onNavigate={setActiveTab}
                items={verifiedItems}
                samples={savedSamples}
                lang={lang}
              />
            )}
            {activeTab === 'verified-items' && (
              <VerifiedItemsView
                items={verifiedItems}
                onNavigateScan={() => setActiveTab('new-scan')}
                onClearItems={() => {
                  setVerifiedItems([]);
                  setSavedSamples([]);
                }}
                lang={lang}
              />
            )}
            {activeTab === 'history' && (
              <HistoryLedgerView
                samples={savedSamples}
                onNavigateScan={() => setActiveTab('new-scan')}
              />
            )}
            {activeTab === 'rule-reference' && <RuleReferenceView />}
          </div>
        </main>
      </div>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#131b2e] text-white px-4 py-3 rounded-xl shadow-lg border border-[#86f2e4]/30 flex items-center gap-3 animate-fade-in text-xs font-medium">
          <span className="material-symbols-outlined text-[18px] text-[#86f2e4]">
            verified
          </span>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white ml-2"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      )}

      {/* Officer Authentication Modal */}
      {isAuthModalOpen && (
        <OfficerAuthModal
          isOpen={isAuthModalOpen}
          initialMode={authModalMode}
          onClose={() => setIsAuthModalOpen(false)}
          onOfficerAuthenticated={handleOfficerAuthSuccess}
          currentOfficer={currentOfficer}
          lang={lang}
        />
      )}
    </div>
  );
}
