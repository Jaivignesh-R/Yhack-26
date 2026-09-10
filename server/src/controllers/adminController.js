const bcrypt = require('bcryptjs');
const db = require('../config/db');

/**
 * Get all administrative data (Departments, Types, Rules, Dependencies, Schemes, Users)
 */
async function getAdminOverview(req, res) {
  try {
    const data = db.getFallbackData();
    return res.json({
      success: true,
      departments: data.departments,
      approval_types: data.approval_types,
      approval_rules: data.approval_rules,
      approval_dependencies: data.approval_dependencies,
      document_requirements: data.document_requirements,
      schemes: data.schemes,
      users: data.users.map(u => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, department_id: u.department_id, created_at: u.created_at }))
    });
  } catch (err) {
    console.error('getAdminOverview error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving admin data' });
  }
}

/**
 * Add / Update Department
 */
async function saveDepartment(req, res) {
  try {
    const { id, name, code, description } = req.body;
    const data = db.getFallbackData();

    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Name and Code are required.' });
    }

    if (id) {
      const dept = data.departments.find(d => d.id === parseInt(id, 10));
      if (dept) {
        dept.name = name;
        dept.code = code;
        dept.description = description || '';
      }
    } else {
      const newId = data.departments.length ? Math.max(...data.departments.map(d => d.id)) + 1 : 1;
      data.departments.push({
        id: newId,
        name,
        code,
        description: description || '',
        created_at: new Date().toISOString()
      });
    }

    db.saveFallbackData();
    return res.json({ success: true, message: 'Department saved successfully.' });
  } catch (err) {
    console.error('saveDepartment error:', err);
    return res.status(500).json({ success: false, message: 'Server error saving department' });
  }
}

/**
 * Add / Update Approval Type
 */
async function saveApprovalType(req, res) {
  try {
    const { id, name, department_id, description, risk_level, processing_days, fee, requires_inspection } = req.body;
    const data = db.getFallbackData();

    if (!name || !department_id) {
      return res.status(400).json({ success: false, message: 'Name and department are required.' });
    }

    if (id) {
      const item = data.approval_types.find(a => a.id === parseInt(id, 10));
      if (item) {
        item.name = name;
        item.department_id = parseInt(department_id, 10);
        item.description = description || '';
        item.risk_level = risk_level || 'Medium';
        item.processing_days = parseInt(processing_days, 10) || 14;
        item.fee = parseFloat(fee) || 0;
        item.requires_inspection = requires_inspection ? 1 : 0;
      }
    } else {
      const newId = data.approval_types.length ? Math.max(...data.approval_types.map(a => a.id)) + 1 : 1;
      data.approval_types.push({
        id: newId,
        name,
        department_id: parseInt(department_id, 10),
        description: description || '',
        risk_level: risk_level || 'Medium',
        processing_days: parseInt(processing_days, 10) || 14,
        fee: parseFloat(fee) || 0,
        requires_inspection: requires_inspection ? 1 : 0,
        created_at: new Date().toISOString()
      });
    }

    db.saveFallbackData();
    return res.json({ success: true, message: 'Approval type saved successfully.' });
  } catch (err) {
    console.error('saveApprovalType error:', err);
    return res.status(500).json({ success: false, message: 'Server error saving approval type' });
  }
}

/**
 * Add / Delete Rule Engine Condition
 */
async function saveRule(req, res) {
  try {
    const { approval_type_id, condition_field, condition_operator, condition_value } = req.body;
    const data = db.getFallbackData();

    if (!approval_type_id || !condition_field || !condition_operator || !condition_value) {
      return res.status(400).json({ success: false, message: 'All rule condition fields are required.' });
    }

    const newId = data.approval_rules.length ? Math.max(...data.approval_rules.map(r => r.id)) + 1 : 1;
    data.approval_rules.push({
      id: newId,
      approval_type_id: parseInt(approval_type_id, 10),
      condition_field,
      condition_operator,
      condition_value
    });

    db.saveFallbackData();
    return res.json({ success: true, message: 'Rule condition added successfully.' });
  } catch (err) {
    console.error('saveRule error:', err);
    return res.status(500).json({ success: false, message: 'Server error saving rule' });
  }
}

async function deleteRule(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const data = db.getFallbackData();
    data.approval_rules = data.approval_rules.filter(r => r.id !== id);
    db.saveFallbackData();
    return res.json({ success: true, message: 'Rule condition removed.' });
  } catch (err) {
    console.error('deleteRule error:', err);
    return res.status(500).json({ success: false, message: 'Server error deleting rule' });
  }
}

/**
 * Add / Delete Approval Dependency (DAG prerequisite link)
 */
async function saveDependency(req, res) {
  try {
    const { approval_type_id, depends_on_approval_type_id } = req.body;
    const data = db.getFallbackData();

    if (approval_type_id === depends_on_approval_type_id) {
      return res.status(400).json({ success: false, message: 'An approval cannot depend on itself.' });
    }

    const newId = data.approval_dependencies.length ? Math.max(...data.approval_dependencies.map(d => d.id)) + 1 : 1;
    data.approval_dependencies.push({
      id: newId,
      approval_type_id: parseInt(approval_type_id, 10),
      depends_on_approval_type_id: parseInt(depends_on_approval_type_id, 10)
    });

    db.saveFallbackData();
    return res.json({ success: true, message: 'Approval dependency mapped successfully.' });
  } catch (err) {
    console.error('saveDependency error:', err);
    return res.status(500).json({ success: false, message: 'Server error saving dependency' });
  }
}

async function deleteDependency(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const data = db.getFallbackData();
    data.approval_dependencies = data.approval_dependencies.filter(d => d.id !== id);
    db.saveFallbackData();
    return res.json({ success: true, message: 'Dependency link removed.' });
  } catch (err) {
    console.error('deleteDependency error:', err);
    return res.status(500).json({ success: false, message: 'Server error deleting dependency' });
  }
}

/**
 * Save Document Requirement Rule
 */
async function saveDocumentRequirement(req, res) {
  try {
    const { approval_type_id, document_name, description, is_mandatory } = req.body;
    const data = db.getFallbackData();

    if (!approval_type_id || !document_name) {
      return res.status(400).json({ success: false, message: 'Approval type and document name are required.' });
    }

    const newId = data.document_requirements.length ? Math.max(...data.document_requirements.map(d => d.id)) + 1 : 1;
    data.document_requirements.push({
      id: newId,
      approval_type_id: parseInt(approval_type_id, 10),
      document_name,
      description: description || '',
      is_mandatory: is_mandatory ? 1 : 0
    });

    db.saveFallbackData();
    return res.json({ success: true, message: 'Document requirement rule added.' });
  } catch (err) {
    console.error('saveDocumentRequirement error:', err);
    return res.status(500).json({ success: false, message: 'Server error saving requirement' });
  }
}

/**
 * Platform-wide Analytics & Bottlenecks
 */
async function getPlatformAnalytics(req, res) {
  try {
    const data = db.getFallbackData();

    const totalApps = data.applications.length;
    const approved = data.applications.filter(a => a.status === 'Approved').length;
    const underReview = data.applications.filter(a => ['Submitted', 'Under Review', 'Inspection Scheduled'].includes(a.status)).length;
    const corrections = data.applications.filter(a => a.status === 'Correction Required').length;
    const rejected = data.applications.filter(a => a.status === 'Rejected').length;

    // Department-wise bottleneck analysis
    const deptStats = data.departments.map(dept => {
      const typeIds = data.approval_types.filter(t => t.department_id === dept.id).map(t => t.id);
      const apps = data.applications.filter(a => typeIds.includes(a.approval_type_id));

      let overdue = 0;
      let totalDays = 0;

      apps.forEach(a => {
        const days = Math.floor((new Date() - new Date(a.submitted_at)) / (1000 * 60 * 60 * 24));
        totalDays += days;
        if (days > 14 && !['Approved', 'Rejected'].includes(a.status)) {
          overdue++;
        }
      });

      return {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        total_applications: apps.length,
        pending_count: apps.filter(a => !['Approved', 'Rejected'].includes(a.status)).length,
        overdue_count: overdue,
        avg_processing_days: apps.length ? (totalDays / apps.length).toFixed(1) : 0
      };
    });

    // Risk score distribution
    const riskDistribution = {
      Low: data.applications.filter(a => (a.risk_score || 50) < 40).length,
      Medium: data.applications.filter(a => (a.risk_score || 50) >= 40 && (a.risk_score || 50) <= 70).length,
      High: data.applications.filter(a => (a.risk_score || 50) > 70).length
    };

    return res.json({
      success: true,
      totals: {
        total_applications: totalApps,
        approved,
        under_review: underReview,
        corrections,
        rejected,
        total_enterprises: data.business_profiles.length,
        active_licences: data.licences.length,
        open_grievances: data.grievances.filter(g => g.status !== 'Resolved').length
      },
      department_analytics: deptStats,
      risk_distribution: riskDistribution
    });
  } catch (err) {
    console.error('getPlatformAnalytics error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving analytics' });
  }
}

module.exports = {
  getAdminOverview,
  saveDepartment,
  saveApprovalType,
  saveRule,
  deleteRule,
  saveDependency,
  deleteDependency,
  saveDocumentRequirement,
  getPlatformAnalytics
};
