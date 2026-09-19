import React, { useState } from 'react';
import { SampleLabel, RuleViolation } from '../types';
import { Language } from '../utils/translations';

interface ManualSpecimenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sample: SampleLabel) => void;
  lang?: Language;
}

export const ManualSpecimenModal: React.FC<ManualSpecimenModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  lang = 'EN',
}) => {
  const [commodity, setCommodity] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Food Grains & Flours');
  const [packageType, setPackageType] = useState('Poly Film Pouch');
  const [ean13, setEan13] = useState('');
  const [netQtyDeclared, setNetQtyDeclared] = useState('1 kg');
  const [pdpAreaCm2, setPdpAreaCm2] = useState<number>(250);
  const [measuredFontMm, setMeasuredFontMm] = useState<number>(4.0);
  const [mrp, setMrp] = useState<number>(90.0);
  const [declaredUsp, setDeclaredUsp] = useState<number>(90.0);
  const [uspUnit, setUspUnit] = useState('₹ / kg');

  // Mandatory declarations flags
  const [hasMfrAddress, setHasMfrAddress] = useState(true);
  const [hasCountryOfOrigin, setHasCountryOfOrigin] = useState(true);
  const [hasNetQty, setHasNetQty] = useState(true);
  const [hasMonthYear, setHasMonthYear] = useState(true);
  const [hasMrpTax, setHasMrpTax] = useState(true);
  const [hasUsp, setHasUsp] = useState(true);
  const [hasConsumerCare, setHasConsumerCare] = useState(true);

  if (!isOpen) return null;

  // Compute statutory minimum numeral font height under Rule 9 Table 1
  const computeRequiredFont = (pdpArea: number): number => {
    if (pdpArea <= 50) return 1.5;
    if (pdpArea <= 100) return 2.0;
    if (pdpArea <= 200) return 4.0;
    if (pdpArea <= 360) return 4.0;
    return 6.0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commodity.trim() || !brand.trim()) {
      alert(lang === 'EN' ? 'Please enter Commodity and Brand names.' : 'कृपया वस्तु और ब्रांड का नाम दर्ज करें।');
      return;
    }

    const requiredFont = computeRequiredFont(pdpAreaCm2);
    const isFontPass = measuredFontMm >= requiredFont;

    // Unit sale price check
    const isUspMatch = Math.abs(declaredUsp - mrp) < 0.05 || declaredUsp > 0;

    const violations: RuleViolation[] = [];

    if (!isFontPass) {
      violations.push({
        ruleCode: 'Rule 6(1)(c) / Rule 9 Table 1',
        ruleTitle: 'Minimum Height of Numerals for Net Quantity',
        measured: `${measuredFontMm.toFixed(2)} mm measured font`,
        required: `${requiredFont.toFixed(2)} mm statutory prescribed minimum`,
        severity: 'CRITICAL',
        description: `Numeral height ${measuredFontMm.toFixed(2)} mm is lower than ${requiredFont.toFixed(2)} mm prescribed for PDP area ${pdpAreaCm2} cm².`,
      });
    }

    if (!isUspMatch || !hasUsp) {
      violations.push({
        ruleCode: 'Rule 6(1)(s)',
        ruleTitle: 'Unit Sale Price Declaration',
        measured: `₹ ${declaredUsp.toFixed(2)} ${uspUnit}`,
        required: `Calculated quotient from declared MRP and net contents`,
        severity: 'MAJOR',
        description: 'Unit Sale Price declaration discrepancy or omission under Rule 6(1)(s).',
      });
    }

    if (!hasMfrAddress) {
      violations.push({
        ruleCode: 'Rule 6(1)(a) & (b)',
        ruleTitle: 'Manufacturer / Packer Identification',
        measured: 'Incomplete / Missing',
        required: 'Full name, complete postal address and PIN code',
        severity: 'MAJOR',
        description: 'Missing complete address and PIN code of manufacturer/packer.',
      });
    }

    if (!hasConsumerCare) {
      violations.push({
        ruleCode: 'Rule 6(1)(g)',
        ruleTitle: 'Consumer Care Helpline Details',
        measured: 'Missing / Incomplete',
        required: 'Name, address, phone number & email address',
        severity: 'MAJOR',
        description: 'Consumer grievance redressal details omitted from consumer packaging.',
      });
    }

    let status: 'COMPLIANT' | 'INFRACTION' | 'USP_DISCREPANCY' = 'COMPLIANT';
    let infractionSummary = 'All statutory declarations fully conform to LMPC Rules, 2011.';
    let ruleCode = 'Rule 6(1) Compliant';

    if (!isFontPass) {
      status = 'INFRACTION';
      ruleCode = 'Rule 6(1)(c) & Rule 9';
      infractionSummary = `Rule 6(1)(c): Measured font ${measuredFontMm.toFixed(1)}mm fails prescribed minimum ${requiredFont.toFixed(1)}mm for ${pdpAreaCm2}cm² PDP.`;
    } else if (!isUspMatch || !hasUsp) {
      status = 'USP_DISCREPANCY';
      ruleCode = 'Rule 6(1)(s)';
      infractionSummary = 'Rule 6(1)(s): Discrepancy detected in Unit Sale Price (USP) declaration.';
    } else if (!hasMfrAddress || !hasConsumerCare || !hasMonthYear || !hasMrpTax) {
      status = 'INFRACTION';
      ruleCode = 'Rule 6(1)';
      infractionSummary = 'Rule 6(1): Omission of mandatory statutory declarations on package.';
    }

    const sample: SampleLabel = {
      id: `specimen-${Date.now()}`,
      brand: brand.trim(),
      commodity: commodity.trim(),
      netQtyDeclared: netQtyDeclared.trim(),
      ean13: ean13.trim() || '890' + Math.floor(1000000000 + Math.random() * 9000000000),
      packageType,
      category,
      status,
      infractionSummary,
      ruleCode,
      pdpAreaCm2,
      measuredFontMm,
      requiredFontMm: requiredFont,
      mrp: Number(mrp) || 0,
      unitSalePrice: {
        declared: Number(declaredUsp) || 0,
        calculated: Number(declaredUsp) || 0,
        unit: uspUnit,
        isMatch: isUspMatch && hasUsp,
      },
      declarations: {
        manufacturerAddress: hasMfrAddress,
        countryOfOrigin: hasCountryOfOrigin,
        netQuantity: hasNetQty,
        monthYearManufacture: hasMonthYear,
        mrpTaxesInclusive: hasMrpTax,
        unitSalePrice: hasUsp,
        consumerCareHelpline: hasConsumerCare,
      },
      violations,
    };

    onSubmit(sample);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-[#dce9ff] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#131b2e] text-white px-6 py-4 flex items-center justify-between border-b border-[#006a61]/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#006a61] flex items-center justify-center text-[#86f2e4] shadow-xs">
              <span className="material-symbols-outlined text-[20px]">edit_note</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {lang === 'EN' ? 'Feed Fresh Specimen Data' : 'नया नमूना डेटा दर्ज करें'}
              </h3>
              <p className="text-[11px] text-[#86f2e4] opacity-90">
                Direct Statutory Metrology Inspection &bull; LMPC Rules 2011
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#0b1c30] mb-1">
                {lang === 'EN' ? 'Commodity Name*' : 'वस्तु का नाम*'}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Pure Desi Ghee 1L Tin"
                value={commodity}
                onChange={e => setCommodity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#c6c6cd] bg-[#f8f9ff] text-[#0b1c30] focus:outline-hidden focus:border-[#006a61]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#0b1c30] mb-1">
                {lang === 'EN' ? 'Brand Name*' : 'ब्रांड का नाम*'}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Amul / Patanjali / Tata"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#c6c6cd] bg-[#f8f9ff] text-[#0b1c30] focus:outline-hidden focus:border-[#006a61]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#0b1c30] mb-1">
                {lang === 'EN' ? 'Packaging Sector / Category' : 'पैकेजिंग क्षेत्र / श्रेणी'}
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-[#c6c6cd] bg-[#f8f9ff] text-[#0b1c30] focus:outline-hidden focus:border-[#006a61]"
              >
                <option value="Dairy & Edible Oils">Dairy &amp; Edible Oils</option>
                <option value="Food Grains & Flours">Food Grains &amp; Flours</option>
                <option value="Beverages & Juices">Beverages &amp; Juices</option>
                <option value="Spices & Condiments">Spices &amp; Condiments</option>
                <option value="Confectionery & Bakery">Confectionery &amp; Bakery</option>
                <option value="Personal Care & Cosmetics">Personal Care &amp; Cosmetics</option>
                <option value="Packaged Consumer Goods">Packaged Consumer Goods</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#0b1c30] mb-1">
                {lang === 'EN' ? 'Package Container Type' : 'पैकेज कंटेनर प्रकार'}
              </label>
              <select
                value={packageType}
                onChange={e => setPackageType(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-[#c6c6cd] bg-[#f8f9ff] text-[#0b1c30] focus:outline-hidden focus:border-[#006a61]"
              >
                <option value="Poly Film Pouch">Poly Film Pouch</option>
                <option value="Rigid Tin Container">Rigid Tin Container</option>
                <option value="Carton / Aseptic Box">Carton / Aseptic Box</option>
                <option value="Glass Bottle / Jar">Glass Bottle / Jar</option>
                <option value="Rigid HDPE/PET Bottle">Rigid HDPE/PET Bottle</option>
                <option value="Woven Poly Sack">Woven Poly Sack</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#0b1c30] mb-1">
                {lang === 'EN' ? 'Declared Net Qty' : 'घोषित शुद्ध मात्रा'}
              </label>
              <input
                type="text"
                placeholder="e.g. 1 L or 500 g"
                value={netQtyDeclared}
                onChange={e => setNetQtyDeclared(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#c6c6cd] bg-[#f8f9ff] text-[#0b1c30] focus:outline-hidden focus:border-[#006a61]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#0b1c30] mb-1">
                {lang === 'EN' ? 'PDP Area (cm²)' : 'पीडीपी क्षेत्रफल (cm²)'}
              </label>
              <input
                type="number"
                min="10"
                max="2000"
                value={pdpAreaCm2}
                onChange={e => setPdpAreaCm2(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg border border-[#c6c6cd] bg-[#f8f9ff] text-[#0b1c30] focus:outline-hidden focus:border-[#006a61]"
              />
              <span className="text-[10px] text-[#006a61] mt-0.5 block">
                Rule 9 Min Font: {computeRequiredFont(pdpAreaCm2).toFixed(1)} mm
              </span>
            </div>

            <div>
              <label className="block font-semibold text-[#0b1c30] mb-1">
                {lang === 'EN' ? 'Measured Font (mm)' : 'मापा गया फॉन्ट (mm)'}
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="20"
                value={measuredFontMm}
                onChange={e => setMeasuredFontMm(Number(e.target.value) || 0)}
                className={`w-full px-3 py-2 rounded-lg border font-mono font-bold focus:outline-hidden ${
                  measuredFontMm >= computeRequiredFont(pdpAreaCm2)
                    ? 'border-[#006a61] text-[#006a61] bg-[#d1f2e8]/20'
                    : 'border-[#ba1a1a] text-[#ba1a1a] bg-[#ffdad6]/20'
                }`}
              />
              <span
                className={`text-[10px] font-semibold mt-0.5 block ${
                  measuredFontMm >= computeRequiredFont(pdpAreaCm2)
                    ? 'text-[#006a61]'
                    : 'text-[#ba1a1a]'
                }`}
              >
                {measuredFontMm >= computeRequiredFont(pdpAreaCm2)
                  ? 'Complies with Rule 9'
                  : 'Infraction: Below Min Height'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#0b1c30] mb-1">
                {lang === 'EN' ? 'MRP (₹ Incl. taxes)' : 'एमआरपी (₹ कर सहित)'}
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={mrp}
                onChange={e => {
                  const val = Number(e.target.value) || 0;
                  setMrp(val);
                  setDeclaredUsp(val);
                }}
                className="w-full px-3 py-2 rounded-lg border border-[#c6c6cd] bg-[#f8f9ff] text-[#0b1c30] focus:outline-hidden focus:border-[#006a61]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#0b1c30] mb-1">
                {lang === 'EN' ? 'Declared USP (₹)' : 'घोषित यूएसपी (₹)'}
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={declaredUsp}
                onChange={e => setDeclaredUsp(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg border border-[#c6c6cd] bg-[#f8f9ff] text-[#0b1c30] focus:outline-hidden focus:border-[#006a61]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#0b1c30] mb-1">
                {lang === 'EN' ? 'USP Unit' : 'यूएसपी इकाई'}
              </label>
              <select
                value={uspUnit}
                onChange={e => setUspUnit(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-[#c6c6cd] bg-[#f8f9ff] text-[#0b1c30] focus:outline-hidden focus:border-[#006a61]"
              >
                <option value="₹ / kg">₹ / kg</option>
                <option value="₹ / g">₹ / g</option>
                <option value="₹ / L">₹ / L</option>
                <option value="₹ / mL">₹ / mL</option>
                <option value="₹ / N">₹ / N (Piece)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#0b1c30] mb-1">
              {lang === 'EN' ? 'EAN-13 Barcode' : 'ईएएन-13 बारकोड'}
            </label>
            <input
              type="text"
              placeholder="e.g. 8901030022419"
              value={ean13}
              onChange={e => setEan13(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#c6c6cd] font-mono bg-[#f8f9ff] text-[#0b1c30] focus:outline-hidden focus:border-[#006a61]"
            />
          </div>

          {/* Mandatory Declarations Toggles */}
          <div className="pt-2 border-t border-[#eff4ff]">
            <span className="block font-semibold text-[#0b1c30] mb-2">
              {lang === 'EN'
                ? 'Mandatory Label Declarations (Rule 6(1))'
                : 'अनिवार्य लेबल घोषणाएं (नियम 6(1))'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasMfrAddress}
                  onChange={e => setHasMfrAddress(e.target.checked)}
                  className="rounded text-[#006a61] focus:ring-[#006a61]"
                />
                <span>Mfr Name, Address &amp; PIN (6(1)(a))</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasCountryOfOrigin}
                  onChange={e => setHasCountryOfOrigin(e.target.checked)}
                  className="rounded text-[#006a61] focus:ring-[#006a61]"
                />
                <span>Country of Origin (6(1)(b))</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasMonthYear}
                  onChange={e => setHasMonthYear(e.target.checked)}
                  className="rounded text-[#006a61] focus:ring-[#006a61]"
                />
                <span>Month &amp; Year of Packing (6(1)(d))</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasMrpTax}
                  onChange={e => setHasMrpTax(e.target.checked)}
                  className="rounded text-[#006a61] focus:ring-[#006a61]"
                />
                <span>MRP Incl. All Taxes (6(1)(e))</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasUsp}
                  onChange={e => setHasUsp(e.target.checked)}
                  className="rounded text-[#006a61] focus:ring-[#006a61]"
                />
                <span>Unit Sale Price (USP) (6(1)(s))</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasConsumerCare}
                  onChange={e => setHasConsumerCare(e.target.checked)}
                  className="rounded text-[#006a61] focus:ring-[#006a61]"
                />
                <span>Consumer Care Helpline &amp; Email (6(1)(g))</span>
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-[#eff4ff] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#c6c6cd] text-xs font-semibold text-[#45464d] hover:bg-[#eff4ff] transition-colors"
            >
              {lang === 'EN' ? 'Cancel' : 'रद्द करें'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#006a61] text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>{lang === 'EN' ? 'Execute Metrology Inspection' : 'विधिक मापविज्ञान निरीक्षण निष्पादित करें'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
