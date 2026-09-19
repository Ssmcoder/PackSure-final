import React, { useState } from 'react';

export const CalibrationLab: React.FC = () => {
  const [targetWidthMm, setTargetWidthMm] = useState<number>(37.29); // Standard EAN-13 nominal width
  const [pixelMeasurement, setPixelMeasurement] = useState<number>(428); // 428 px / 37.29 mm = ~11.47 px/mm
  const [lensFocalLength, setLensFocalLength] = useState<string>('24mm Field Tablet Prime');
  const [isCalibrated, setIsCalibrated] = useState<boolean>(true);

  const calculatedPxPerMm = (pixelMeasurement / targetWidthMm).toFixed(2);
  const calculatedResolutionUm = (1000 / Number(calculatedPxPerMm)).toFixed(1); // micrometers per pixel

  return (
    <div className="flex flex-col gap-6">
      {/* Controls Header */}
      <div className="flex items-center justify-end">
        <span className="px-3 py-1.5 rounded bg-[#86f2e4] text-[#00201d] text-xs font-semibold flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#006a61]">verified</span>
          <span>Matrix: {calculatedPxPerMm} px/mm</span>
        </span>
      </div>

      {/* Interactive Rig Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Optical Alignment Reticle Canvas Simulation */}
        <div className="lg:col-span-7 bg-white rounded-xl shadow-sm border border-[#dce9ff] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-[#0b1c30]">Optical Reticle Viewport (Nominal 100% Magnification)</span>
            <span className="text-xs font-mono text-[#006a61] bg-[#eff4ff] px-2 py-0.5 rounded border border-[#dce9ff]">
              1 px = {calculatedResolutionUm} µm
            </span>
          </div>

          <div className="relative w-full h-80 bg-[#131b2e] rounded-xl overflow-hidden flex items-center justify-center p-6 border border-[#213145]">
            {/* Grid background */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            ></div>

            {/* Corner Crosshairs */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#86f2e4]"></div>
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#86f2e4]"></div>
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#86f2e4]"></div>
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#86f2e4]"></div>

            {/* Simulated EAN-13 Barcode with Measurement Calipers */}
            <div className="relative bg-white text-black p-4 rounded shadow-lg flex flex-col items-center select-none">
              <div className="font-mono text-[10px] text-gray-500 mb-1">GS1 SPECIFICATION (100% MAGNIFICATION)</div>
              {/* Barcode visual bars */}
              <div className="flex items-end h-24 gap-[2px] px-2 bg-white">
                {[
                  3, 1, 2, 1, 4, 2, 1, 3, 2, 1, 1, 4, 1, 2, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 3, 1,
                  2, 4, 1, 2, 1, 4, 2, 1, 3, 1, 2, 1, 4, 1, 2, 3, 1, 2, 1, 4, 2, 1, 3, 1,
                ].map((w, i) => (
                  <div
                    key={i}
                    style={{ width: `${w * 1.5}px` }}
                    className={`h-full ${i % 2 === 0 ? 'bg-black' : 'bg-transparent'}`}
                  ></div>
                ))}
              </div>
              <div className="font-mono text-xs font-bold tracking-[0.25em] mt-1 text-black">
                8 9 0 1 0 3 0 4 9 1 0 2 3
              </div>

              {/* Digital Optical Caliper Overlay */}
              <div className="absolute -top-7 left-0 right-0 flex flex-col items-center">
                <div className="flex items-center justify-between w-full text-[10px] font-mono font-bold text-[#86f2e4] bg-[#131b2e] px-2 py-0.5 rounded">
                  <span>|◀</span>
                  <span>{targetWidthMm.toFixed(2)} mm (Nominal Standard Width)</span>
                  <span>▶|</span>
                </div>
                <div className="w-full h-0.5 bg-[#86f2e4]"></div>
              </div>

              {/* Pixel span overlay */}
              <div className="absolute -bottom-7 left-0 right-0 flex flex-col items-center">
                <div className="w-full h-0.5 bg-[#bec6e0]"></div>
                <div className="flex items-center justify-between w-full text-[10px] font-mono text-[#bec6e0] bg-[#131b2e] px-2 py-0.5 rounded">
                  <span>|</span>
                  <span>Span: {pixelMeasurement} Optical Sensor Pixels</span>
                  <span>|</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 text-xs text-[#45464d]">
            <span>Calibrated with ISO/IEC 15415 Optical Target</span>
            <span className="text-[#006a61] font-semibold">Variance: ±0.02 mm</span>
          </div>
        </div>

        {/* Calibration Parameters Panel */}
        <div className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-[#dce9ff] p-6 space-y-5">
          <h3 className="font-headline-sm text-base font-bold text-[#0b1c30]">
            Geometric Scale Controls
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-[#0b1c30] block mb-1">
                EAN-13 Reference Dimension Standard (mm)
              </label>
              <input
                type="number"
                step="0.01"
                value={targetWidthMm}
                onChange={e => setTargetWidthMm(parseFloat(e.target.value) || 37.29)}
                className="w-full p-2.5 rounded-lg border border-[#c6c6cd] font-mono text-sm bg-[#f8f9ff]"
              />
              <span className="text-[11px] text-[#76777d] mt-1 block">
                Default 37.29 mm represents 100% nominal width per GS1 General Specifications.
              </span>
            </div>

            <div>
              <label className="font-semibold text-[#0b1c30] block mb-1">
                Measured Pixel Span ({pixelMeasurement} px)
              </label>
              <input
                type="range"
                min="200"
                max="800"
                value={pixelMeasurement}
                onChange={e => setPixelMeasurement(parseInt(e.target.value, 10))}
                className="w-full accent-[#006a61]"
              />
              <div className="flex justify-between text-[11px] text-[#76777d] mt-1">
                <span>200 px (Low Zoom)</span>
                <span>800 px (Macro Close-up)</span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#0b1c30] block mb-1">
                Optical Lens Profile
              </label>
              <select
                value={lensFocalLength}
                onChange={e => setLensFocalLength(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#c6c6cd] text-xs bg-[#f8f9ff]"
              >
                <option value="24mm Field Tablet Prime">24mm Field Tablet Prime (Wide Angle)</option>
                <option value="50mm Macro Inspection Rig">50mm Macro Inspection Rig (Zero Distortion)</option>
                <option value="Direct Flatbed Scanner (600 DPI)">Direct Flatbed Scanner (600 DPI)</option>
              </select>
            </div>

            <div className="p-4 rounded-xl bg-[#eff4ff] border border-[#dce9ff] space-y-2">
              <div className="text-xs font-semibold text-[#0b1c30]">Active Resolution Calibration</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#76777d]">Pixel Density:</span>
                  <div className="font-mono font-bold text-sm text-[#006a61]">{calculatedPxPerMm} px/mm</div>
                </div>
                <div>
                  <span className="text-[#76777d]">Spatial Accuracy:</span>
                  <div className="font-mono font-bold text-sm text-[#0b1c30]">{calculatedResolutionUm} µm/px</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setIsCalibrated(true);
              }}
              className="w-full py-2.5 rounded-lg bg-[#006a61] text-white font-semibold hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">lock</span>
              <span>Lock Scale Matrix for Inspection Run</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
