export type NavigationTab = 'new-scan' | 'dashboard' | 'history' | 'rule-reference' | 'verified-items';

export type TerminalMode = 'standard' | 'batch' | 'calibration';

export interface QualityGateMetrics {
  laplacianVar: number; // >= 120
  luminance: number; // 40 - 240 cd/m2
  glareRatio: number; // < 0.15
  isPassed: boolean;
  blurStatus: 'PASS' | 'FAIL_BLUR';
  luminanceStatus: 'PASS' | 'WARN_SHADOW' | 'WARN_GLARE';
  exitCode?: string;
}

export interface RuleViolation {
  ruleCode: string; // e.g. "Rule 6(1)(c)"
  ruleTitle: string;
  measured: string;
  required: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  description: string;
}

export interface VerifiedCheckDetail {
  ruleCode: string;
  checkName: string;
  result: 'PASS' | 'FAIL' | 'WARNING';
  measuredValue: string;
  statutoryRequirement: string;
  notes: string;
}

export interface VerifiedItem {
  id: string;
  sampleId: string;
  commodity: string;
  brand: string;
  category?: string;
  packageType: string;
  ean13: string;
  netQtyDeclared: string;
  mrp: number;
  timestamp: string;
  verifiedAtFormatted: string;
  status: 'COMPLIANT' | 'INFRACTION' | 'USP_DISCREPANCY';
  pdpAreaCm2: number;
  measuredFontMm: number;
  requiredFontMm: number;
  verifiedChecks: VerifiedCheckDetail[];
  officerName: string;
  terminalId: string;
}

export interface SampleLabel {
  id: string;
  brand: string;
  commodity: string;
  netQtyDeclared: string;
  ean13: string;
  packageType: string;
  category: 'Oil' | 'Dairy' | 'Grains' | 'Snacks' | 'Beverages' | string;
  status: 'INFRACTION' | 'COMPLIANT' | 'USP_DISCREPANCY';
  infractionSummary: string;
  ruleCode: string;
  imageUrl?: string;
  pdpAreaCm2: number;
  measuredFontMm: number;
  requiredFontMm: number;
  mrp: number;
  unitSalePrice: {
    declared: number;
    calculated: number;
    unit: string;
    isMatch: boolean;
  };
  declarations: {
    manufacturerAddress: boolean;
    countryOfOrigin: boolean;
    netQuantity: boolean;
    monthYearManufacture: boolean;
    mrpTaxesInclusive: boolean;
    unitSalePrice: boolean;
    consumerCareHelpline: boolean;
  };
  violations: RuleViolation[];
  backendReport?: any;
  savedScanId?: string;
}

export interface PipelineStageState {
  stageNumber: number;
  name: string;
  subtitle: string;
  metric: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  statusLabel: string;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  stationId: string;
  officerId: string;
  officerName: string;
  sampleName: string;
  ean13: string;
  status: 'COMPLIANT' | 'INFRACTION_ISSUED' | 'WARNING';
  ruleViolationsCount: number;
  sha256Hash: string;
  isoStandard: string;
}

export interface Officer {
  id: string;
  officerId: string; // Specific ID of Department of Legal Metrology Officer
  name: string;
  designation: string;
  zone: string;
  stationCode: string;
  password?: string;
  registeredAt?: string;
}
