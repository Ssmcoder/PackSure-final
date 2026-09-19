import React, { useState } from 'react';
import { AuditRecord } from '../types';
import { INITIAL_AUDIT_LOGS } from '../data/samples';

export const AuditLogsView: React.FC = () => {
  const [logs] = useState<AuditRecord[]>(INITIAL_AUDIT_LOGS);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyHash = (hash: string, id: string) => {
    navigator.clipboard?.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col w-full pb-8 space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-end pt-1">
        <button
          onClick={() => {
            const dataStr = JSON.stringify(logs, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `PackSure_Audit_Ledger_${Date.now()}.json`;
            a.click();
          }}
          className="px-4 py-2 bg-[#000000] text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs"
        >
          <span className="material-symbols-outlined text-[16px] text-[#86f2e4]">download</span>
          <span>Export Ledger</span>
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl shadow-xs border border-[#dce9ff] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#eff4ff] text-[#45464d] border-b border-[#dce9ff]">
                <th className="p-3.5">Log ID &amp; Timestamp</th>
                <th className="p-3.5">Sample Dossier</th>
                <th className="p-3.5 font-mono">EAN-13</th>
                <th className="p-3.5">Inspection Status</th>
                <th className="p-3.5 font-mono">SHA-256 Digest</th>
                <th className="p-3.5 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff4ff]">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-[#f8f9ff] transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-[#0b1c30] font-mono">{log.id}</div>
                    <div className="text-[11px] text-[#45464d]">{log.timestamp}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-[#0b1c30]">{log.sampleName}</div>
                    <div className="text-[11px] text-[#45464d]">{log.isoStandard}</div>
                  </td>
                  <td className="p-3.5 font-mono text-[#45464d]">{log.ean13}</td>
                  <td className="p-3.5">
                    {log.status === 'COMPLIANT' ? (
                      <span className="px-2 py-0.5 rounded bg-[#86f2e4] text-[#00201d] font-semibold">
                        CLEAN VERDICT
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-[#ffdad6] text-[#93000a] font-semibold">
                        NOTICE LOGGED
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-[#45464d]">
                    <div className="flex items-center gap-1.5">
                      <span>{log.sha256Hash.slice(0, 16)}...{log.sha256Hash.slice(-8)}</span>
                      <button
                        onClick={() => copyHash(log.sha256Hash, log.id)}
                        className="text-[#006a61] hover:underline"
                      >
                        {copiedId === log.id ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </td>
                  <td className="p-3.5 text-right">
                    <span className="inline-flex items-center gap-1 text-[#006a61] font-semibold">
                      <span className="material-symbols-outlined text-[14px]">lock</span>
                      <span>Verified</span>
                    </span>
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
