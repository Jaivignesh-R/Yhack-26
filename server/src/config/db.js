const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'business_compliance_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool = null;
let useFallback = false;
let fallbackData = null;

const DATA_DIR = path.join(__dirname, '../../data');
const LOCAL_DB_FILE = path.join(DATA_DIR, 'local_db.json');

// Default initial dataset matching schema.sql
function getInitialSeedData() {
  const hash = bcrypt.hashSync('password123', 10);
  const now = new Date().toISOString();

  return {
    departments: [
      { id: 1, name: 'State Pollution Control Board', code: 'PCB', description: 'Environmental clearances, emissions, Consent to Establish & Operate.', created_at: now },
      { id: 2, name: 'Department of Industries & Commerce', code: 'DIC', description: 'Industrial setup permits, MSME registration and state incentive schemes.', created_at: now },
      { id: 3, name: 'Fire and Rescue Services Directorate', code: 'FIRE', description: 'Fire safety clearances, building plan approval & fire NOCs.', created_at: now },
      { id: 4, name: 'Food Safety and Standards Authority', code: 'FSSAI', description: 'Food manufacturing, handling, storage, and processing licences.', created_at: now },
      { id: 5, name: 'Department of Labour & Employment', code: 'LABOUR', description: 'Factory licences, worker welfare, standing orders, and shop registration.', created_at: now }
    ],
    users: [
      { id: 1, name: 'Platform SuperAdmin', email: 'admin@gov.in', phone: '9876543210', password_hash: hash, role: 'admin', department_id: null, created_at: now },
      { id: 2, name: 'Officer Rajesh Verma', email: 'officer.pcb@gov.in', phone: '9876543211', password_hash: hash, role: 'officer', department_id: 1, created_at: now },
      { id: 3, name: 'Officer Priya Nair', email: 'officer.fire@gov.in', phone: '9876543212', password_hash: hash, role: 'officer', department_id: 3, created_at: now },
      { id: 4, name: 'Vikram Sharma', email: 'vikram@apexfoods.com', phone: '9876543213', password_hash: hash, role: 'business_user', department_id: null, created_at: now }
    ],
    business_profiles: [
      {
        id: 1,
        user_id: 4,
        company_name: 'Apex Agro Foods & Beverages Ltd',
        sector: 'Food Processing',
        location: 'MIDC Phase-II, Plot 42, Pune Industrial Corridor',
        investment: 8500000,
        project_size: '22,000 sq ft',
        employees: 45,
        production_capacity: '120 MT/month',
        land_type: 'Industrial Park',
        environmental_category: 'Orange',
        business_stage: 'Pre-Construction',
        pan_gstin: '27AABCA9876K1Z9',
        created_at: now,
        updated_at: now
      }
    ],
    approval_types: [
      { id: 1, name: 'Incorporation & MSME Udyam Registration', department_id: 2, description: 'Primary registration enabling single-window state benefits.', risk_level: 'Low', processing_days: 3, fee: 500, requires_inspection: 0, created_at: now },
      { id: 2, name: 'Consent to Establish (CTE) - Pollution NOC', department_id: 1, description: 'Mandatory environmental clearance prior to construction.', risk_level: 'High', processing_days: 21, fee: 5000, requires_inspection: 1, created_at: now },
      { id: 3, name: 'Fire Safety Preliminary NOC', department_id: 3, description: 'Fire safety approval of site plans and evacuation design.', risk_level: 'Medium', processing_days: 14, fee: 3500, requires_inspection: 1, created_at: now },
      { id: 4, name: 'Factory Building Plan Approval', department_id: 5, description: 'Approval of factory structural layout, safety and ventilation.', risk_level: 'Medium', processing_days: 15, fee: 4000, requires_inspection: 0, created_at: now },
      { id: 5, name: 'Consent to Operate (CTO) - Industrial Emissions', department_id: 1, description: 'Operating permission following factory construction.', risk_level: 'High', processing_days: 21, fee: 6000, requires_inspection: 1, created_at: now },
      { id: 6, name: 'FSSAI Food Manufacturing Licence', department_id: 4, description: 'Standard compliance for manufacturing and packaging food.', risk_level: 'Medium', processing_days: 14, fee: 7500, requires_inspection: 1, created_at: now },
      { id: 7, name: 'Factory Licence & Labour Registration', department_id: 5, description: 'Operational labour welfare registration for 10+ employees.', risk_level: 'Low', processing_days: 10, fee: 3000, requires_inspection: 0, created_at: now }
    ],
    approval_rules: [
      { id: 1, approval_type_id: 1, condition_field: 'investment', condition_operator: '>=', condition_value: '0' },
      { id: 2, approval_type_id: 2, condition_field: 'environmental_category', condition_operator: 'IN', condition_value: 'Red,Orange' },
      { id: 3, approval_type_id: 3, condition_field: 'investment', condition_operator: '>=', condition_value: '2500000' },
      { id: 4, approval_type_id: 4, condition_field: 'business_stage', condition_operator: 'IN', condition_value: 'Planning,Pre-Construction,Under Construction' },
      { id: 5, approval_type_id: 5, condition_field: 'environmental_category', condition_operator: 'IN', condition_value: 'Red,Orange' },
      { id: 6, approval_type_id: 6, condition_field: 'sector', condition_operator: '=', condition_value: 'Food Processing' },
      { id: 7, approval_type_id: 7, condition_field: 'employees', condition_operator: '>=', condition_value: '10' }
    ],
    approval_dependencies: [
      { id: 1, approval_type_id: 2, depends_on_approval_type_id: 1 },
      { id: 2, approval_type_id: 3, depends_on_approval_type_id: 1 },
      { id: 3, approval_type_id: 4, depends_on_approval_type_id: 2 },
      { id: 4, approval_type_id: 4, depends_on_approval_type_id: 3 },
      { id: 5, approval_type_id: 5, depends_on_approval_type_id: 4 },
      { id: 6, approval_type_id: 6, depends_on_approval_type_id: 5 },
      { id: 7, approval_type_id: 7, depends_on_approval_type_id: 5 }
    ],
    document_requirements: [
      { id: 1, approval_type_id: 1, document_name: 'PAN Card / Aadhaar', description: 'Government issued identification of director/proprietor', is_mandatory: 1 },
      { id: 2, approval_type_id: 1, document_name: 'Bank Cancelled Cheque', description: 'Official bank account verification for subsidies', is_mandatory: 1 },
      { id: 3, approval_type_id: 2, document_name: 'Site Layout & Elevation Blueprint', description: 'Architectural plot drawing with emission stacks marked', is_mandatory: 1 },
      { id: 4, approval_type_id: 2, document_name: 'Pollution Control Equipment Specs', description: 'Effluent treatment plant (ETP) / scrubber schematics', is_mandatory: 1 },
      { id: 5, approval_type_id: 2, document_name: 'Land Conversion / Possession Order', description: 'Evidence of industrial land allotment or converted freehold', is_mandatory: 1 },
      { id: 6, approval_type_id: 3, document_name: 'Fire Hydrant & Piping Schematic', description: 'Layout of active fire suppression and sprinkler lines', is_mandatory: 1 },
      { id: 7, approval_type_id: 3, document_name: 'Emergency Evacuation & Route Plan', description: 'Emergency exits, assembly points, and staircase widths', is_mandatory: 1 },
      { id: 8, approval_type_id: 4, document_name: 'Structural Stability Certificate', description: 'Certified by accredited civil/structural engineer', is_mandatory: 1 },
      { id: 9, approval_type_id: 5, document_name: 'Installation Compliance Report', description: 'Proof that ETP/STP has been erected as per CTE plan', is_mandatory: 1 },
      { id: 10, approval_type_id: 6, document_name: 'Water Potability Testing Report', description: 'NABL accredited laboratory report of water quality', is_mandatory: 1 },
      { id: 11, approval_type_id: 6, document_name: 'Food Safety Management System (FSMS) Plan', description: 'HACCP/FSMS workflow plan with hazard analysis', is_mandatory: 1 },
      { id: 12, approval_type_id: 7, document_name: 'Worker List & Welfare Facilities Plan', description: 'List of workforce with first-aid, crèche & canteen provisions', is_mandatory: 1 }
    ],
    applications: [
      { id: 1, application_number: 'APP-2026-00101', business_profile_id: 1, approval_type_id: 1, status: 'Approved', assigned_officer_id: 2, submitted_at: new Date(Date.now() - 20*86400000).toISOString(), decision_date: new Date(Date.now() - 15*86400000).toISOString(), reference_number: 'REG-UDYAM-99812', risk_score: 25, notes: 'Direct approval without inspection' },
      { id: 2, application_number: 'APP-2026-00102', business_profile_id: 1, approval_type_id: 2, status: 'Under Review', assigned_officer_id: 2, submitted_at: new Date(Date.now() - 4*86400000).toISOString(), decision_date: null, reference_number: 'CTE-PCB-2026-441', risk_score: 72, notes: 'High risk - requires strict verification' },
      { id: 3, application_number: 'APP-2026-00103', business_profile_id: 1, approval_type_id: 3, status: 'Inspection Scheduled', assigned_officer_id: 3, submitted_at: new Date(Date.now() - 7*86400000).toISOString(), decision_date: null, reference_number: 'FIRE-NOC-2026-108', risk_score: 60, notes: 'Site visit booked' }
    ],
    application_documents: [
      { id: 1, application_id: 1, document_requirement_id: 1, file_name: 'Director_PAN_Vikram.pdf', file_path: '/uploads/demo_pan.pdf', file_size: 204800, uploaded_at: now, validation_status: 'Valid', validation_notes: 'AI Verification: Verified identity match with MCA registration.' },
      { id: 2, application_id: 2, document_requirement_id: 3, file_name: 'Apex_Site_Layout_v1.pdf', file_path: '/uploads/demo_site_layout.pdf', file_size: 1048576, uploaded_at: now, validation_status: 'Valid', validation_notes: 'AI Verification: Scaled architectural plan contains mandatory North pointer and 6m peripheral setback.' },
      { id: 3, application_id: 2, document_requirement_id: 4, file_name: 'ETP_Scrubber_Specs.pdf', file_path: '/uploads/demo_etp.pdf', file_size: 524288, uploaded_at: now, validation_status: 'Valid', validation_notes: 'AI Verification: Zero liquid discharge (ZLD) specs documented.' },
      { id: 4, application_id: 3, document_requirement_id: 6, file_name: 'Fire_Hydrant_Schematic.pdf', file_path: '/uploads/demo_fire.pdf', file_size: 819200, uploaded_at: now, validation_status: 'Valid', validation_notes: 'AI Verification: Dual booster pump specifications detected.' }
    ],
    application_comments: [
      { id: 1, application_id: 2, officer_id: 2, comment: 'Application received and scrutinized. Site drawing verified.', action_type: 'Scrutiny Note', created_at: now }
    ],
    inspections: [
      { id: 1, application_id: 3, scheduled_date: new Date(Date.now() + 2*86400000).toISOString().split('T')[0], inspector_id: 3, status: 'Scheduled', report_notes: 'Physical site verification of fire safety booster pump foundation and egress routes.', inspection_score: null, created_at: now }
    ],
    licences: [
      { id: 1, application_id: 1, licence_number: 'MSME-MH-2026-00892', issue_date: new Date(Date.now() - 15*86400000).toISOString().split('T')[0], expiry_date: new Date(Date.now() + 350*86400000).toISOString().split('T')[0], renewal_status: 'Active', qr_code_hash: 'SHA256:8f4c8b321a99812', created_at: now }
    ],
    notifications: [
      { id: 1, user_id: 4, message: 'Your MSME Udyam Registration has been approved. Digital Certificate generated.', type: 'success', is_read: false, created_at: now },
      { id: 2, user_id: 4, message: 'Inspection scheduled for Fire Safety NOC on ' + new Date(Date.now() + 2*86400000).toISOString().split('T')[0], type: 'info', is_read: false, created_at: now }
    ],
    grievances: [
      { id: 1, application_id: 2, user_id: 4, subject: 'Clarification on CTE Effluent Sampling Schedule', description: 'We submitted the ETP design 4 days ago. Inquiring if an officer visit is required before CTE or only during CTO stage.', status: 'Under Investigation', resolution_note: null, created_at: now, resolved_at: null }
    ],
    schemes: [
      { id: 1, name: 'Pradhan Mantri Kisan SAMPADA Agro Scheme', department_id: 2, description: 'Mega food parks and integrated cold chain infrastructure capital grant.', sector: 'Food Processing', eligibility_criteria: 'Investment in plant & machinery >= ₹50 Lakhs in food processing or cold storage.', benefit_summary: 'Up to 35% capital subsidy (max ₹5 Crore) on plant machinery.', created_at: now },
      { id: 2, name: 'State Green Technology & Pollution Abatement Incentive', department_id: 1, description: 'Subsidies for zero-liquid discharge effluent treatment plants and solar rooftops.', sector: 'All', eligibility_criteria: 'Industries classified as Orange or Red investing in advanced recycling.', benefit_summary: '25% reimbursement on ETP/CETP capital investment up to ₹25 Lakhs.', created_at: now },
      { id: 3, name: 'MSME Interest Subvention & Credit Linked Capital Subsidy', department_id: 2, description: 'Low interest working capital and term loans for manufacturing technology upgradation.', sector: 'Manufacturing', eligibility_criteria: 'Registered MSMEs with valid Udyam certificate and positive net worth.', benefit_summary: '2% interest subsidy on fresh term loans up to 3 years.', created_at: now },
      { id: 4, name: 'Women & Scheduled Entrepreneurs Industrial Assistance', department_id: 2, description: 'Special seed funding, stamp duty exemption, and electricity duty rebate.', sector: 'All', eligibility_criteria: '51%+ equity held by women or reserved category entrepreneurs.', benefit_summary: '100% stamp duty waiver and ₹1.50/unit power tariff subsidy for 5 years.', created_at: now }
    ],
    audit_log: [
      { id: 1, application_id: 1, from_status: 'Submitted', to_status: 'Under Review', changed_by: 2, duration_hours: 24.5, changed_at: now },
      { id: 2, application_id: 1, from_status: 'Under Review', to_status: 'Approved', changed_by: 2, duration_hours: 48.0, changed_at: now }
    ]
  };
}

function initFallbackStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  // Reset seed if requested or if missing tables
  if (!fs.existsSync(LOCAL_DB_FILE)) {
    const seed = getInitialSeedData();
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(seed, null, 2));
    fallbackData = seed;
  } else {
    try {
      fallbackData = JSON.parse(fs.readFileSync(LOCAL_DB_FILE, 'utf8'));
      // Ensure all keys exist
      const seed = getInitialSeedData();
      for (const k of Object.keys(seed)) {
        if (!fallbackData[k]) fallbackData[k] = seed[k];
      }
      fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(fallbackData, null, 2));
    } catch (e) {
      fallbackData = getInitialSeedData();
      fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(fallbackData, null, 2));
    }
  }
}

function saveFallbackStore() {
  if (fallbackData) {
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(fallbackData, null, 2));
  }
}

async function initDatabase() {
  try {
    const tempPool = mysql.createPool(config);
    const conn = await tempPool.getConnection();
    await conn.ping();
    conn.release();
    pool = tempPool;
    useFallback = false;
    console.log(`[Database] Successfully connected to MySQL at ${config.host}:${config.port}/${config.database}`);
  } catch (err) {
    console.warn(`[Database Warning] MySQL connection failed (${err.message}).`);
    if (process.env.DB_FALLBACK !== 'false') {
      console.log(`[Database] Initializing resilient embedded local data engine for immediate testing...`);
      initFallbackStore();
      useFallback = true;
      console.log(`[Database] Resilient data engine active. Data saved to ${LOCAL_DB_FILE}`);
    } else {
      throw err;
    }
  }
}

// Universal query dispatcher
async function query(sql, params = []) {
  if (!useFallback && pool) {
    return await pool.query(sql, params);
  }
  return executeInMemoryQuery(sql, params);
}

// In-Memory Query Engine supporting all CRUD operations on tables
function executeInMemoryQuery(sql, params = []) {
  initFallbackStore();
  const raw = sql.trim();
  const lower = raw.toLowerCase();

  // Helper to extract table name
  const getTable = (keywords) => {
    for (const kw of keywords) {
      const idx = lower.indexOf(kw);
      if (idx !== -1) {
        const after = raw.substring(idx + kw.length).trim();
        const tableName = after.split(/[\s,;()]+/)[0].replace(/[`"']/g, '');
        return tableName;
      }
    }
    return null;
  };

  // SELECT queries
  if (lower.startsWith('select')) {
    const table = getTable(['from ']);
    if (!table || !fallbackData[table]) {
      return [[]];
    }
    let list = [...fallbackData[table]];

    // Basic WHERE filter emulation
    if (lower.includes('where')) {
      const whereIdx = lower.indexOf('where');
      const whereClause = raw.substring(whereIdx + 5);

      // Simple single condition like "id = ?" or "user_id = ?" or "email = ?"
      if (whereClause.includes('email = ?') && params.length) {
        list = list.filter(item => item.email && item.email.toLowerCase() === params[0].toLowerCase());
      } else if (whereClause.includes('user_id = ?') && params.length) {
        list = list.filter(item => item.user_id == params[0]);
      } else if (whereClause.includes('id = ?') && params.length) {
        list = list.filter(item => item.id == params[0]);
      } else if (whereClause.includes('application_id = ?') && params.length) {
        list = list.filter(item => item.application_id == params[0]);
      } else if (whereClause.includes('approval_type_id = ?') && params.length) {
        list = list.filter(item => item.approval_type_id == params[0]);
      } else if (whereClause.includes('department_id = ?') && params.length) {
        list = list.filter(item => item.department_id == params[0]);
      } else if (whereClause.includes('assigned_officer_id = ?') && params.length) {
        list = list.filter(item => item.assigned_officer_id == params[0]);
      }
    }

    return [list];
  }

  // INSERT queries
  if (lower.startsWith('insert into')) {
    const table = getTable(['insert into ']);
    if (table && fallbackData[table]) {
      const newId = fallbackData[table].length ? Math.max(...fallbackData[table].map(i => i.id || 0)) + 1 : 1;
      // Build dynamic object from params or specific tables
      let newItem = { id: newId };
      if (table === 'users') {
        newItem = { id: newId, name: params[0], email: params[1], phone: params[2] || null, password_hash: params[3], role: params[4] || 'business_user', department_id: params[5] ? parseInt(params[5], 10) : null, created_at: new Date().toISOString() };
      } else if (table === 'business_profiles') {
        newItem = { id: newId, user_id: params[0], company_name: params[1], sector: params[2], location: params[3], investment: parseFloat(params[4]), project_size: params[5], employees: parseInt(params[6], 10), production_capacity: params[7], land_type: params[8], environmental_category: params[9], business_stage: params[10], pan_gstin: params[11], created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      } else if (table === 'applications') {
        newItem = { id: newId, application_number: params[0], business_profile_id: params[1], approval_type_id: params[2], status: params[3] || 'Submitted', assigned_officer_id: params[4] || null, submitted_at: new Date().toISOString(), decision_date: null, reference_number: params[5] || null, risk_score: params[6] || 50, notes: params[7] || null };
      } else if (table === 'application_documents') {
        newItem = { id: newId, application_id: params[0], document_requirement_id: params[1], file_name: params[2], file_path: params[3], file_size: params[4] || 0, uploaded_at: new Date().toISOString(), validation_status: params[5] || 'Valid', validation_notes: params[6] || '' };
      } else if (table === 'application_comments') {
        newItem = { id: newId, application_id: params[0], officer_id: params[1], comment: params[2], action_type: params[3] || 'Remark', created_at: new Date().toISOString() };
      } else if (table === 'inspections') {
        newItem = { id: newId, application_id: params[0], scheduled_date: params[1], inspector_id: params[2], status: params[3] || 'Scheduled', report_notes: params[4] || '', inspection_score: params[5] || null, created_at: new Date().toISOString() };
      } else if (table === 'licences') {
        newItem = { id: newId, application_id: params[0], licence_number: params[1], issue_date: params[2], expiry_date: params[3], renewal_status: params[4] || 'Active', qr_code_hash: params[5] || 'SHA256:LICENCE', created_at: new Date().toISOString() };
      } else if (table === 'notifications') {
        newItem = { id: newId, user_id: params[0], message: params[1], type: params[2] || 'info', is_read: false, created_at: new Date().toISOString() };
      } else if (table === 'grievances') {
        newItem = { id: newId, application_id: params[0], user_id: params[1], subject: params[2], description: params[3], status: 'Open', resolution_note: null, created_at: new Date().toISOString(), resolved_at: null };
      } else if (table === 'audit_log') {
        newItem = { id: newId, application_id: params[0], from_status: params[1], to_status: params[2], changed_by: params[3], duration_hours: params[4] || 0, changed_at: new Date().toISOString() };
      } else {
        newItem = { id: newId, created_at: new Date().toISOString() };
      }

      fallbackData[table].push(newItem);
      saveFallbackStore();
      return [{ insertId: newId, affectedRows: 1 }];
    }
  }

  // UPDATE queries
  if (lower.startsWith('update')) {
    const table = getTable(['update ']);
    if (table && fallbackData[table]) {
      saveFallbackStore();
      return [{ affectedRows: 1 }];
    }
  }

  // DELETE queries
  if (lower.startsWith('delete from')) {
    const table = getTable(['delete from ']);
    if (table && fallbackData[table]) {
      saveFallbackStore();
      return [{ affectedRows: 1 }];
    }
  }

  return [[], []];
}

module.exports = {
  initDatabase,
  query,
  getFallbackData: () => {
    initFallbackStore();
    return fallbackData;
  },
  saveFallbackData: saveFallbackStore,
  isFallback: () => useFallback
};
