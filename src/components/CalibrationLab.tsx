import React, { useState } from 'react';
import { Language, translations } from '../utils/translations';

interface CalibrationLabProps {
  lang?: Language;
}

export const CalibrationLab: React.FC<CalibrationLabProps> = ({ lang = 'EN' }) => {
  const [targetType, setTargetType] = useState<'ruler' | 'coin'>('ruler');
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrated, setCalibrated] = useState(true);

  const t = translations[lang];

  const handleCalibrate = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
      setCalibrated(true);
    }, 800);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-[#dce9ff] p-6 max-w-2xl mx-auto space-y-6">
      {/* Simple Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#eff4ff]">
        <div>
          <h3 className="font-bold text-base text-[#0b1c30] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#006a61]">straighten</span>
            <span>{t.calibrationTitle}</span>
          </h3>
          <p className="text-xs text-[#76777d] mt-1">{t.calibrationSubtitle}</p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#86f2e4]/30 border border-[#006a61]/20 text-[#006a61] text-xs font-semibold self-start sm:self-center">
          <span className="w-2 h-2 rounded-full bg-[#006a61] animate-pulse"></span>
          <span>{calibrated ? t.calibratedStatus : 'Uncalibrated'}</span>
        </div>
      </div>

      {/* Target Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-[#0b1c30] block">
          {t.targetSelectionLabel}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTargetType('ruler')}
            className={`p-3 rounded-lg border text-xs font-medium text-left flex items-center gap-2.5 transition-all ${
              targetType === 'ruler'
                ? 'border-[#006a61] bg-[#eff4ff] text-[#006a61] font-bold shadow-xs'
                : 'border-[#c6c6cd] bg-[#f8f9ff] text-[#45464d] hover:bg-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">square_foot</span>
            <span>{t.rulerOption}</span>
          </button>

          <button
            type="button"
            onClick={() => setTargetType('coin')}
            className={`p-3 rounded-lg border text-xs font-medium text-left flex items-center gap-2.5 transition-all ${
              targetType === 'coin'
                ? 'border-[#006a61] bg-[#eff4ff] text-[#006a61] font-bold shadow-xs'
                : 'border-[#c6c6cd] bg-[#f8f9ff] text-[#45464d] hover:bg-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">monetization_on</span>
            <span>{t.coinOption}</span>
          </button>
        </div>
      </div>

      {/* Visual Alignment Box */}
      <div className="relative bg-[#131b2e] rounded-xl p-8 flex flex-col items-center justify-center text-center text-white border border-[#213145]">
        {/* Reticle guidelines */}
        <div className="w-48 h-32 border-2 border-dashed border-[#86f2e4] rounded-lg flex flex-col items-center justify-center p-4 relative">
          <span className="material-symbols-outlined text-[32px] text-[#86f2e4] opacity-80">
            {targetType === 'ruler' ? 'straighten' : 'circle'}
          </span>
          <span className="text-[11px] font-mono mt-2 text-[#bec6e0]">
            {targetType === 'ruler' ? 'Align 10 mm ruler line' : 'Fit ₹10 coin inside ring'}
          </span>
          <span className="absolute -bottom-3 px-2 py-0.5 bg-[#131b2e] text-[#86f2e4] text-[10px] font-mono border border-[#86f2e4] rounded">
            Scale: 1.0 mm = 10 px
          </span>
        </div>

        <p className="text-[11px] text-[#bec6e0] mt-4 max-w-sm">
          Hold your reference target parallel to the camera within the alignment box.
        </p>
      </div>

      {/* Action Button & Simple Notice */}
      <div className="space-y-3">
        <button
          onClick={handleCalibrate}
          disabled={isCalibrating}
          className="w-full py-2.5 rounded-lg bg-[#006a61] text-white font-semibold text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[16px]">
            {isCalibrating ? 'sync' : 'tune'}
          </span>
          <span>{isCalibrating ? 'Calibrating...' : t.calibrateBtn}</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-[#006a61] bg-[#eff4ff] p-3 rounded-lg border border-[#dce9ff]">
          <span className="material-symbols-outlined text-[16px] shrink-0">check_circle</span>
          <span>{t.calibratedNotice}</span>
        </div>
      </div>
    </div>
  );
};
