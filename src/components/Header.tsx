import React, { useState } from 'react';
import { Language, translations } from '../utils/translations';
import { Officer } from '../types';

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
  const [apiStatus, setApiStatus] = useState<'connected' | 'reconnecting'>('connected');

  const t = translations[lang];

  const toggleStatus = () => {
    setApiStatus(prev => (prev === 'connected' ? 'reconnecting' : 'connected'));
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

        {/* Top Tablist: Helpline, Zoom Controls, Language Toggle */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden md:flex items-center gap-1.5 font-medium text-[#006a61]">
            <span className="material-symbols-outlined text-[14px]">call</span>
            <span>{t.nchHelpline}</span>
          </div>

          {/* Functional Text Zoom Buttons (A-, A, A+) */}
          <div
            className="flex items-center gap-1 text-[11px] font-mono border border-[#c6c6cd] rounded px-1.5 py-0.5 bg-white shadow-xs"
            title="Adjust interface font size"
          >
            <button
              onClick={() => onFontZoomChange('small')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                fontZoom === 'small'
                  ? 'bg-[#131b2e] text-white font-bold'
                  : 'hover:text-[#0b1c30] text-[#45464d]'
              }`}
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="text-[#c6c6cd]">|</span>
            <button
              onClick={() => onFontZoomChange('normal')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                fontZoom === 'normal'
                  ? 'bg-[#131b2e] text-white font-bold'
                  : 'hover:text-[#0b1c30] text-[#45464d]'
              }`}
              title="Default Font Size"
            >
              A
            </button>
            <span className="text-[#c6c6cd]">|</span>
            <button
              onClick={() => onFontZoomChange('large')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                fontZoom === 'large'
                  ? 'bg-[#131b2e] text-white font-bold'
                  : 'hover:text-[#0b1c30] text-[#45464d]'
              }`}
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Functional Language Translation Toggle */}
          <button
            onClick={() => onLanguageChange(lang === 'EN' ? 'HI' : 'EN')}
            className="px-2.5 py-0.5 rounded bg-white border border-[#c6c6cd] font-semibold text-[11px] text-[#0b1c30] hover:bg-[#eff4ff] shadow-xs flex items-center gap-1 transition-colors"
            title="Translate interface between English and Hindi"
          >
            <span className="material-symbols-outlined text-[13px] text-[#006a61]">
              translate
            </span>
            <span>{lang === 'EN' ? 'हिन्दी' : 'English'}</span>
          </button>
        </div>
      </div>

      {/* Main Header Bar: Official Emblem + PackSure Logo & Product Identity */}
      <div className="w-full px-4 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          {/* State Emblem of India */}
          <div className="w-9 h-11 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 100 120" className="w-8 h-10 text-[#0b1c30] fill-current" aria-label="State Emblem of India">
              <circle cx="50" cy="22" r="14" fill="none" stroke="currentColor" strokeWidth="4" />
              <path d="M38 18 C38 12, 44 8, 50 8 C56 8, 62 12, 62 18 Z" />
              <circle cx="50" cy="18" r="3" fill="currentColor" />
              <circle cx="34" cy="24" r="7" fill="none" stroke="currentColor" strokeWidth="3" />
              <circle cx="66" cy="24" r="7" fill="none" stroke="currentColor" strokeWidth="3" />
              <rect x="24" y="38" width="52" height="12" rx="3" fill="none" stroke="currentColor" strokeWidth="3.5" />
              <circle cx="50" cy="44" r="4.5" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M28 50 C32 64, 40 72, 50 72 C60 72, 68 64, 72 50 Z" fill="none" stroke="currentColor" strokeWidth="3.5" />
              <path d="M38 50 C40 60, 45 66, 50 66 C55 66, 60 60, 62 50" fill="none" stroke="currentColor" strokeWidth="2" />
              <rect x="22" y="74" width="56" height="6" rx="1.5" />
              <text x="50" y="94" textAnchor="middle" fontSize="10.5" fontWeight="bold" fontFamily="sans-serif" fill="currentColor">
                सत्यमेव जयते
              </text>
            </svg>
          </div>

          <div className="border-l border-[#dce9ff] pl-3 flex flex-col justify-center">
            <span className="font-bold text-xs sm:text-sm text-[#0b1c30] tracking-tight">
              {t.deptName}
            </span>
            <div className="text-[11px] text-[#45464d] flex items-center gap-2">
              <span className="font-semibold text-[#006a61]">{t.divisionName}</span>
              <span className="hidden md:inline text-[#c6c6cd]">•</span>
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
              <div className="flex items-center gap-1">
                <span className="font-black text-sm sm:text-base text-[#0b1c30] tracking-tight font-sans">
                  PackSure
                </span>
                <span className="text-[9px] font-bold text-[#006a61] bg-[#86f2e4]/40 px-1 rounded">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-[#76777d] leading-none">
                {t.productTagline}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Portal Gateway Status & Officer Identity */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            onClick={toggleStatus}
            title="Click to toggle gateway connectivity status"
            className="hidden lg:flex items-center gap-2 px-3 py-1 rounded bg-[#eff4ff] border border-[#dce9ff] cursor-pointer hover:bg-[#e5eeff] transition-colors"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                apiStatus === 'connected' ? 'bg-[#006a61] animate-pulse' : 'bg-[#f59e0b]'
              }`}
            ></span>
            <span className="text-[11px] font-medium text-[#0b1c30]">
              {apiStatus === 'connected' ? t.gatewayActive : 'Offline / Standby'}
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
                    <span>Certified Calibration:</span>
                    <span className="text-[#006a61] font-semibold">Valid till Dec 2026</span>
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
    </header>
  );
};
