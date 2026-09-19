export type Language = 'EN' | 'HI';

export interface TranslationStrings {
  govOfIndia: string;
  ministryName: string;
  deptName: string;
  divisionName: string;
  portalSubtitle: string;
  productName: string;
  productTagline: string;
  gatewayActive: string;
  officerRole: string;
  officerZone: string;
  nchHelpline: string;

  // Navigation
  navDashboard: string;
  navNewScan: string;
  navVerifiedItems: string;
  navHistory: string;
  navRuleReference: string;

  // Terminal modes
  modeStandard: string;
  modeBatch: string;
  modeCalibration: string;

  // Verified items
  verifiedItemsTitle: string;
  verifiedItemsSubtitle: string;
  emptyVerifiedTitle: string;
  emptyVerifiedDesc: string;
  scanNowBtn: string;
  scannedAtLabel: string;
  rulesVerifiedLabel: string;
  clearAllBtn: string;

  // Calibration
  calibrationTitle: string;
  calibrationSubtitle: string;
  targetSelectionLabel: string;
  rulerOption: string;
  coinOption: string;
  calibratedStatus: string;
  calibrateBtn: string;
  calibratedNotice: string;
}

export const translations: Record<Language, TranslationStrings> = {
  EN: {
    govOfIndia: 'भारत सरकार | Government of India',
    ministryName: 'Ministry of Consumer Affairs, Food & Public Distribution',
    deptName: 'DEPARTMENT OF CONSUMER AFFAIRS',
    divisionName: 'Legal Metrology Division',
    portalSubtitle: 'LMPC Rules, 2011 Verification System',
    productName: 'PackSure',
    productTagline: 'Statutory Packaging Verification System',
    gatewayActive: 'NIC Gateway Active',
    officerRole: 'Legal Metrology Officer (FEU-4)',
    officerZone: 'Northern Region (Delhi HQ)',
    nchHelpline: 'NCH: 1915',

    navDashboard: 'Dashboard',
    navNewScan: 'New Scan',
    navVerifiedItems: 'Verified Items',
    navHistory: 'History',
    navRuleReference: 'Rule Reference',

    modeStandard: 'Standard Scan',
    modeBatch: 'Batch Cargo',
    modeCalibration: 'Calibration',

    verifiedItemsTitle: 'Verified Items',
    verifiedItemsSubtitle: 'List of recently scanned commodities and the statutory rules verified in them.',
    emptyVerifiedTitle: 'No Items Verified Yet',
    emptyVerifiedDesc: 'When you scan or upload an item in the New Scan terminal, it will appear here showing its scan time and verified rules.',
    scanNowBtn: 'Scan An Item',
    scannedAtLabel: 'Scanned at',
    rulesVerifiedLabel: 'Rules Verified',
    clearAllBtn: 'Clear List',

    calibrationTitle: 'Camera Calibration',
    calibrationSubtitle: 'Quick scale check to ensure accurate millimeter measurements for Rule 9 font height.',
    targetSelectionLabel: 'Reference Target',
    rulerOption: 'Standard Ruler (10 mm)',
    coinOption: '₹10 Standard Coin (27 mm)',
    calibratedStatus: 'Calibrated (1.0 mm accurate)',
    calibrateBtn: 'Calibrate Now',
    calibratedNotice: 'Camera scale is calibrated and ready for LMPC inspections.',
  },
  HI: {
    govOfIndia: 'भारत सरकार | Government of India',
    ministryName: 'उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय',
    deptName: 'उपभोक्ता मामले विभाग',
    divisionName: 'विधिक मापविज्ञान प्रभाग',
    portalSubtitle: 'एलएमपीसी नियम, 2011 सत्यापन प्रणाली',
    productName: 'पैकश्योर (PackSure)',
    productTagline: 'वैधानिक पैकेजिंग सत्यापन प्रणाली',
    gatewayActive: 'एनआईसी गेटवे सक्रिय',
    officerRole: 'विधिक मापविज्ञान अधिकारी (FEU-4)',
    officerZone: 'उत्तरी क्षेत्र (दिल्ली मुख्यालय)',
    nchHelpline: 'राष्ट्रीय हेल्पलाइन: 1915',

    navDashboard: 'डैशबोर्ड',
    navNewScan: 'नया स्कैन',
    navVerifiedItems: 'सत्यापित वस्तुएं',
    navHistory: 'इतिहास',
    navRuleReference: 'नियम संदर्भ',

    modeStandard: 'मानक स्कैन',
    modeBatch: 'बैच कार्गो',
    modeCalibration: 'अंशांकन (कैलिब्रेशन)',

    verifiedItemsTitle: 'सत्यापित वस्तुएं',
    verifiedItemsSubtitle: 'हाल ही में स्कैन की गई वस्तुओं और उनमें सत्यापित वैधानिक नियमों की सूची।',
    emptyVerifiedTitle: 'अभी तक कोई वस्तु सत्यापित नहीं है',
    emptyVerifiedDesc: 'जब आप नए स्कैन टर्मिनल में कोई वस्तु स्कैन या अपलोड करेंगे, तो वह उसके समय और सत्यापित नियमों के साथ यहाँ दिखाई देगी।',
    scanNowBtn: 'वस्तु स्कैन करें',
    scannedAtLabel: 'स्कैन का समय',
    rulesVerifiedLabel: 'सत्यापित नियम',
    clearAllBtn: 'सूची साफ़ करें',

    calibrationTitle: 'कैमरा अंशांकन (कैलिब्रेशन)',
    calibrationSubtitle: 'नियम 9 के अनुसार फ़ॉन्ट ऊंचाई के सटीक मिलीमीटर माप हेतु त्वरित अंशांकन।',
    targetSelectionLabel: 'संदर्भ मानक (टारगेट)',
    rulerOption: 'मानक रूलर / पैमाना (10 मिमी)',
    coinOption: '₹10 का मानक सिक्का (27 मिमी)',
    calibratedStatus: 'अंशांकित (1.0 मिमी सटीक)',
    calibrateBtn: 'अभी अंशांकित करें',
    calibratedNotice: 'कैमरा पैमाना अंशांकित है और एलएमपीसी निरीक्षण के लिए तैयार है।',
  },
};
