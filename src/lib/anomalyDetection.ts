// Anomaly detection utilities for healthcare facility verification

export interface FacilityAnomaly {
  facilityId: string;
  facilityName: string;
  region: string;
  type: 'equipment_mismatch' | 'procedure_overload' | 'specialty_gap' | 'suspicious_claim' | 'incomplete_data';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  details: string;
}

// Equipment required for specific specialties/procedures
const SPECIALTY_EQUIPMENT_MAP: Record<string, string[]> = {
  'cardiac': ['ecg', 'echo', 'defibrillator', 'cardiac monitor', 'cath lab'],
  'cardiology': ['ecg', 'echo', 'defibrillator', 'cardiac monitor'],
  'surgery': ['operating room', 'anesthesia', 'ventilator', 'surgical instruments'],
  'cardiac surgery': ['cath lab', 'bypass machine', 'operating room', 'icu'],
  'orthopedic': ['x-ray', 'ct scan', 'operating room', 'cast equipment'],
  'radiology': ['x-ray', 'ct scan', 'mri', 'ultrasound'],
  'oncology': ['chemotherapy', 'radiation', 'ct scan', 'biopsy'],
  'dialysis': ['dialysis machine', 'hemodialysis'],
  'icu': ['ventilator', 'cardiac monitor', 'defibrillator', 'infusion pump'],
  'emergency': ['defibrillator', 'ventilator', 'trauma equipment'],
  'ophthalmology': ['slit lamp', 'ophthalmoscope', 'laser', 'operating microscope'],
  'neurology': ['eeg', 'mri', 'ct scan'],
  'neurosurgery': ['mri', 'ct scan', 'operating room', 'microscope'],
};

// Procedure to equipment mapping
const PROCEDURE_EQUIPMENT_MAP: Record<string, string[]> = {
  'open heart surgery': ['cath lab', 'bypass machine', 'icu', 'ventilator'],
  'angioplasty': ['cath lab', 'fluoroscopy'],
  'mri scan': ['mri'],
  'ct scan': ['ct scan', 'ct'],
  'dialysis': ['dialysis machine'],
  'chemotherapy': ['infusion pump', 'oncology unit'],
  'cataract surgery': ['operating microscope', 'phaco machine'],
  'laparoscopy': ['laparoscope', 'operating room'],
  'endoscopy': ['endoscope'],
  'colonoscopy': ['colonoscope'],
};

export interface Facility {
  id: string;
  name: string;
  region: string | null;
  specialties: string | null;
  procedures: string | null;
  equipment: string | null;
  capability: string | null;
}

// Detect equipment-specialty mismatches
export function detectEquipmentMismatches(facilities: Facility[]): FacilityAnomaly[] {
  const anomalies: FacilityAnomaly[] = [];
  
  for (const facility of facilities) {
    const specialtiesLower = (facility.specialties || '').toLowerCase();
    const equipmentLower = (facility.equipment || '').toLowerCase();
    const proceduresLower = (facility.procedures || '').toLowerCase();
    
    // Check each specialty
    for (const [specialty, requiredEquipment] of Object.entries(SPECIALTY_EQUIPMENT_MAP)) {
      if (specialtiesLower.includes(specialty) || proceduresLower.includes(specialty)) {
        const hasAnyEquipment = requiredEquipment.some(eq => equipmentLower.includes(eq));
        
        if (!hasAnyEquipment && equipmentLower.trim() !== '') {
          anomalies.push({
            facilityId: facility.id,
            facilityName: facility.name,
            region: facility.region || 'Unknown',
            type: 'equipment_mismatch',
            severity: specialty.includes('surgery') || specialty.includes('cardiac') ? 'critical' : 'high',
            description: `Claims ${specialty} but lacks required equipment`,
            details: `Expected: ${requiredEquipment.join(', ')}. Found: ${facility.equipment || 'none listed'}`,
          });
        }
      }
    }
    
    // Check procedures
    for (const [procedure, requiredEquipment] of Object.entries(PROCEDURE_EQUIPMENT_MAP)) {
      if (proceduresLower.includes(procedure)) {
        const hasAnyEquipment = requiredEquipment.some(eq => equipmentLower.includes(eq));
        
        if (!hasAnyEquipment && equipmentLower.trim() !== '') {
          anomalies.push({
            facilityId: facility.id,
            facilityName: facility.name,
            region: facility.region || 'Unknown',
            type: 'equipment_mismatch',
            severity: 'high',
            description: `Claims ${procedure} procedure but lacks equipment`,
            details: `Expected: ${requiredEquipment.join(', ')}. Found: ${facility.equipment || 'none listed'}`,
          });
        }
      }
    }
  }
  
  return anomalies;
}

// Detect procedure overload (too many procedures for facility size)
export function detectProcedureOverload(facilities: Facility[]): FacilityAnomaly[] {
  const anomalies: FacilityAnomaly[] = [];
  
  for (const facility of facilities) {
    const procedures = (facility.procedures || '').split(',').filter(p => p.trim()).length;
    const specialties = (facility.specialties || '').split(',').filter(s => s.trim()).length;
    const equipment = (facility.equipment || '').split(',').filter(e => e.trim()).length;
    
    // If claiming many procedures but few equipment
    if (procedures > 10 && equipment < 3) {
      anomalies.push({
        facilityId: facility.id,
        facilityName: facility.name,
        region: facility.region || 'Unknown',
        type: 'procedure_overload',
        severity: 'high',
        description: `Claims ${procedures} procedures but only ${equipment} equipment items`,
        details: `Procedure-to-equipment ratio is unusually high (${(procedures / Math.max(equipment, 1)).toFixed(1)}:1)`,
      });
    }
    
    // If claiming many specialties but few equipment
    if (specialties > 5 && equipment < 2) {
      anomalies.push({
        facilityId: facility.id,
        facilityName: facility.name,
        region: facility.region || 'Unknown',
        type: 'specialty_gap',
        severity: 'medium',
        description: `Claims ${specialties} specialties but only ${equipment} equipment items`,
        details: `Specialty depth appears unsupported by infrastructure`,
      });
    }
  }
  
  return anomalies;
}

// Detect incomplete data
export function detectIncompleteData(facilities: Facility[]): FacilityAnomaly[] {
  const anomalies: FacilityAnomaly[] = [];
  
  for (const facility of facilities) {
    const missingFields: string[] = [];
    
    if (!facility.specialties?.trim()) missingFields.push('specialties');
    if (!facility.procedures?.trim()) missingFields.push('procedures');
    if (!facility.equipment?.trim()) missingFields.push('equipment');
    if (!facility.region?.trim()) missingFields.push('region');
    
    if (missingFields.length >= 2) {
      anomalies.push({
        facilityId: facility.id,
        facilityName: facility.name,
        region: facility.region || 'Unknown',
        type: 'incomplete_data',
        severity: missingFields.length >= 3 ? 'high' : 'medium',
        description: `Missing ${missingFields.length} critical data fields`,
        details: `Missing: ${missingFields.join(', ')}`,
      });
    }
  }
  
  return anomalies;
}

// Run all anomaly detection
export function runFullAnomalyDetection(facilities: Facility[]): {
  anomalies: FacilityAnomaly[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    byType: Record<string, number>;
  };
} {
  const allAnomalies = [
    ...detectEquipmentMismatches(facilities),
    ...detectProcedureOverload(facilities),
    ...detectIncompleteData(facilities),
  ];
  
  // Deduplicate by facility + type
  const seen = new Set<string>();
  const uniqueAnomalies = allAnomalies.filter(a => {
    const key = `${a.facilityId}-${a.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  const byType: Record<string, number> = {};
  for (const a of uniqueAnomalies) {
    byType[a.type] = (byType[a.type] || 0) + 1;
  }
  
  return {
    anomalies: uniqueAnomalies,
    summary: {
      total: uniqueAnomalies.length,
      critical: uniqueAnomalies.filter(a => a.severity === 'critical').length,
      high: uniqueAnomalies.filter(a => a.severity === 'high').length,
      medium: uniqueAnomalies.filter(a => a.severity === 'medium').length,
      low: uniqueAnomalies.filter(a => a.severity === 'low').length,
      byType,
    },
  };
}
