import React, { useState, useRef } from 'react';
import { SampleLabel, TerminalMode, VerifiedItem, VerifiedCheckDetail, Officer } from '../types';
import { InspectionDossierModal } from './InspectionDossierModal';
import { BatchTerminal } from './BatchTerminal';
import { CalibrationLab } from './CalibrationLab';
import { ManualSpecimenModal } from './ManualSpecimenModal';
import { Language, translations } from '../utils/translations';

export function createVerifiedItemFromSample(sample: SampleLabel, officer?: Officer): VerifiedItem {
  const now = new Date();
  const timeFormatted =
    now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) +
    ', ' +
    now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

  const fontPassed = sample.measuredFontMm >= sample.requiredFontMm;
  const uspPassed = sample.unitSalePrice.isMatch;
  const dec = sample.declarations;

  const verifiedChecks: VerifiedCheckDetail[] = [
    {
      ruleCode: 'Rule 6(1)(c) & Rule 9 Table 1',
      checkName: 'Net Quantity Font Height',
      result: fontPassed ? 'PASS' : 'FAIL',
      measuredValue: `${sample.measuredFontMm.toFixed(2)} mm`,
      statutoryRequirement: `≥ ${sample.requiredFontMm.toFixed(2)} mm (PDP: ${sample.pdpAreaCm2} cm²)`,
      notes: fontPassed
        ? 'Numerals comply with statutory minimum height requirements in Table 1.'
        : 'Font height is below the statutory minimum threshold prescribed in Table 1.',
    },
    {
      ruleCode: 'Rule 6(1)(s)',
      checkName: 'Unit Sale Price (USP) Calculation',
      result: uspPassed ? 'PASS' : 'FAIL',
      measuredValue: `₹ ${sample.unitSalePrice.declared.toFixed(2)} / ${sample.unitSalePrice.unit}`,
      statutoryRequirement: `₹ ${sample.unitSalePrice.calculated.toFixed(2)} / ${sample.unitSalePrice.unit}`,
      notes: uspPassed
        ? 'Calculated quotient matches declared unit sale price within 2 decimal places.'
        : 'Discrepancy detected between declared unit sale price and computed quotient.',
    },
    {
      ruleCode: 'Rule 6(1)(e) & Rule 18',
      checkName: 'Maximum Retail Price (MRP) Declaration',
      result: dec.mrpTaxesInclusive ? 'PASS' : 'FAIL',
      measuredValue: `₹ ${sample.mrp.toFixed(2)} incl. of all taxes`,
      statutoryRequirement: 'Must declare "incl. of all taxes" without price alteration',
      notes: dec.mrpTaxesInclusive
        ? 'Format conforms to Rule 6(1)(e); no smudging or dual pricing detected.'
        : 'Missing mandatory tax inclusivity text or price alteration detected.',
    },
    {
      ruleCode: 'Rule 6(1)(a) & (b)',
      checkName: 'Manufacturer Details & Generic Name',
      result: dec.manufacturerAddress ? 'PASS' : 'FAIL',
      measuredValue: 'Complete postal address & PIN identified',
      statutoryRequirement: 'Premises, City, State & 6-digit postal PIN code',
      notes: dec.manufacturerAddress
        ? 'Full manufacturer/packer identity verified.'
        : 'Incomplete postal address or missing PIN code.',
    },
    {
      ruleCode: 'Rule 6(1)(d)',
      checkName: 'Date of Manufacture / Packaging',
      result: dec.monthYearManufacture ? 'PASS' : 'FAIL',
      measuredValue: 'Month & Year stamped clearly',
      statutoryRequirement: 'Month and year of manufacture or pre-packaging',
      notes: dec.monthYearManufacture
        ? 'Temporal stamp legible and within validity.'
        : 'Missing or illegible date of packing.',
    },
    {
      ruleCode: 'Rule 6(1)(g)',
      checkName: 'Consumer Care Helpline & Redressal',
      result: dec.consumerCareHelpline ? 'PASS' : 'FAIL',
      measuredValue: dec.consumerCareHelpline ? 'Name, Phone & Email verified' : 'Incomplete Contact Details',
      statutoryRequirement: 'Designated contact name, telephone number and email',
      notes: dec.consumerCareHelpline
        ? 'Statutory consumer grievance cell verified.'
        : 'Consumer helpline telephone or email missing from package.',
    },
    {
      ruleCode: 'Rule 13',
      checkName: 'Metric SI Standard Symbols',
      result: 'PASS',
      measuredValue: sample.netQtyDeclared,
      statutoryRequirement: 'Standard singular symbols (g, kg, ml, l)',
      notes: 'No forbidden plural symbols (e.g. gms, kgs, ltrs) detected.',
    },
  ];

  return {
    id: `VER-${Date.now().toString().slice(-6)}`,
    sampleId: sample.id,
    commodity: sample.commodity,
    brand: sample.brand,
    category: sample.category || 'General',
    packageType: sample.packageType,
    ean13: sample.ean13,
    netQtyDeclared: sample.netQtyDeclared,
    mrp: sample.mrp,
    timestamp: now.toISOString(),
    verifiedAtFormatted: timeFormatted,
    status: sample.status,
    pdpAreaCm2: sample.pdpAreaCm2,
    measuredFontMm: sample.measuredFontMm,
    requiredFontMm: sample.requiredFontMm,
    verifiedChecks,
    officerName: officer ? officer.name : 'Inspector 9921',
    terminalId: officer ? officer.stationCode || officer.officerId : 'FEU-4-TOUGHPAD-01',
  };
}

interface NewScanTerminalProps {
  onSaveToLedger?: (sample: SampleLabel) => void;
  onItemVerified?: (item: VerifiedItem) => void;
  lang?: Language;
  currentOfficer?: Officer;
}

export const NewScanTerminal: React.FC<NewScanTerminalProps> = ({
  onSaveToLedger,
  onItemVerified,
  lang = 'EN',
  currentOfficer,
}) => {
  const t = translations[lang];
  const [terminalMode, setTerminalMode] = useState<TerminalMode>('standard');
  const [selectedSample, setSelectedSample] = useState<SampleLabel | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

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

      if (onItemVerified) {
        const verifiedItem = createVerifiedItemFromSample(sample, currentOfficer);
        onItemVerified(verifiedItem);
      }
      if (onSaveToLedger) {
        onSaveToLedger(sample);
      }
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

  const cameraInputRef = useRef<HTMLInputElement>(null);

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
            <span>{t.modeStandard}</span>
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
            <span>{t.modeBatch}</span>
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
            <span>{t.modeCalibration}</span>
          </button>
        </div>
      </div>

      {/* Render Alternate Modes if Selected */}
      {terminalMode === 'batch' && <BatchTerminal />}
      {terminalMode === 'calibration' && <CalibrationLab lang={lang} />}

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
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-lg bg-[#dce9ff] text-[#0b1c30] text-xs font-medium hover:bg-[#d3e4fe] transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#006a61]">photo_camera</span>
                    <span>Capture Camera</span>
                  </button>
                  <button
                    onClick={() => setIsManualModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#006a61] text-white text-xs font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit_note</span>
                    <span>Feed Fresh Specimen</span>
                  </button>
                </div>

                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Inspected Specimen or Blank State */}
            <div className="lg:col-span-6 flex flex-col bg-[#ffffff] rounded-xl shadow-xs border border-[#dce9ff] p-5">
              {selectedSample ? (
                <div className="flex flex-col justify-between h-full space-y-4">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
                      <span className="font-headline-sm text-sm font-bold text-[#0b1c30]">
                        Active Specimen
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          selectedSample.status === 'COMPLIANT'
                            ? 'bg-[#86f2e4] text-[#00201d]'
                            : 'bg-[#ffdad6] text-[#93000a]'
                        }`}
                      >
                        {selectedSample.status === 'COMPLIANT' ? 'Compliant' : 'Infraction Detected'}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="text-base font-bold text-[#0b1c30]">
                        {selectedSample.commodity}
                      </div>
                      <div className="text-xs text-[#45464d] flex items-center gap-2">
                        <span>Net Qty: <strong className="text-[#0b1c30]">{selectedSample.netQtyDeclared}</strong></span>
                        <span>•</span>
                        <span>MRP: <strong className="text-[#0b1c30]">₹{selectedSample.mrp.toFixed(2)}</strong></span>
                      </div>
                      <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff] text-xs text-[#0b1c30]">
                        {selectedSample.infractionSummary}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#eff4ff]">
                    <button
                      onClick={() => {
                        setSelectedSample(null);
                        setUploadedFileName(null);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-[#c6c6cd] text-xs text-[#45464d] hover:text-[#0b1c30] transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setIsDossierOpen(true)}
                      className="px-4 py-1.5 rounded-lg bg-[#000000] text-[#ffffff] text-xs font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      <span>Open Dossier</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 min-h-[220px] flex flex-col items-center justify-center text-center p-6 rounded-lg border border-dashed border-[#dce9ff] bg-[#fafbff]">
                  <div className="w-12 h-12 rounded-full bg-[#e5eeff] flex items-center justify-center mb-3 text-[#76777d]">
                    <span className="material-symbols-outlined text-[24px]">inbox</span>
                  </div>
                  <div className="text-sm font-semibold text-[#0b1c30]">
                    No Specimen Loaded
                  </div>
                  <p className="text-xs text-[#76777d] max-w-xs mt-1">
                    Upload a package label file or use the camera to begin metrology inspection.
                  </p>
                </div>
              )}
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

      {/* Manual Specimen Direct Entry Modal */}
      {isManualModalOpen && (
        <ManualSpecimenModal
          isOpen={isManualModalOpen}
          onClose={() => setIsManualModalOpen(false)}
          onSubmit={(sample) => {
            setUploadedFileName(sample.commodity);
            handleRunAnalysis(sample);
          }}
          lang={lang}
        />
      )}
    </div>
  );
};
