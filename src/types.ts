export type NavigationTab = 'new-scan' | 'dashboard' | 'history' | 'rule-reference' | 'audit-logs';

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

export interface SampleLabel {
  id: string;
  brand: string;
  commodity: string;
  netQtyDeclared: string;
  ean13: string;
  packageType: string;
  category: 'Oil' | 'Dairy' | 'Grains' | 'Snacks' | 'Beverages';
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
