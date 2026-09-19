/**
 * Pre-rendered SVG specimen labels for benchmark commodities
 * ensuring realistic packaging visual representation in the inspection terminal.
 */

function encodeSvg(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_SPECIMEN_IMAGES: Record<string, string> = {
  'sample-1': encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" width="100%" height="100%">
      <defs>
        <linearGradient id="oilBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff8e1"/>
          <stop offset="100%" stop-color="#ffecb3"/>
        </linearGradient>
      </defs>
      <rect width="400" height="260" rx="8" fill="url(#oilBg)" stroke="#fbc02d" stroke-width="2"/>
      <!-- Header Banner -->
      <rect x="0" y="0" width="400" height="42" fill="#f57f17"/>
      <text x="200" y="27" font-family="sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="1">NUTRIGOLD REFINED SUNFLOWER OIL</text>
      
      <!-- Graphic emblem -->
      <circle cx="65" cy="115" r="32" fill="#ffd54f" stroke="#f57f17" stroke-width="2"/>
      <path d="M65,95 L68,107 L80,107 L70,114 L74,126 L65,119 L56,126 L60,114 L50,107 L62,107 Z" fill="#e65100"/>
      <text x="65" y="160" font-family="sans-serif" font-size="10" font-weight="bold" fill="#bf360c" text-anchor="middle">100% PURE</text>

      <!-- Principal Display Panel (PDP) Details -->
      <rect x="120" y="55" width="265" height="125" rx="6" fill="#ffffff" stroke="#e0e0e0"/>
      <text x="135" y="76" font-family="sans-serif" font-size="11" font-weight="bold" fill="#333333">COMMODITY: EDIBLE VEGETABLE OIL</text>
      
      <!-- Net Quantity box (Rule 6 infraction: 2.1mm measured font) -->
      <rect x="135" y="86" width="235" height="34" rx="4" fill="#fff3e0" stroke="#ffb74d"/>
      <text x="145" y="102" font-family="sans-serif" font-size="9" font-weight="bold" fill="#e65100">NET QUANTITY / शुद्ध मात्रा :</text>
      <text x="145" y="115" font-family="monospace" font-size="11" font-weight="bold" fill="#b71c1c">1000 mL (1 L) [Measured: 2.1mm]</text>

      <!-- MRP & USP -->
      <text x="135" y="138" font-family="sans-serif" font-size="11" font-weight="bold" fill="#212121">MRP: ₹ 175.00</text>
      <text x="235" y="138" font-family="sans-serif" font-size="9" fill="#616161">(INCL. OF ALL TAXES)</text>
      <text x="135" y="153" font-family="monospace" font-size="10" fill="#00695c">USP: ₹ 0.175 / mL</text>
      <text x="135" y="168" font-family="sans-serif" font-size="8" fill="#757575">Mfd by: NutriAgro Foods Ltd, Phase-II, Okhla, New Delhi - 110020</text>

      <!-- Barcode area -->
      <rect x="15" y="195" width="370" height="50" rx="4" fill="#ffffff" stroke="#c6c6cd"/>
      <!-- Barcode stripes -->
      <path d="M30,205 v30 M33,205 v30 M38,205 v30 M42,205 v30 M47,205 v30 M53,205 v30 M57,205 v30 M63,205 v30 M70,205 v30 M74,205 v30 M81,205 v30 M88,205 v30 M95,205 v30 M101,205 v30 M108,205 v30 M115,205 v30 M120,205 v30 M126,205 v30" stroke="#212121" stroke-width="2.5"/>
      <text x="80" y="243" font-family="monospace" font-size="9" fill="#424242">8 901030 491023</text>
      <text x="180" y="215" font-family="sans-serif" font-size="9" font-weight="bold" fill="#37474f">BATCH NO: NG-2026-09A</text>
      <text x="180" y="228" font-family="sans-serif" font-size="9" fill="#37474f">MFD: 09/2026 &bull; BEST BEFORE 9 MONTHS</text>
      <text x="180" y="240" font-family="sans-serif" font-size="8" fill="#00695c">Consumer Care: 1800-11-2099 / care@nutrigold.in</text>
    </svg>
  `),

  'sample-2': encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" width="100%" height="100%">
      <rect width="400" height="260" rx="8" fill="#f0fdf4" stroke="#86efac" stroke-width="2"/>
      <rect x="0" y="0" width="400" height="42" fill="#0284c7"/>
      <text x="200" y="27" font-family="sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="1">DAIRYPURE FULL CREAM MILK</text>
      
      <!-- Milk drop emblem -->
      <circle cx="65" cy="115" r="32" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/>
      <path d="M65,95 C65,95 80,115 80,125 A15,15 0 0 1 50,125 C50,115 65,95 65,95 Z" fill="#0284c7"/>
      <text x="65" y="160" font-family="sans-serif" font-size="10" font-weight="bold" fill="#0369a1" text-anchor="middle">PASTEURISED</text>

      <!-- Principal Display Panel (PDP) Details -->
      <rect x="120" y="55" width="265" height="125" rx="6" fill="#ffffff" stroke="#bbf7d0"/>
      <text x="135" y="76" font-family="sans-serif" font-size="11" font-weight="bold" fill="#15803d">PASTEURISED STANDARDISED MILK</text>
      
      <!-- Net Quantity box -->
      <rect x="135" y="86" width="235" height="34" rx="4" fill="#f0fdf4" stroke="#4ade80"/>
      <text x="145" y="102" font-family="sans-serif" font-size="9" font-weight="bold" fill="#166534">NET QUANTITY / शुद्ध मात्रा :</text>
      <text x="145" y="115" font-family="monospace" font-size="11" font-weight="bold" fill="#15803d">500 mL [Prescribed font: 3.2mm - PASS]</text>

      <!-- MRP & USP -->
      <text x="135" y="138" font-family="sans-serif" font-size="11" font-weight="bold" fill="#0f172a">MRP: ₹ 34.00</text>
      <text x="220" y="138" font-family="sans-serif" font-size="9" fill="#64748b">(INCL. ALL TAXES)</text>
      <text x="135" y="153" font-family="monospace" font-size="10" fill="#0284c7">USP: ₹ 0.068 / mL (MATCH CONFIRMED)</text>
      <text x="135" y="168" font-family="sans-serif" font-size="8" fill="#64748b">FSSAI Lic. 10019011002231 &bull; DairyPure Co-op, Anand, Gujarat</text>

      <!-- Barcode area -->
      <rect x="15" y="195" width="370" height="50" rx="4" fill="#ffffff" stroke="#cbd5e1"/>
      <path d="M30,205 v30 M34,205 v30 M38,205 v30 M45,205 v30 M50,205 v30 M55,205 v30 M62,205 v30 M68,205 v30 M75,205 v30 M82,205 v30 M90,205 v30 M98,205 v30 M105,205 v30 M112,205 v30 M120,205 v30" stroke="#0f172a" stroke-width="2.5"/>
      <text x="75" y="243" font-family="monospace" font-size="9" fill="#334155">8 901262 018241</text>
      <text x="180" y="215" font-family="sans-serif" font-size="9" font-weight="bold" fill="#1e293b">PKD ON: 18 SEP 2026 04:30 AM</text>
      <text x="180" y="228" font-family="sans-serif" font-size="9" fill="#334155">USE WITHIN 48 HOURS OF PACKAGING</text>
      <text x="180" y="240" font-family="sans-serif" font-size="8" fill="#166534">Compliant with LM (Packaged Commodities) Rules 2011</text>
    </svg>
  `),

  'sample-3': encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" width="100%" height="100%">
      <rect width="400" height="260" rx="8" fill="#fefce8" stroke="#ca8a04" stroke-width="2"/>
      <rect x="0" y="0" width="400" height="42" fill="#713f12"/>
      <text x="200" y="27" font-family="sans-serif" font-size="16" font-weight="bold" fill="#fef08a" text-anchor="middle" letter-spacing="1">HERITAGE TRADITIONAL BASMATI RICE</text>
      
      <!-- Graphic emblem -->
      <circle cx="65" cy="115" r="32" fill="#fef08a" stroke="#a16207" stroke-width="2"/>
      <text x="65" y="119" font-family="sans-serif" font-size="20" text-anchor="middle">🌾</text>
      <text x="65" y="160" font-family="sans-serif" font-size="10" font-weight="bold" fill="#854d0e" text-anchor="middle">AGED 2 YEARS</text>

      <!-- Principal Display Panel (PDP) Details -->
      <rect x="120" y="55" width="265" height="125" rx="6" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="135" y="76" font-family="sans-serif" font-size="11" font-weight="bold" fill="#854d0e">COMMODITY: PREMIUM GRAIN</text>
      
      <!-- Net Quantity box -->
      <rect x="135" y="86" width="235" height="34" rx="4" fill="#fef9c3" stroke="#facc15"/>
      <text x="145" y="102" font-family="sans-serif" font-size="9" font-weight="bold" fill="#713f12">NET QUANTITY / शुद्ध मात्रा :</text>
      <text x="145" y="115" font-family="monospace" font-size="11" font-weight="bold" fill="#713f12">5.00 kg [Prescribed: 6.0mm &bull; OK]</text>

      <!-- MRP & USP -->
      <text x="135" y="138" font-family="sans-serif" font-size="11" font-weight="bold" fill="#1c1917">MRP: ₹ 540.00</text>
      <text x="225" y="138" font-family="sans-serif" font-size="9" fill="#78716c">(INCL. ALL TAXES)</text>
      <text x="135" y="153" font-family="monospace" font-size="10" fill="#854d0e">USP: ₹ 108.00 / kg</text>
      <!-- Violation callout: Missing consumer care helpline -->
      <text x="135" y="168" font-family="sans-serif" font-size="8" font-weight="bold" fill="#dc2626">⚠️ RULE 6(1)(e) VIOLATION: NO HELPLINE / EMAIL</text>

      <!-- Barcode area -->
      <rect x="15" y="195" width="370" height="50" rx="4" fill="#ffffff" stroke="#cbd5e1"/>
      <path d="M30,205 v30 M35,205 v30 M42,205 v30 M48,205 v30 M56,205 v30 M63,205 v30 M71,205 v30 M79,205 v30 M88,205 v30 M96,205 v30 M104,205 v30 M113,205 v30 M120,205 v30" stroke="#1c1917" stroke-width="2.5"/>
      <text x="75" y="243" font-family="monospace" font-size="9" fill="#44403c">8 901502 409180</text>
      <text x="180" y="215" font-family="sans-serif" font-size="9" font-weight="bold" fill="#292524">LOT: HR-2026-GR9</text>
      <text x="180" y="228" font-family="sans-serif" font-size="9" fill="#57534e">Packed by: Heritage Rice Mill, Karnal, Haryana</text>
      <text x="180" y="240" font-family="sans-serif" font-size="8" fill="#dc2626">Consumer grievance contact absent on package</text>
    </svg>
  `),

  'sample-4': encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" width="100%" height="100%">
      <rect width="400" height="260" rx="8" fill="#fff1f2" stroke="#f43f5e" stroke-width="2"/>
      <rect x="0" y="0" width="400" height="42" fill="#be123c"/>
      <text x="200" y="27" font-family="sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="1">SNACKBURST SALTED CHIPS</text>
      
      <!-- Graphic emblem -->
      <circle cx="65" cy="115" r="32" fill="#ffe4e6" stroke="#e11d48" stroke-width="2"/>
      <text x="65" y="122" font-family="sans-serif" font-size="22" text-anchor="middle">🥔</text>
      <text x="65" y="160" font-family="sans-serif" font-size="9" font-weight="bold" fill="#be123c" text-anchor="middle">CRISPY SALTED</text>

      <!-- Principal Display Panel (PDP) Details -->
      <rect x="120" y="55" width="265" height="125" rx="6" fill="#ffffff" stroke="#fecdd3"/>
      <text x="135" y="76" font-family="sans-serif" font-size="11" font-weight="bold" fill="#881337">POTATO CHIPS &bull; READY TO EAT</text>
      
      <!-- Net Quantity box -->
      <rect x="135" y="86" width="235" height="34" rx="4" fill="#fff1f2" stroke="#fda4af"/>
      <text x="145" y="102" font-family="sans-serif" font-size="9" font-weight="bold" fill="#9f1239">NET QUANTITY / शुद्ध मात्रा :</text>
      <text x="145" y="115" font-family="monospace" font-size="11" font-weight="bold" fill="#881337">85 g [Nitrogen Flushed Foil Pouch]</text>

      <!-- MRP & USP (Infraction: Declared 0.41 vs Calculated 0.47) -->
      <text x="135" y="138" font-family="sans-serif" font-size="11" font-weight="bold" fill="#0f172a">MRP: ₹ 40.00</text>
      <text x="220" y="138" font-family="sans-serif" font-size="9" fill="#64748b">(INCL. OF ALL TAXES)</text>
      <text x="135" y="153" font-family="monospace" font-size="10" font-weight="bold" fill="#e11d48">DECLARED USP: ₹ 0.41 / g (MISMATCH!)</text>
      <text x="135" y="168" font-family="sans-serif" font-size="8" fill="#be123c">STATUTORY CALCULATION: ₹40 ÷ 85 g = ₹ 0.47 / g</text>

      <!-- Barcode area -->
      <rect x="15" y="195" width="370" height="50" rx="4" fill="#ffffff" stroke="#cbd5e1"/>
      <path d="M30,205 v30 M36,205 v30 M41,205 v30 M49,205 v30 M55,205 v30 M64,205 v30 M72,205 v30 M80,205 v30 M89,205 v30 M97,205 v30 M104,205 v30 M112,205 v30 M120,205 v30" stroke="#0f172a" stroke-width="2.5"/>
      <text x="75" y="243" font-family="monospace" font-size="9" fill="#334155">8 901725 330198</text>
      <text x="180" y="215" font-family="sans-serif" font-size="9" font-weight="bold" fill="#1e293b">PKD: SEP 2026 &bull; EXP: MAR 2027</text>
      <text x="180" y="228" font-family="sans-serif" font-size="9" fill="#334155">Mfg by: SnackBurst Foods Pvt Ltd, Pune</text>
      <text x="180" y="240" font-family="sans-serif" font-size="8" fill="#e11d48">Rule 6(1)(s) Unit Sale Price disparity detected</text>
    </svg>
  `),
};

export function getSpecimenImageUrl(sampleId: string): string | undefined {
  return SAMPLE_SPECIMEN_IMAGES[sampleId];
}

export function createSpecimenSvgDataUrl(
  brand: string,
  commodity: string,
  netQty: string,
  mrp: number,
  usp: string,
  ean13: string,
  accentColor: string = '#006a61'
): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" width="100%" height="100%">
      <rect width="400" height="250" rx="8" fill="#f8f9fa" stroke="${accentColor}" stroke-width="2"/>
      <rect x="0" y="0" width="400" height="42" fill="${accentColor}"/>
      <text x="200" y="27" font-family="sans-serif" font-size="15" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="1">${brand.toUpperCase()} - ${commodity.toUpperCase()}</text>
      
      <!-- Details Panel -->
      <rect x="20" y="55" width="360" height="120" rx="6" fill="#ffffff" stroke="#e0e0e0"/>
      <text x="35" y="80" font-family="sans-serif" font-size="12" font-weight="bold" fill="#212121">COMMODITY: ${commodity}</text>
      <text x="35" y="100" font-family="sans-serif" font-size="11" fill="#424242">NET QUANTITY / शुद्ध मात्रा: <tspan font-weight="bold" fill="${accentColor}">${netQty}</tspan></text>
      <text x="35" y="122" font-family="sans-serif" font-size="11" font-weight="bold" fill="#1b5e20">MRP: ₹ ${mrp.toFixed(2)} (INCL. OF ALL TAXES)</text>
      <text x="35" y="142" font-family="monospace" font-size="11" fill="#00695c">UNIT SALE PRICE: ${usp}</text>
      <text x="35" y="162" font-family="sans-serif" font-size="9" fill="#757575">Consumer Redressal Helpline: 1800-11-2099 • complaints@packsure.gov.in</text>

      <!-- Barcode Bar -->
      <rect x="20" y="185" width="360" height="50" rx="4" fill="#ffffff" stroke="#c6c6cd"/>
      <path d="M35,195 v30 M38,195 v30 M42,195 v30 M48,195 v30 M53,195 v30 M60,195 v30 M66,195 v30 M73,195 v30 M80,195 v30 M86,195 v30 M92,195 v30 M99,195 v30 M105,195 v30 M112,195 v30 M120,195 v30" stroke="#212121" stroke-width="2.5"/>
      <text x="75" y="233" font-family="monospace" font-size="9" fill="#424242">${ean13}</text>
      <text x="160" y="208" font-family="sans-serif" font-size="9" font-weight="bold" fill="#37474f">STATUTORY METROLOGY SPECIMEN</text>
      <text x="160" y="222" font-family="sans-serif" font-size="8" fill="#546e7a">Legal Metrology (Packaged Commodities) Rules, 2011</text>
    </svg>
  `;
  return encodeSvg(svg);
}

