import React, { useState, useMemo, useEffect } from 'react';
import { NavigationTab, VerifiedItem, SampleLabel } from '../types';
import { Language } from '../utils/translations';
import { packsureApi, BackendStats } from '../utils/api';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
  items?: VerifiedItem[];
  samples?: SampleLabel[];
  lang?: Language;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  items = [],
  samples = [],
  lang = 'EN',
}) => {
  const [timeRange, setTimeRange] = useState<'ALL' | '7D' | '30D'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [backendStats, setBackendStats] = useState<BackendStats | null>(null);

  useEffect(() => {
    let mounted = true;
    packsureApi.getStats().then(stats => {
      if (mounted) setBackendStats(stats);
    }).catch(() => {
      // Backend offline, fallback to local data
    });
    return () => { mounted = false; };
  }, [items.length]);

  // Available categories
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    items.forEach(item => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats);
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    const now = Date.now();
    return items.filter(item => {
      if (categoryFilter !== 'ALL') {
        const itemCat = item.category || 'General';
        if (itemCat !== categoryFilter && !item.commodity.toLowerCase().includes(categoryFilter.toLowerCase())) {
          return false;
        }
      }

      if (timeRange === '7D') {
        const itemTime = new Date(item.timestamp).getTime();
        if (!isNaN(itemTime) && itemTime < now - 7 * 24 * 60 * 60 * 1000) {
          return false;
        }
      } else if (timeRange === '30D') {
        const itemTime = new Date(item.timestamp).getTime();
        if (!isNaN(itemTime) && itemTime < now - 30 * 24 * 60 * 60 * 1000) {
          return false;
        }
      }

      return true;
    });
  }, [items, timeRange, categoryFilter]);

  // Summary counts
  const totalScanned = filteredItems.length;
  const passedItems = useMemo(
    () => filteredItems.filter(i => i.status === 'COMPLIANT'),
    [filteredItems]
  );
  const issuesItems = useMemo(
    () => filteredItems.filter(i => i.status !== 'COMPLIANT'),
    [filteredItems]
  );

  const passRate = totalScanned > 0 ? Math.round((passedItems.length / totalScanned) * 100) : 0;

  // Grade calculation
  const getQualityGrade = (rate: number, total: number) => {
    if (total === 0) return { grade: '—', label: lang === 'EN' ? 'No Scans Yet' : 'कोई स्कैन नहीं', color: 'text-[#76777d]' };
    if (rate >= 90) return { grade: 'A', label: lang === 'EN' ? 'Excellent Quality' : 'उत्कृष्ट गुणवत्ता', color: 'text-[#006a61]' };
    if (rate >= 75) return { grade: 'B', label: lang === 'EN' ? 'Good Quality' : 'अच्छी गुणवत्ता', color: 'text-[#006a61]' };
    if (rate >= 50) return { grade: 'C', label: lang === 'EN' ? 'Needs Improvement' : 'सुधार की आवश्यकता', color: 'text-[#b45309]' };
    return { grade: 'D', label: lang === 'EN' ? 'Action Required' : 'त्वरित सुधार आवश्यक', color: 'text-[#ba1a1a]' };
  };

  const qualityGrade = getQualityGrade(passRate, totalScanned);

  // Group detected issues in plain layman terms
  const detectedMistakes = useMemo(() => {
    const issues: {
      id: string;
      title: string;
      titleHi: string;
      count: number;
      whatHappened: string;
      whatHappenedHi: string;
      howToFix: string;
      howToFixHi: string;
      icon: string;
    }[] = [
      {
        id: 'font-size',
        title: 'Text Size Too Small',
        titleHi: 'लिखाई का आकार बहुत छोटा है',
        count: 0,
        whatHappened: 'The printed net weight or volume text is too small to read comfortably from a normal distance.',
        whatHappenedHi: 'पैकेट पर वजन या मात्रा बहुत छोटे अक्षरों में लिखी है जिससे ग्राहक इसे आसानी से नहीं पढ़ पाते।',
        howToFix: 'Increase the font height of the net weight (aim for at least 2mm to 4mm tall depending on pack size) on your next packaging print.',
        howToFixHi: 'अगले प्रिंट में वजन/मात्रा का फॉन्ट आकार बढ़ाएं (पैकेट के आकार के आधार पर कम से कम 2mm से 4mm रखें)।',
        icon: 'format_size',
      },
      {
        id: 'unit-price',
        title: 'Missing Unit Price (Price per 100g / 100ml)',
        titleHi: 'प्रति ग्राम / मिलीलीटर मूल्य गायब है',
        count: 0,
        whatHappened: 'Customers cannot see the cost per gram or per 100g to compare value against other brands.',
        whatHappenedHi: 'ग्राहक अन्य उत्पादों से कीमत की तुलना करने के लिए प्रति ग्राम या प्रति 100ml का दाम नहीं देख पा रहे हैं।',
        howToFix: 'Always print the unit sale price (for example: "₹0.50 per gram" or "₹15 per 100ml") right beside the MRP.',
        howToFixHi: 'एमआरपी (MRP) के ठीक बगल में प्रति ग्राम या प्रति 100ml का दाम (उदा. ₹0.50 प्रति ग्राम) अवश्य लिखें।',
        icon: 'payments',
      },
      {
        id: 'mfr-address',
        title: 'Missing Full Address & PIN Code',
        titleHi: 'निर्माता का पूरा पता या पिन कोड गायब',
        count: 0,
        whatHappened: 'The factory address or 6-digit postal PIN code is missing or incomplete on the label.',
        whatHappenedHi: 'लेबल पर कारखाने का पूरा पता या 6-अंकों का पिन कोड अधूरा या अनुपस्थित है।',
        howToFix: 'Print your registered company name, unit street address, city, state, and 6-digit postal PIN code clearly.',
        howToFixHi: 'कंपनी का नाम, कारखाने का पूरा पता, शहर, राज्य और 6-अंकों का पिन कोड स्पष्ट रूप से छापें।',
        icon: 'location_on',
      },
      {
        id: 'customer-care',
        title: 'Missing Customer Care Helpline',
        titleHi: 'कस्टमर केयर हेल्पलाइन नंबर गायब',
        count: 0,
        whatHappened: 'Shoppers have no direct phone number or email to contact for questions or complaints.',
        whatHappenedHi: 'शिकायत या सहायता के लिए कोई संपर्क फोन नंबर या ईमेल आईडी नहीं दी गई है।',
        howToFix: 'Add a customer care line: "For complaints, contact: Customer Care Executive, Phone: 1800-XXX-XXXX, Email: care@brand.com".',
        howToFixHi: 'ग्राहक सेवा विवरण जोड़ें: "शिकायत हेतु संपर्क करें: फोन नंबर और ईमेल आईडी स्पष्ट लिखें"।',
        icon: 'support_agent',
      },
      {
        id: 'pack-date',
        title: 'Packaging Date Not Clear',
        titleHi: 'पैकिंग की तारीख स्पष्ट नहीं है',
        count: 0,
        whatHappened: 'The month and year of packaging is smudged, hidden, or omitted.',
        whatHappenedHi: 'पैकिंग का महीना और वर्ष अस्पष्ट, धुंधला या गायब है।',
        howToFix: 'Ensure month and year of packaging (e.g., "09/2026") are stamped in clean, dark, non-fading ink.',
        howToFixHi: 'पैकिंग का महीना और वर्ष (उदा. 09/2026) साफ और गहरे रंग की स्याही से स्पष्ट छापें।',
        icon: 'event',
      },
    ];

    filteredItems.forEach(item => {
      if (item.verifiedChecks && item.verifiedChecks.length > 0) {
        item.verifiedChecks.forEach(chk => {
          if (chk.result === 'FAIL') {
            const code = chk.ruleCode.toLowerCase();
            const name = chk.checkName.toLowerCase();
            if (code.includes('6(1)(c)') || code.includes('rule 9') || name.includes('font') || name.includes('height')) {
              issues[0].count += 1;
            } else if (code.includes('6(1)(s)') || name.includes('usp') || name.includes('unit price')) {
              issues[1].count += 1;
            } else if (code.includes('6(1)(a)') || code.includes('6(1)(b)') || name.includes('manufacturer') || name.includes('address')) {
              issues[2].count += 1;
            } else if (code.includes('6(1)(g)') || name.includes('consumer') || name.includes('care') || name.includes('helpline')) {
              issues[3].count += 1;
            } else if (code.includes('6(1)(d)') || name.includes('date') || name.includes('month')) {
              issues[4].count += 1;
            }
          }
        });
      } else if (item.status !== 'COMPLIANT') {
        // Fallback count
        issues[0].count += 1;
      }
    });

    return issues;
  }, [filteredItems]);

  // Product categories breakdown (plain list)
  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    filteredItems.forEach(item => {
      const cat = item.category || 'Packaged Goods';
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [filteredItems]);

  // Helper for simple CSV export
  const handleExportCSV = () => {
    if (filteredItems.length === 0) {
      alert(lang === 'EN' ? 'No scanned products to export.' : 'निर्यात के लिए कोई स्कैन किया हुआ उत्पाद नहीं है।');
      return;
    }

    const headers = [
      'Product Name',
      'Brand',
      'Category',
      'Package Type',
      'Barcode (EAN)',
      'Weight or Volume',
      'Price (INR)',
      'Check Result',
      'Scanned Date',
      'Inspector',
    ];

    const rows = filteredItems.map(item => [
      `"${item.commodity.replace(/"/g, '""')}"`,
      `"${item.brand.replace(/"/g, '""')}"`,
      `"${item.category || 'General'}"`,
      `"${item.packageType}"`,
      `"${item.ean13}"`,
      `"${item.netQtyDeclared}"`,
      item.mrp,
      item.status === 'COMPLIANT' ? 'Passed' : 'Needs Fix',
      `"${item.verifiedAtFormatted || item.timestamp}"`,
      `"${item.officerName || 'Inspector'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PackSure_Packaging_Summary_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Plain-language tip for an item
  const getSimpleItemTip = (item: VerifiedItem) => {
    if (item.status === 'COMPLIANT') {
      return lang === 'EN'
        ? 'All labels are clear and meet standards. Ready for retail shelves.'
        : 'सभी लेबल स्पष्ट हैं और मानकों पर खरे हैं। बिक्री के लिए तैयार।';
    }

    if (item.measuredFontMm < item.requiredFontMm) {
      return lang === 'EN'
        ? `Make weight text taller (currently ${item.measuredFontMm}mm, needs ${item.requiredFontMm}mm).`
        : `वजन का लिखावट बड़ा करें (वर्तमान ${item.measuredFontMm}mm, जरूरत ${item.requiredFontMm}mm)।`;
    }

    if (item.status === 'USP_DISCREPANCY') {
      return lang === 'EN'
        ? 'Add price per gram or per 100ml beside the MRP.'
        : 'एमआरपी के बगल में प्रति ग्राम या प्रति 100ml का दाम जोड़ें।';
    }

    return lang === 'EN'
      ? 'Check that manufacturer address and consumer care phone number are printed.'
      : 'जांचें कि निर्माता का पता और ग्राहक सेवा नंबर छपा हुआ है।';
  };

  return (
    <div className="flex flex-col w-full pb-12 space-y-6">
      {/* Friendly Header & Control Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#dce9ff] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#006a61]"></span>
            <h1 className="text-xl font-bold text-[#0b1c30]">
              {lang === 'EN' ? 'Packaging Quality Dashboard' : 'पैकेजिंग गुणवत्ता डैशबोर्ड'}
            </h1>
          </div>
          <p className="text-xs text-[#45464d] mt-1 max-w-xl">
            {lang === 'EN'
              ? 'A simple overview of all scanned items, whether they passed labeling checks, and easy steps to improve your packaging.'
              : 'स्कैन किए गए सभी सामानों का सरल सारांश, क्या वे लेबलिंग जांच में पास हुए, और अपनी पैकेजिंग को सुधारने के आसान कदम।'}
          </p>
        </div>

        {/* Filter and Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Filter */}
          <div className="flex items-center bg-[#f0f4ff] p-1 rounded-xl text-xs border border-[#dce9ff]">
            <button
              onClick={() => setTimeRange('ALL')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                timeRange === 'ALL'
                  ? 'bg-white text-[#0b1c30] shadow-xs font-semibold'
                  : 'text-[#45464d] hover:text-[#0b1c30]'
              }`}
            >
              {lang === 'EN' ? 'All Time' : 'शुरू से'}
            </button>
            <button
              onClick={() => setTimeRange('7D')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                timeRange === '7D'
                  ? 'bg-white text-[#0b1c30] shadow-xs font-semibold'
                  : 'text-[#45464d] hover:text-[#0b1c30]'
              }`}
            >
              {lang === 'EN' ? 'Last 7 Days' : 'पिछले 7 दिन'}
            </button>
            <button
              onClick={() => setTimeRange('30D')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                timeRange === '30D'
                  ? 'bg-white text-[#0b1c30] shadow-xs font-semibold'
                  : 'text-[#45464d] hover:text-[#0b1c30]'
              }`}
            >
              {lang === 'EN' ? 'Last 30 Days' : 'पिछले 30 दिन'}
            </button>
          </div>

          {/* Category Dropdown */}
          {availableCategories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="text-xs py-2 px-3 rounded-xl border border-[#c6c6cd] bg-white text-[#0b1c30] focus:outline-hidden focus:border-[#006a61]"
            >
              <option value="ALL">
                {lang === 'EN' ? 'All Categories' : 'सभी श्रेणियां'} ({totalScanned})
              </option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

          {/* Export Report */}
          <button
            onClick={handleExportCSV}
            disabled={totalScanned === 0}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              totalScanned > 0
                ? 'bg-white text-[#0b1c30] border-[#c6c6cd] hover:bg-[#f0f4ff]'
                : 'bg-[#f4f5fa] text-[#76777d] border-[#e2e3ea] cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>{lang === 'EN' ? 'Download Report' : 'रिपोर्ट डाउनलोड करें'}</span>
          </button>

          {/* Scan New Item CTA */}
          <button
            onClick={() => onNavigate('new-scan')}
            className="px-4 py-2 bg-[#000000] text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px] text-[#86f2e4]">document_scanner</span>
            <span>{lang === 'EN' ? 'Scan New Item' : 'नया सामान स्कैन करें'}</span>
          </button>
        </div>
      </div>

      {/* 4 Essential Summary Cards in Simple Layman Terms */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Items Scanned */}
        <div className="p-5 rounded-2xl bg-white border border-[#dce9ff] shadow-xs">
          <div className="flex items-center justify-between text-[#45464d] text-xs font-medium">
            <span>{lang === 'EN' ? 'Total Items Scanned' : 'कुल स्कैन किए गए सामान'}</span>
            <div className="w-8 h-8 rounded-full bg-[#f0f4ff] flex items-center justify-center text-[#006a61]">
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-[#0b1c30] mt-2 font-mono">
            {totalScanned}
          </div>
          <p className="text-[11px] text-[#76777d] mt-2">
            {totalScanned > 0
              ? lang === 'EN'
                ? `Checked across ${categoryCounts.length || 1} product types`
                : `${categoryCounts.length || 1} प्रकार के उत्पादों की जांच की गई`
              : lang === 'EN'
              ? 'No packages scanned yet'
              : 'अभी तक कोई सामान स्कैन नहीं हुआ'}
          </p>
        </div>

        {/* 2. Passed Checks */}
        <div className="p-5 rounded-2xl bg-white border border-[#dce9ff] shadow-xs">
          <div className="flex items-center justify-between text-[#45464d] text-xs font-medium">
            <span>{lang === 'EN' ? 'Passed Checks' : 'पास हुए पैकेट'}</span>
            <div className="w-8 h-8 rounded-full bg-[#e6f8f5] flex items-center justify-center text-[#006a61]">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-[#006a61] mt-2 font-mono">
            {passedItems.length}
          </div>
          <p className="text-[11px] text-[#006a61] mt-2 font-medium flex items-center gap-1">
            <span>
              {totalScanned > 0
                ? lang === 'EN'
                  ? `${passRate}% ready for store shelves`
                  : `${passRate}% बिक्री के लिए पूरी तरह तैयार`
                : '—'}
            </span>
          </p>
        </div>

        {/* 3. Items Needing Fixes */}
        <div className="p-5 rounded-2xl bg-white border border-[#dce9ff] shadow-xs">
          <div className="flex items-center justify-between text-[#45464d] text-xs font-medium">
            <span>{lang === 'EN' ? 'Needs Attention' : 'सुधार की आवश्यकता'}</span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${issuesItems.length > 0 ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#f0f4ff] text-[#76777d]'}`}>
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </div>
          </div>
          <div className={`text-3xl font-bold mt-2 font-mono ${issuesItems.length > 0 ? 'text-[#ba1a1a]' : 'text-[#0b1c30]'}`}>
            {issuesItems.length}
          </div>
          <p className={`text-[11px] mt-2 font-medium ${issuesItems.length > 0 ? 'text-[#ba1a1a]' : 'text-[#76777d]'}`}>
            {issuesItems.length > 0
              ? lang === 'EN'
                ? `${issuesItems.length} item(s) have label mistakes to fix`
                : `${issuesItems.length} पैकेट में सुधार की जरूरत है`
              : lang === 'EN'
              ? 'Zero packaging mistakes found!'
              : 'कोई गलती नहीं मिली!'}
          </p>
        </div>

        {/* 4. Overall Packaging Grade */}
        <div className="p-5 rounded-2xl bg-white border border-[#dce9ff] shadow-xs">
          <div className="flex items-center justify-between text-[#45464d] text-xs font-medium">
            <span>{lang === 'EN' ? 'Overall Quality Rating' : 'समग्र गुणवत्ता रेटिंग'}</span>
            <div className="w-8 h-8 rounded-full bg-[#f0f4ff] flex items-center justify-center text-[#006a61]">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-3xl font-bold font-mono ${qualityGrade.color}`}>
              {qualityGrade.grade}
            </span>
            <span className={`text-xs font-semibold ${qualityGrade.color}`}>
              {qualityGrade.label}
            </span>
          </div>
          <p className="text-[11px] text-[#76777d] mt-2">
            {totalScanned > 0
              ? lang === 'EN'
                ? `Based on text size, price, & details`
                : 'फॉन्ट आकार, मूल्य और विवरण पर आधारित'
              : lang === 'EN'
              ? 'Scan packages to see rating'
              : 'रेटिंग देखने के लिए स्कैन करें'}
          </p>
        </div>
      </div>

      {/* Empty State Banner if no items scanned */}
      {totalScanned === 0 && (
        <div className="bg-white border border-[#dce9ff] rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[#f0f4ff] flex items-center justify-center text-[#006a61]">
            <span className="material-symbols-outlined text-[32px]">photo_camera</span>
          </div>
          <h3 className="text-base font-bold text-[#0b1c30]">
            {lang === 'EN' ? 'No Scanned Items Yet' : 'अभी तक कोई सामान स्कैन नहीं हुआ है'}
          </h3>
          <p className="text-xs text-[#45464d] max-w-md">
            {lang === 'EN'
              ? 'Start by scanning your first package label in the scanner terminal. The dashboard will automatically summarize results and give you tips to improve your labels.'
              : 'स्कैनर टर्मिनल में अपना पहला पैकेज लेबल स्कैन करके शुरुआत करें। डैशबोर्ड स्वचालित रूप से परिणामों का सारांश देगा और लेबल सुधारने के आसान सुझाव दिखाएगा।'}
          </p>
          <button
            onClick={() => onNavigate('new-scan')}
            className="mt-2 px-5 py-2.5 rounded-xl bg-[#000000] text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px] text-[#86f2e4]">document_scanner</span>
            <span>{lang === 'EN' ? 'Open Scanner' : 'स्कैनर खोलें'}</span>
          </button>
        </div>
      )}

      {/* Section 1: Simple Visual Overview & Breakdown */}
      {totalScanned > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Visual Pass vs Fix Bar */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-[#dce9ff] p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#0b1c30] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#006a61]">pie_chart</span>
                  <span>{lang === 'EN' ? 'Scan Results Breakdown' : 'जांच परिणामों का विवरण'}</span>
                </h3>
                <span className="text-xs font-bold text-[#006a61] bg-[#e6f8f5] px-2.5 py-0.5 rounded-full">
                  {passRate}% {lang === 'EN' ? 'Passed' : 'पास'}
                </span>
              </div>
              <p className="text-xs text-[#45464d] mt-1">
                {lang === 'EN'
                  ? 'How many scanned packages passed all checks versus packages that need label fixes.'
                  : 'कितने स्कैन किए गए पैकेट पूरी तरह पास हुए और कितनों में सुधार की जरूरत है।'}
              </p>

              {/* Simple Clean Progress Bar */}
              <div className="mt-4">
                <div className="h-4 w-full bg-[#f0f4ff] rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${passRate}%` }}
                    className="bg-[#006a61] h-full transition-all duration-500 rounded-l-full"
                    title={`Passed: ${passRate}%`}
                  ></div>
                  <div
                    style={{ width: `${100 - passRate}%` }}
                    className="bg-[#ba1a1a] h-full transition-all duration-500 rounded-r-full"
                    title={`Needs Fixes: ${100 - passRate}%`}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-xs mt-2 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#006a61]"></span>
                    <span className="text-[#0b1c30]">
                      {lang === 'EN' ? 'Ready for Shelves (Passed)' : 'बिक्री हेतु तैयार (पास)'}:
                    </span>
                    <span className="font-bold text-[#006a61]">{passedItems.length}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#ba1a1a]"></span>
                    <span className="text-[#0b1c30]">
                      {lang === 'EN' ? 'Needs Label Fixes' : 'सुधार की जरूरत'}:
                    </span>
                    <span className="font-bold text-[#ba1a1a]">{issuesItems.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Encouraging Note */}
            <div className="mt-5 p-3 rounded-xl bg-[#f8f9ff] border border-[#eff4ff] text-xs text-[#45464d] flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#006a61] shrink-0 mt-0.5">
                {passRate === 100 ? 'celebration' : 'lightbulb'}
              </span>
              <span>
                {passRate === 100
                  ? lang === 'EN'
                    ? 'Superb! 100% of scanned products have clean, compliant labels with proper font sizes and prices.'
                    : 'बहुत बढ़िया! स्कैन किए गए 100% उत्पादों के लेबल स्पष्ट, सही फॉन्ट आकार और दाम के साथ सही हैं।'
                  : lang === 'EN'
                  ? `Fixing the ${issuesItems.length} flagged package(s) will raise your quality pass rate to 100%. Check the action items below.`
                  : `${issuesItems.length} चिह्नित पैकेटों को ठीक करने से आपका पास दर 100% हो जाएगा। नीचे दिए गए सुझाव देखें।`}
              </span>
            </div>
          </div>

          {/* Product Types / Categories (Simple Pills) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-[#dce9ff] p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#0b1c30] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#006a61]">category</span>
                <span>{lang === 'EN' ? 'Product Types Checked' : 'जांचे गए सामानों के प्रकार'}</span>
              </h3>
              <p className="text-xs text-[#45464d] mt-1">
                {lang === 'EN'
                  ? 'Categories of items scanned during inspections.'
                  : 'निरीक्षण के दौरान स्कैन की गई वस्तुओं की श्रेणियां।'}
              </p>

              {/* Simple categories grid */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {categoryCounts.map(cat => (
                  <div
                    key={cat.name}
                    className="p-2.5 rounded-xl border border-[#eff4ff] bg-[#f8f9ff] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="material-symbols-outlined text-[18px] text-[#006a61]">
                        {cat.name.toLowerCase().includes('oil')
                          ? 'opacity'
                          : cat.name.toLowerCase().includes('dairy') || cat.name.toLowerCase().includes('milk')
                          ? 'water_drop'
                          : cat.name.toLowerCase().includes('snack')
                          ? 'cookie'
                          : cat.name.toLowerCase().includes('grain') || cat.name.toLowerCase().includes('rice')
                          ? 'grain'
                          : 'inventory_2'}
                      </span>
                      <span className="text-xs font-semibold text-[#0b1c30] truncate">{cat.name}</span>
                    </div>
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-white border border-[#e5eeff] text-[#0b1c30]">
                      {cat.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#eff4ff] flex items-center justify-between text-xs text-[#76777d]">
              <span>{lang === 'EN' ? 'Total audited items' : 'कुल जांची गई वस्तुएं'}:</span>
              <span className="font-bold text-[#0b1c30] font-mono">{totalScanned}</span>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: WHAT CAN BE DONE TO IMPROVISE IT (Core Action Plan) */}
      <div className="bg-white rounded-2xl border border-[#dce9ff] p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#eff4ff] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#006a61]"></span>
              <h2 className="text-base font-bold text-[#0b1c30]">
                {lang === 'EN' ? 'How to Improve Your Packaging (Action Guide)' : 'अपनी पैकेजिंग को कैसे सुधारें (मार्गदर्शिका)'}
              </h2>
            </div>
            <p className="text-xs text-[#45464d] mt-1">
              {lang === 'EN'
                ? 'Easy, practical steps to fix label mistakes, make packaging customer-friendly, and pass all inspections.'
                : 'लेबल की गलतियों को ठीक करने, ग्राहकों के अनुकूल बनाने और सभी निरीक्षणों को पास करने के आसान कदम।'}
            </p>
          </div>

          <button
            onClick={() => onNavigate('rule-reference')}
            className="text-xs font-semibold text-[#006a61] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>{lang === 'EN' ? 'Read Packaging Rules' : 'पैकेजिंग नियम पढ़ें'}</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </button>
        </div>

        {/* Dynamic Action Items based on detected issues */}
        {issuesItems.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#ba1a1a] flex items-center gap-1.5 uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">priority_high</span>
              <span>
                {lang === 'EN'
                  ? 'Direct Fixes Needed for Flagged Packages'
                  : 'चिह्नित पैकेटों के लिए तत्काल सुधार'}
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {detectedMistakes
                .filter(m => m.count > 0)
                .map(mistake => (
                  <div
                    key={mistake.id}
                    className="p-4 rounded-xl border border-[#ffdad6] bg-[#fff8f7] flex flex-col justify-between space-y-2"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]">{mistake.icon}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-[#0b1c30]">
                            {lang === 'EN' ? mistake.title : mistake.titleHi}
                          </h4>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#ba1a1a] text-white">
                            {mistake.count} {lang === 'EN' ? 'pack(s)' : 'पैकेट'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#45464d] mt-1">
                          {lang === 'EN' ? mistake.whatHappened : mistake.whatHappenedHi}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 p-2.5 rounded-lg bg-white border border-[#ffdad6] text-xs text-[#0b1c30]">
                      <div className="font-semibold text-[#006a61] flex items-center gap-1 mb-0.5">
                        <span className="material-symbols-outlined text-[14px]">task_alt</span>
                        <span>{lang === 'EN' ? 'How to fix it:' : 'इसे कैसे ठीक करें:'}</span>
                      </div>
                      <p className="text-[11px] text-[#45464d]">
                        {lang === 'EN' ? mistake.howToFix : mistake.howToFixHi}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 4 Golden Everyday Rules for Perfect Packaging (Layman Guide) */}
        <div>
          <h3 className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider mb-3">
            {lang === 'EN'
              ? '4 Golden Rules for Every Package Label'
              : 'हर पैकेज लेबल के लिए 4 मुख्य नियम'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Rule 1: Text Size */}
            <div className="p-3.5 rounded-xl border border-[#eff4ff] bg-[#f8f9ff] flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-white border border-[#dce9ff] text-[#006a61] flex items-center justify-center mb-2 shadow-xs">
                  <span className="material-symbols-outlined text-[18px]">format_size</span>
                </div>
                <h4 className="text-xs font-bold text-[#0b1c30]">
                  {lang === 'EN' ? '1. Big, Legible Quantity' : '1. बड़ा और साफ वजन'}
                </h4>
                <p className="text-[11px] text-[#45464d] mt-1">
                  {lang === 'EN'
                    ? 'Print net weight/volume clearly in bold, contrasting ink. Never make it smaller than 2mm to 4mm.'
                    : 'वजन या मात्रा को गहरे और बड़े अक्षरों में छापें। इसे 2mm से 4mm से छोटा कभी न रखें।'}
                </p>
              </div>
              <span className="text-[10px] font-semibold text-[#006a61] mt-3">
                {lang === 'EN' ? '✔ Easy to read for shoppers' : '✔ ग्राहकों के लिए पढ़ने में आसान'}
              </span>
            </div>

            {/* Rule 2: Price and Unit Price */}
            <div className="p-3.5 rounded-xl border border-[#eff4ff] bg-[#f8f9ff] flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-white border border-[#dce9ff] text-[#006a61] flex items-center justify-center mb-2 shadow-xs">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                </div>
                <h4 className="text-xs font-bold text-[#0b1c30]">
                  {lang === 'EN' ? '2. Clear Price & Per-Gram Cost' : '2. स्पष्ट मूल्य और इकाई दर'}
                </h4>
                <p className="text-[11px] text-[#45464d] mt-1">
                  {lang === 'EN'
                    ? 'Always state "MRP (incl. of all taxes)" and print the unit cost (like ₹0.50/g) right next to it.'
                    : 'हमेशा "एमआरपी (सभी कर सहित)" लिखें और उसके पास प्रति ग्राम/मिलीलीटर का भाव अवश्य दें।'}
                </p>
              </div>
              <span className="text-[10px] font-semibold text-[#006a61] mt-3">
                {lang === 'EN' ? '✔ Fair price transparency' : '✔ सही मूल्य पारदर्शिता'}
              </span>
            </div>

            {/* Rule 3: Complete Address */}
            <div className="p-3.5 rounded-xl border border-[#eff4ff] bg-[#f8f9ff] flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-white border border-[#dce9ff] text-[#006a61] flex items-center justify-center mb-2 shadow-xs">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                </div>
                <h4 className="text-xs font-bold text-[#0b1c30]">
                  {lang === 'EN' ? '3. Full Address & PIN' : '3. पूरा पता और पिन कोड'}
                </h4>
                <p className="text-[11px] text-[#45464d] mt-1">
                  {lang === 'EN'
                    ? 'List company name, physical factory premises, and valid 6-digit postal PIN code.'
                    : 'कंपनी का नाम, कारखाने का वास्तविक पता और 6-अंकों का डाक पिन कोड लिखें।'}
                </p>
              </div>
              <span className="text-[10px] font-semibold text-[#006a61] mt-3">
                {lang === 'EN' ? '✔ Builds genuine buyer trust' : '✔ ग्राहकों में विश्वास बढ़ाता है'}
              </span>
            </div>

            {/* Rule 4: Helpline & Date */}
            <div className="p-3.5 rounded-xl border border-[#eff4ff] bg-[#f8f9ff] flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-white border border-[#dce9ff] text-[#006a61] flex items-center justify-center mb-2 shadow-xs">
                  <span className="material-symbols-outlined text-[18px]">support_agent</span>
                </div>
                <h4 className="text-xs font-bold text-[#0b1c30]">
                  {lang === 'EN' ? '4. Support Phone & Date' : '4. हेल्पलाइन और पैकिंग तिथि'}
                </h4>
                <p className="text-[11px] text-[#45464d] mt-1">
                  {lang === 'EN'
                    ? 'Provide a working helpline phone or email, along with the clearly stamped packaging month/year.'
                    : 'एक चालू हेल्पलाइन नंबर या ईमेल, और पैकिंग का स्पष्ट महीना/वर्ष अवश्य छापें।'}
                </p>
              </div>
              <span className="text-[10px] font-semibold text-[#006a61] mt-3">
                {lang === 'EN' ? '✔ Easy consumer support' : '✔ आसान ग्राहक सहायता'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Essential Scanned Items Feed (Simplified) */}
      <div className="bg-white rounded-2xl border border-[#dce9ff] p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#eff4ff]">
          <div>
            <h3 className="font-bold text-sm text-[#0b1c30]">
              {lang === 'EN' ? 'Recently Scanned Items' : 'हाल ही में स्कैन किए गए सामान'}
            </h3>
            <p className="text-xs text-[#45464d]">
              {lang === 'EN'
                ? 'Quick view of recent packages with status and suggestions.'
                : 'हाल के पैकेटों का परिणाम और त्वरित सुझाव।'}
            </p>
          </div>

          <button
            onClick={() => onNavigate('verified-items')}
            className="text-xs font-semibold text-[#006a61] hover:underline flex items-center gap-1"
          >
            <span>{lang === 'EN' ? 'View All Scanned Items' : 'सभी स्कैन किए गए सामान देखें'}</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </button>
        </div>

        {filteredItems.length > 0 ? (
          <div className="divide-y divide-[#eff4ff] mt-2">
            {filteredItems.slice(0, 6).map(item => {
              const isCompliant = item.status === 'COMPLIANT';
              const tip = getSimpleItemTip(item);

              return (
                <div
                  key={item.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#fcfdff] transition-colors rounded-xl px-2"
                >
                  {/* Left: Product info */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isCompliant ? 'bg-[#e6f8f5] text-[#006a61]' : 'bg-[#ffdad6] text-[#ba1a1a]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isCompliant ? 'check_circle' : 'build'}
                      </span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-xs text-[#0b1c30]">{item.commodity}</span>
                        <span className="text-[11px] text-[#76777d]">• {item.brand}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#f0f4ff] text-[#45464d] font-mono">
                          {item.netQtyDeclared}
                        </span>
                        <span className="text-[10px] font-semibold text-[#0b1c30]">
                          ₹{item.mrp.toFixed(2)}
                        </span>
                      </div>

                      {/* Plain-Language Improvement Tip */}
                      <p className={`text-[11px] mt-1 flex items-center gap-1 ${isCompliant ? 'text-[#006a61]' : 'text-[#ba1a1a] font-medium'}`}>
                        <span className="material-symbols-outlined text-[13px]">
                          {isCompliant ? 'verified' : 'arrow_right'}
                        </span>
                        <span>{tip}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right: Badge & Time */}
                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <span className="text-[11px] text-[#76777d]">
                      {item.verifiedAtFormatted || new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                        isCompliant
                          ? 'bg-[#86f2e4] text-[#00201d]'
                          : 'bg-[#ffdad6] text-[#93000a]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {isCompliant ? 'check' : 'warning'}
                      </span>
                      <span>{isCompliant ? (lang === 'EN' ? 'Passed' : 'पास') : (lang === 'EN' ? 'Needs Fix' : 'सुधारें')}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-[#76777d]">
            <span className="material-symbols-outlined text-[32px] text-[#c6c6cd] mb-1">
              inventory_2
            </span>
            <div className="text-xs font-semibold text-[#45464d]">
              {lang === 'EN' ? 'No items scanned yet' : 'अभी तक कोई सामान स्कैन नहीं हुआ है'}
            </div>
            <p className="text-[11px] mt-0.5">
              {lang === 'EN' ? 'Click "Scan New Item" above to test your first package label.' : 'अपना पहला पैकेज लेबल जांचने के लिए ऊपर "नया सामान स्कैन करें" पर क्लिक करें।'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
