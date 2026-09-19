/**
 * PackSure Backend API Client
 * Seamlessly integrates with the FastAPI Python Backend:
 * https://github.com/Piya-glitches/PackSure/tree/main/backend
 */

import { SampleLabel, VerifiedItem, RuleViolation, QualityGateMetrics } from '../types';

export interface BackendFieldOut {
  field_key: string;
  extracted_text: string | null;
  confidence: number;
  bounding_box_json?: string | null;
  bbox?: { xmin: number; ymin: number; xmax: number; ymax: number };
  font_height_px?: number | null;
  font_height_mm?: number | null;
  min_required_mm?: number | null;
  status: 'PASS' | 'FAIL' | 'MISSING' | 'WARN' | string;
  notes?: string | null;
}

export interface BackendViolationOut {
  rule_code: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR' | string;
  description: string;
  citation: string;
}

export interface BackendResponsibleParty {
  role: 'MANUFACTURER' | 'PACKER' | 'IMPORTER' | 'UNKNOWN' | string;
  matched_phrase?: string;
  address?: string;
  is_legally_responsible?: boolean;
  reasoning?: string;
}

export interface BackendCalibration {
  found: boolean;
  symbology?: string;
  raw_value?: string;
  px_per_mm?: number;
  physical_width_mm?: number;
  bbox?: any;
}

export interface BackendQualityGate {
  passed: boolean;
  laplacian_variance: number;
  brightness_mean: number;
  reasons: string[];
}

export interface BackendProcessingLogStage {
  stage: string;
  duration_ms: number;
  note: string;
}

export interface BackendReport {
  overall_status: 'COMPLIANT' | 'NON_COMPLIANT' | 'NEEDS_REVIEW';
  compliance_score: number;
  calibration: BackendCalibration;
  quality_gate: BackendQualityGate;
  pdp_detection_method?: string;
  fields: BackendFieldOut[];
  responsible_party: BackendResponsibleParty;
  violations: BackendViolationOut[];
  ocr_raw_text: string;
  processing_log: BackendProcessingLogStage[];
}

export interface BackendScanCreateResponse {
  report: BackendReport;
  processed_image_data_url: string;
}

export interface BackendScanSummary {
  id: string;
  created_at: string;
  product_label: string;
  overall_status: 'COMPLIANT' | 'NON_COMPLIANT' | 'NEEDS_REVIEW';
  compliance_score: number;
  calibration_source?: string | null;
}

export interface BackendScanDetail extends BackendScanSummary {
  image_data_url: string;
  calibration_factor?: number | null;
  pdp_detection_method?: string | null;
  ocr_raw_text: string;
  fields: BackendFieldOut[];
  violations: BackendViolationOut[];
}

export interface BackendStats {
  total: number;
  compliant: number;
  non_compliant: number;
  needs_review: number;
  avg_score: number;
  trend: Array<{ date: string; score: number; status: string }>;
  violation_breakdown: Array<{ rule_code: string; severity: string; count: number }>;
}

export interface BackendSampleInfo {
  id: string;
  title: string;
  expected_outcome: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  role: string;
}

// Storage keys
const API_URL_KEY = 'packsure_backend_api_url';
const AUTH_TOKEN_KEY = 'packsure_auth_token';
const AUTH_ROLE_KEY = 'packsure_auth_role';

export function getBackendBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(API_URL_KEY);
    if (stored) return stored;
  }
  return (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';
}

export function setBackendBaseUrl(url: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(API_URL_KEY, url.replace(/\/+$/, ''));
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }
  return null;
}

export function setAuthToken(token: string | null, role: string = 'officer'): void {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_ROLE_KEY, role);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_ROLE_KEY);
    }
  }
}

export function getAuthRole(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AUTH_ROLE_KEY) || 'public';
  }
  return 'public';
}

/**
 * Generic request wrapper with auth header
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getBackendBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorDetail = res.statusText;
    try {
      const errorJson = await res.json();
      if (errorJson.detail) {
        errorDetail = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
      }
    } catch {
      // fallback to status text
    }
    throw new Error(`API Error ${res.status}: ${errorDetail}`);
  }

  return res.json();
}

/**
 * PackSure API Client methods
 */
export const packsureApi = {
  /**
   * Health Check & ML Model Preload Status
   */
  async checkHealth(): Promise<{ status: string; models?: Record<string, any> }> {
    return apiRequest<{ status: string; models?: Record<string, any> }>('/health');
  },

  /**
   * Officer / User Registration
   */
  async register(username: string, password: string, role: string = 'officer'): Promise<{ id: string; username: string; role: string }> {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, role }),
    });
  },

  /**
   * Officer / User Login
   */
  async login(username: string, password: string): Promise<AuthTokenResponse> {
    const baseUrl = getBackendBaseUrl();
    const url = `${baseUrl}/auth/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      let errorDetail = res.statusText;
      try {
        const errorJson = await res.json();
        if (errorJson.detail) errorDetail = errorJson.detail;
      } catch {}
      throw new Error(errorDetail);
    }

    const data: AuthTokenResponse = await res.json();
    setAuthToken(data.access_token, data.role);
    return data;
  },

  /**
   * Fetch backend built-in benchmark samples list
   */
  async getSamples(): Promise<{ samples: BackendSampleInfo[] }> {
    return apiRequest<{ samples: BackendSampleInfo[] }>('/scans/samples');
  },

  /**
   * Run full compliance pipeline for a backend sample label
   */
  async runSample(sampleId: string): Promise<BackendScanCreateResponse> {
    return apiRequest<BackendScanCreateResponse>(`/scans/samples/${sampleId}/run`);
  },

  /**
   * Run full compliance pipeline on uploaded image
   */
  async runScan(productLabel: string, imageDataUrl: string, manualQuad?: number[][]): Promise<BackendScanCreateResponse> {
    return apiRequest<BackendScanCreateResponse>('/scans/run', {
      method: 'POST',
      body: JSON.stringify({
        product_label: productLabel,
        image_data_url: imageDataUrl,
        manual_quad: manualQuad || null,
      }),
    });
  },

  /**
   * Persist a completed scan & report in backend database
   */
  async saveScan(productLabel: string, processedImageDataUrl: string, report: BackendReport): Promise<BackendScanDetail> {
    return apiRequest<BackendScanDetail>('/scans', {
      method: 'POST',
      body: JSON.stringify({
        product_label: productLabel,
        processed_image_data_url: processedImageDataUrl,
        report,
      }),
    });
  },

  /**
   * List saved scans from backend database
   */
  async listScans(status?: string, limit: number = 50): Promise<BackendScanSummary[]> {
    const query = new URLSearchParams();
    if (status) query.append('status', status);
    query.append('limit', limit.toString());
    return apiRequest<BackendScanSummary[]>(`/scans?${query.toString()}`);
  },

  /**
   * Get single scan details
   */
  async getScan(scanId: string): Promise<BackendScanDetail> {
    return apiRequest<BackendScanDetail>(`/scans/${scanId}`);
  },

  /**
   * Delete a scan (requires officer or admin auth)
   */
  async deleteScan(scanId: string): Promise<{ ok: boolean }> {
    return apiRequest<{ ok: boolean }>(`/scans/${scanId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Download generated PDF compliance report
   */
  async downloadReportPdf(scanId: string): Promise<Blob> {
    const baseUrl = getBackendBaseUrl();
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${baseUrl}/scans/${scanId}/report`, {
      headers,
    });

    if (!res.ok) {
      throw new Error(`Failed to generate PDF report (${res.status})`);
    }

    return res.blob();
  },

  /**
   * Fetch backend stats & trends for dashboard
   */
  async getStats(): Promise<BackendStats> {
    return apiRequest<BackendStats>('/stats');
  },
};

/**
 * Data Model Converters:
 * Seamlessly bridge Backend models with Frontend SampleLabel & VerifiedItem types.
 */
export function convertBackendReportToSampleLabel(
  report: BackendReport,
  imageDataUrl: string = '',
  productLabel: string = 'Scanned Commodity',
  savedScanId?: string
): SampleLabel {
  const getField = (key: string) => report.fields?.find(f => f.field_key === key);

  const netQtyField = getField('net_quantity');
  const mrpField = getField('mrp');
  const uspField = getField('unit_sale_price');
  const mfrField = getField('manufacturer') || getField('packer') || getField('importer');
  const originField = getField('country_of_origin');
  const mfgDateField = getField('mfg_date') || getField('pkd_date');
  const careField = getField('consumer_care') || getField('consumer_care_helpline');

  // Parse MRP numeric
  let mrpValue = 0;
  if (mrpField?.extracted_text) {
    const match = mrpField.extracted_text.match(/[\d.]+/);
    if (match) mrpValue = parseFloat(match[0]);
  }

  // Parse USP
  let declaredUsp = 0;
  let uspUnit = '₹ / unit';
  if (uspField?.extracted_text) {
    const match = uspField.extracted_text.match(/[\d.]+/);
    if (match) declaredUsp = parseFloat(match[0]);
    if (uspField.extracted_text.includes('/')) {
      uspUnit = uspField.extracted_text.substring(uspField.extracted_text.indexOf('/'));
    }
  }

  const violations: RuleViolation[] = report.violations.map(v => ({
    ruleCode: v.rule_code,
    ruleTitle: v.citation || v.rule_code,
    measured: 'Pipeline Measured',
    required: v.citation,
    severity: (v.severity.toUpperCase() === 'CRITICAL' || v.severity.toUpperCase() === 'MAJOR' ? v.severity.toUpperCase() : 'MINOR') as any,
    description: v.description,
  }));

  const isCompliant = report.overall_status === 'COMPLIANT';
  const hasUspDiscrepancy = report.violations.some(v => v.rule_code.includes('6(1)(s)') || v.description.toLowerCase().includes('unit sale price'));

  const status: 'COMPLIANT' | 'INFRACTION' | 'USP_DISCREPANCY' = isCompliant
    ? 'COMPLIANT'
    : hasUspDiscrepancy
    ? 'USP_DISCREPANCY'
    : 'INFRACTION';

  const infractionSummary = isCompliant
    ? `All statutory declarations fully verified (Compliance Score: ${report.compliance_score}/100)`
    : report.violations.map(v => `${v.rule_code}: ${v.description}`).join(' • ') || 'Statutory infraction detected in labeling.';

  return {
    id: savedScanId || `scan-${Date.now()}`,
    brand: report.responsible_party?.matched_phrase?.split(':')[0]?.trim() || productLabel.split(' ')[0] || 'Generic Brand',
    commodity: productLabel,
    imageUrl: imageDataUrl,
    netQtyDeclared: netQtyField?.extracted_text || 'Declared Quantity',
    ean13: report.calibration?.raw_value || '8901234567890',
    packageType: 'Rigid / Flexible Retail Packaging',
    category: 'Packaged Commodity',
    status,
    infractionSummary,
    ruleCode: report.violations[0]?.rule_code || 'Rule 6(1) Compliant',
    pdpAreaCm2: report.calibration?.physical_width_mm ? Math.round(report.calibration.physical_width_mm * 4) : 150,
    measuredFontMm: netQtyField?.font_height_mm || 3.0,
    requiredFontMm: netQtyField?.min_required_mm || 3.0,
    mrp: mrpValue,
    unitSalePrice: {
      declared: declaredUsp || mrpValue,
      calculated: declaredUsp || mrpValue,
      unit: uspUnit,
      isMatch: !hasUspDiscrepancy,
    },
    declarations: {
      manufacturerAddress: mfrField?.status === 'PASS',
      countryOfOrigin: originField?.status === 'PASS',
      netQuantity: netQtyField?.status === 'PASS',
      monthYearManufacture: mfgDateField?.status === 'PASS',
      mrpTaxesInclusive: mrpField?.status === 'PASS',
      unitSalePrice: uspField?.status === 'PASS',
      consumerCareHelpline: careField?.status === 'PASS',
    },
    violations,
    // Backend extra metadata
    backendReport: report,
    savedScanId,
  } as SampleLabel;
}

export function convertBackendScanDetailToSampleLabel(scan: BackendScanDetail): SampleLabel {
  const isCompliant = scan.overall_status === 'COMPLIANT';
  const hasUspDiscrepancy = scan.violations.some(v => v.rule_code.includes('6(1)(s)'));

  const netQtyField = scan.fields.find(f => f.field_key === 'net_quantity');
  const mrpField = scan.fields.find(f => f.field_key === 'mrp');
  const uspField = scan.fields.find(f => f.field_key === 'unit_sale_price');
  const mfrField = scan.fields.find(f => f.field_key === 'manufacturer' || f.field_key === 'packer' || f.field_key === 'importer');
  const originField = scan.fields.find(f => f.field_key === 'country_of_origin');
  const mfgDateField = scan.fields.find(f => f.field_key === 'mfg_date' || f.field_key === 'pkd_date');
  const careField = scan.fields.find(f => f.field_key === 'consumer_care');

  let mrpValue = 0;
  if (mrpField?.extracted_text) {
    const match = mrpField.extracted_text.match(/[\d.]+/);
    if (match) mrpValue = parseFloat(match[0]);
  }

  return {
    id: scan.id,
    brand: scan.product_label.split(' ')[0] || 'PackSure Verified',
    commodity: scan.product_label,
    imageUrl: scan.image_data_url,
    netQtyDeclared: netQtyField?.extracted_text || 'Standard Pack',
    ean13: scan.calibration_source || '8901234567890',
    packageType: 'Retail Sealed Pack',
    category: 'Packaged Commodity',
    status: isCompliant ? 'COMPLIANT' : hasUspDiscrepancy ? 'USP_DISCREPANCY' : 'INFRACTION',
    infractionSummary: isCompliant
      ? `Compliant (Score: ${scan.compliance_score}/100)`
      : scan.violations.map(v => `${v.rule_code}: ${v.description}`).join(' • '),
    ruleCode: scan.violations[0]?.rule_code || 'Rule 6(1)',
    pdpAreaCm2: 150,
    measuredFontMm: netQtyField?.font_height_mm || 3.0,
    requiredFontMm: netQtyField?.min_required_mm || 3.0,
    mrp: mrpValue,
    unitSalePrice: {
      declared: 0,
      calculated: 0,
      unit: '₹ / unit',
      isMatch: !hasUspDiscrepancy,
    },
    declarations: {
      manufacturerAddress: mfrField?.status === 'PASS',
      countryOfOrigin: originField?.status === 'PASS',
      netQuantity: netQtyField?.status === 'PASS',
      monthYearManufacture: mfgDateField?.status === 'PASS',
      mrpTaxesInclusive: mrpField?.status === 'PASS',
      unitSalePrice: uspField?.status === 'PASS',
      consumerCareHelpline: careField?.status === 'PASS',
    },
    violations: scan.violations.map(v => ({
      ruleCode: v.rule_code,
      ruleTitle: v.citation,
      measured: 'Backend Verified',
      required: v.citation,
      severity: (v.severity.toUpperCase() === 'CRITICAL' || v.severity.toUpperCase() === 'MAJOR' ? v.severity.toUpperCase() : 'MINOR') as any,
      description: v.description,
    })),
    savedScanId: scan.id,
  };
}
