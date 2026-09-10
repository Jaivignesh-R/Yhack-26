-- =============================================================================
-- Intelligent Business Approval, Licensing & Compliance Management Platform
-- Complete MySQL Database Schema & Rich Seed Data
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `business_compliance_db`
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `business_compliance_db`;

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS `departments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL UNIQUE,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Users Table (business_user, officer, admin)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(20),
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('business_user', 'officer', 'admin') NOT NULL DEFAULT 'business_user',
  `department_id` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Business Profiles Table
CREATE TABLE IF NOT EXISTS `business_profiles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `company_name` VARCHAR(200) NOT NULL,
  `sector` VARCHAR(100) NOT NULL, -- e.g. Manufacturing, Food Processing, IT & Software, Healthcare, Chemicals, Retail
  `location` VARCHAR(255) NOT NULL,
  `investment` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `project_size` VARCHAR(100) NOT NULL, -- e.g. '15,000 sq ft'
  `employees` INT NOT NULL DEFAULT 10,
  `production_capacity` VARCHAR(150) NOT NULL, -- e.g. '500 Metric Tons/Month'
  `land_type` ENUM('Industrial Park', 'Commercial Zone', 'Agricultural (Converted)', 'Private Freehold') NOT NULL DEFAULT 'Industrial Park',
  `environmental_category` ENUM('Red', 'Orange', 'Green', 'White') NOT NULL DEFAULT 'Orange',
  `business_stage` ENUM('Planning', 'Pre-Construction', 'Under Construction', 'Operational', 'Expansion') NOT NULL DEFAULT 'Planning',
  `pan_gstin` VARCHAR(50) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Approval Types Table
CREATE TABLE IF NOT EXISTS `approval_types` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL,
  `department_id` INT NOT NULL,
  `description` TEXT,
  `risk_level` ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
  `processing_days` INT DEFAULT 14,
  `fee` DECIMAL(10,2) DEFAULT 2500.00,
  `requires_inspection` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Data-driven Approval Rules Engine Table
CREATE TABLE IF NOT EXISTS `approval_rules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `approval_type_id` INT NOT NULL,
  `condition_field` VARCHAR(50) NOT NULL, -- e.g. 'sector', 'investment', 'employees', 'environmental_category'
  `condition_operator` VARCHAR(10) NOT NULL, -- '=', '!=', '>', '>=', '<', '<=', 'IN'
  `condition_value` VARCHAR(255) NOT NULL, -- e.g. 'Manufacturing', '5000000', 'Red,Orange'
  `rule_group` VARCHAR(50) DEFAULT 'default',
  FOREIGN KEY (`approval_type_id`) REFERENCES `approval_types`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Approval Dependencies Table (Directed Acyclic Graph)
CREATE TABLE IF NOT EXISTS `approval_dependencies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `approval_type_id` INT NOT NULL,
  `depends_on_approval_type_id` INT NOT NULL,
  FOREIGN KEY (`approval_type_id`) REFERENCES `approval_types`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`depends_on_approval_type_id`) REFERENCES `approval_types`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Document Requirements Table
CREATE TABLE IF NOT EXISTS `document_requirements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `approval_type_id` INT NOT NULL,
  `document_name` VARCHAR(200) NOT NULL,
  `description` VARCHAR(255) NULL,
  `is_mandatory` BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (`approval_type_id`) REFERENCES `approval_types`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Applications Table
CREATE TABLE IF NOT EXISTS `applications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `application_number` VARCHAR(60) NOT NULL UNIQUE,
  `business_profile_id` INT NOT NULL,
  `approval_type_id` INT NOT NULL,
  `status` ENUM(
    'Draft',
    'Submitted',
    'Under Review',
    'Correction Required',
    'Inspection Scheduled',
    'Inspection Completed',
    'Approved',
    'Rejected'
  ) NOT NULL DEFAULT 'Submitted',
  `assigned_officer_id` INT NULL,
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `decision_date` TIMESTAMP NULL,
  `reference_number` VARCHAR(100) NULL,
  `risk_score` INT DEFAULT 50, -- 0 to 100 risk score based on category & investment
  `notes` TEXT NULL,
  FOREIGN KEY (`business_profile_id`) REFERENCES `business_profiles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`approval_type_id`) REFERENCES `approval_types`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`assigned_officer_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Application Documents Table (with AI/rule validation status)
CREATE TABLE IF NOT EXISTS `application_documents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `application_id` INT NOT NULL,
  `document_requirement_id` INT NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `file_size` INT DEFAULT 0,
  `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `validation_status` ENUM('Pending', 'Valid', 'Invalid') DEFAULT 'Pending',
  `validation_notes` TEXT NULL,
  FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`document_requirement_id`) REFERENCES `document_requirements`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Application Comments / Defect Trail
CREATE TABLE IF NOT EXISTS `application_comments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `application_id` INT NOT NULL,
  `officer_id` INT NULL,
  `comment` TEXT NOT NULL,
  `action_type` VARCHAR(50) DEFAULT 'Remark',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`officer_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Inspections Table
CREATE TABLE IF NOT EXISTS `inspections` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `application_id` INT NOT NULL UNIQUE,
  `scheduled_date` DATE NOT NULL,
  `inspector_id` INT NULL,
  `status` ENUM('Scheduled', 'Completed', 'Defects Found', 'Cancelled') DEFAULT 'Scheduled',
  `report_notes` TEXT NULL,
  `inspection_score` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`inspector_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Licences / Digital Certificates Table
CREATE TABLE IF NOT EXISTS `licences` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `application_id` INT NOT NULL UNIQUE,
  `licence_number` VARCHAR(100) NOT NULL UNIQUE,
  `issue_date` DATE NOT NULL,
  `expiry_date` DATE NOT NULL,
  `renewal_status` ENUM('Active', 'Expiring Soon', 'Expired', 'Renewed') DEFAULT 'Active',
  `qr_code_hash` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. Notifications Table
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(50) DEFAULT 'info',
  `is_read` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. Grievances & Escalations Table
CREATE TABLE IF NOT EXISTS `grievances` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `application_id` INT NULL,
  `user_id` INT NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `status` ENUM('Open', 'Under Investigation', 'Resolved', 'Escalated') DEFAULT 'Open',
  `resolution_note` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` TIMESTAMP NULL,
  FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 15. Government Schemes & Subsidies Table
CREATE TABLE IF NOT EXISTS `schemes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `department_id` INT NULL,
  `description` TEXT NOT NULL,
  `sector` VARCHAR(100) NOT NULL, -- 'All' or specific like 'Manufacturing'
  `eligibility_criteria` TEXT NOT NULL,
  `benefit_summary` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 16. Audit Log (for timeline & bottleneck tracking)
CREATE TABLE IF NOT EXISTS `audit_log` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `application_id` INT NOT NULL,
  `from_status` VARCHAR(50) NULL,
  `to_status` VARCHAR(50) NOT NULL,
  `changed_by` INT NULL,
  `changed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `duration_hours` DECIMAL(10,2) DEFAULT 0.00,
  FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`changed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- Comprehensive Seed Data
-- =============================================================================

-- Departments
INSERT INTO `departments` (`id`, `name`, `code`, `description`) VALUES
(1, 'State Pollution Control Board', 'PCB', 'Environmental clearances, emissions, Consent to Establish & Operate.'),
(2, 'Department of Industries & Commerce', 'DIC', 'Industrial setup permits, MSME registration and state incentive schemes.'),
(3, 'Fire and Rescue Services Directorate', 'FIRE', 'Fire safety clearances, building plan approval & fire NOCs.'),
(4, 'Food Safety and Standards Authority', 'FSSAI', 'Food manufacturing, handling, storage, and processing licences.'),
(5, 'Department of Labour & Employment', 'LABOUR', 'Factory licences, worker welfare, standing orders, and shop registration.')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Demo Users (passwords: 'password123')
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password_hash`, `role`, `department_id`) VALUES
(1, 'Platform SuperAdmin', 'admin@gov.in', '9876543210', '$2a$10$wY9eBqR39z3l.Vq7qK6vceg42yvRzZ1p/0M5Z6Nfx6s8xU1vJ9iW2', 'admin', NULL),
(2, 'Officer Rajesh Verma', 'officer.pcb@gov.in', '9876543211', '$2a$10$wY9eBqR39z3l.Vq7qK6vceg42yvRzZ1p/0M5Z6Nfx6s8xU1vJ9iW2', 'officer', 1),
(3, 'Officer Priya Nair', 'officer.fire@gov.in', '9876543212', '$2a$10$wY9eBqR39z3l.Vq7qK6vceg42yvRzZ1p/0M5Z6Nfx6s8xU1vJ9iW2', 'officer', 3),
(4, 'Vikram Sharma', 'vikram@apexfoods.com', '9876543213', '$2a$10$wY9eBqR39z3l.Vq7qK6vceg42yvRzZ1p/0M5Z6Nfx6s8xU1vJ9iW2', 'business_user', NULL),
(5, 'Officer Anand Kumar', 'officer.dic@gov.in', '9876543214', '$2a$10$wY9eBqR39z3l.Vq7qK6vceg42yvRzZ1p/0M5Z6Nfx6s8xU1vJ9iW2', 'officer', 2),
(6, 'Officer Sunita Rao', 'officer.fssai@gov.in', '9876543215', '$2a$10$wY9eBqR39z3l.Vq7qK6vceg42yvRzZ1p/0M5Z6Nfx6s8xU1vJ9iW2', 'officer', 4),
(7, 'Officer Manoj Deshmukh', 'officer.labour@gov.in', '9876543216', '$2a$10$wY9eBqR39z3l.Vq7qK6vceg42yvRzZ1p/0M5Z6Nfx6s8xU1vJ9iW2', 'officer', 5)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Approval Types
INSERT INTO `approval_types` (`id`, `name`, `department_id`, `description`, `risk_level`, `processing_days`, `fee`, `requires_inspection`) VALUES
(1, 'Incorporation & MSME Udyam Registration', 2, 'Primary registration enabling single-window state benefits.', 'Low', 3, 500.00, FALSE),
(2, 'Consent to Establish (CTE) - Pollution NOC', 1, 'Mandatory environmental clearance prior to construction.', 'High', 21, 5000.00, TRUE),
(3, 'Fire Safety Preliminary NOC', 3, 'Fire safety approval of site plans and evacuation design.', 'Medium', 14, 3500.00, TRUE),
(4, 'Factory Building Plan Approval', 5, 'Approval of factory structural layout, safety and ventilation.', 'Medium', 15, 4000.00, FALSE),
(5, 'Consent to Operate (CTO) - Industrial Emissions', 1, 'Operating permission following factory construction.', 'High', 21, 6000.00, TRUE),
(6, 'FSSAI Food Manufacturing Licence', 4, 'Standard compliance for manufacturing and packaging food.', 'Medium', 14, 7500.00, TRUE),
(7, 'Factory Licence & Labour Registration', 5, 'Operational labour welfare registration for 10+ employees.', 'Low', 10, 3000.00, FALSE)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Approval Rules (Data-driven conditions)
-- Type 1: Udyam applies to all
INSERT INTO `approval_rules` (`approval_type_id`, `condition_field`, `condition_operator`, `condition_value`) VALUES
(1, 'investment', '>=', '0'),
-- Type 2: CTE applies if Red or Orange category OR sector Manufacturing/Food Processing
(2, 'environmental_category', 'IN', 'Red,Orange'),
-- Type 3: Fire NOC applies if project size > 2000 or investment > 2000000 or sector Manufacturing/Chemicals/Food Processing
(3, 'investment', '>=', '2500000'),
-- Type 4: Building Plan Approval applies if stage is Planning or Pre-Construction
(4, 'business_stage', 'IN', 'Planning,Pre-Construction,Under Construction'),
-- Type 5: CTO applies if Red or Orange AND stage is Under Construction or Operational
(5, 'environmental_category', 'IN', 'Red,Orange'),
-- Type 6: FSSAI applies if sector = 'Food Processing'
(6, 'sector', '=', 'Food Processing'),
-- Type 7: Labour licence if employees >= 10
(7, 'employees', '>=', '10');

-- Approval Dependencies (The Compliance Roadmap DAG)
-- CTE (2) depends on Udyam (1)
-- Fire NOC (3) depends on Udyam (1)
-- Factory Building Approval (4) depends on CTE (2) and Fire NOC (3)
-- CTO (5) depends on Factory Building Approval (4)
-- FSSAI (6) depends on CTO (5)
-- Factory Labour Licence (7) depends on CTO (5)
INSERT INTO `approval_dependencies` (`approval_type_id`, `depends_on_approval_type_id`) VALUES
(2, 1),
(3, 1),
(4, 2),
(4, 3),
(5, 4),
(6, 5),
(7, 5);

-- Document Requirements
INSERT INTO `document_requirements` (`id`, `approval_type_id`, `document_name`, `description`, `is_mandatory`) VALUES
(1, 1, 'PAN Card / Aadhaar', 'Government issued identification of director/proprietor', TRUE),
(2, 1, 'Bank Cancelled Cheque', 'Official bank account verification for subsidies', TRUE),
(3, 2, 'Site Layout & Elevation Blueprint', 'Architectural plot drawing with emission stacks marked', TRUE),
(4, 2, 'Pollution Control Equipment Specs', 'Effluent treatment plant (ETP) / scrubber schematics', TRUE),
(5, 2, 'Land Conversion / Possession Order', 'Evidence of industrial land allotment or converted freehold', TRUE),
(6, 3, 'Fire Hydrant & Piping Schematic', 'Layout of active fire suppression and sprinkler lines', TRUE),
(7, 3, 'Emergency Evacuation & Route Plan', 'Emergency exits, assembly points, and staircase widths', TRUE),
(8, 4, 'Structural Stability Certificate', 'Certified by accredited civil/structural engineer', TRUE),
(9, 5, 'Installation Compliance Report', 'Proof that ETP/STP has been erected as per CTE plan', TRUE),
(10, 6, 'Water Potability Testing Report', 'NABL accredited laboratory report of water quality', TRUE),
(11, 6, 'Food Safety Management System (FSMS) Plan', 'HACCP/FSMS workflow plan with hazard analysis', TRUE),
(12, 7, 'Worker List & Welfare Facilities Plan', 'List of workforce with first-aid, crèche & canteen provisions', TRUE);

-- Demo Business Profile for Vikram Sharma (user_id = 4)
INSERT INTO `business_profiles` (`id`, `user_id`, `company_name`, `sector`, `location`, `investment`, `project_size`, `employees`, `production_capacity`, `land_type`, `environmental_category`, `business_stage`, `pan_gstin`) VALUES
(1, 4, 'Apex Agro Foods & Beverages Ltd', 'Food Processing', 'MIDC Phase-II, Plot 42, Pune Industrial Corridor', 8500000.00, '22,000 sq ft', 45, '120 MT/month', 'Industrial Park', 'Orange', 'Pre-Construction', '27AABCA9876K1Z9')
ON DUPLICATE KEY UPDATE `company_name`=VALUES(`company_name`);

-- Demo Applications
INSERT INTO `applications` (`id`, `application_number`, `business_profile_id`, `approval_type_id`, `status`, `assigned_officer_id`, `submitted_at`, `risk_score`, `reference_number`) VALUES
(1, 'APP-2026-00101', 1, 1, 'Approved', 2, DATE_SUB(NOW(), INTERVAL 20 DAY), 25, 'REG-UDYAM-99812'),
(2, 'APP-2026-00102', 1, 2, 'Under Review', 2, DATE_SUB(NOW(), INTERVAL 4 DAY), 72, 'CTE-PCB-2026-441'),
(3, 'APP-2026-00103', 1, 3, 'Inspection Scheduled', 3, DATE_SUB(NOW(), INTERVAL 7 DAY), 60, 'FIRE-NOC-2026-108')
ON DUPLICATE KEY UPDATE `application_number`=VALUES(`application_number`);

-- Demo Documents
INSERT INTO `application_documents` (`id`, `application_id`, `document_requirement_id`, `file_name`, `file_path`, `file_size`, `validation_status`, `validation_notes`) VALUES
(1, 1, 1, 'Director_PAN_Vikram.pdf', '/uploads/demo_pan.pdf', 204800, 'Valid', 'AI Verification: Verified identity match with MCA registration.'),
(2, 2, 3, 'Apex_Site_Layout_v1.pdf', '/uploads/demo_site_layout.pdf', 1048576, 'Valid', 'AI Verification: Scaled architectural plan contains mandatory North pointer and 6m peripheral setback.'),
(3, 2, 4, 'ETP_Scrubber_Specs.pdf', '/uploads/demo_etp.pdf', 524288, 'Valid', 'AI Verification: Zero liquid discharge (ZLD) specs documented.'),
(4, 3, 6, 'Fire_Hydrant_Schematic.pdf', '/uploads/demo_fire.pdf', 819200, 'Valid', 'AI Verification: Dual booster pump specifications detected.');

-- Demo Inspection
INSERT INTO `inspections` (`id`, `application_id`, `scheduled_date`, `inspector_id`, `status`, `report_notes`, `inspection_score`) VALUES
(1, 3, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 3, 'Scheduled', 'Physical site verification of fire safety booster pump foundation and egress routes.', NULL);

-- Demo Licence (Issued for approved application 1)
INSERT INTO `licences` (`id`, `application_id`, `licence_number`, `issue_date`, `expiry_date`, `renewal_status`, `qr_code_hash`) VALUES
(1, 1, 'MSME-MH-2026-00892', DATE_SUB(CURDATE(), INTERVAL 15 DAY), DATE_ADD(CURDATE(), INTERVAL 350 DAY), 'Active', 'SHA256:8f4c8b321a99812');

-- Demo Grievance
INSERT INTO `grievances` (`id`, `application_id`, `user_id`, `subject`, `description`, `status`) VALUES
(1, 2, 4, 'Clarification on CTE Effluent Sampling Schedule', 'We submitted the ETP design 4 days ago. Inquiring if an officer visit is required before CTE or only during CTO stage.', 'Under Investigation');

-- Demo Incentive Schemes
INSERT INTO `schemes` (`id`, `name`, `department_id`, `description`, `sector`, `eligibility_criteria`, `benefit_summary`) VALUES
(1, 'Pradhan Mantri Kisan SAMPADA Agro Scheme', 2, 'Mega food parks and integrated cold chain infrastructure capital grant.', 'Food Processing', 'Investment in plant & machinery >= ₹50 Lakhs in food processing or cold storage.', 'Up to 35% capital subsidy (max ₹5 Crore) on plant machinery.'),
(2, 'State Green Technology & Pollution Abatement Incentive', 1, 'Subsidies for zero-liquid discharge effluent treatment plants and solar rooftops.', 'All', 'Industries classified as Orange or Red investing in advanced recycling.', '25% reimbursement on ETP/CETP capital investment up to ₹25 Lakhs.'),
(3, 'MSME Interest Subvention & Credit Linked Capital Subsidy', 2, 'Low interest working capital and term loans for manufacturing technology upgradation.', 'Manufacturing', 'Registered MSMEs with valid Udyam certificate and positive net worth.', '2% interest subsidy on fresh term loans up to 3 years.'),
(4, 'Women & Scheduled Entrepreneurs Industrial Assistance', 2, 'Special seed funding, stamp duty exemption, and electricity duty rebate.', 'All', '51%+ equity held by women or reserved category entrepreneurs.', '100% stamp duty waiver and ₹1.50/unit power tariff subsidy for 5 years.');

-- Demo Audit Log Entries
INSERT INTO `audit_log` (`application_id`, `from_status`, `to_status`, `changed_by`, `duration_hours`) VALUES
(1, 'Submitted', 'Under Review', 2, 24.5),
(1, 'Under Review', 'Approved', 2, 48.0),
(2, 'Submitted', 'Under Review', 2, 12.0),
(3, 'Submitted', 'Under Review', 3, 16.0),
(3, 'Under Review', 'Inspection Scheduled', 3, 36.0);
