import React from 'react';
import { NavigationTab } from '../types';
import { Language, translations } from '../utils/translations';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  lang?: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, lang = 'EN' }) => {
  const t = translations[lang];

  const navItems: { id: NavigationTab; label: string; icon: string }[] = [
    { id: 'dashboard', label: t.navDashboard, icon: 'dashboard' },
    { id: 'new-scan', label: t.navNewScan, icon: 'document_scanner' },
    { id: 'verified-items', label: t.navVerifiedItems, icon: 'fact_check' },
    { id: 'history', label: t.navHistory, icon: 'history' },
    { id: 'rule-reference', label: t.navRuleReference, icon: 'menu_book' },
  ];

  return (
    <aside className="fixed left-0 top-[92px] bottom-0 w-64 bg-[#ffffff] shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-[#e5eeff] z-40 flex flex-col justify-between py-4">
      <nav className="flex flex-col gap-1 px-2">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded transition-colors font-label-lg text-[14px] text-left w-full ${
                isActive
                  ? 'bg-[#e5eeff] text-[#0b1c30] font-semibold shadow-xs'
                  : 'text-[#45464d] hover:bg-[#dce9ff] hover:text-[#0b1c30]'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[18px] ${
                  isActive ? 'text-[#006a61]' : 'text-[#76777d]'
                }`}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
              {item.id === 'new-scan' && (
                <span className="ml-auto w-2 h-2 rounded-full bg-[#006a61] animate-pulse"></span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Official Gov Emblem & Help Footer */}
      <div className="px-4 py-3 border-t border-[#eff4ff] text-[11px] text-[#76777d] space-y-1 bg-[#fcfdff]">
        <div className="font-semibold text-[#0b1c30] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[15px] text-[#006a61]">verified_user</span>
          <span>{lang === 'EN' ? 'Dept. of Consumer Affairs' : 'उपभोक्ता मामले विभाग'}</span>
        </div>
        <div className="text-[10px]">
          {lang === 'EN' ? 'Legal Metrology (PC) Rules, 2011' : 'विधिक मापविज्ञान (पीसी) नियम, 2011'}
        </div>
        <div className="text-[10px] text-[#45464d] font-mono pt-1">
          e-Gov Standard • NIC Hosted
        </div>
      </div>
    </aside>
  );
};
