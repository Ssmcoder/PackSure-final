import React from 'react';
import { NavigationTab } from '../types';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const navItems: { id: NavigationTab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'new-scan', label: 'New Scan', icon: 'document_scanner' },
    { id: 'history', label: 'History', icon: 'history' },
    { id: 'rule-reference', label: 'Rule Reference', icon: 'menu_book' },
    { id: 'audit-logs', label: 'Audit Logs', icon: 'fingerprint' },
  ];

  return (
    <aside className="fixed left-0 top-20 bottom-0 w-64 bg-[#ffffff] shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-[#e5eeff] z-40 flex flex-col justify-between py-4">
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
    </aside>
  );
};
