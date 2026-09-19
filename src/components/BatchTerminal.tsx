import React, { useState } from 'react';

interface BatchItem {
  id: string;
  consignment: string;
  sku: string;
  cartonCount: number;
  ean: string;
  sampledPacks: number;
  passCount: number;
  failCount: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED_CLEAN' | 'SEIZURE_FLAGGED';
}

const INITIAL_BATCH: BatchItem[] = [
  {
    id: 'BATCH-DEL-2026-901',
    consignment: 'CN-88129 (FMCG North Depot)',
    sku: 'Fortune Refined Soyabean Oil 1L',
    cartonCount: 240,
    ean: '8906007281920',
    sampledPacks: 20,
    passCount: 20,
    failCount: 0,
    status: 'COMPLETED_CLEAN',
  },
  {
    id: 'BATCH-DEL-2026-902',
    consignment: 'CN-88130 (Palwal Wholesale Hub)',
    sku: 'TasteMax Potato Crisps Tangy Tomato 75g',
    cartonCount: 400,
    ean: '8901239918230',
    sampledPacks: 30,
    passCount: 22,
    failCount: 8,
    status: 'SEIZURE_FLAGGED',
  },
  {
    id: 'BATCH-DEL-2026-903',
    consignment: 'CN-88131 (Bhiwandi Cargo Yard)',
    sku: 'PureDew Mineral Spring Water 500mL',
    cartonCount: 500,
    ean: '8901182746190',
    sampledPacks: 15,
    passCount: 15,
    failCount: 0,
    status: 'COMPLETED_CLEAN',
  },
];

export const BatchTerminal: React.FC = () => {
  const [batches, setBatches] = useState<BatchItem[]>(INITIAL_BATCH);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manifestFilter, setManifestFilter] = useState<string>('ALL');

  const runAllBatches = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
    }, 1500);
  };

  const filtered = batches.filter(b => {
    if (manifestFilter === 'CLEAN') return b.status === 'COMPLETED_CLEAN';
    if (manifestFilter === 'FLAGGED') return b.status === 'SEIZURE_FLAGGED';
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Controls Bar */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-[#dce9ff] flex flex-wrap items-center justify-between gap-4">
        <div className="flex bg-[#eff4ff] p-1 rounded-lg border border-[#dce9ff]">
          {(['ALL', 'CLEAN', 'FLAGGED'] as const).map(f => (
            <button
              key={f}
              onClick={() => setManifestFilter(f)}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                manifestFilter === f
                  ? 'bg-[#131b2e] text-white shadow-xs'
                  : 'text-[#45464d] hover:text-[#0b1c30]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <button
          onClick={runAllBatches}
          disabled={isProcessing}
          className="px-4 py-2 bg-[#006a61] text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[16px]">
            {isProcessing ? 'sync' : 'play_arrow'}
          </span>
          <span>{isProcessing ? 'Analyzing Lots...' : 'Execute Queue'}</span>
        </button>
      </div>

      {/* Batch Manifest Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#dce9ff] overflow-hidden">
        <div className="p-4 bg-[#f8f9ff] border-b border-[#dce9ff] flex items-center justify-between">
          <span className="text-xs font-semibold text-[#0b1c30]">Active Cargo Manifests (3 Consignments)</span>
          <span className="text-xs text-[#45464d] font-mono">Statistical Sampling: 3.5% AQL</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#eff4ff] text-[#45464d] border-b border-[#dce9ff]">
                <th className="p-3">Consignment & SKU</th>
                <th className="p-3 font-mono">EAN-13</th>
                <th className="p-3">Carton Volume</th>
                <th className="p-3">Sample Count</th>
                <th className="p-3">Pass / Deficit</th>
                <th className="p-3 text-right">Batch Disposition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff4ff]">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-[#f8f9ff]">
                  <td className="p-3">
                    <div className="font-bold text-[#0b1c30]">{item.sku}</div>
                    <div className="text-[11px] text-[#45464d]">{item.consignment}</div>
                  </td>
                  <td className="p-3 font-mono text-[#45464d]">{item.ean}</td>
                  <td className="p-3 font-mono">{item.cartonCount} cartons</td>
                  <td className="p-3 font-mono">{item.sampledPacks} packs</td>
                  <td className="p-3 font-mono">
                    <span className="text-[#006a61] font-bold">{item.passCount} Pass</span>
                    {item.failCount > 0 && (
                      <span className="text-[#ba1a1a] font-bold ml-2">({item.failCount} Non-Compliant)</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {item.status === 'COMPLETED_CLEAN' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#86f2e4] text-[#00201d] font-semibold">
                        <span className="material-symbols-outlined text-[14px]">check</span>
                        <span>Clearance Issued</span>
                      </span>
                    )}
                    {item.status === 'SEIZURE_FLAGGED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#ffdad6] text-[#93000a] font-semibold">
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                        <span>Lot Seizure #LM-04</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
