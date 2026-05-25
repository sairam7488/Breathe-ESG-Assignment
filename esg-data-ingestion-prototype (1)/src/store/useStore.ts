import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  EmissionRecord,
  IngestionBatch,
  RowStatus,
  DashboardMetrics,
  EditEvent,
} from '../types';
import { SAMPLE_SAP_DATA } from '../data/sampleSAP';
import { SAMPLE_UTILITY_DATA } from '../data/sampleUtility';
import { SAMPLE_TRAVEL_DATA } from '../data/sampleTravel';
import { normalizeSAPData, normalizeUtilityData, normalizeTravelData } from '../engine/normalize';

const TENANT_ID = 'tenant-tata-industries';

function createInitialData(): { batches: IngestionBatch[]; records: EmissionRecord[] } {
  const sapBatchId = uuidv4();
  const utilBatchId = uuidv4();
  const travelBatchId = uuidv4();
  
  const sapRecords = normalizeSAPData(SAMPLE_SAP_DATA, sapBatchId);
  const utilRecords = normalizeUtilityData(SAMPLE_UTILITY_DATA, utilBatchId);
  const travelRecords = normalizeTravelData(SAMPLE_TRAVEL_DATA, travelBatchId);
  
  const allRecords = [...sapRecords, ...utilRecords, ...travelRecords];
  
  const batches: IngestionBatch[] = [
    {
      id: sapBatchId,
      tenantId: TENANT_ID,
      sourceType: 'sap_fuel',
      fileName: 'SAP_MB51_FuelMovements_FY2024.txt',
      ingestedAt: '2024-05-01T09:30:00Z',
      ingestedBy: 'system@breatheesg.in',
      totalRows: sapRecords.length,
      validRows: sapRecords.filter(r => r.flags.length === 0).length,
      errorRows: sapRecords.filter(r => r.flags.some(f => f.severity === 'error')).length,
      flaggedRows: sapRecords.filter(r => r.flags.length > 0).length,
      status: 'completed',
    },
    {
      id: utilBatchId,
      tenantId: TENANT_ID,
      sourceType: 'utility_electricity',
      fileName: 'DISCOM_Electricity_Bills_Q1_FY25.csv',
      ingestedAt: '2024-05-01T10:15:00Z',
      ingestedBy: 'facilities@tata.com',
      totalRows: utilRecords.length,
      validRows: utilRecords.filter(r => r.flags.length === 0).length,
      errorRows: utilRecords.filter(r => r.flags.some(f => f.severity === 'error')).length,
      flaggedRows: utilRecords.filter(r => r.flags.length > 0).length,
      status: 'completed',
    },
    {
      id: travelBatchId,
      tenantId: TENANT_ID,
      sourceType: 'travel_flights',
      fileName: 'Concur_Expense_Extract_Q1_FY25.csv',
      ingestedAt: '2024-05-01T11:00:00Z',
      ingestedBy: 'travel-admin@tata.com',
      totalRows: travelRecords.length,
      validRows: travelRecords.filter(r => r.flags.length === 0).length,
      errorRows: travelRecords.filter(r => r.flags.some(f => f.severity === 'error')).length,
      flaggedRows: travelRecords.filter(r => r.flags.length > 0).length,
      status: 'completed',
    },
  ];
  
  return { batches, records: allRecords };
}

export function useAppStore() {
  const [data] = useState(createInitialData);
  const [records, setRecords] = useState<EmissionRecord[]>(data.records);
  const [batches] = useState<IngestionBatch[]>(data.batches);
  
  const updateRecordStatus = useCallback((
    recordId: string,
    status: RowStatus,
    reviewNotes?: string
  ) => {
    setRecords(prev => prev.map(r => {
      if (r.id !== recordId) return r;
      return {
        ...r,
        status,
        reviewedBy: 'sairam@breatheesg.in',
        reviewedAt: new Date().toISOString(),
        reviewNotes: reviewNotes || r.reviewNotes,
        updatedAt: new Date().toISOString(),
        editHistory: [
          ...r.editHistory,
          {
            timestamp: new Date().toISOString(),
            userId: 'sairam@breatheesg.in',
            field: 'status',
            oldValue: r.status,
            newValue: status,
            reason: reviewNotes || '',
          } satisfies EditEvent,
        ],
      };
    }));
  }, []);
  
  const bulkUpdateStatus = useCallback((
    recordIds: string[],
    status: RowStatus,
    reviewNotes?: string
  ) => {
    setRecords(prev => prev.map(r => {
      if (!recordIds.includes(r.id)) return r;
      return {
        ...r,
        status,
        reviewedBy: 'sairam@breatheesg.in',
        reviewedAt: new Date().toISOString(),
        reviewNotes: reviewNotes || r.reviewNotes,
        updatedAt: new Date().toISOString(),
        editHistory: [
          ...r.editHistory,
          {
            timestamp: new Date().toISOString(),
            userId: 'sairam@breatheesg.in',
            field: 'status',
            oldValue: r.status,
            newValue: status,
            reason: reviewNotes || 'Bulk action',
          } satisfies EditEvent,
        ],
      };
    }));
  }, []);
  
  const getMetrics = useCallback((): DashboardMetrics => {
    return {
      totalBatches: batches.length,
      totalRecords: records.length,
      pendingReview: records.filter(r => r.status === 'pending').length,
      approved: records.filter(r => r.status === 'approved').length,
      rejected: records.filter(r => r.status === 'rejected').length,
      flagged: records.filter(r => r.status === 'flagged').length,
      totalEmissionsKgCO2e: records
        .filter(r => r.status !== 'rejected')
        .reduce((sum, r) => sum + r.computedEmissionKgCO2e, 0),
      byScope: {
        scope_1: records.filter(r => r.scope === 'scope_1' && r.status !== 'rejected')
          .reduce((sum, r) => sum + r.computedEmissionKgCO2e, 0),
        scope_2: records.filter(r => r.scope === 'scope_2' && r.status !== 'rejected')
          .reduce((sum, r) => sum + r.computedEmissionKgCO2e, 0),
        scope_3: records.filter(r => r.scope === 'scope_3' && r.status !== 'rejected')
          .reduce((sum, r) => sum + r.computedEmissionKgCO2e, 0),
      },
      bySource: {
        sap_fuel: records.filter(r => r.sourceType === 'sap_fuel' && r.status !== 'rejected')
          .reduce((sum, r) => sum + r.computedEmissionKgCO2e, 0),
        sap_procurement: 0,
        utility_electricity: records.filter(r => r.sourceType === 'utility_electricity' && r.status !== 'rejected')
          .reduce((sum, r) => sum + r.computedEmissionKgCO2e, 0),
        travel_flights: records.filter(r => r.sourceType === 'travel_flights' && r.status !== 'rejected')
          .reduce((sum, r) => sum + r.computedEmissionKgCO2e, 0),
        travel_hotels: records.filter(r => r.sourceType === 'travel_hotels' && r.status !== 'rejected')
          .reduce((sum, r) => sum + r.computedEmissionKgCO2e, 0),
        travel_ground: records.filter(r => r.sourceType === 'travel_ground' && r.status !== 'rejected')
          .reduce((sum, r) => sum + r.computedEmissionKgCO2e, 0),
      },
    };
  }, [records, batches]);
  
  return {
    records,
    batches,
    updateRecordStatus,
    bulkUpdateStatus,
    getMetrics,
  };
}
