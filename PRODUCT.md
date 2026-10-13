# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Medical Doctors & Specialists**: Outpatient and inpatient consultations, clinical diagnosis recording, electronic prescriptions, lab test ordering, and reviewing longitudinal patient medical histories.
- **Nurses & Ward Staff**: Inpatient admissions, ward bed allocations, real-time bed occupancy monitoring, and patient discharge workflows.
- **Receptionists & Front-Desk Staff**: Patient registration and MRN issuance, appointment booking, doctor schedule tracking, and appointment rescheduling.
- **Pharmacists**: Drug inventory and stock level management, batch expiry tracking, prescription fulfillment, and medication dispensing.
- **Laboratory Technicians**: Receiving test orders, specimen collection tracking, test result entry, and issuing verified diagnostic reports.
- **Cashiers & Accountants**: Generating comprehensive itemized patient bills (consultations, medications, lab tests, room rates), logging payments (Cash, Card, Online/UPI, Insurance), tracking accounts receivable, and issuing official printed receipts.
- **Hospital Administrators & HR**: Managing medical staff directories, doctor consultation fees and schedules, employee payroll, attendance tracking, and auditing executive financial and clinical KPI reports.

## Product Purpose

CareSync HMS is an integrated hospital management system designed to automate, unify, and streamline clinical, administrative, and financial operations for mid-sized private hospitals and multi-specialty clinics in Sri Lanka. Success means zero cross-department data friction: a doctor's prescription directly updates pharmacy fulfillment, an ordered lab test immediately routes to the diagnostic workbench, inpatient ward days aggregate onto the discharge bill, and all transactions reconcile accurately in Sri Lankan Rupees (Rs. / LKR) without administrative bottlenecks.

## Positioning

Unlike bloated enterprise hospital software with steep learning curves or fragmented standalone clinic tools, CareSync HMS provides an all-in-one operational core tailored for agile healthcare facilities. It balances dense clinical workflows (EMR, LIS, IPD, Pharmacy) with high-throughput reception and billing ledgers in a clean, modern, and rapid web interface.

## Operating Context

- **Operational Environments**: Fast-paced outpatient consultation rooms, busy reception desks, inpatient nursing stations, diagnostic labs, pharmacy dispensing counters, and administrative billing offices.
- **Throughput Dynamics**: High patient volume during peak hospital hours; interface demands rapid scanning, minimal modal friction, and instant visual validation.
- **Physical Artifacts & Documentation**: Official printed receipts/invoices featuring hospital seals and authorized signature sections, printable diagnostic lab test reports, and prescription summaries.
- **Currency & Regional Standards**: Sri Lankan Rupees (`Rs.` / `LKR`), regional date formats, multi-channel payment reconciliation (Cash, Card, Online Transfer / UPI, Insurance Claim settlement).

## Capabilities and Constraints

- **Core Capabilities**:
  - Role-based access control (RBAC) across 7 distinct roles (`ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`, `LAB_STAFF`, `PHARMACIST`, `ACCOUNTANT`).
  - Patient master index with standardized code generation (`PAT-YYYYMM-XXXX`) and document/scan archiving.
  - Doctor directory and time-slotted appointment scheduling with live status tracking.
  - Electronic Medical Records (EMR) with vital signs recording, clinical diagnoses, and prescriptions.
  - Inpatient Department (IPD) ward bed occupancy grids and admission/discharge workflows.
  - Laboratory Information System (LIS) test requisition, sample collection, and result reporting.
  - Pharmacy catalog management, batch-level expiry and cost/sell tracking, low stock alerts, and prescription dispensing.
  - Financial ledger with automated tax and discount calculation, payment logs, balance due tracking, and printable receipts in Sri Lankan Rupees.
  - Staff directory, monthly salary management, daily attendance logging, and leave approval workflows.
  - Executive analytics dashboards and CSV report exports.
- **Constraints**:
  - PostgreSQL ACID transaction integrity (`prisma.$transaction`) across billing, payments, and pharmacy inventory decrementing.
  - Medical confidentiality and role segregation enforced on both client routes and API endpoints.
  - Consistent Sri Lankan Rupee currency formatting across all screens and printable documents.

## Brand Commitments

- **Product Identity**: CareSync HMS — Hospital Management System.
- **Voice & Tone**: Clinical, dependable, reassuring, precise, and professional.
- **Visual Personality**: High-trust medical slate and deep blue/teal foundation, crisp data-dense tables, monospaced figures for financial and clinical values, and distinct semantic state badges.

## Evidence on Hand

- **Repository Implementation**: Production-ready React 18 / Vite / Tailwind client and Express / Prisma / PostgreSQL backend in `v:\hms_project`.
- **System Specification**: Formal specification documentation in `docs/project_specification.md`.
- **Database Schema**: Comprehensive relational schema in `server/prisma/schema.prisma`.
- **Audit & Gap Closure Records**: Documented functional reviews in `docs/audit_report.md` and `docs/walkthrough_gap_closure.md`.

## Product Principles

1. **Clinical Speed & Clarity Over Decoration**: Present dense operational data with crisp visual hierarchy; healthcare staff must absorb critical alerts, vitals, and figures in milliseconds without distracting visual ornamentation.
2. **Seamless Operational Continuum**: Every clinical touchpoint (a lab order, medication dispensed, ward bed day) must immediately propagate to patient history and billing ledgers without manual duplicate entry.
3. **Audit-Grade Traceability**: All financial transactions, invoices, medical records, and specimens maintain indelible unique identifiers (`INV-...`, `PAT-...`, `TXN-...`) and physical print-readiness.
4. **Ergonomic Counter Throughput**: Forms, filters, search bars, and action modals must minimize keystrokes and navigation hops to sustain high peak-hour patient flow.

## Accessibility & Inclusion

- High-contrast color coding for critical clinical states (Emergency urgency, Low Stock alerts, Unpaid invoice balances).
- Scannable typography, explicit form field labels, and clear tabular column headers for rapid keyboard navigation across busy hospital terminals.
