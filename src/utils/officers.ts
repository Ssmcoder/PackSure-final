import { Officer } from '../types';

export function normalizeOfficerId(id?: string): string {
  if (!id || typeof id !== 'string') {
    return '9921';
  }
  const trimmed = id.trim();
  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }
  // Extract all digit sequences
  const matches = trimmed.match(/\d+/g);
  if (matches && matches.length > 0) {
    // If it was e.g. "DCA-LM-2026-9921", take the trailing number "9921"
    return matches[matches.length - 1];
  }
  const stripped = trimmed.replace(/\D/g, '');
  return stripped || '9921';
}

export function formatToInspectorName(nameOrId?: string, fallbackId?: string): string {
  const normFallback = normalizeOfficerId(fallbackId);
  if (!nameOrId || typeof nameOrId !== 'string') {
    return `Inspector ${normFallback}`;
  }
  const trimmed = nameOrId.trim();

  // If already in "Inspector <number>" format, normalize spacing
  const inspectorMatch = trimmed.match(/^Inspector\s+(\d+)/i);
  if (inspectorMatch) {
    return `Inspector ${inspectorMatch[1]}`;
  }

  // If the user typed just digits like "42" or "9921"
  if (/^\d+$/.test(trimmed)) {
    return `Inspector ${trimmed}`;
  }

  // Extract number from name if any digits exist
  const digitsInName = trimmed.match(/\d+/g);
  if (digitsInName && digitsInName.length > 0) {
    return `Inspector ${digitsInName[digitsInName.length - 1]}`;
  }

  // Fallback to extracting digits from fallbackId
  if (fallbackId) {
    return `Inspector ${normFallback}`;
  }

  return 'Inspector 9921';
}

export const INITIAL_OFFICERS: Officer[] = [
  {
    id: 'off-1',
    officerId: '9921',
    name: 'Inspector 9921',
    designation: 'Senior Legal Metrology Inspector',
    zone: 'North Zone (Delhi HQ)',
    stationCode: 'FEU-4-TOUGHPAD-01',
    password: '1234',
    registeredAt: '2026-01-15T09:00:00.000Z',
  },
  {
    id: 'off-2',
    officerId: '4401',
    name: 'Inspector 4401',
    designation: 'Assistant Controller (Enforcement)',
    zone: 'West Zone (Mumbai Region)',
    stationCode: 'WZE-1-TABLET-02',
    password: '1234',
    registeredAt: '2026-02-10T10:30:00.000Z',
  },
  {
    id: 'off-3',
    officerId: '1188',
    name: 'Inspector 1188',
    designation: 'Legal Metrology Inspector (LMI)',
    zone: 'South Zone (Bengaluru Region)',
    stationCode: 'SZE-2-DEVICE-05',
    password: '1234',
    registeredAt: '2026-03-01T11:15:00.000Z',
  },
];

export function getStoredOfficers(): Officer[] {
  try {
    const raw = localStorage.getItem('packsure_registered_officers');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Automatically migrate any legacy IDs to normal numbers and names to "Inspector (number)"
        return parsed.map((officer: Officer) => {
          const normId = normalizeOfficerId(officer.officerId);
          return {
            ...officer,
            officerId: normId,
            name: formatToInspectorName(officer.name, normId),
          };
        });
      }
    }
  } catch (e) {
    console.error('Failed to load registered officers:', e);
  }
  return INITIAL_OFFICERS;
}

export function saveStoredOfficers(officers: Officer[]) {
  try {
    const formatted = officers.map(officer => {
      const normId = normalizeOfficerId(officer.officerId);
      return {
        ...officer,
        officerId: normId,
        name: formatToInspectorName(officer.name, normId),
      };
    });
    localStorage.setItem('packsure_registered_officers', JSON.stringify(formatted));
  } catch (e) {
    console.error('Failed to save officers:', e);
  }
}

export function getStoredCurrentOfficer(): Officer {
  try {
    const raw = localStorage.getItem('packsure_current_officer');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.officerId) {
        const normId = normalizeOfficerId(parsed.officerId);
        return {
          ...parsed,
          officerId: normId,
          name: formatToInspectorName(parsed.name, normId),
        };
      }
    }
  } catch (e) {
    console.error('Failed to load current officer:', e);
  }
  return INITIAL_OFFICERS[0];
}

export function saveStoredCurrentOfficer(officer: Officer | null) {
  try {
    if (officer) {
      const normId = normalizeOfficerId(officer.officerId);
      const formatted = {
        ...officer,
        officerId: normId,
        name: formatToInspectorName(officer.name, normId),
      };
      localStorage.setItem('packsure_current_officer', JSON.stringify(formatted));
    } else {
      localStorage.removeItem('packsure_current_officer');
    }
  } catch (e) {
    console.error('Failed to save current officer:', e);
  }
}
