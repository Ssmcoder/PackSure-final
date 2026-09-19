import React, { useState, useRef } from 'react';

export interface BatchItem {
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

export const BatchTerminal: React.FC = () => {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manifestFilter, setManifestFilter] = useState<'ALL' | 'CLEAN' | 'FLAGGED'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New consignment form state
  const [consignmentNumber, setConsignmentNumber] = useState('');
  const [skuName, setSkuName] = useState('');
  const [ean13Code, setEan13Code] = useState('');
  const [cartons, setCartons] = useState<number>(100);
  const [sampleSize, setSampleSize] = useState<number>(15);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const runAllBatches = () => {
    if (batches.length === 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      // Process pending batches
      setBatches(prev =>
        prev.map(b => {
          if (b.status === 'PENDING' || b.status === 'IN_PROGRESS') {
            const pass = Math.floor(b.sampledPacks * 0.9);
            const fail = b.sampledPacks - pass;
            return {
              ...b,
              passCount: pass,
              failCount: fail,
              status: fail > 0 ? 'SEIZURE_FLAGGED' : 'COMPLETED_CLEAN',
            };
          }
          return b;
        })
      );
      setIsProcessing(false);
    }, 1200);
  };

  const handleAddConsignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consignmentNumber || !skuName) return;

    const newItem: BatchItem = {
      id: `BATCH-${Date.now().toString().slice(-6)}`,
      consignment: consignmentNumber,
      sku: skuName,
      ean: ean13Code || '8901000000000',
      cartonCount: Number(cartons) || 50,
      sampledPacks: Number(sampleSize) || 15,
      passCount: 0,
      failCount: 0,
      status: 'PENDING',
    };

    setBatches(prev => [newItem, ...prev]);
    setConsignmentNumber('');
    setSkuName('');
    setEan13Code('');
    setIsAddModalOpen(false);
  };

  const handleImportManifest = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate reading manifest file and registering lot
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      const importedBatch: BatchItem = {
        id: `BATCH-${Date.now().toString().slice(-6)}`,
        consignment: `Manifest: ${cleanName}`,
        sku: 'Imported Cargo Lot (LMPC Audit)',
        cartonCount: 350,
        ean: '8901289190124',
        sampledPacks: 20,
        passCount: 0,
        failCount: 0,
        status: 'PENDING',
      };
      setBatches(prev => [importedBatch, ...prev]);
    }
  };

  const filtered = batches.filter(b => {
    if (manifestFilter === 'CLEAN') return b.status === 'COMPLETED_CLEAN';
    if (manifestFilter === 'FLAGGED') return b.status === 'SEIZURE_FLAGGED';
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Hidden file input for manifest upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportManifest}
        accept=".csv,.json,.xlsx,.pdf"
        className="hidden"
      />

      {/* Controls Bar */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-[#dce9ff] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
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
                {f} ({batches.filter(b => f === 'ALL' || (f === 'CLEAN' ? b.status === 'COMPLETED_CLEAN' : b.status === 'SEIZURE_FLAGGED')).length})
              </button>
            ))}
          </div>

          {batches.length > 0 && (
            <button
              onClick={() => setBatches([])}
              className="px-3 py-1.5 rounded-lg border border-[#c6c6cd] text-xs font-semibold text-[#45464d] hover:text-[#ba1a1a] transition-colors"
            >
              Clear Manifests
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 border border-[#c6c6cd] text-[#0b1c30] bg-white rounded-lg text-xs font-semibold hover:bg-[#eff4ff] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            <span>Import Manifest</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-2 bg-[#131b2e] text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Add Consignment</span>
          </button>

          {batches.length > 0 && (
            <button
              onClick={runAllBatches}
              disabled={isProcessing}
              className="px-4 py-2 bg-[#006a61] text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isProcessing ? 'sync' : 'play_arrow'}
              </span>
              <span>{isProcessing ? 'Analyzing Lots...' : 'Execute Queue'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Batch Manifest Table */}
      <div className="bg-white rounded-xl shadow-xs border border-[#dce9ff] overflow-hidden">
        <div className="p-4 bg-[#f8f9ff] border-b border-[#dce9ff] flex items-center justify-between">
          <span className="text-xs font-semibold text-[#0b1c30]">
            Active Cargo Manifests ({filtered.length} Consignments)
          </span>
          <span className="text-xs text-[#45464d] font-mono">Statistical Sampling: 3.5% AQL</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#76777d]">
              <span className="material-symbols-outlined text-[28px]">inventory_2</span>
            </div>
            <div className="text-base font-semibold text-[#0b1c30]">
              {batches.length === 0 ? 'No Consignments in Batch Queue' : 'No Batches Match Filter'}
            </div>
            <p className="text-xs text-[#76777d] max-w-md">
              {batches.length === 0
                ? 'The batch queue is currently empty. Import an official cargo manifest file or add a new consignment lot to execute statistical AQL sampling.'
                : 'Try selecting another status filter to view pending or completed lots.'}
            </p>
            {batches.length === 0 && (
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 border border-[#c6c6cd] bg-white text-[#0b1c30] rounded-lg text-xs font-semibold hover:bg-[#eff4ff] transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">upload_file</span>
                  <span>Import Manifest (CSV / Excel)</span>
                </button>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-3.5 py-2 bg-[#131b2e] text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Register Consignment</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#eff4ff] text-[#45464d] border-b border-[#dce9ff]">
                  <th className="p-3">Consignment &amp; SKU</th>
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
                      {item.status === 'PENDING' ? (
                        <span className="text-[#76777d] italic">Awaiting verification</span>
                      ) : (
                        <>
                          <span className="text-[#006a61] font-bold">{item.passCount} Pass</span>
                          {item.failCount > 0 && (
                            <span className="text-[#ba1a1a] font-bold ml-2">
                              ({item.failCount} Non-Compliant)
                            </span>
                          )}
                        </>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {item.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#eff4ff] text-[#45464d] font-semibold">
                          <span className="material-symbols-outlined text-[14px]">hourglass_empty</span>
                          <span>Pending Execution</span>
                        </span>
                      )}
                      {item.status === 'COMPLETED_CLEAN' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#86f2e4] text-[#00201d] font-semibold">
                          <span className="material-symbols-outlined text-[14px]">check</span>
                          <span>Clearance Issued</span>
                        </span>
                      )}
                      {item.status === 'SEIZURE_FLAGGED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#ffdad6] text-[#93000a] font-semibold">
                          <span className="material-symbols-outlined text-[14px]">warning</span>
                          <span>Lot Seizure Flagged</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Consignment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-[#dce9ff] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#006a61]">
                  add_box
                </span>
                <h3 className="font-bold text-sm text-[#0b1c30]">Register Consignment Lot</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#76777d] hover:text-[#0b1c30]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddConsignment} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#45464d] font-medium mb-1">
                  Consignment Ref / Depot
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., CN-99412 (Central Warehouse Hub)"
                  value={consignmentNumber}
                  onChange={e => setConsignmentNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#c6c6cd] bg-[#f8f9ff] text-[#0b1c30] focus:outline-hidden focus:border-[#006a61]"
                />
              </div>

              <div>
                <label className="block text-[#45464d] font-medium mb-1">
                  Product / SKU Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Cold Pressed Mustard Oil 1L Pouch"
                  value={skuName}
                  onChange={e => setSkuName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#c6c6cd] bg-[#f8f9ff] text-[#0b1c30] focus:outline-hidden focus:border-[#006a61]"
                />
              </div>

              <div>
                <label className="block text-[#45464d] font-medium mb-1">
                  EAN-13 Barcode
                </label>
                <input
                  type="text"
                  placeholder="e.g., 8901234567890"
                  value={ean13Code}
                  onChange={e => setEan13Code(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#c6c6cd] bg-[#f8f9ff] font-mono text-[#0b1c30] focus:outline-hidden focus:border-[#006a61]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#45464d] font-medium mb-1">
                    Carton Volume
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={cartons}
                    onChange={e => setCartons(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-[#c6c6cd] bg-[#f8f9ff] font-mono text-[#0b1c30] focus:outline-hidden focus:border-[#006a61]"
                  />
                </div>
                <div>
                  <label className="block text-[#45464d] font-medium mb-1">
                    Sample Size (AQL)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={sampleSize}
                    onChange={e => setSampleSize(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-[#c6c6cd] bg-[#f8f9ff] font-mono text-[#0b1c30] focus:outline-hidden focus:border-[#006a61]"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#eff4ff]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 rounded-lg border border-[#c6c6cd] text-[#45464d] hover:bg-[#eff4ff] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#006a61] text-white font-semibold hover:opacity-90 transition-opacity shadow-xs"
                >
                  Register Lot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
