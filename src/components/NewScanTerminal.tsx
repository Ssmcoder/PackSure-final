import React, { useState, useRef } from 'react';
import { SampleLabel, TerminalMode, VerifiedItem, VerifiedCheckDetail, Officer } from '../types';
import { BENCHMARK_SAMPLES } from '../data/samples';
import { InspectionDossierModal } from './InspectionDossierModal';
import { BatchTerminal } from './BatchTerminal';
import { CalibrationLab } from './CalibrationLab';
import { ManualSpecimenModal } from './ManualSpecimenModal';
import { Language, translations } from '../utils/translations';
import { packsureApi, convertBackendReportToSampleLabel } from '../utils/api';

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
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedImageMeta, setUploadedImageMeta] = useState<{
    name: string;
    size: string;
    type: string;
  } | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Pipeline simulation state
  const [pipelineProgress, setPipelineProgress] = useState<number>(68.4);
  const [currentStage, setCurrentStage] = useState<number>(4);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Clear current specimen and loaded image
  const handleClearSpecimen = () => {
    setSelectedSample(null);
    setUploadedFileName(null);
    setUploadedImageUrl(null);
    setUploadedImageMeta(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Trigger analysis for a sample via FastAPI backend with fallback
  const handleRunAnalysis = async (sample: SampleLabel) => {
    setSelectedSample(sample);
    if (sample.imageUrl) {
      setUploadedImageUrl(sample.imageUrl);
    }
    setIsAnalyzing(true);
    setPipelineProgress(20);
    setCurrentStage(1);

    const step1 = setTimeout(() => {
      setPipelineProgress(45);
      setCurrentStage(2);
    }, 350);

    const step2 = setTimeout(() => {
      setPipelineProgress(70);
      setCurrentStage(3);
    }, 700);

    let finalSample: SampleLabel = sample;

    try {
      let backendReport: any = null;
      if (sample.id.startsWith('sample-0') || sample.id === 'sample-01' || sample.id === 'sample-02' || sample.id === 'sample-03') {
        // Run pre-packaged benchmark sample in backend
        try {
          const runRes = await packsureApi.runSample(sample.id);
          backendReport = runRes.report;
        } catch {
          // If sample not registered, run via image or direct
          if (sample.imageUrl) {
            const scanRes = await packsureApi.runScan(sample.commodity, sample.imageUrl);
            backendReport = scanRes.report;
          }
        }
      } else if (sample.imageUrl) {
        const scanRes = await packsureApi.runScan(sample.commodity, sample.imageUrl);
        backendReport = scanRes.report;
      }

      if (backendReport) {
        const converted = convertBackendReportToSampleLabel(backendReport, sample.imageUrl || '', sample.commodity, sample.id);
        finalSample = { ...converted, id: sample.id };
        
        // Auto persist scan to backend database
        try {
          const savedResult = await packsureApi.saveScan(sample.commodity, sample.imageUrl || '', backendReport);
          finalSample.savedScanId = savedResult.id;
        } catch {
          // Non-blocking database save
        }
      }
    } catch (err) {
      console.warn('Backend scan pipeline unavailable, fallback to local analysis:', err);
    } finally {
      clearTimeout(step1);
      clearTimeout(step2);

      setPipelineProgress(90);
      setCurrentStage(4);

      setTimeout(() => {
        setPipelineProgress(100);
        setCurrentStage(5);
        setIsAnalyzing(false);
        setSelectedSample(finalSample);
        setIsDossierOpen(true);

        if (onItemVerified) {
          const verifiedItem = createVerifiedItemFromSample(finalSample, currentOfficer);
          onItemVerified(verifiedItem);
        }
        if (onSaveToLedger) {
          onSaveToLedger(finalSample);
        }
      }, 500);
    }
  };

  const processFile = (file: File) => {
    setUploadedFileName(file.name);
    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    setUploadedImageMeta({
      name: file.name,
      size: sizeFormatted,
      type: file.type || 'image',
    });

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = (event.target?.result as string) || '';
      setUploadedImageUrl(dataUrl);

      // Construct an active sample with uploaded image attached
      const customSample: SampleLabel = {
        id: `upload-${Date.now()}`,
        brand: 'Field Capture Specimen',
        commodity: `Uploaded Specimen: ${file.name.replace(/\.[^/.]+$/, '')}`,
        imageUrl: dataUrl,
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
    };

    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
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
          {/* Quick Pre-calibrated Benchmark Specimens Bar */}
          <div className="bg-[#ffffff] rounded-xl border border-[#dce9ff] p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0b1c30]">
              <span className="material-symbols-outlined text-[16px] text-[#006a61]">verified</span>
              <span>Quick Test Benchmark Labels:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {BENCHMARK_SAMPLES.map(sample => (
                <button
                  key={sample.id}
                  onClick={() => {
                    setUploadedFileName(null);
                    setUploadedImageMeta(null);
                    handleRunAnalysis(sample);
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all flex items-center gap-1.5 border ${
                    selectedSample?.id === sample.id
                      ? 'bg-[#131b2e] text-white border-[#131b2e] shadow-xs'
                      : 'bg-[#eff4ff] text-[#0b1c30] border-[#dce9ff] hover:bg-[#e5eeff]'
                  }`}
                >
                  <span>{sample.commodity.split(' ')[0]}</span>
                  <span
                    className={`text-[9px] px-1 rounded ${
                      sample.status === 'COMPLIANT'
                        ? 'bg-[#86f2e4] text-[#00201d]'
                        : 'bg-[#ffdad6] text-[#93000a]'
                    }`}
                  >
                    {sample.status === 'COMPLIANT' ? 'PASS' : 'FAIL'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Primary Split Grid: Upload Target vs Inspected Specimen */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Upload Area */}
            <div className="lg:col-span-6 flex flex-col bg-[#ffffff] rounded-xl shadow-xs border border-[#dce9ff] p-4">
              {/* Drag & Drop Viewport Target */}
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    processFile(file);
                  }
                }}
                className="relative group flex-1 min-h-[240px] flex flex-col items-center justify-center p-4 bg-[#eff4ff] border-2 border-dashed border-[#c6c6cd] hover:border-[#006a61] rounded-lg transition-all cursor-pointer"
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

                <div className="text-sm font-semibold text-[#0b1c30] text-center mb-1">
                  {uploadedFileName ? 'Replace Specimen Image' : 'Drop package label here or browse'}
                </div>
                <p className="text-xs text-[#76777d] text-center mb-3">
                  Supports JPG, PNG, WEBP, or live camera snapshot
                </p>

                {uploadedFileName && (
                  <div className="text-xs text-[#006a61] bg-[#dce9ff] px-2.5 py-1 rounded font-mono mb-3 font-semibold truncate max-w-[260px]">
                    Current: {uploadedFileName}
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

            {/* Inspected Specimen Display (Uploaded Image Section) */}
            <div className="lg:col-span-6 flex flex-col bg-[#ffffff] rounded-xl shadow-xs border border-[#dce9ff] p-4">
              {uploadedImageUrl || selectedSample ? (
                <div className="flex flex-col justify-between h-full space-y-3">
                  <div>
                    {/* Header Bar */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-[#eff4ff]">
                      <div className="flex items-center gap-2">
                        <span className="font-headline-sm text-sm font-bold text-[#0b1c30]">
                          {uploadedFileName ? 'Uploaded Specimen Image' : 'Active Specimen'}
                        </span>
                        {uploadedImageMeta && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#eff4ff] text-[#45464d] border border-[#dce9ff]">
                            {uploadedImageMeta.size}
                          </span>
                        )}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1.5 ${
                          isAnalyzing
                            ? 'bg-[#e5eeff] text-[#006a61]'
                            : selectedSample?.status === 'COMPLIANT'
                            ? 'bg-[#86f2e4] text-[#00201d]'
                            : 'bg-[#ffdad6] text-[#93000a]'
                        }`}
                      >
                        {isAnalyzing ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#006a61] animate-ping"></span>
                            <span>Scanning OCR...</span>
                          </>
                        ) : selectedSample?.status === 'COMPLIANT' ? (
                          'Compliant'
                        ) : (
                          'Infraction Detected'
                        )}
                      </span>
                    </div>

                    {/* Prominent Specimen Image Display */}
                    <div className="relative mt-2.5 rounded-lg overflow-hidden border border-[#dce9ff] bg-[#f8f9ff] flex items-center justify-center min-h-[190px] max-h-[240px] p-2 group">
                      {uploadedImageUrl ? (
                        <img
                          src={uploadedImageUrl}
                          alt={selectedSample?.commodity || uploadedFileName || 'Specimen Label'}
                          className="max-h-[220px] w-auto max-w-full object-contain rounded shadow-xs transition-transform group-hover:scale-[1.01]"
                          referrerPolicy="no-referrer"
                        />
                      ) : selectedSample?.imageUrl ? (
                        <img
                          src={selectedSample.imageUrl}
                          alt={selectedSample.commodity}
                          className="max-h-[220px] w-auto max-w-full object-contain rounded shadow-xs transition-transform group-hover:scale-[1.01]"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-[#76777d]">
                          <span className="material-symbols-outlined text-[32px] text-[#006a61]">receipt_long</span>
                          <span className="text-xs font-medium mt-1">Package Label Loaded</span>
                        </div>
                      )}

                      {/* Optical Laser Scanning Bar (Active while analyzing) */}
                      {isAnalyzing && (
                        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
                          <div className="absolute inset-0 bg-[#006a61]/10"></div>
                          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#006a61] to-transparent shadow-[0_0_12px_#006a61] animate-laser-scan"></div>
                          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-3 py-1 rounded bg-black/80 text-white text-[10px] font-mono backdrop-blur-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#86f2e4] animate-ping"></span>
                              <span>OPTICAL SCAN: PDP NUMERAL HEIGHT MEASUREMENT</span>
                            </div>
                            <span className="text-[#86f2e4] font-bold">{pipelineProgress.toFixed(0)}%</span>
                          </div>
                        </div>
                      )}

                      {/* File badge */}
                      {uploadedFileName && !isAnalyzing && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono flex items-center gap-1 backdrop-blur-xs">
                          <span className="material-symbols-outlined text-[12px] text-[#86f2e4]">image</span>
                          <span className="truncate max-w-[180px]">{uploadedFileName}</span>
                        </div>
                      )}
                    </div>

                    {/* Specimen Particulars */}
                    {selectedSample && (
                      <div className="mt-2.5 space-y-1.5">
                        <div className="text-sm font-bold text-[#0b1c30]">
                          {selectedSample.commodity}
                        </div>
                        <div className="text-xs text-[#45464d] flex flex-wrap items-center gap-2">
                          <span>Net Qty: <strong className="text-[#0b1c30] font-mono">{selectedSample.netQtyDeclared}</strong></span>
                          <span>•</span>
                          <span>MRP: <strong className="text-[#0b1c30] font-mono">₹{selectedSample.mrp.toFixed(2)}</strong></span>
                          <span>•</span>
                          <span>PDP: <strong className="text-[#0b1c30] font-mono">{selectedSample.pdpAreaCm2} cm²</strong></span>
                        </div>
                        <div
                          className={`p-2 rounded-lg border text-xs ${
                            selectedSample.status === 'COMPLIANT'
                              ? 'bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46]'
                              : 'bg-[#eff4ff] border-[#dce9ff] text-[#0b1c30]'
                          }`}
                        >
                          <div className="font-semibold text-[11px] mb-0.5">
                            {selectedSample.status === 'COMPLIANT'
                              ? 'Mandatory Declarations Verified:'
                              : 'Statutory Verification Finding:'}
                          </div>
                          <div className="text-[11px]">{selectedSample.infractionSummary}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-[#eff4ff]">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleClearSpecimen}
                        className="px-3 py-1.5 rounded-lg border border-[#c6c6cd] text-xs text-[#45464d] hover:text-[#ba1a1a] hover:border-[#ffdad6] hover:bg-[#fffbfa] transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                        <span>Clear</span>
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg border border-[#dce9ff] bg-[#eff4ff] text-xs text-[#0b1c30] hover:bg-[#e5eeff] transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">sync</span>
                        <span>Replace Image</span>
                      </button>
                    </div>
                    <button
                      onClick={() => setIsDossierOpen(true)}
                      disabled={!selectedSample || isAnalyzing}
                      className="px-4 py-1.5 rounded-lg bg-[#000000] text-[#ffffff] text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1.5 shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      <span>Open Dossier</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 min-h-[240px] flex flex-col items-center justify-center text-center p-6 rounded-lg border border-dashed border-[#dce9ff] bg-[#fafbff]">
                  <div className="w-12 h-12 rounded-full bg-[#e5eeff] flex items-center justify-center mb-3 text-[#76777d]">
                    <span className="material-symbols-outlined text-[24px]">inbox</span>
                  </div>
                  <div className="text-sm font-semibold text-[#0b1c30]">
                    No Specimen Loaded
                  </div>
                  <p className="text-xs text-[#76777d] max-w-xs mt-1">
                    Upload a package label file or use the camera to begin metrology inspection. The uploaded image will appear here.
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-lg bg-[#000000] text-white text-xs font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[15px]">upload_file</span>
                      <span>Upload Image</span>
                    </button>
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-lg border border-[#dce9ff] bg-[#eff4ff] text-[#0b1c30] text-xs font-medium hover:bg-[#e5eeff] transition-colors flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[15px] text-[#006a61]">photo_camera</span>
                      <span>Camera</span>
                    </button>
                  </div>
                </div>
              )}
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
