import React, { useState } from 'react';

interface HeaderProps {
  onQuickScanClick?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const [showOfficerMenu, setShowOfficerMenu] = useState(false);
  const [apiStatus, setApiStatus] = useState<'connected' | 'reconnecting'>('connected');

  const toggleStatus = () => {
    setApiStatus(prev => (prev === 'connected' ? 'reconnecting' : 'connected'));
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#ffffff] shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#e5eeff]">
      <div className="w-full px-4 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <img
            alt="PackSure Logo"
            className="h-8 w-auto object-contain cursor-pointer"
            src="https://lh3.googleusercontent.com/aida/AEtjO1XAdb0XPtmB1euYNjFj5z2nXqUWLKiGGeR3izKDbKHyVRzLDfj-iKVlVndGF7C8ZjWCORxhFEWko7aNXGL0LHLBuGvmd7Uy1U3DckZWvY6a0Y6zsANHiZBmv9hy966Ms8ViZJf54OZfa-OY053bDsFU8a3xRtM-Fve6VjubIWSsbxQifmHk5AoEE365eKJIU3l3Olhvjox7ixqfLbS1cGg80yo69TyBYzWp0EIP60P_GyIW46BLLSaXskh6"
          />
          <span className="font-headline-sm text-[16px] font-semibold text-[#0b1c30] tracking-tight">PackSure</span>
        </div>

        {/* Right: Status & Officer Profile */}
        <div className="flex items-center gap-4">
          <div
            onClick={toggleStatus}
            title="Click to toggle system status"
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded bg-[#eff4ff] border border-[#dce9ff] cursor-pointer hover:bg-[#e5eeff] transition-colors"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                apiStatus === 'connected' ? 'bg-[#006a61] animate-pulse' : 'bg-[#f59e0b]'
              }`}
            ></span>
            <span className="font-label-sm text-[11px] font-medium text-[#0b1c30]">
              {apiStatus === 'connected' ? 'System Online' : 'Reconnecting...'}
            </span>
          </div>

          {/* Officer Identity & Badge */}
          <div className="relative">
            <div
              onClick={() => setShowOfficerMenu(prev => !prev)}
              className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-85 transition-opacity"
            >
              <div className="text-right hidden sm:block">
                <div className="font-label-md text-[13px] font-medium text-[#0b1c30]">Officer S. Sharma</div>
                <div className="font-label-sm text-[11px] text-[#45464d]">Unit FEU-4</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#000000] text-[#ffffff] flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[20px]">person</span>
              </div>
            </div>

            {showOfficerMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-[#dce9ff] py-2 z-50">
                <div className="px-4 py-2 border-b border-[#eff4ff]">
                  <p className="text-xs font-semibold text-[#0b1c30]">Sub-Divisional Legal Metrology</p>
                  <p className="text-[11px] text-[#45464d]">Field Enforcement Unit Delhi-04</p>
                  <p className="text-[10px] text-[#006a61] font-mono mt-1">ID: DCA-FEU-IND-2026-9921</p>
                </div>
                <div className="px-4 py-2 text-xs text-[#45464d] space-y-1">
                  <div className="flex justify-between">
                    <span>Shift Status:</span>
                    <span className="text-emerald-700 font-semibold">Active Duty</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Terminal Device:</span>
                    <span className="font-mono">Toughpad-F4</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily Inspections:</span>
                    <span className="font-bold text-[#0b1c30]">18 dossiers</span>
                  </div>
                </div>
                <div className="px-3 pt-2 border-t border-[#eff4ff]">
                  <button
                    onClick={() => setShowOfficerMenu(false)}
                    className="w-full py-1 text-center text-xs bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] rounded font-medium"
                  >
                    Close Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
