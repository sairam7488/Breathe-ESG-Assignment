
# Breathe ESG — Data Ingestion & Review Prototype

A React-based prototype for ingesting, normalizing, and reviewing Scope 1, 2, and 3 emissions data from multiple enterprise sources before audit lock.

## Overview

This prototype simulates a real-world ESG data workflow where facilities, fuel, and travel data live in different systems with different formats and quality challenges. Analysts review normalized records, approve/reject rows, and lock data for audit.

**Live Demo**: [Your deployment URL here]

**Tenant**: Tata Industries  
**Reporting Period**: FY 2024-25 Q1  
**Analyst**: Sairam

## Three Source Types

### 1. SAP — Fuel & Procurement (Scope 1)
- **Format**: MB51 pipe-delimited flat file export
- **Why**: Most SAP admins can produce this without middleware (vs IDoc complexity or OData Gateway setup)
- **Challenges handled**: Hindi descriptions, KL→L conversions, plant code lookups, BWART filtering, negative quantities (reversals)

### 2. Utility Electricity (Scope 2)
- **Format**: CSV exports from DISCOM portals (MSEDCL, TATA Power, CESC, BESCOM, TANGEDCO)
- **Why**: Indian utilities rarely offer APIs; manual portal download is standard practice
- **Challenges handled**: Regional grid factors (CEA India 2023), HT meter formats, outliers, multiple meters per facility

### 3. Corporate Travel (Scope 3)
- **Format**: SAP Concur / ITILITE CSV extracts
- **Why**: Accessible via scheduled extracts (APIs require provisioning)
- **Challenges handled**: Missing IATA codes, Indian Railways, domestic/international flights, cabin class multipliers

## Key Features

### Dashboard
- Total records, pending review, flagged items, emission totals
- Scope 1/2/3 breakdown with emission factors
- Emissions by category visualization
- Batch status overview

### Review & Approve
- Filterable, sortable table (search, status, scope, source, flags)
- Record detail modal with normalized data, raw source data, flags, and full audit trail
- Single and bulk approve/reject actions
- Approved records are locked for audit

### Data Model Highlights
- Multi-tenancy via `tenantId`
- Scope 1/2/3 categorization
- Source-of-truth tracking (`rawSourceData`, `batchId`)
- Emission factor attribution (source & version)
- Audit trail with edit history
- Data quality flagging system

## Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Data Processing**: Papa Parse (CSV), custom normalization engine
- **Build**: Vite single-file plugin (300 KB gzipped)

## Emission Factor Sources

- **Scope 1**: IPCC 2006 / India GHG Program (HSD, MS, LPG, PNG, Furnace Oil)
- **Scope 2**: CEA India CO₂ Database 2023 (Regional: North 0.85, South 0.78, West 0.80, East 0.88 kgCO₂e/kWh)
- **Scope 3**: DEFRA 2024 + Indian Railways Sustainability Report 2023

## Sample Data Quality Issues

The prototype includes realistic data quality challenges that analysts must resolve:

**SAP**: Hindi descriptions, kiloliter units, movement type 201 (non-fuel), unknown plant codes, negative reversals

**Utility**: Non-calendar billing periods, 10x usage outliers, empty meter reads, swapped dates

**Travel**: Missing IATA codes, zero-night hotels, unknown expense types, same origin/destination errors

## Running Locally

```bash
npm install
npm run dev
