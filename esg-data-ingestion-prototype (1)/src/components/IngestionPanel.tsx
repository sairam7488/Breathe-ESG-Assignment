import { useState } from 'react';
import { Upload, FileText, CheckCircle, Download } from 'lucide-react';
import { generateSAPCSV } from '../data/sampleSAP';
import { generateUtilityCSV } from '../data/sampleUtility';
import { generateTravelCSV } from '../data/sampleTravel';

type SourceChoice = 'sap' | 'utility' | 'travel';

const SOURCE_INFO: Record<SourceChoice, { label: string; description: string; format: string; mechanism: string }> = {
  sap: {
    label: 'SAP — Fuel & Procurement',
    description: 'Pipe-delimited flat file from SAP MB51 (Material Document List). Contains movement types, plant codes, material descriptions (HSD, MS, PNG, LPG, FO), and quantities in various units (L, KL, M3).',
    format: 'Pipe-delimited TXT (IDoc-style flat file)',
    mechanism: 'File Upload — SAP exports are typically extracted by IT as scheduled jobs via SAP transactions SE38/SM37. The flat file is the lowest-common-denominator format across SAP ECC and S/4HANA versions used by Indian enterprises.',
  },
  utility: {
    label: 'Utility — Electricity (DISCOMs)',
    description: 'CSV export from state DISCOM portals (MSEDCL, TATA Power, CESC, BESCOM, TANGEDCO). Contains HT meter reads, billing periods, usage in kWh, demand in kVA, and tariff codes (HT-I, HT-IND, etc.).',
    format: 'CSV (comma-delimited)',
    mechanism: 'File Upload — Facilities teams download these from DISCOM web portals. Most Indian utilities don\'t offer APIs; manual CSV download from the consumer portal is the standard practice.',
  },
  travel: {
    label: 'Travel — Concur/ITILITE',
    description: 'CSV extract from SAP Concur or ITILITE expense reports. Contains expense types (AIRFR, HOTEL, CARRT, TRAIN), IATA codes for domestic/international flights, distances, and cabin classes.',
    format: 'CSV (comma-delimited)',
    mechanism: 'File Upload / API Pull — Concur Standard Extract (SAE) or ITILITE API. For Indian enterprises, travel often includes domestic flights (IndiGo, Vistara, SpiceJet), Indian Railways, and Ola/Uber.',
  },
};

function downloadSample(type: SourceChoice) {
  let content: string;
  let filename: string;
  
  switch (type) {
    case 'sap':
      content = generateSAPCSV();
      filename = 'SAP_MB51_FuelMovements_FY2024.txt';
      break;
    case 'utility':
      content = generateUtilityCSV();
      filename = 'DISCOM_Electricity_Bills_Q1_FY25.csv';
      break;
    case 'travel':
      content = generateTravelCSV();
      filename = 'Concur_Expense_Extract_Q1_FY25.csv';
      break;
  }
  
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function IngestionPanel() {
  const [selectedSource, setSelectedSource] = useState<SourceChoice>('sap');
  const [uploaded, setUploaded] = useState(false);
  
  const info = SOURCE_INFO[selectedSource];
  
  const handleUpload = () => {
    // In a real app, this would parse the file and call the normalization engine.
    // For the prototype, sample data is pre-loaded.
    setUploaded(true);
    setTimeout(() => setUploaded(false), 3000);
  };
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Data Ingestion
        </h3>
        <p className="text-xs text-gray-400 mt-1">Upload source files for normalization and review</p>
      </div>
      
      <div className="p-5 space-y-4">
        {/* Source selector */}
        <div className="grid grid-cols-3 gap-2">
          {(['sap', 'utility', 'travel'] as SourceChoice[]).map(src => (
            <button
              key={src}
              onClick={() => setSelectedSource(src)}
              className={`px-3 py-2.5 rounded-lg text-xs font-medium border transition ${
                selectedSource === src
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {SOURCE_INFO[src].label}
            </button>
          ))}
        </div>
        
        {/* Source info */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-gray-700">{info.label}</p>
          <p className="text-xs text-gray-500">{info.description}</p>
          <div className="flex items-start gap-2 mt-2">
            <FileText className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-600"><span className="font-medium">Format:</span> {info.format}</p>
              <p className="text-xs text-gray-600 mt-1"><span className="font-medium">Mechanism:</span> {info.mechanism}</p>
            </div>
          </div>
        </div>
        
        {/* Download sample */}
        <button
          onClick={() => downloadSample(selectedSource)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
        >
          <Download className="w-4 h-4" />
          Download Sample {selectedSource === 'sap' ? 'SAP' : selectedSource === 'utility' ? 'DISCOM' : 'Travel'} File
        </button>
        
        {/* Upload zone */}
        <div
          onClick={handleUpload}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
            uploaded
              ? 'border-emerald-300 bg-emerald-50'
              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
          }`}
        >
          {uploaded ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
              <p className="text-sm font-medium text-emerald-700">File processed successfully!</p>
              <p className="text-xs text-emerald-500">Sample data already loaded in the Review Dashboard.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-gray-400" />
              <p className="text-sm font-medium text-gray-600">Click to upload or drag & drop</p>
              <p className="text-xs text-gray-400">
                {selectedSource === 'sap' ? '.txt pipe-delimited file' :
                 '.csv comma-delimited file'}
              </p>
              <p className="text-xs text-gray-300 mt-2">
                Note: Sample data is pre-loaded for demonstration.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
