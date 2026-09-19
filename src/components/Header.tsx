import React, { useState, useEffect } from 'react';
import { Language, translations } from '../utils/translations';
import { Officer } from '../types';
import { packsureApi, getBackendBaseUrl, setBackendBaseUrl } from '../utils/api';

interface HeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  fontZoom: 'small' | 'normal' | 'large';
  onFontZoomChange: (zoom: 'small' | 'normal' | 'large') => void;
  onQuickScanClick?: () => void;
  currentOfficer?: Officer;
  onOpenAuthModal?: (mode: 'login' | 'register') => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLanguageChange,
  fontZoom,
  onFontZoomChange,
  currentOfficer,
  onOpenAuthModal,
  onLogout,
}) => {
  const [showOfficerMenu, setShowOfficerMenu] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiStatus, setApiStatus] = useState<'connected' | 'checking' | 'offline'>('checking');
  const [backendUrl, setBackendUrlInput] = useState(getBackendBaseUrl);
  const [modelStatus, setModelStatus] = useState<Record<string, any> | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  const t = translations[lang];

  const verifyBackend = async () => {
    setApiStatus('checking');
    setHealthError(null);
    try {
      const res = await packsureApi.checkHealth();
      if (res.status === 'ok') {
        setApiStatus('connected');
        setModelStatus(res.models || {});
      } else {
        setApiStatus('offline');
        setHealthError('Invalid response from server');
      }
    } catch (err: any) {
      setApiStatus('offline');
      setHealthError(err?.message || 'Could not connect to backend server');
    }
  };

  useEffect(() => {
    verifyBackend();
    const interval = setInterval(verifyBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveApiUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setBackendBaseUrl(backendUrl);
    verifyBackend();
  };

  const getInitials = (name?: string) => {
    if (!name) return 'LM';
    const numMatch = name.match(/\d+/);
    if (numMatch) {
      const numStr = numMatch[0];
      return numStr.length <= 2 ? `I${numStr}` : `I${numStr.slice(-2)}`;
    }
    const clean = name.replace(/^(Officer|Inspector)\s+/i, '').trim();
    const parts = clean.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase() || 'LM';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#ffffff] shadow-[0_1px_8px_rgba(0,0,0,0.06)] border-b border-[#dce9ff]">
      {/* Official Tricolor Ribbon */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-[#ffffff] to-[#138808]"></div>

      {/* Official Govt Top Utilities Bar with Functional Tablist Controls */}
      <div className="bg-[#f0f4fa] border-b border-[#dce9ff] text-[11px] text-[#45464d] px-4 lg:px-8 py-1 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-medium text-[#0b1c30]">{t.govOfIndia}</span>
          <span className="hidden sm:inline text-[#c6c6cd]">|</span>
          <span className="hidden sm:inline">{t.ministryName}</span>
        </div>

        {/* Top Right Utilities: Backend status, Font Zoom & Language */}
        <div className="flex items-center gap-3">
          {/* Backend Status indicator button */}
          <button
            onClick={() => setShowApiModal(true)}
            title="FastAPI Backend Status & Settings"
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-white border border-[#dce9ff] hover:bg-[#e5eeff] transition-colors text-[10px]"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                apiStatus === 'connected'
                  ? 'bg-[#006a61] animate-pulse'
                  : apiStatus === 'checking'
                  ? 'bg-[#f59e0b]'
                  : 'bg-[#ba1a1a]'
              }`}
            ></span>
            <span className="font-mono text-[#0b1c30]">
              {apiStatus === 'connected' ? 'API: Online' : apiStatus === 'checking' ? 'API: Checking...' : 'API: Standby'}
            </span>
          </button>

          {/* Text Zoom Controls */}
          <div className="flex items-center bg-white border border-[#dce9ff] rounded px-1 py-0.5 gap-1">
            <span className="text-[10px] text-[#76777d] px-1 font-mono">Text:</span>
            <button
              onClick={() => onFontZoomChange('small')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                fontZoom === 'small' ? 'bg-[#0b1c30] text-white' : 'text-[#45464d] hover:bg-[#f0f4fa]'
              }`}
              title="Small font size"
            >
              A-
            </button>
            <button
              onClick={() => onFontZoomChange('normal')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                fontZoom === 'normal' ? 'bg-[#0b1c30] text-white' : 'text-[#45464d] hover:bg-[#f0f4fa]'
              }`}
              title="Default font size"
            >
              A
            </button>
            <button
              onClick={() => onFontZoomChange('large')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                fontZoom === 'large' ? 'bg-[#0b1c30] text-white' : 'text-[#45464d] hover:bg-[#f0f4fa]'
              }`}
              title="Large font size"
            >
              A+
            </button>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-white border border-[#dce9ff] rounded px-1 py-0.5">
            <button
              onClick={() => onLanguageChange('EN')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                lang === 'EN' ? 'bg-[#006a61] text-white' : 'text-[#45464d] hover:bg-[#f0f4fa]'
              }`}
            >
              English
            </button>
            <button
              onClick={() => onLanguageChange('HI')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                lang === 'HI' ? 'bg-[#006a61] text-white' : 'text-[#45464d] hover:bg-[#f0f4fa]'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Bar: Official Emblem + PackSure Logo & Product Identity */}
      <div className="px-4 lg:px-8 py-2.5 flex items-center justify-between">
        {/* Left: Emblem & App Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-center p-1 shadow-xs">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
              alt="National Emblem of India"
              className="h-7 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex flex-col">
            <span className="font-extrabold text-sm sm:text-base text-[#0b1c30] tracking-tight leading-tight">
              {t.deptName}
            </span>
            <div className="text-[11px] text-[#45464d] flex items-center gap-2">
              <span className="font-semibold text-[#006a61]">{t.divisionName}</span>
              <span className="hidden md:inline text-[#c6c6cd]">|</span>
              <span className="hidden md:inline font-mono text-[10px] px-1.5 py-0.2 bg-[#eff4ff] border border-[#dce9ff] rounded text-[#0b1c30]">
                {t.portalSubtitle}
              </span>
            </div>
          </div>

          {/* Dedicated PackSure Product Logo & Brand Card */}
          <div className="hidden sm:flex items-center gap-2.5 ml-2 pl-3.5 border-l border-[#dce9ff]">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#006a61] via-[#131b2e] to-[#0b1c30] flex items-center justify-center text-white shadow-xs border border-[#86f2e4]/30">
              <span className="material-symbols-outlined text-[20px] text-[#86f2e4]">
                verified
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm sm:text-base text-[#0b1c30] tracking-tight font-sans">
                PackSure
              </span>
              <span className="text-[10px] text-[#76777d] leading-none">
                {t.productTagline}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Portal Gateway Status & Officer Identity */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            onClick={() => setShowApiModal(true)}
            title="Click to view Backend Gateway Configuration"
            className="hidden lg:flex items-center gap-2 px-3 py-1 rounded bg-[#eff4ff] border border-[#dce9ff] cursor-pointer hover:bg-[#e5eeff] transition-colors"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                apiStatus === 'connected' ? 'bg-[#006a61] animate-pulse' : 'bg-[#f59e0b]'
              }`}
            ></span>
            <span className="text-[11px] font-medium text-[#0b1c30]">
              {apiStatus === 'connected' ? 'FastAPI Gateway Active' : 'Offline / Standby Engine'}
            </span>
          </div>

          {/* Officer Identity & Popover */}
          <div className="relative">
            <div
              onClick={() => setShowOfficerMenu(prev => !prev)}
              className="flex items-center gap-2.5 pl-2 cursor-pointer hover:opacity-85 transition-opacity"
            >
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-[#0b1c30]">
                  {currentOfficer ? currentOfficer.name : 'Officer Portal'}
                </div>
                <div className="text-[10px] text-[#006a61] font-mono font-medium">
                  {currentOfficer ? currentOfficer.officerId : 'Sign In Required'}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#131b2e] text-white flex items-center justify-center shadow-xs text-xs font-bold ring-2 ring-[#006a61]/30">
                {getInitials(currentOfficer?.name)}
              </div>
            </div>

            {showOfficerMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#dce9ff] py-2 z-50 text-xs animate-fade-in">
                <div className="px-4 py-2.5 border-b border-[#eff4ff] bg-[#f8f9ff]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0b1c30] text-sm">
                      {currentOfficer?.name || 'Officer Profile'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#86f2e4] text-[#00201d]">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-[#45464d] mt-0.5">
                    {currentOfficer?.designation || 'Legal Metrology Inspector'}
                  </p>
                  <p className="text-[10px] text-[#006a61] font-mono mt-1 font-semibold">
                    Officer ID: {currentOfficer?.officerId || 'Unauthenticated'}
                  </p>
                </div>
                <div className="px-4 py-2.5 text-[#45464d] space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span>Enforcement Zone:</span>
                    <span className="font-semibold text-[#0b1c30]">
                      {currentOfficer?.zone || t.officerZone}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Backend Server Sync:</span>
                    <span className={apiStatus === 'connected' ? 'text-[#006a61] font-semibold' : 'text-[#ba1a1a] font-semibold'}>
                      {apiStatus === 'connected' ? 'Synchronized' : 'Local Storage Mode'}
                    </span>
                  </div>
                </div>
                <div className="px-3 pt-2.5 pb-1 border-t border-[#eff4ff] space-y-1.5">
                  <button
                    onClick={() => {
                      setShowOfficerMenu(false);
                      onOpenAuthModal?.('login');
                    }}
                    className="w-full py-1.5 px-3 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px] text-[#006a61]">
                      switch_account
                    </span>
                    <span>Switch Officer / Log In ID</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowOfficerMenu(false);
                      onOpenAuthModal?.('register');
                    }}
                    className="w-full py-1.5 px-3 bg-white border border-[#dce9ff] hover:bg-[#f8f9ff] text-[#0b1c30] rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px] text-[#006a61]">
                      person_add
                    </span>
                    <span>Register New Officer ID</span>
                  </button>

                  <div className="flex items-center gap-2 pt-1">
                    {onLogout && (
                      <button
                        onClick={() => {
                          setShowOfficerMenu(false);
                          onLogout();
                        }}
                        className="flex-1 py-1 text-center text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded font-medium transition-colors"
                      >
                        Sign Out
                      </button>
                    )}
                    <button
                      onClick={() => setShowOfficerMenu(false)}
                      className="flex-1 py-1 text-center text-[#76777d] hover:bg-[#eff4ff] rounded font-medium transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backend API Configuration & Health Modal */}
      {showApiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#dce9ff] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#006a61]/10 text-[#006a61] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px]">dns</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#0b1c30] text-base">PackSure Backend Gateway</h3>
                  <p className="text-xs text-[#76777d]">FastAPI Python Microservice Connection</p>
                </div>
              </div>
              <button
                onClick={() => setShowApiModal(false)}
                className="text-[#76777d] hover:text-[#0b1c30] p-1 rounded-lg hover:bg-[#f0f4fa]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Current Status Box */}
            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              apiStatus === 'connected' ? 'bg-[#e6f4ea] border-[#34a853]/40' : 'bg-[#fef7e0] border-[#fbbc04]/40'
            }`}>
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${apiStatus === 'connected' ? 'bg-[#34a853]' : 'bg-[#fbbc04]'}`} />
                <div>
                  <div className="font-bold text-xs text-[#0b1c30]">
                    {apiStatus === 'connected' ? 'Connected to PackSure Backend' : 'Running in Local Standby Mode'}
                  </div>
                  <div className="text-[11px] text-[#45464d] font-mono">
                    {healthError ? `Notice: ${healthError}` : 'All REST endpoints (/scans, /auth, /stats) functional'}
                  </div>
                </div>
              </div>
              <button
                onClick={verifyBackend}
                className="px-3 py-1 bg-white rounded-lg border border-[#dce9ff] text-xs font-semibold hover:bg-[#f8f9ff] text-[#0b1c30]"
              >
                Re-check
              </button>
            </div>

            {/* Backend URL Input Form */}
            <form onSubmit={handleSaveApiUrl} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                  Backend API Base URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={backendUrl}
                    onChange={e => setBackendUrlInput(e.target.value)}
                    placeholder="http://localhost:8000"
                    className="flex-1 px-3 py-2 text-xs border border-[#c6c6cd] rounded-lg font-mono focus:outline-none focus:border-[#006a61]"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#006a61] text-white rounded-lg text-xs font-semibold hover:bg-[#005049]"
                  >
                    Save & Test
                  </button>
                </div>
                <p className="text-[10px] text-[#76777d] mt-1">
                  Default: <span className="font-mono">http://localhost:8000</span> (FastAPI backend server)
                </p>
              </div>
            </form>

            {/* Microservice Endpoints Specification */}
            <div className="border border-[#eff4ff] rounded-xl p-3 bg-[#f8f9ff] space-y-2 text-[11px]">
              <div className="font-bold text-[#0b1c30] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-[#006a61]">hub</span>
                <span>Active Backend API Specifications</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="p-1.5 bg-white rounded border border-[#dce9ff]">
                  <span className="text-[#006a61] font-bold">POST</span> /scans/run
                  <p className="text-[#76777d] text-[9px] font-sans">AI OCR & Metrology Rule Pipeline</p>
                </div>
                <div className="p-1.5 bg-white rounded border border-[#dce9ff]">
                  <span className="text-[#138808] font-bold">GET</span> /scans/:id/report
                  <p className="text-[#76777d] text-[9px] font-sans">Official PDF Report Generator</p>
                </div>
                <div className="p-1.5 bg-white rounded border border-[#dce9ff]">
                  <span className="text-[#006a61] font-bold">POST</span> /auth/login
                  <p className="text-[#76777d] text-[9px] font-sans">JWT Officer Authentication</p>
                </div>
                <div className="p-1.5 bg-white rounded border border-[#dce9ff]">
                  <span className="text-[#138808] font-bold">GET</span> /stats
                  <p className="text-[#76777d] text-[9px] font-sans">Live Aggregated Enforcement Analytics</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowApiModal(false)}
                className="px-4 py-2 bg-[#0b1c30] text-white text-xs font-semibold rounded-lg hover:bg-[#131b2e]"
              >
                Close Gateway Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
