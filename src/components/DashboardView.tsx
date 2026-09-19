import React from 'react';
import { NavigationTab } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col w-full pb-8 space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-end pt-1">
        <button
          onClick={() => onNavigate('new-scan')}
          className="px-4 py-2 bg-[#000000] text-[#ffffff] rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-xs"
        >
          <span className="material-symbols-outlined text-[16px] text-[#86f2e4]">add_circle</span>
          <span>New Inspection Scan</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#dce9ff] shadow-xs">
          <div className="flex items-center justify-between text-[#45464d] text-xs">
            <span>Total Inspected</span>
            <span className="material-symbols-outlined text-[18px] text-[#006a61]">inventory_2</span>
          </div>
          <div className="font-data-metric text-2xl font-bold text-[#0b1c30] mt-2">1,482</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#dce9ff] shadow-xs">
          <div className="flex items-center justify-between text-[#45464d] text-xs">
            <span>Compliance Rate</span>
            <span className="material-symbols-outlined text-[18px] text-[#006a61]">verified</span>
          </div>
          <div className="font-data-metric text-2xl font-bold text-[#006a61] mt-2">84.2%</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#dce9ff] shadow-xs">
          <div className="flex items-center justify-between text-[#45464d] text-xs">
            <span>Active Notices</span>
            <span className="material-symbols-outlined text-[18px] text-[#ba1a1a]">gavel</span>
          </div>
          <div className="font-data-metric text-2xl font-bold text-[#ba1a1a] mt-2">234</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#dce9ff] shadow-xs">
          <div className="flex items-center justify-between text-[#45464d] text-xs">
            <span>Chain Integrity</span>
            <span className="material-symbols-outlined text-[18px] text-[#006a61]">lock</span>
          </div>
          <div className="font-data-metric text-2xl font-bold text-[#0b1c30] mt-2">100%</div>
        </div>
      </div>

      {/* Analytics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Statutory Infractions */}
        <div className="lg:col-span-7 bg-white rounded-xl shadow-xs border border-[#dce9ff] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#eff4ff] pb-3">
            <h3 className="font-headline-sm text-base font-bold text-[#0b1c30]">
              Infraction Distribution
            </h3>
            <span className="px-2 py-0.5 rounded bg-[#e5eeff] text-[#0b1c30] text-xs font-mono">
              234 Infractions
            </span>
          </div>

          <div className="space-y-3">
            {[
              { rule: 'Rule 6(1)(c) & Rule 9 Table 1', name: 'Under-sized Net Quantity Font Height', percent: 46, count: 108 },
              { rule: 'Rule 6(1)(s)', name: 'Unit Sale Price (USP) Calculation Mismatch', percent: 28, count: 66 },
              { rule: 'Rule 6(1)(e)', name: 'Missing Consumer Care Tel / Helpline', percent: 16, count: 37 },
              { rule: 'Rule 6(1)(a)', name: 'Incomplete Manufacturer / Packer Address', percent: 10, count: 23 },
            ].map((inf, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[#0b1c30]">
                    <span className="font-bold text-[#ba1a1a] mr-1">[{inf.rule}]</span>
                    {inf.name}
                  </span>
                  <span className="font-mono text-[#45464d]">
                    {inf.count} ({inf.percent}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#eff4ff] overflow-hidden">
                  <div
                    className="h-full bg-[#ba1a1a] rounded-full"
                    style={{ width: `${inf.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Field Enforcement Units */}
        <div className="lg:col-span-5 bg-white rounded-xl shadow-xs border border-[#dce9ff] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#eff4ff] pb-3">
            <h3 className="font-headline-sm text-base font-bold text-[#0b1c30]">
              Enforcement Stations
            </h3>
            <span className="w-2.5 h-2.5 rounded-full bg-[#006a61] animate-pulse"></span>
          </div>

          <div className="space-y-3">
            {[
              { station: 'FEU-DELHI-04 (Current Terminal)', officer: 'Officer S. Sharma', scans: 42, status: 'Active Duty' },
              { station: 'FEU-DELHI-01 (Cargo T3 Logistics)', officer: 'Officer R. Verma', scans: 68, status: 'Active Duty' },
              { station: 'FEU-NOIDA-02 (Wholesale Mandi)', officer: 'Officer K. Yadav', scans: 31, status: 'Active Duty' },
              { station: 'FEU-GURGAON-05 (Retail Hub Hub)', officer: 'Officer P. Singh', scans: 25, status: 'Shift Change' },
            ].map((st, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-[#0b1c30]">{st.station}</div>
                  <div className="text-[#45464d]">{st.officer}</div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-[#0b1c30]">{st.scans} scans today</span>
                  <div className="text-[10px] text-[#006a61] font-semibold">{st.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
