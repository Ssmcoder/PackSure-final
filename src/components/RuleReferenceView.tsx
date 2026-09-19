import React, { useState } from 'react';

export const RuleReferenceView: React.FC = () => {
  const [calculatorPdpArea, setCalculatorPdpArea] = useState<number>(150);
  const [isBlownBottle, setIsBlownBottle] = useState<boolean>(false);

  // Calculate required font height according to Legal Metrology (Packaged Commodities) Rules, 2011, Table 1
  const computeRule9Requirements = (areaCm2: number, isBlown: boolean) => {
    let minNumeralHeightMm = 1.0;
    let minLetterHeightMm = 1.0;

    if (areaCm2 <= 50) {
      minNumeralHeightMm = 1.0;
      minLetterHeightMm = 1.0;
    } else if (areaCm2 <= 100) {
      minNumeralHeightMm = 1.5;
      minLetterHeightMm = 1.0;
    } else if (areaCm2 <= 500) {
      minNumeralHeightMm = 2.0;
      minLetterHeightMm = 1.5;
    } else if (areaCm2 <= 2500) {
      minNumeralHeightMm = 4.0;
      minLetterHeightMm = 2.0;
    } else {
      minNumeralHeightMm = 6.0;
      minLetterHeightMm = 3.0;
    }

    if (isBlown) {
      // Blown, formed, moulded or embossed packages require larger tolerances
      minNumeralHeightMm += 1.0;
    }

    return { minNumeralHeightMm, minLetterHeightMm };
  };

  const { minNumeralHeightMm, minLetterHeightMm } = computeRule9Requirements(
    calculatorPdpArea,
    isBlownBottle
  );

  return (
    <div className="flex flex-col w-full pb-8 space-y-6">
      {/* Interactive Rule 9 Table 1 Calculator */}
      <div className="bg-white rounded-xl shadow-xs border border-[#dce9ff] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#eff4ff] pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded bg-[#e5eeff] text-[#006a61]">
              <span className="material-symbols-outlined text-[20px]">calculate</span>
            </span>
            <h3 className="font-headline-sm text-base font-bold text-[#0b1c30]">
              Rule 9 Minimum Height Calculator
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 space-y-4 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-[#0b1c30]">
                  Display Panel Area: {calculatorPdpArea} cm²
                </label>
                <span className="font-mono text-[11px] text-[#006a61] font-bold">
                  {calculatorPdpArea <= 50
                    ? 'Tier 1 (≤ 50 cm²)'
                    : calculatorPdpArea <= 100
                    ? 'Tier 2 (50 - 100 cm²)'
                    : calculatorPdpArea <= 500
                    ? 'Tier 3 (100 - 500 cm²)'
                    : calculatorPdpArea <= 2500
                    ? 'Tier 4 (500 - 2500 cm²)'
                    : 'Tier 5 (> 2500 cm²)'}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="3000"
                step="10"
                value={calculatorPdpArea}
                onChange={e => setCalculatorPdpArea(parseInt(e.target.value, 10))}
                className="w-full accent-[#006a61]"
              />
              <div className="flex justify-between text-[11px] text-[#76777d] mt-1 font-mono">
                <span>10 cm²</span>
                <span>500 cm²</span>
                <span>3000 cm²</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="blownCheck"
                checked={isBlownBottle}
                onChange={e => setIsBlownBottle(e.target.checked)}
                className="w-4 h-4 rounded text-[#006a61] accent-[#006a61]"
              />
              <label htmlFor="blownCheck" className="text-xs text-[#0b1c30] cursor-pointer">
                Blown, moulded, embossed or perforated container
              </label>
            </div>
          </div>

          {/* Computed Statutory Output */}
          <div className="md:col-span-5 p-4 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex flex-col gap-3">
            <span className="text-xs uppercase font-semibold text-[#45464d] tracking-wider">
              Rule 9 Table 1 Thresholds
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-lg border border-[#dce9ff] shadow-xs">
                <span className="text-[11px] text-[#76777d] block">Numeral Height</span>
                <span className="text-xl font-bold font-mono text-[#006a61]">
                  {minNumeralHeightMm.toFixed(1)} mm
                </span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#dce9ff] shadow-xs">
                <span className="text-[11px] text-[#76777d] block">Letter Height</span>
                <span className="text-xl font-bold font-mono text-[#0b1c30]">
                  {minLetterHeightMm.toFixed(1)} mm
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statutory Rules Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rule 6 Mandatory Checklist */}
        <div className="bg-white rounded-xl shadow-xs border border-[#dce9ff] p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-[#eff4ff] pb-2">
            <span className="material-symbols-outlined text-[#006a61] text-[20px]">format_list_numbered</span>
            <h3 className="font-headline-sm text-base font-bold text-[#0b1c30]">
              Rule 6(1) Mandatory Declarations
            </h3>
          </div>
          <div className="space-y-2 text-xs text-[#0b1c30]">
            <div className="p-2.5 rounded bg-[#f8f9ff] border border-[#dce9ff]">
              <strong>(a) Identity of Commodity:</strong> Generic name of commodity contained in the package.
            </div>
            <div className="p-2.5 rounded bg-[#f8f9ff] border border-[#dce9ff]">
              <strong>(b) Manufacturer / Packer:</strong> Name and complete postal address of manufacturer, packer, or importer.
            </div>
            <div className="p-2.5 rounded bg-[#f8f9ff] border border-[#dce9ff]">
              <strong>(c) Net Quantity:</strong> Standard units of weight, measure or number per Schedule II.
            </div>
            <div className="p-2.5 rounded bg-[#f8f9ff] border border-[#dce9ff]">
              <strong>(d) Date of Packaging:</strong> Month and year of manufacture or pre-packaging.
            </div>
            <div className="p-2.5 rounded bg-[#f8f9ff] border border-[#dce9ff]">
              <strong>(e) Consumer Care Cell:</strong> Contact name, address, telephone number & email.
            </div>
            <div className="p-2.5 rounded bg-[#f8f9ff] border border-[#dce9ff]">
              <strong>(s) Unit Sale Price (USP):</strong> Price per gram, ml, or piece rounded to 2 decimals.
            </div>
          </div>
        </div>

        {/* Penal Provisions under Legal Metrology Act 2009 */}
        <div className="bg-white rounded-xl shadow-xs border border-[#dce9ff] p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-[#eff4ff] pb-2">
            <span className="material-symbols-outlined text-[#ba1a1a] text-[20px]">gavel</span>
            <h3 className="font-headline-sm text-base font-bold text-[#0b1c30]">
              Statutory Penalties & Compounding Fees
            </h3>
          </div>
          <div className="space-y-2.5 text-xs text-[#0b1c30]">
            <div className="p-3 rounded-lg bg-[#ffdad6]/40 border border-[#ffdad6]">
              <div className="font-bold text-[#93000a]">Section 36(1) — Penalty for Non-Standard Package</div>
              <p className="text-[#45464d] mt-1">
                Fine up to ₹25,000 for first offence; up to ₹50,000 for second offence; up to ₹1,00,000 or imprisonment up to 1 year for subsequent offences.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff]">
              <div className="font-bold text-[#006a61]">Section 48 — Compounding of Offences</div>
              <p className="text-[#45464d] mt-1">
                Director, Controller or Legal Metrology Officer may compound violations prior to or after institution of prosecution.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#f8f9ff] border border-[#dce9ff]">
              <div className="font-bold text-[#0b1c30]">Section 18 — Mandatory Packaging Verification</div>
              <p className="text-[#45464d] mt-1">
                No person shall manufacture, pack, sell, distribute, deliver, or offer for sale any pre-packaged commodity unless it complies with Rules.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
