# Intelligent Business Approval, Licensing & Compliance Management Platform

A full-stack enterprise Single-Window compliance platform for businesses to discover, apply for, and track statutory licences and departmental approvals, and for government officers to scrutinize applications, schedule inspections, issue digital certificates, and monitor bottlenecks.

---

## 1. Quick Start Guide (Windows)

### Prerequisites
- Node.js v18+ (verified on Node v24)
- (Optional) MySQL Server (or XAMPP / MariaDB). *Note: The application has a built-in persistent zero-config database fallback (`server/data/local_db.json`), so it runs immediately out of the box even without MySQL running!*

### Step 1: Start the Backend API Server
Open a terminal in the project root:
```cmd
cd server
npm start
```
- API Server listens on: **`http://localhost:5000`**
- Health Check: `http://localhost:5000/api/health`

### Step 2: Start the Frontend Client
Open a second terminal:
```cmd
cd client
npm run dev
```
- Web Application opens on: **`http://localhost:5173`**

---

## 2. Pre-Seeded Test Credentials

Use these credentials or click the **1-Click Demo Switcher** directly on the Landing or Login page:

| Role | Name | Email | Password | Department / Responsibility |
| :--- | :--- | :--- | :--- | :--- |
| **Business User** | Vikram Sharma | `vikram@apexfoods.com` | `password123` | Apex Agro Foods & Beverages Ltd |
| **Gov Officer (PCB)** | Officer Rajesh Verma | `officer.pcb@gov.in` | `password123` | State Pollution Control Board |
| **Gov Officer (Fire)** | Officer Priya Nair | `officer.fire@gov.in` | `password123` | Fire and Rescue Services |
| **System Admin** | Platform SuperAdmin | `admin@gov.in` | `password123` | Platform Governance & Rule Config |

---

## 3. Database Setup (Optional Live MySQL)

If you wish to run on a local MySQL server:
1. Ensure MySQL is running on `localhost:3306`.
2. Open your MySQL client (MySQL Workbench, HeidiSQL, or command line):
   ```sql
   SOURCE server/schema.sql;
   ```
3. Update `server/.env` with your MySQL user/password:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=business_compliance_db
   ```

---

## 4. Key Architecture & Logic Guide

### A. Intelligent Rule Engine (`server/src/services/ruleEngine.js`)
- **How it works**:
  Instead of hardcoding business types in code, rules are stored as data records in the `approval_rules` database table:
  ```sql
  (approval_type_id, condition_field, condition_operator, condition_value)
  ```
  - `condition_field`: Dynamically pulls any attribute from `business_profiles` (e.g. `sector`, `investment`, `environmental_category`, `employees`, `business_stage`).
  - `condition_operator`: Supports `=`, `!=`, `>`, `>=`, `<`, `<=`, `IN` (comma-separated list), and `CONTAINS`.
  - When a user enters or updates their business profile, the rule engine iterates through all approval types, runs dynamic comparison for all active rules, and generates a tailored approval checklist.
  - **Risk Score Calculation**: Computes a 0–100 risk score based on CPCB environmental categorization (Red = +40, Orange = +25, Green = +10), capital investment threshold, and workforce size. High-risk files are flagged for multi-level officer scrutiny.

### B. Dependency Analysis & Compliance Roadmap (`server/src/services/dependencyEngine.js`)
- **How it works**:
  Dependencies are stored as a Directed Acyclic Graph (DAG) in `approval_dependencies`:
  ```sql
  (approval_type_id, depends_on_approval_type_id)
  ```
  - Example: *Factory Building Plan Approval* requires *Consent to Establish (CTE)* and *Fire Preliminary NOC* first.
  - The engine performs **topological sorting** on the applicable approvals to structure a multi-stage execution roadmap (Stage 1 &rarr; Stage 2 &rarr; Stage 3 &rarr; Stage 4).
  - For each stage, the system checks whether prerequisite applications have been marked `Approved`. If missing prerequisites exist, the application is locked with a clear indicator; once approved, it transitions to `Ready to Apply`.

### C. AI Document Verification (`server/src/services/documentValidator.js`)
- Validates uploaded evidence documents before final submission to government departments.
- Checks file format, minimum byte integrity, and inspects file heuristics against the document type requirements (e.g., identity verification, architectural plan verification).
- Provides instant actionable feedback (`Valid` vs `Defect Detected`) with deficiency remarks so applicants can fix files before official scrutiny.

### D. Single-Window Department Scrutiny & Inspection Workflow
1. **Application Filing**: Verified company data is reused without re-typing.
2. **Department Scrutiny Desk**: Officers view assigned files, verify documents, and record mandatory comments.
3. **Physical Inspections**: Mandatory for high-risk clearances (e.g., Pollution CTE, Fire Safety). The officer schedules the site visit, inspects the premises, records a score (0–100), and uploads the field report.
4. **Digital Certificate Issuance**: Approvals automatically generate an electronic licence record with a unique licence number, validity period, and tamper-proof cryptographic QR code hash.
5. **Continuous Compliance & Renewal Alerts**: Licences display live expiry countdowns and advance renewal alerts.
6. **Grievance Redressal**: Applicants can lodge formal dispute tickets on delayed applications, which are tracked and resolved by designated nodal officers.
7. **Cross-Department Bottleneck Analytics**: The admin console and officer dashboards track statutory 14-day SLA limits and automatically flag bottlenecks across departments.
