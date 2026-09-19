import React, { useState } from 'react';
import { SampleLabel } from '../types';
import { BENCHMARK_SAMPLES } from '../data/samples';
import { InspectionDossierModal } from './InspectionDossierModal';

export const HistoryLedgerView: React.FC = () => {
  const [samples] = useState<SampleLabel[]>(BENCHMARK_SAMPLES);
  const [filter, setFilter] = useState<'ALL' | 'COMPLIANT' | 'INFRACTION' | 'USP'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSample, setSelectedSample] = useState<SampleLabel | null>(null);

  const filteredSamples = samples.filter(s => {
    if (filter === 'COMPLIANT' && s.status !== 'COMPLIANT') return false;
    if (filter === 'INFRACTION' && s.status !== 'INFRACTION') return false;
    if (filter === 'USP' && s.status !== 'USP_DISCREPANCY') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.commodity.toLowerCase().includes(q) ||
        s.brand.toLowerCase().includes(q) ||
        s.ean13.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-8 space-y-6">
      {/* Controls Bar: Search & Filter Tabs */}
      <div className="bg-white rounded-xl shadow-xs border border-[#dce9ff] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#76777d]">
            search
          </span>
          <input
            type="text"
            placeholder="Search commodity name, brand, or EAN-13 code..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#c6c6cd] text-xs bg-[#f8f9ff] focus:outline-hidden focus:border-[#006a61]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-[#eff4ff] p-1 rounded-lg border border-[#dce9ff]">
          {(['ALL', 'COMPLIANT', 'INFRACTION', 'USP'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                filter === tab
                  ? 'bg-[#131b2e] text-white shadow-xs'
                  : 'text-[#45464d] hover:text-[#0b1c30]'
              }`}
            >
              {tab === 'ALL'
                ? 'All Dossiers'
                : tab === 'COMPLIANT'
                ? 'Compliant'
                : tab === 'INFRACTION'
                ? 'Infractions'
                : 'USP Mismatch'}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl shadow-xs border border-[#dce9ff] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#eff4ff] text-[#45464d] border-b border-[#dce9ff]">
                <th className="p-3.5">Commodity &amp; Brand</th>
                <th className="p-3.5 font-mono">EAN-13</th>
                <th className="p-3.5">Net Qty / Font (Measured vs Req)</th>
                <th className="p-3.5">Declared MRP</th>
                <th className="p-3.5">Statutory Verdict</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff4ff]">
              {filteredSamples.map(sample => {
                const isCompliant = sample.status === 'COMPLIANT';
                return (
                  <tr key={sample.id} className="hover:bg-[#f8f9ff] transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-[#0b1c30] text-[13px]">{sample.commodity}</div>
                      <div className="text-[11px] text-[#45464d]">{sample.packageType}</div>
                    </td>
                    <td className="p-3.5 font-mono text-[#45464d]">{sample.ean13}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-[#0b1c30]">{sample.netQtyDeclared}</div>
                      <div className="text-[11px] font-mono">
                        Font: <span className={sample.measuredFontMm >= sample.requiredFontMm ? 'text-[#006a61]' : 'text-[#ba1a1a] font-bold'}>
                          {sample.measuredFontMm.toFixed(2)}mm
                        </span>{' '}
                        / Req: {sample.requiredFontMm.toFixed(2)}mm
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-[#0b1c30] font-bold">
                      ₹ {sample.mrp.toFixed(2)}
                    </td>
                    <td className="p-3.5">
                      {isCompliant ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#86f2e4] text-[#00201d] font-semibold">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          <span>Compliant</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#ffdad6] text-[#93000a] font-semibold">
                          <span className="material-symbols-outlined text-[14px]">warning</span>
                          <span>{sample.status === 'USP_DISCREPANCY' ? 'USP Mismatch' : 'Infraction'}</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedSample(sample)}
                        className="px-3 py-1.5 rounded bg-[#000000] text-white hover:opacity-90 font-medium text-xs transition-opacity shadow-xs"
                      >
                        View Dossier
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Dossier Modal */}
      {selectedSample && (
        <InspectionDossierModal
          sample={selectedSample}
          onClose={() => setSelectedSample(null)}
        />
      )}
    </div>
  );
};
