import React, { useState, useRef } from 'react';
import { SampleLabel, TerminalMode } from '../types';
import { BENCHMARK_SAMPLES } from '../data/samples';
import { InspectionDossierModal } from './InspectionDossierModal';
import { BatchTerminal } from './BatchTerminal';
import { CalibrationLab } from './CalibrationLab';

interface NewScanTerminalProps {
  onSaveToLedger?: (sample: SampleLabel) => void;
}

export const NewScanTerminal: React.FC<NewScanTerminalProps> = ({ onSaveToLedger }) => {
  const [terminalMode, setTerminalMode] = useState<TerminalMode>('standard');
  const [selectedSample, setSelectedSample] = useState<SampleLabel | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Pipeline simulation state
  const [pipelineProgress, setPipelineProgress] = useState<number>(68.4);
  const [currentStage, setCurrentStage] = useState<number>(4);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Quality gate test states
  const [blurState, setBlurState] = useState<'REJECTED' | 'PASSED'>('REJECTED');
  const [luminanceState, setLuminanceState] = useState<'WARNING' | 'NORMAL'>('WARNING');
  const [tabletFlashOn, setTabletFlashOn] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger analysis for a sample
  const handleRunAnalysis = (sample: SampleLabel) => {
    setSelectedSample(sample);
    setIsAnalyzing(true);
    setPipelineProgress(20);
    setCurrentStage(1);

    const step1 = setTimeout(() => {
      setPipelineProgress(40);
      setCurrentStage(2);
    }, 400);

    const step2 = setTimeout(() => {
      setPipelineProgress(65);
      setCurrentStage(3);
    }, 800);

    const step3 = setTimeout(() => {
      setPipelineProgress(85);
      setCurrentStage(4);
    }, 1200);

    const step4 = setTimeout(() => {
      setPipelineProgress(100);
      setCurrentStage(5);
      setIsAnalyzing(false);
      setIsDossierOpen(true);
    }, 1700);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      clearTimeout(step4);
    };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      // Construct an active sample from uploaded image
      const customSample: SampleLabel = {
        id: `upload-${Date.now()}`,
        brand: 'Field Capture Specimen',
        commodity: `Uploaded Dossier: ${file.name.replace(/\.[^/.]+$/, '')}`,
        netQtyDeclared: '750 mL',
        ean13: '8901099281740',
        packageType: 'Composite Sealed Container',
        category: 'Beverages',
        status: 'INFRACTION',
        infractionSummary: 'Rule 6(1)(c): Under-sized Net Quantity font (2.8mm measured vs 4.0mm required).',
        ruleCode: 'Rule 6(1)(c) & Rule 9',
        pdpAreaCm2: 140,
        measuredFontMm: 2.8,
        requiredFontMm: 4.0,
        mrp: 120.0,
        unitSalePrice: {
          declared: 0.16,
          calculated: 0.16,
          unit: '₹ / mL',
          isMatch: true,
        },
        declarations: {
          manufacturerAddress: true,
          countryOfOrigin: true,
          netQuantity: true,
          monthYearManufacture: true,
          mrpTaxesInclusive: true,
          unitSalePrice: true,
          consumerCareHelpline: false,
        },
        violations: [
          {
            ruleCode: 'Rule 6(1)(c) / Rule 9 Table 1',
            ruleTitle: 'Minimum Height of Numerals for Net Quantity',
            measured: '2.80 mm measured font',
            required: '4.00 mm prescribed minimum',
            severity: 'CRITICAL',
            description: 'Declared net quantity font height fails statutory minimum requirement for PDP area > 100 cm².',
          },
        ],
      };
      handleRunAnalysis(customSample);
    }
  };

  const toggleFlash = () => {
    setTabletFlashOn(prev => !prev);
    setLuminanceState(prev => (prev === 'WARNING' ? 'NORMAL' : 'WARNING'));
  };

  const retakeSteady = () => {
    setBlurState(prev => (prev === 'REJECTED' ? 'PASSED' : 'REJECTED'));
  };

  return (
    <div className="flex flex-col w-full pb-8 space-y-4">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Mode Selector Tabs */}
      <div className="flex justify-end pt-1">
        <div className="inline-flex p-1 bg-[#dce9ff] rounded-lg shadow-xs">
          <button
            onClick={() => setTerminalMode('standard')}
            className={`px-3 py-1.5 rounded font-label-md text-[12px] transition-colors flex items-center gap-1.5 ${
              terminalMode === 'standard'
                ? 'bg-[#131b2e] text-[#ffffff] shadow-xs font-semibold'
                : 'text-[#45464d] hover:text-[#0b1c30]'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[16px] ${
                terminalMode === 'standard' ? 'text-[#86f2e4]' : 'text-[#76777d]'
              }`}
            >
              document_scanner
            </span>
            <span>Standard</span>
          </button>
          <button
            onClick={() => setTerminalMode('batch')}
            className={`px-3 py-1.5 rounded font-label-md text-[12px] transition-colors flex items-center gap-1.5 ${
              terminalMode === 'batch'
                ? 'bg-[#131b2e] text-[#ffffff] shadow-xs font-semibold'
                : 'text-[#45464d] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">view_agenda</span>
            <span>Batch</span>
          </button>
          <button
            onClick={() => setTerminalMode('calibration')}
            className={`px-3 py-1.5 rounded font-label-md text-[12px] transition-colors flex items-center gap-1.5 ${
              terminalMode === 'calibration'
                ? 'bg-[#131b2e] text-[#ffffff] shadow-xs font-semibold'
                : 'text-[#45464d] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">straighten</span>
            <span>Calibration</span>
          </button>
        </div>
      </div>

      {/* Render Alternate Modes if Selected */}
      {terminalMode === 'batch' && <BatchTerminal />}
      {terminalMode === 'calibration' && <CalibrationLab />}

      {/* Standard Terminal Content */}
      {terminalMode === 'standard' && (
        <>
          {/* Primary Split Grid: Upload Target vs Samples */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Upload Area */}
            <div className="lg:col-span-6 flex flex-col bg-[#ffffff] rounded-xl shadow-xs border border-[#dce9ff] p-4">
              {/* Drag & Drop Viewport Target */}
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file && fileInputRef.current) {
                    fileInputRef.current.files = e.dataTransfer.files;
                    handleFileUpload({ target: fileInputRef.current } as any);
                  }
                }}
                className="relative group flex-1 min-h-[220px] flex flex-col items-center justify-center p-4 bg-[#eff4ff] border-2 border-dashed border-[#c6c6cd] hover:border-[#006a61] rounded-lg transition-all cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {/* Crosshairs */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#76777d] pointer-events-none"></div>
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#76777d] pointer-events-none"></div>
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#76777d] pointer-events-none"></div>
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#76777d] pointer-events-none"></div>

                <div className="w-12 h-12 rounded-full bg-[#e5eeff] flex items-center justify-center mb-3 text-[#0b1c30] group-hover:scale-105 transition-transform shadow-xs">
                  <span className="material-symbols-outlined text-[24px] text-[#000000]">cloud_upload</span>
                </div>

                {uploadedFileName && (
                  <div className="text-sm text-[#0b1c30] text-center mb-3 font-semibold">
                    {uploadedFileName}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-center gap-2" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-lg bg-[#000000] text-[#ffffff] text-xs font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">folder_open</span>
                    <span>Browse Files</span>
                  </button>
                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-[#dce9ff] text-[#0b1c30] text-xs font-medium hover:bg-[#d3e4fe] transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#006a61]">photo_camera</span>
                    <span>Capture Camera</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Benchmark Samples */}
            <div className="lg:col-span-6 flex flex-col bg-[#ffffff] rounded-xl shadow-xs border border-[#dce9ff] p-4">
              {/* Sample Cards Mosaic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                {BENCHMARK_SAMPLES.map(sample => {
                  const isInfraction = sample.status === 'INFRACTION';
                  const isCompliant = sample.status === 'COMPLIANT';
                  const isUsp = sample.status === 'USP_DISCREPANCY';

                  return (
                    <div
                      key={sample.id}
                      className="group relative flex flex-col justify-between p-3 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] border border-[#dce9ff] transition-colors"
                    >
                      <div className="flex flex-col gap-1 mb-2">
                        <div className="flex items-center justify-between">
                          {isInfraction && (
                            <span className="px-1.5 py-0.5 rounded bg-[#ffdad6] text-[#93000a] text-[10px] font-semibold">
                              Infraction
                            </span>
                          )}
                          {isCompliant && (
                            <span className="px-1.5 py-0.5 rounded bg-[#86f2e4] text-[#00201d] text-[10px] font-semibold flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[12px]">verified</span> Compliant
                            </span>
                          )}
                          {isUsp && (
                            <span className="px-1.5 py-0.5 rounded bg-[#ffdad6] text-[#93000a] text-[10px] font-semibold">
                              USP Mismatch
                            </span>
                          )}
                          <span className="text-[11px] text-[#45464d] font-mono">
                            {sample.netQtyDeclared}
                          </span>
                        </div>

                        <div className="font-headline-sm text-[13px] font-bold text-[#0b1c30]">
                          {sample.commodity}
                        </div>

                        <div
                          className={`text-[11px] flex items-start gap-1 leading-snug ${
                            isCompliant ? 'text-[#006a61]' : 'text-[#ba1a1a]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[13px] mt-0.5 shrink-0">
                            {isCompliant ? 'check_circle' : isUsp ? 'calculate' : 'report_problem'}
                          </span>
                          <span className="line-clamp-2">{sample.infractionSummary}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end pt-1 border-t border-[#dce9ff]/60">
                        <button
                          onClick={() => handleRunAnalysis(sample)}
                          disabled={isAnalyzing}
                          className="px-2.5 py-1 rounded bg-[#000000] text-[#ffffff] text-[11px] font-medium flex items-center gap-1 hover:opacity-85 transition-opacity disabled:opacity-50"
                        >
                          <span>{isAnalyzing && selectedSample?.id === sample.id ? 'Analyzing...' : 'Inspect'}</span>
                          <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Diagnostics Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Blur */}
            <div className="flex flex-col p-4 rounded-xl bg-white border border-[#dce9ff] shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                    blurState === 'REJECTED'
                      ? 'bg-[#ffdad6] text-[#93000a]'
                      : 'bg-[#86f2e4] text-[#00201d]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px]">
                    {blurState === 'REJECTED' ? 'cancel' : 'check_circle'}
                  </span>
                  <span>{blurState === 'REJECTED' ? 'Blur Detected' : 'Sharpness Optimal'}</span>
                </span>
                <button
                  onClick={retakeSteady}
                  className="px-3 py-1.5 rounded-lg bg-[#000000] text-[#ffffff] text-xs font-medium hover:opacity-90 transition-opacity flex items-center gap-1 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[14px]">refresh</span>
                  <span>{blurState === 'REJECTED' ? 'Retake Steady Photo' : 'Simulate Blur'}</span>
                </button>
              </div>

              <div className="relative overflow-hidden rounded-lg bg-[#eff4ff] h-20 flex items-center justify-center border border-[#dce9ff]">
                <div
                  className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all ${
                    blurState === 'REJECTED' ? 'opacity-40 blur-md' : 'opacity-80 blur-none'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-[#0b1c30]">
                      NET QTY 1000ml
                    </span>
                    <span className="text-[11px] text-[#45464d]">
                      MRP ₹ 165.00 INCL. ALL TAXES
                    </span>
                  </div>
                </div>

                <div className="relative z-10 flex items-center gap-1.5 bg-white/90 px-3 py-1 rounded shadow-xs border border-[#dce9ff]">
                  <span
                    className={`text-xs font-semibold ${
                      blurState === 'REJECTED' ? 'text-[#ba1a1a]' : 'text-[#006a61]'
                    }`}
                  >
                    {blurState === 'REJECTED' ? 'Motion Blur' : 'Sharpness Verified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Lighting */}
            <div className="flex flex-col p-4 rounded-xl bg-white border border-[#dce9ff] shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                    luminanceState === 'WARNING'
                      ? 'bg-[#fed7aa] text-[#9a3412]'
                      : 'bg-[#86f2e4] text-[#00201d]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px]">
                    {luminanceState === 'WARNING' ? 'warning' : 'check_circle'}
                  </span>
                  <span>{luminanceState === 'WARNING' ? 'Low Light / Shadow' : 'Lighting Optimal'}</span>
                </span>
                <button
                  onClick={toggleFlash}
                  className="px-3 py-1.5 rounded-lg bg-[#006a61] text-[#ffffff] text-xs font-medium hover:opacity-90 transition-opacity flex items-center gap-1 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {tabletFlashOn ? 'flash_off' : 'flash_on'}
                  </span>
                  <span>{tabletFlashOn ? 'Turn Off Flash' : 'Enable Flash'}</span>
                </button>
              </div>

              <div className="relative overflow-hidden rounded-lg bg-[#eff4ff] h-20 flex items-center justify-center border border-[#dce9ff]">
                <div
                  className={`absolute inset-0 pointer-events-none transition-all ${
                    tabletFlashOn
                      ? 'bg-gradient-to-tr from-transparent via-white/10 to-transparent'
                      : 'bg-gradient-to-tr from-black/60 via-transparent to-white/40'
                  }`}
                ></div>

                <div className="relative z-10 flex items-center gap-1.5 bg-white/90 px-3 py-1 rounded shadow-xs border border-[#dce9ff]">
                  <span
                    className={`text-xs font-semibold ${
                      luminanceState === 'WARNING' ? 'text-[#9a3412]' : 'text-[#006a61]'
                    }`}
                  >
                    {luminanceState === 'WARNING'
                      ? 'Shadow Detected'
                      : 'Uniform Illumination'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Pipeline */}
          <div className="flex flex-col bg-[#ffffff] rounded-xl shadow-xs border border-[#dce9ff] p-4">
            <div className="flex items-center justify-end pb-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-medium text-[#45464d]">
                  {pipelineProgress.toFixed(0)}%
                </span>
                <div className="w-24 h-2 rounded-full bg-[#e5eeff] overflow-hidden">
                  <div
                    className="h-full bg-[#006a61] transition-all duration-500"
                    style={{ width: `${pipelineProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Five Sequential Pipeline Stages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              {/* Stage 1 */}
              <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#0b1c30]">Image Clarity</span>
                  <span className="material-symbols-outlined text-[15px] text-[#006a61]">check_circle</span>
                </div>
                <div className="text-[10px] font-semibold text-[#006a61]">PASSED</div>
              </div>

              {/* Stage 2 */}
              <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#0b1c30]">Barcode Scale</span>
                  <span className="material-symbols-outlined text-[15px] text-[#006a61]">check_circle</span>
                </div>
                <div className="text-[10px] font-semibold text-[#006a61]">CALIBRATED</div>
              </div>

              {/* Stage 3 */}
              <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#0b1c30]">Display Panel</span>
                  <span className="material-symbols-outlined text-[15px] text-[#006a61]">check_circle</span>
                </div>
                <div className="text-[10px] font-semibold text-[#006a61]">ISOLATED</div>
              </div>

              {/* Stage 4 */}
              <div
                className={`p-3 rounded-lg border flex flex-col justify-between ${
                  currentStage === 4
                    ? 'bg-[#e5eeff] border-[#006a61]'
                    : currentStage > 4
                    ? 'bg-[#eff4ff] border-[#dce9ff]'
                    : 'bg-[#eff4ff] border-[#dce9ff] opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#0b1c30]">OCR</span>
                  {currentStage === 4 ? (
                    <span className="w-2.5 h-2.5 rounded-full border-2 border-[#006a61] border-t-transparent animate-spin"></span>
                  ) : (
                    <span className="material-symbols-outlined text-[15px] text-[#006a61]">check_circle</span>
                  )}
                </div>
                <div className="text-[10px] font-semibold text-[#0b1c30]">
                  {currentStage === 4 ? 'PROCESSING' : 'RESOLVED'}
                </div>
              </div>

              {/* Stage 5 */}
              <div
                className={`p-3 rounded-lg border flex flex-col justify-between ${
                  currentStage === 5
                    ? 'bg-[#e5eeff] border-[#006a61]'
                    : 'bg-[#eff4ff] border-[#dce9ff] opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#0b1c30]">Rule Engine</span>
                  {currentStage === 5 ? (
                    <span className="material-symbols-outlined text-[15px] text-[#006a61]">task_alt</span>
                  ) : (
                    <span className="material-symbols-outlined text-[15px] text-[#76777d]">hourglass_empty</span>
                  )}
                </div>
                <div className="text-[10px] font-semibold text-[#006a61]">
                  {currentStage === 5 ? 'AUDITED' : 'QUEUED'}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Inspection Dossier Modal */}
      {isDossierOpen && selectedSample && (
        <InspectionDossierModal
          sample={selectedSample}
          onClose={() => setIsDossierOpen(false)}
          onSaveToLedger={onSaveToLedger}
        />
      )}
    </div>
  );
};
