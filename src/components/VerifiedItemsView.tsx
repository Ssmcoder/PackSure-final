import React from 'react';
import { VerifiedItem } from '../types';
import { Language, translations } from '../utils/translations';

interface VerifiedItemsViewProps {
  items: VerifiedItem[];
  onNavigateScan: () => void;
  onClearItems?: () => void;
  lang?: Language;
}

export const VerifiedItemsView: React.FC<VerifiedItemsViewProps> = ({
  items,
  onNavigateScan,
  onClearItems,
  lang = 'EN',
}) => {
  const t = translations[lang];

  return (
    <div className="flex flex-col w-full pb-10 space-y-5 max-w-4xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#dce9ff]">
        <div>
          <h2 className="text-lg font-bold text-[#0b1c30] flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-[#006a61]">
              fact_check
            </span>
            <span>{t.verifiedItemsTitle}</span>
          </h2>
          <p className="text-xs text-[#76777d] mt-0.5">{t.verifiedItemsSubtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {items.length > 0 && onClearItems && (
            <button
              onClick={onClearItems}
              className="px-3 py-1.5 rounded-lg border border-[#c6c6cd] text-xs font-semibold text-[#45464d] hover:text-[#ba1a1a] transition-colors"
            >
              {t.clearAllBtn}
            </button>
          )}
          <button
            onClick={onNavigateScan}
            className="px-3 py-1.5 bg-[#006a61] text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>{t.scanNowBtn}</span>
          </button>
        </div>
      </div>

      {/* Simplified List of Verified Items */}
      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#dce9ff] p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#76777d]">
            <span className="material-symbols-outlined text-[24px]">checklist</span>
          </div>
          <h3 className="font-bold text-sm text-[#0b1c30]">{t.emptyVerifiedTitle}</h3>
          <p className="text-xs text-[#76777d] max-w-sm">{t.emptyVerifiedDesc}</p>
          <button
            onClick={onNavigateScan}
            className="mt-2 px-4 py-2 bg-[#131b2e] text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
          >
            {t.scanNowBtn}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-5 border border-[#dce9ff] shadow-xs space-y-4 hover:border-[#b0cdfa] transition-colors"
            >
              {/* Product Name & Scanned Time */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#eff4ff]">
                <div>
                  <h3 className="text-base font-bold text-[#0b1c30]">
                    {item.commodity}
                    {item.brand && (
                      <span className="text-xs font-normal text-[#45464d] ml-2">
                        ({item.brand})
                      </span>
                    )}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#45464d] font-mono bg-[#f8f9ff] px-2.5 py-1 rounded-md border border-[#eff4ff]">
                  <span className="material-symbols-outlined text-[15px] text-[#006a61]">
                    schedule
                  </span>
                  <span>
                    {t.scannedAtLabel}: <strong className="text-[#0b1c30]">{item.verifiedAtFormatted}</strong>
                  </span>
                </div>
              </div>

              {/* What Rules Were Verified In It */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#006a61]">
                    gavel
                  </span>
                  <span>{t.rulesVerifiedLabel}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {item.verifiedChecks && item.verifiedChecks.length > 0 ? (
                    item.verifiedChecks.map((check, idx) => {
                      const isPass = check.result === 'PASS';
                      return (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                            isPass
                              ? 'bg-[#f8f9ff] border-[#dce9ff]'
                              : 'bg-[#fff8f7] border-[#ffdad6]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                                isPass
                                  ? 'bg-[#86f2e4] text-[#00201d]'
                                  : 'bg-[#ffdad6] text-[#ba1a1a]'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[11px] font-bold">
                                {isPass ? 'check' : 'close'}
                              </span>
                            </span>
                            <span className="font-semibold text-[#0b1c30]">
                              {check.ruleCode}
                            </span>
                            <span className="text-[#45464d] text-[11px]">
                              — {check.checkName}
                            </span>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isPass
                                ? 'bg-[#e5eeff] text-[#006a61]'
                                : 'bg-[#ffdad6] text-[#ba1a1a]'
                            }`}
                          >
                            {check.result}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-xs text-[#76777d] italic col-span-2">
                      LMPC Rule 6(1) Declarations &amp; Rule 9 Minimum Font Height verified.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
