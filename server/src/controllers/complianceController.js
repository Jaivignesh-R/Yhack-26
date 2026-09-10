const db = require('../config/db');
const { evaluateApplicableApprovals, calculateRiskScore } = require('../services/ruleEngine');
const { generatePersonalizedRoadmap } = require('../services/dependencyEngine');

/**
 * Get current user's business profile
 */
async function getProfile(req, res) {
  try {
    const data = db.getFallbackData();
    const profile = data.business_profiles.find(p => p.user_id == req.user.id);
    return res.json({
      success: true,
      profile: profile || null
    });
  } catch (err) {
    console.error('getProfile error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving profile' });
  }
}

/**
 * Create or update business profile
 */
async function saveProfile(req, res) {
  try {
    const {
      company_name,
      sector,
      location,
      investment,
      project_size,
      employees,
      production_capacity,
      land_type,
      environmental_category,
      business_stage,
      pan_gstin
    } = req.body;

    if (!company_name || !sector || !location) {
      return res.status(400).json({
        success: false,
        message: 'Company name, sector, and location are required.'
      });
    }

    const data = db.getFallbackData();
    let profile = data.business_profiles.find(p => p.user_id == req.user.id);

    const now = new Date().toISOString();

    if (profile) {
      // Update existing
      profile.company_name = company_name;
      profile.sector = sector;
      profile.location = location;
      profile.investment = parseFloat(investment) || 0;
      profile.project_size = project_size || '10,000 sq ft';
      profile.employees = parseInt(employees, 10) || 10;
      profile.production_capacity = production_capacity || 'N/A';
      profile.land_type = land_type || 'Industrial Park';
      profile.environmental_category = environmental_category || 'Orange';
      profile.business_stage = business_stage || 'Planning';
      profile.pan_gstin = pan_gstin || '';
      profile.updated_at = now;
    } else {
      // Create new profile
      const newId = data.business_profiles.length ? Math.max(...data.business_profiles.map(p => p.id)) + 1 : 1;
      profile = {
        id: newId,
        user_id: req.user.id,
        company_name,
        sector,
        location,
        investment: parseFloat(investment) || 0,
        project_size: project_size || '10,000 sq ft',
        employees: parseInt(employees, 10) || 10,
        production_capacity: production_capacity || 'N/A',
        land_type: land_type || 'Industrial Park',
        environmental_category: environmental_category || 'Orange',
        business_stage: business_stage || 'Planning',
        pan_gstin: pan_gstin || '',
        created_at: now,
        updated_at: now
      };
      data.business_profiles.push(profile);
    }

    db.saveFallbackData();

    return res.json({
      success: true,
      message: 'Business profile saved successfully.',
      profile
    });
  } catch (err) {
    console.error('saveProfile error:', err);
    return res.status(500).json({ success: false, message: 'Server error saving profile' });
  }
}

/**
 * Intelligent Rule Engine Evaluation
 * Generates personalized checklist of applicable approvals for the profile
 */
async function getChecklist(req, res) {
  try {
    const data = db.getFallbackData();
    let profile = data.business_profiles.find(p => p.user_id == req.user.id);

    if (!profile) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your Business Profile first to generate your approval checklist.'
      });
    }

    const applicableIds = evaluateApplicableApprovals(profile, data.approval_types, data.approval_rules);
    const applicableApprovals = data.approval_types.filter(a => applicableIds.includes(a.id));

    // Attach department names, document requirements, and dependencies
    const enriched = applicableApprovals.map(approval => {
      const dept = data.departments.find(d => d.id === approval.department_id);
      const docs = data.document_requirements.filter(d => d.approval_type_id === approval.id);
      const deps = data.approval_dependencies
        .filter(d => d.approval_type_id === approval.id)
        .map(d => {
          const parent = data.approval_types.find(p => p.id === d.depends_on_approval_type_id);
          return parent ? parent.name : `Approval #${d.depends_on_approval_type_id}`;
        });

      return {
        ...approval,
        department_name: dept ? dept.name : 'Government Authority',
        department_code: dept ? dept.code : 'GOV',
        required_documents: docs,
        dependencies: deps
      };
    });

    const riskScore = calculateRiskScore(profile);

    return res.json({
      success: true,
      profile,
      riskScore,
      totalApplicable: enriched.length,
      approvals: enriched
    });
  } catch (err) {
    console.error('getChecklist error:', err);
    return res.status(500).json({ success: false, message: 'Server error generating checklist' });
  }
}

/**
 * Dependency Graph & Phased Compliance Roadmap
 */
async function getRoadmap(req, res) {
  try {
    const data = db.getFallbackData();
    const profile = data.business_profiles.find(p => p.user_id == req.user.id);

    if (!profile) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your Business Profile to view your roadmap.'
      });
    }

    const applicableIds = evaluateApplicableApprovals(profile, data.approval_types, data.approval_rules);
    const applicableApprovals = data.approval_types.filter(a => applicableIds.includes(a.id));

    // Get applications already filed by this profile
    const userApps = data.applications.filter(app => app.business_profile_id === profile.id);

    const roadmap = generatePersonalizedRoadmap(applicableApprovals, data.approval_dependencies, userApps);

    return res.json({
      success: true,
      profile,
      roadmap
    });
  } catch (err) {
    console.error('getRoadmap error:', err);
    return res.status(500).json({ success: false, message: 'Server error generating roadmap' });
  }
}

/**
 * Procedure and Guidance details for a specific approval type
 */
async function getApprovalDetail(req, res) {
  try {
    const approvalId = parseInt(req.params.id, 10);
    const data = db.getFallbackData();

    const approval = data.approval_types.find(a => a.id === approvalId);
    if (!approval) {
      return res.status(404).json({ success: false, message: 'Approval type not found.' });
    }

    const dept = data.departments.find(d => d.id === approval.department_id);
    const docs = data.document_requirements.filter(d => d.approval_type_id === approval.id);
    const deps = data.approval_dependencies
      .filter(d => d.approval_type_id === approval.id)
      .map(d => data.approval_types.find(p => p.id === d.depends_on_approval_type_id))
      .filter(Boolean);

    return res.json({
      success: true,
      approval: {
        ...approval,
        department: dept,
        required_documents: docs,
        prerequisites: deps
      }
    });
  } catch (err) {
    console.error('getApprovalDetail error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving details' });
  }
}

/**
 * Discovers state and central schemes/subsidies matching this business profile
 */
async function getSchemes(req, res) {
  try {
    const data = db.getFallbackData();
    const profile = data.business_profiles.find(p => p.user_id == req.user.id);

    let matching = [...data.schemes];
    if (profile) {
      // Filter schemes by sector or 'All'
      matching = matching.filter(s => s.sector === 'All' || s.sector.toLowerCase() === profile.sector.toLowerCase());
    }

    return res.json({
      success: true,
      schemes: matching
    });
  } catch (err) {
    console.error('getSchemes error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving schemes' });
  }
}

/**
 * Get active licences and renewal alerts
 */
async function getLicences(req, res) {
  try {
    const data = db.getFallbackData();
    const profile = data.business_profiles.find(p => p.user_id == req.user.id);

    if (!profile) {
      return res.json({ success: true, licences: [] });
    }

    const userApps = data.applications.filter(a => a.business_profile_id === profile.id);
    const appIds = userApps.map(a => a.id);

    const userLicences = data.licences
      .filter(l => appIds.includes(l.application_id))
      .map(licence => {
        const app = userApps.find(a => a.id === licence.application_id);
        const approval = data.approval_types.find(t => t.id === app.approval_type_id);
        const dept = data.departments.find(d => d.id === approval?.department_id);

        // Calculate days to expiry
        const expiryDate = new Date(licence.expiry_date);
        const today = new Date();
        const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

        let renewalStatus = 'Active';
        if (diffDays <= 0) renewalStatus = 'Expired';
        else if (diffDays <= 60) renewalStatus = 'Expiring Soon';

        return {
          ...licence,
          approval_name: approval?.name,
          department_name: dept?.name,
          days_to_expiry: diffDays,
          calculated_status: renewalStatus
        };
      });

    return res.json({
      success: true,
      licences: userLicences
    });
  } catch (err) {
    console.error('getLicences error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving licences' });
  }
}

module.exports = {
  getProfile,
  saveProfile,
  getChecklist,
  getRoadmap,
  getApprovalDetail,
  getSchemes,
  getLicences
};
