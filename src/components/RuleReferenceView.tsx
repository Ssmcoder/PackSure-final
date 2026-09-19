import React, { useState } from 'react';

interface RuleItem {
  id: string;
  ruleNumber: string;
  title: string;
  chapter: string;
  category: 'declarations' | 'pdp' | 'units' | 'retailsale' | 'exemptions' | 'penalties';
  statutorySummary: string;
  keyRequirements: string[];
  enforcementNotes?: string;
  scheduleReference?: string;
}

const LMPC_2011_RULES: RuleItem[] = [
  {
    id: 'rule-2',
    ruleNumber: 'Rule 2',
    title: 'Statutory Definitions',
    chapter: 'Chapter I — Preliminary',
    category: 'declarations',
    statutorySummary:
      'Defines foundational statutory terminology governing pre-packaged commodities in the Indian market.',
    keyRequirements: [
      'Pre-packaged commodity: A commodity which without the purchaser being present is placed in a package of whatever nature, so that quantity of product contained therein has a predetermined value.',
      'Principal Display Panel (PDP): That part of package which is intended or likely to be displayed, presented, or shown to the customer under normal conditions of display for retail sale.',
      'Maximum Retail Price (MRP): The maximum price at which the commodity in packaged form may be sold to the consumer inclusive of all taxes.',
      'Retail Package: Packages produced, distributed, or displayed for consumption by an individual or a group of individuals.',
      'Consumer: Any person who purchases or receives any packaged commodity for their own personal consumption or use.'
    ],
    enforcementNotes: 'Critical for determining whether a specimen qualifies under retail or wholesale jurisdiction.'
  },
  {
    id: 'rule-3-4',
    ruleNumber: 'Rule 3 & 4',
    title: 'Scope & Regulation of Packaging and Retail Sale',
    chapter: 'Chapter II — Provisions Applicable to Packages Intended for Retail Sale',
    category: 'declarations',
    statutorySummary:
      'Mandates that no person shall pre-pack, cause to be pre-packed, manufacture, sell, distribute, deliver, or display for sale any commodity unless packages comply with these rules.',
    keyRequirements: [
      'Applies universally to all pre-packaged commodities intended for retail sale across India.',
      'Prohibits any person from manufacturing, packing, importing, or distributing packages without statutory declarations.',
      'Obligates manufacturers, packers, and importers to register with the Director of Legal Metrology or State Controller.'
    ]
  },
  {
    id: 'rule-5',
    ruleNumber: 'Rule 5',
    title: 'Specific Commodities Packed in Prescribed Standard Quantities',
    chapter: 'Chapter II — Packages for Retail Sale',
    category: 'units',
    statutorySummary:
      'Commodities specified in the Second Schedule must be pre-packed and offered for sale solely in the standard quantities designated by the Central Government.',
    keyRequirements: [
      'Enforces standard pack sizes for staples including baby food, biscuits, bread, tea, coffee, edible oils, cereals, pulses, and washing powders.',
      'Prevents deceptive packaging where manufacturers reduce pack sizes by fractional non-standard quantities to disguise price hikes.'
    ],
    scheduleReference: 'Schedule II — Standard Packaging Sizes'
  },
  {
    id: 'rule-6-1-a',
    ruleNumber: 'Rule 6(1)(a)',
    title: 'Name & Complete Address of Manufacturer, Packer or Importer',
    chapter: 'Chapter II — Mandatory Declarations',
    category: 'declarations',
    statutorySummary:
      'Every package must bear the complete postal address identifying the manufacturer, packer, or importer.',
    keyRequirements: [
      'Must state premises number, street, locality, city, district, state, and valid 6-digit postal PIN code.',
      'Where manufacturer is distinct from packer or marketer, the relationship must be explicitly stated (e.g., "Manufactured by... for...").',
      'For imported goods, the name, address, and legal entity of the Indian importer must be declared.'
    ],
    enforcementNotes: 'Abbreviated addresses without PIN codes or street details constitute actionable infractions.'
  },
  {
    id: 'rule-6-1-b',
    ruleNumber: 'Rule 6(1)(b)',
    title: 'Common or Generic Name of the Commodity',
    chapter: 'Chapter II — Mandatory Declarations',
    category: 'declarations',
    statutorySummary:
      'The package must declare the common or generic name of the commodity contained in the package.',
    keyRequirements: [
      'Fancy brand names or marketing trademarks are insufficient without the generic descriptive name.',
      'For composite packages, generic names of all components must be clearly legible on the principal display panel.',
      'Must be displayed in prominent type with high contrast against the background.'
    ]
  },
  {
    id: 'rule-6-1-c',
    ruleNumber: 'Rule 6(1)(c)',
    title: 'Net Quantity Declaration in Standard SI Units',
    chapter: 'Chapter II — Mandatory Declarations',
    category: 'units',
    statutorySummary:
      'Declaration of net quantity in terms of standard metric units of weight, measure, or numerical count.',
    keyRequirements: [
      'Weight: Expressed in grams (g) or kilograms (kg).',
      'Volume (liquids): Expressed in milliliters (ml) or liters (l or L).',
      'Length & Area: Expressed in centimeters (cm), meters (m), or square units.',
      'Pieces / Count: Expressed in numerical count (N or U) where commodities are sold by number.',
      'Strict prohibition against non-standard symbols such as "gms", "kgs", "liters", "m.l.", or "pkts".'
    ],
    scheduleReference: 'First Schedule & Schedule II'
  },
  {
    id: 'rule-6-1-d',
    ruleNumber: 'Rule 6(1)(d) & (da)',
    title: 'Month & Year of Manufacture, Packing or Import & Expiry Date',
    chapter: 'Chapter II — Mandatory Declarations',
    category: 'declarations',
    statutorySummary:
      'Mandatory temporal disclosure indicating when the package was manufactured, pre-packed, or imported.',
    keyRequirements: [
      'Month and year format (e.g., "09/2026", "Sep 2026", or "09-2026").',
      'Rule 6(1)(da): For commodities which may become unfit for human consumption after a period of time, the "Best Before" or "Use By" date, month, and year must be explicitly stated.',
      'Must not be obscured by heat seals, batch stamps, or package folds.'
    ]
  },
  {
    id: 'rule-6-1-e',
    ruleNumber: 'Rule 6(1)(e)',
    title: 'Maximum Retail Price (MRP) Inclusive of All Taxes',
    chapter: 'Chapter II — Mandatory Declarations',
    category: 'retailsale',
    statutorySummary:
      'Statutory pricing declaration ensuring transparency and consumer protection against overcharging.',
    keyRequirements: [
      'Must be declared in Indian Currency: "Maximum Retail Price ₹ ..... (inclusive of all taxes)" or "MRP Rs. ..... incl. of all taxes".',
      'Must be clearly legible with font height compliant with Table 1.',
      'Prohibition of affixing additional stickers to increase price unless authorized by Central Government notifications.',
      'Dual pricing or discriminatory MRP on identical commodities across different sales channels is strictly illegal.'
    ]
  },
  {
    id: 'rule-6-1-f',
    ruleNumber: 'Rule 6(1)(f)',
    title: 'Dimensions of Commodity',
    chapter: 'Chapter II — Mandatory Declarations',
    category: 'units',
    statutorySummary:
      'Where the size or dimension of the commodity is relevant for purchase evaluation, dimensions must be declared.',
    keyRequirements: [
      'Applies to textiles, apparel, ropes, wrapping sheets, footwear, sanitary napkins, etc.',
      'Must state length, width, thickness, or diameter in standard metric units (cm, mm, m).'
    ]
  },
  {
    id: 'rule-6-1-g',
    ruleNumber: 'Rule 6(1)(g)',
    title: 'Consumer Care Cell Details',
    chapter: 'Chapter II — Mandatory Declarations',
    category: 'declarations',
    statutorySummary:
      'Mandatory disclosure of consumer grievance redressal contact points.',
    keyRequirements: [
      'Name of the designated person or office responsible for consumer redressal.',
      'Complete postal address of the consumer care cell.',
      'Active telephone helpline number (or toll-free number).',
      'Valid email address for electronic grievance filing.'
    ],
    enforcementNotes: 'Omitting telephone number or email constitutes an independent non-compliance notice.'
  },
  {
    id: 'rule-6-1-h',
    ruleNumber: 'Rule 6(1)(h)',
    title: 'Country of Origin / Manufacture',
    chapter: 'Chapter II — Mandatory Declarations',
    category: 'declarations',
    statutorySummary:
      'For imported pre-packaged goods, the country where the goods were manufactured or produced must be stated.',
    keyRequirements: [
      'Prominently declared as "Country of Origin: [Country Name]" or "Made in [Country Name]".',
      'Cannot be concealed in microtext or internal packaging layers.'
    ]
  },
  {
    id: 'rule-6-1-s',
    ruleNumber: 'Rule 6(1)(s)',
    title: 'Unit Sale Price (USP) Mandatory Declaration',
    chapter: 'Chapter II — Mandatory Declarations',
    category: 'retailsale',
    statutorySummary:
      'Enables direct price comparison across different package sizes by declaring price per standard unit.',
    keyRequirements: [
      'For packages containing net quantity less than 1 kg or 1 liter: Declared per gram (₹/g) or per milliliter (₹/ml).',
      'For packages containing net quantity 1 kg / 1 liter or more: Declared per kilogram (₹/kg) or per liter (₹/L).',
      'For items sold by number: Declared per piece, item, or number (₹/piece).',
      'Calculation: Total MRP ÷ Declared Net Quantity, rounded off to two decimal places.',
      'Must be displayed in close proximity to the MRP on the principal display panel.'
    ],
    enforcementNotes: 'Discrepancy between declared USP and mathematical quotient attracts misbranding notices.'
  },
  {
    id: 'rule-7',
    ruleNumber: 'Rule 7',
    title: 'Principal Display Panel (PDP) Dimensions & Calculation Rules',
    chapter: 'Chapter II — Principal Display Panel Specifications',
    category: 'pdp',
    statutorySummary:
      'Governs the mathematical calculation of the Principal Display Panel area across packaging geometries.',
    keyRequirements: [
      'Rectangular Package: 100% of height × width of the front or primary display face.',
      'Cylindrical / Round Container: 40% of the container height × circumference.',
      'Any Other Shape / Irregular: 20% of the total surface area of the package.',
      'Determines the statutory threshold tier for font heights under Rule 9 Table 1.'
    ]
  },
  {
    id: 'rule-8',
    ruleNumber: 'Rule 8',
    title: 'Declaration of Quantity in Metric System',
    chapter: 'Chapter II — Quantity Declarations',
    category: 'units',
    statutorySummary:
      'Net quantity declarations must be made in standard SI metric system units.',
    keyRequirements: [
      'Mass / Weight: Gram (g), Kilogram (kg), Tonne (t).',
      'Liquid Volume: Milliliter (ml), Liter (l or L).',
      'Length: Centimeter (cm), Meter (m).',
      'Area: Square centimeter (cm²), Square meter (m²).',
      'Prohibits use of non-metric units such as ounces, pounds, fluid ounces, inches, or yards without metric equivalents.'
    ]
  },
  {
    id: 'rule-9',
    ruleNumber: 'Rule 9',
    title: 'Manner in Which Declarations Shall Be Made & Table 1 Font Heights',
    chapter: 'Chapter II — Principal Display Panel Specifications',
    category: 'pdp',
    statutorySummary:
      'Prescribes visibility, contrast, and statutory minimum font heights of numerals and letters.',
    keyRequirements: [
      'All declarations must be conspicuous, clear, legible, and prominent.',
      'Must appear in contrasting colors against the background (e.g., dark typography on light background or vice versa).',
      'Mandatory compliance with Table 1 thresholds for numeral and letter heights based on PDP area.',
      'Blown, formed, moulded, embossed, or perforated packages require enlarged dimensions per Table 1.'
    ]
  },
  {
    id: 'rule-10',
    ruleNumber: 'Rule 10',
    title: 'Declaration of Manufacturer / Packer on Outer Wrap and Inner Units',
    chapter: 'Chapter II — Declarations',
    category: 'declarations',
    statutorySummary:
      'Where outer packaging contains individual retail packages, declarations must remain accessible.',
    keyRequirements: [
      'If outer wrapper is transparent, inner declarations must be completely legible from the outside.',
      'If outer wrapper is opaque, all mandatory declarations under Rule 6 must appear on the exterior carton or outer packaging.'
    ]
  },
  {
    id: 'rule-11-12',
    ruleNumber: 'Rule 11 & 12',
    title: 'Quantity Tolerances & Maximum Permissible Error (MPE)',
    chapter: 'Chapter II — Quantity Compliance',
    category: 'units',
    statutorySummary:
      'Governs allowable deviations between actual package contents and declared net quantity.',
    keyRequirements: [
      'Actual net quantity must conform to the declared net quantity within the Maximum Permissible Error (MPE) tolerances set out in the First Schedule.',
      'Average quantity of packages drawn from an inspection lot must equal or exceed declared net quantity.',
      'No package shall exhibit a negative error greater than twice the specified MPE.'
    ],
    scheduleReference: 'First Schedule — Maximum Permissible Errors'
  },
  {
    id: 'rule-13',
    ruleNumber: 'Rule 13',
    title: 'Standard Units & Prohibition of Plural Symbols',
    chapter: 'Chapter II — Units of Weight and Measure',
    category: 'units',
    statutorySummary:
      'Enforces grammatical and statutory accuracy in the presentation of SI metric units.',
    keyRequirements: [
      'Symbols must be written in singular form: "g", "kg", "ml", "l", "m", "cm".',
      'Prohibited forms: "gms", "kgs", "mls", "ltrs", "gm.", "k.g.", or capitalized "GMS".',
      'Must maintain a space between the numerical value and the statutory unit symbol (e.g., "500 g", not "500g").'
    ]
  },
  {
    id: 'rule-18',
    ruleNumber: 'Rule 18',
    title: 'Provisions Relating to Retail Sale & Overcharging Prohibition',
    chapter: 'Chapter II — Retail Sale Enforcement',
    category: 'retailsale',
    statutorySummary:
      'Strict legal safeguards against consumer exploitation, overpricing, and price tampering.',
    keyRequirements: [
      'Rule 18(1): No retail dealer or any other person including e-commerce entities shall sell any packaged commodity at a price exceeding the Maximum Retail Price.',
      'Rule 18(2): No person shall alter, obliterate, smudge, or overwrite the MRP declared on the package by the manufacturer or packer.',
      'Rule 18(5): Prohibition of dual MRP — identical packages of identical commodities cannot bear different retail prices across different commercial locations.',
      'Enforcement officers empowered to seize offending stock and initiate compounding or prosecution.'
    ]
  },
  {
    id: 'rule-24-26',
    ruleNumber: 'Rule 24, 25 & 26',
    title: 'Exemptions from Legal Metrology (Packaged Commodities) Rules',
    chapter: 'Chapter IV — Exemptions',
    category: 'exemptions',
    statutorySummary:
      'Explicitly demarcates categories of packages exempt from standard retail labelling provisions.',
    keyRequirements: [
      'Packages containing net quantity of 10 grams or 10 milliliters or less (except for tobacco and tobacco products).',
      'Packages intended for institutional consumers (service institutions like hotels, railways, hospitals) purchasing commodities directly from manufacturers.',
      'Packages intended for industrial consumers who use the commodity directly for manufacturing or processing.',
      'Packages containing agricultural produce weighing more than 50 kilograms.'
    ]
  },
  {
    id: 'lm-act-penalties',
    ruleNumber: 'Sections 18, 36 & 48',
    title: 'Statutory Penalties under Legal Metrology Act, 2009',
    chapter: 'Statutory Legal Act Enforcement',
    category: 'penalties',
    statutorySummary:
      'Prescribes fines, compounding procedures, and criminal liability for violations of packaging rules.',
    keyRequirements: [
      'Section 18: Mandatory compliance of pre-packaged commodities with prescribed rules.',
      'Section 36(1): Penalty for manufacture, packing, import, or sale of non-standard packages — First offence: fine up to ₹ 25,000; Second offence: fine up to ₹ 50,000; Subsequent offences: fine up to ₹ 1,00,000 or imprisonment up to 1 year, or both.',
      'Section 36(2): Penalty for selling commodity in packaged form at a price higher than the declared MRP — Fine up to ₹ 5,000 per violation.',
      'Section 48: Compounding of offences by Director, Controller, or authorized Legal Metrology Officer.',
      'Section 49: Offences by Companies — nominated directors and persons in charge held personally liable.'
    ]
  }
];

export const RuleReferenceView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredRules = LMPC_2011_RULES.filter(rule => {
    const matchesCategory =
      selectedCategory === 'all' || rule.category === selectedCategory;
    const matchesSearch =
      rule.ruleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.statutorySummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.keyRequirements.some(req => req.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col w-full pb-10 space-y-6">
      {/* Top Filter & Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-[#dce9ff] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[#131b2e] text-white shadow-xs'
                : 'bg-[#eff4ff] text-[#45464d] hover:text-[#0b1c30]'
            }`}
          >
            All Rules ({LMPC_2011_RULES.length})
          </button>
          <button
            onClick={() => setSelectedCategory('declarations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedCategory === 'declarations'
                ? 'bg-[#131b2e] text-white shadow-xs'
                : 'bg-[#eff4ff] text-[#45464d] hover:text-[#0b1c30]'
            }`}
          >
            Mandatory Declarations
          </button>
          <button
            onClick={() => setSelectedCategory('pdp')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedCategory === 'pdp'
                ? 'bg-[#131b2e] text-white shadow-xs'
                : 'bg-[#eff4ff] text-[#45464d] hover:text-[#0b1c30]'
            }`}
          >
            PDP &amp; Font Specs
          </button>
          <button
            onClick={() => setSelectedCategory('units')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedCategory === 'units'
                ? 'bg-[#131b2e] text-white shadow-xs'
                : 'bg-[#eff4ff] text-[#45464d] hover:text-[#0b1c30]'
            }`}
          >
            SI Units &amp; Quantities
          </button>
          <button
            onClick={() => setSelectedCategory('retailsale')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedCategory === 'retailsale'
                ? 'bg-[#131b2e] text-white shadow-xs'
                : 'bg-[#eff4ff] text-[#45464d] hover:text-[#0b1c30]'
            }`}
          >
            MRP &amp; Unit Sale Price
          </button>
          <button
            onClick={() => setSelectedCategory('exemptions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedCategory === 'exemptions'
                ? 'bg-[#131b2e] text-white shadow-xs'
                : 'bg-[#eff4ff] text-[#45464d] hover:text-[#0b1c30]'
            }`}
          >
            Exemptions
          </button>
          <button
            onClick={() => setSelectedCategory('penalties')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedCategory === 'penalties'
                ? 'bg-[#ba1a1a] text-white shadow-xs'
                : 'bg-[#ffdad6]/60 text-[#93000a] hover:bg-[#ffdad6]'
            }`}
          >
            Statutory Penalties
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search LMPC rules, clauses, terms..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#c6c6cd] bg-[#f8f9ff] text-[#0b1c30] placeholder-[#76777d] focus:outline-hidden focus:border-[#006a61]"
          />
          <span className="material-symbols-outlined text-[16px] text-[#76777d] absolute left-2.5 top-2">
            search
          </span>
        </div>
      </div>

      {/* Official Rule 9 Table 1 Statutory Schedule */}
      <div className="bg-white rounded-xl shadow-xs border border-[#dce9ff] p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#eff4ff] gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#eff4ff] text-[#006a61] border border-[#dce9ff]">
                STATUTORY SCHEDULE
              </span>
              <h3 className="font-bold text-sm text-[#0b1c30]">
                Rule 9 — Table 1: Minimum Height of Numerals &amp; Letters
              </h3>
            </div>
            <p className="text-[11px] text-[#76777d] mt-1">
              Statutory prescribed dimensions based on the Area of Principal Display Panel (PDP) under Legal Metrology (Packaged Commodities) Rules, 2011
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-[#f8f9ff] text-[#45464d] border border-[#dce9ff] self-start sm:self-center">
            Standard Reference
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#eff4ff] text-[#45464d] border-b border-[#dce9ff]">
                <th className="p-3 font-semibold">Area of Principal Display Panel (A in cm²)</th>
                <th className="p-3 font-semibold">Min. Height of Numerals (Normal Packages)</th>
                <th className="p-3 font-semibold">Min. Height of Letters (Normal Packages)</th>
                <th className="p-3 font-semibold">Min. Height (Blown, Formed, Moulded, Embossed)</th>
                <th className="p-3 font-semibold">Statutory Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff4ff]">
              <tr className="hover:bg-[#f8f9ff]">
                <td className="p-3 font-mono font-bold text-[#0b1c30]">A ≤ 50 cm²</td>
                <td className="p-3 font-mono font-semibold text-[#006a61]">1.0 mm</td>
                <td className="p-3 font-mono text-[#45464d]">1.0 mm</td>
                <td className="p-3 font-mono font-semibold text-[#ba1a1a]">2.0 mm</td>
                <td className="p-3 text-[11px] text-[#76777d]">Small retail pouches, sachets</td>
              </tr>
              <tr className="hover:bg-[#f8f9ff]">
                <td className="p-3 font-mono font-bold text-[#0b1c30]">50 cm² &lt; A ≤ 100 cm²</td>
                <td className="p-3 font-mono font-semibold text-[#006a61]">1.5 mm</td>
                <td className="p-3 font-mono text-[#45464d]">1.0 mm</td>
                <td className="p-3 font-mono font-semibold text-[#ba1a1a]">2.5 mm</td>
                <td className="p-3 text-[11px] text-[#76777d]">Confectionery, snacks, cosmetic tubes</td>
              </tr>
              <tr className="hover:bg-[#f8f9ff]">
                <td className="p-3 font-mono font-bold text-[#0b1c30]">100 cm² &lt; A ≤ 500 cm²</td>
                <td className="p-3 font-mono font-semibold text-[#006a61]">2.0 mm</td>
                <td className="p-3 font-mono text-[#45464d]">1.5 mm</td>
                <td className="p-3 font-mono font-semibold text-[#ba1a1a]">3.0 mm</td>
                <td className="p-3 text-[11px] text-[#76777d]">Standard food boxes, oil pouches, dairy cartons</td>
              </tr>
              <tr className="hover:bg-[#f8f9ff]">
                <td className="p-3 font-mono font-bold text-[#0b1c30]">500 cm² &lt; A ≤ 2500 cm²</td>
                <td className="p-3 font-mono font-semibold text-[#006a61]">4.0 mm</td>
                <td className="p-3 font-mono text-[#45464d]">2.0 mm</td>
                <td className="p-3 font-mono font-semibold text-[#ba1a1a]">5.0 mm</td>
                <td className="p-3 text-[11px] text-[#76777d]">Large family packs, bulk jars, flour bags</td>
              </tr>
              <tr className="hover:bg-[#f8f9ff]">
                <td className="p-3 font-mono font-bold text-[#0b1c30]">A &gt; 2500 cm²</td>
                <td className="p-3 font-mono font-semibold text-[#006a61]">6.0 mm</td>
                <td className="p-3 font-mono text-[#45464d]">3.0 mm</td>
                <td className="p-3 font-mono font-semibold text-[#ba1a1a]">6.0 mm</td>
                <td className="p-3 text-[11px] text-[#76777d]">Industrial cases, bulk sacks (up to 50 kg)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Rules Registry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRules.map(rule => {
          const isPenalty = rule.category === 'penalties';
          const isPdp = rule.category === 'pdp';
          const isRetail = rule.category === 'retailsale';

          return (
            <div
              key={rule.id}
              className={`p-5 rounded-xl bg-white border shadow-xs flex flex-col justify-between transition-all ${
                isPenalty
                  ? 'border-[#ffdad6] hover:border-[#ba1a1a]'
                  : 'border-[#dce9ff] hover:border-[#b0cdfa]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                        isPenalty
                          ? 'bg-[#ffdad6] text-[#93000a]'
                          : isPdp
                          ? 'bg-[#eff4ff] text-[#006a61]'
                          : isRetail
                          ? 'bg-[#e5eeff] text-[#131b2e]'
                          : 'bg-[#f0f4fa] text-[#0b1c30]'
                      }`}
                    >
                      {rule.ruleNumber}
                    </span>
                    <span className="text-[10px] text-[#76777d] font-mono">{rule.chapter}</span>
                  </div>

                  {rule.scheduleReference && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f8f9ff] text-[#45464d] border border-[#dce9ff]">
                      {rule.scheduleReference}
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-[#0b1c30] mb-2">{rule.title}</h4>

                <p className="text-xs text-[#45464d] leading-relaxed mb-3">
                  {rule.statutorySummary}
                </p>

                <div className="space-y-1.5 border-t border-[#eff4ff] pt-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#76777d]">
                    Statutory Provisions &amp; Clauses:
                  </span>
                  <ul className="space-y-1 text-xs text-[#0b1c30]">
                    {rule.keyRequirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#006a61] mt-0.5 shrink-0 text-[13px]">•</span>
                        <span className="leading-snug">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {rule.enforcementNotes && (
                <div className="mt-3 pt-2.5 border-t border-[#eff4ff] flex items-start gap-1.5 text-[11px] text-[#ba1a1a] font-medium">
                  <span className="material-symbols-outlined text-[14px] shrink-0 mt-0.5">
                    info
                  </span>
                  <span>{rule.enforcementNotes}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
