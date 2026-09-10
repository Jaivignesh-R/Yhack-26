const path = require('path');
const db = require('../config/db');
const { calculateRiskScore } = require('../services/ruleEngine');
const { validateDocument } = require('../services/documentValidator');

/**
 * Apply for an approval (Reuses verified business profile information)
 */
async function apply(req, res) {
  try {
    const { approval_type_id, notes } = req.body;
    const data = db.getFallbackData();

    const profile = data.business_profiles.find(p => p.user_id == req.user.id);
    if (!profile) {
      return res.status(400).json({ success: false, message: 'Please create your business profile before applying.' });
    }

    const approval = data.approval_types.find(a => a.id == approval_type_id);
    if (!approval) {
      return res.status(404).json({ success: false, message: 'Approval type not found.' });
    }

    // Check if an active application already exists for this type
    const existing = data.applications.find(a => a.business_profile_id == profile.id && a.approval_type_id == approval_type_id);
    if (existing && !['Rejected'].includes(existing.status)) {
      return res.status(409).json({
        success: false,
        message: `An application for "${approval.name}" already exists (${existing.application_number}). Current status: ${existing.status}.`
      });
    }

    // Dependency check: Are all prerequisite approvals approved?
    const prereqDeps = data.approval_dependencies.filter(d => d.approval_type_id == approval_type_id);
    const missingPrereqs = [];
    prereqDeps.forEach(dep => {
      const prereqApp = data.applications.find(a => a.business_profile_id == profile.id && a.approval_type_id == dep.depends_on_approval_type_id);
      if (!prereqApp || prereqApp.status !== 'Approved') {
        const prereqType = data.approval_types.find(t => t.id == dep.depends_on_approval_type_id);
        missingPrereqs.push(prereqType ? prereqType.name : `Approval #${dep.depends_on_approval_type_id}`);
      }
    });

    if (missingPrereqs.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot apply yet. Prerequisite approvals required first: ${missingPrereqs.join(', ')}.`
      });
    }

    // Assign departmental officer if available
    const officer = data.users.find(u => u.role === 'officer' && u.department_id == approval.department_id);

    const appNumber = `APP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const riskScore = calculateRiskScore(profile);

    const newId = data.applications.length ? Math.max(...data.applications.map(a => a.id)) + 1 : 1;
    const now = new Date().toISOString();

    const newApp = {
      id: newId,
      application_number: appNumber,
      business_profile_id: profile.id,
      approval_type_id: parseInt(approval_type_id, 10),
      status: 'Submitted',
      assigned_officer_id: officer ? officer.id : null,
      submitted_at: now,
      decision_date: null,
      reference_number: null,
      risk_score: riskScore,
      notes: notes || `Application for ${approval.name} initiated.`
    };

    data.applications.push(newApp);

    // Create Audit Log
    data.audit_log.push({
      id: data.audit_log.length ? Math.max(...data.audit_log.map(a => a.id)) + 1 : 1,
      application_id: newId,
      from_status: 'Draft',
      to_status: 'Submitted',
      changed_by: req.user.id,
      duration_hours: 0,
      changed_at: now
    });

    // Create Notification
    data.notifications.push({
      id: data.notifications.length ? Math.max(...data.notifications.map(n => n.id)) + 1 : 1,
      user_id: req.user.id,
      message: `Your application for "${approval.name}" has been submitted successfully (${appNumber}).`,
      type: 'info',
      is_read: false,
      created_at: now
    });

    db.saveFallbackData();

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully to the department.',
      application: newApp
    });
  } catch (err) {
    console.error('apply error:', err);
    return res.status(500).json({ success: false, message: 'Server error creating application' });
  }
}

/**
 * Get all applications for the current business user
 */
async function getMyApplications(req, res) {
  try {
    const data = db.getFallbackData();
    const profile = data.business_profiles.find(p => p.user_id == req.user.id);

    if (!profile) {
      return res.json({ success: true, applications: [] });
    }

    const apps = data.applications
      .filter(a => a.business_profile_id == profile.id)
      .map(app => {
        const approval = data.approval_types.find(t => t.id == app.approval_type_id);
        const dept = data.departments.find(d => d.id == approval?.department_id);
        const officer = data.users.find(u => u.id == app.assigned_officer_id);
        const docs = data.application_documents.filter(d => d.application_id == app.id);
        const inspection = data.inspections.find(i => i.application_id == app.id);
        const licence = data.licences.find(l => l.application_id == app.id);

        return {
          ...app,
          approval_name: approval ? approval.name : 'Clearance',
          department_name: dept ? dept.name : 'Authority',
          department_code: dept ? dept.code : 'GOV',
          assigned_officer_name: officer ? officer.name : 'Under Assignment',
          documents: docs,
          inspection: inspection || null,
          licence: licence || null
        };
      })
      .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));

    return res.json({
      success: true,
      applications: apps
    });
  } catch (err) {
    console.error('getMyApplications error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving applications' });
  }
}

/**
 * Get single application by ID
 */
async function getApplicationById(req, res) {
  try {
    const appId = parseInt(req.params.id, 10);
    const data = db.getFallbackData();

    const app = data.applications.find(a => a.id === appId);
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const approval = data.approval_types.find(t => t.id == app.approval_type_id);
    const dept = data.departments.find(d => d.id == approval?.department_id);
    const officer = data.users.find(u => u.id == app.assigned_officer_id);
    const profile = data.business_profiles.find(p => p.id == app.business_profile_id);
    const reqDocs = data.document_requirements.filter(d => d.approval_type_id == app.approval_type_id);
    const uploadedDocs = data.application_documents.filter(d => d.application_id == app.id);
    const comments = data.application_comments.filter(c => c.application_id == app.id);
    const inspection = data.inspections.find(i => i.application_id == app.id);
    const licence = data.licences.find(l => l.application_id == app.id);
    const auditLogs = data.audit_log.filter(a => a.application_id == app.id);

    return res.json({
      success: true,
      application: {
        ...app,
        approval,
        department: dept,
        officer,
        business_profile: profile,
        required_documents: reqDocs,
        uploaded_documents: uploadedDocs,
        comments,
        inspection,
        licence,
        audit_history: auditLogs
      }
    });
  } catch (err) {
    console.error('getApplicationById error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving application' });
  }
}

/**
 * Document Upload + Automated AI Validation
 */
async function uploadDocument(req, res) {
  try {
    const appId = parseInt(req.params.id, 10);
    const { document_requirement_id } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const data = db.getFallbackData();
    const app = data.applications.find(a => a.id === appId);
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const reqDoc = data.document_requirements.find(d => d.id == document_requirement_id) || {
      document_name: 'Supporting Document'
    };

    // Run AI & Rule Document Validation
    const validationResult = validateDocument(reqDoc, file);

    const newId = data.application_documents.length ? Math.max(...data.application_documents.map(d => d.id)) + 1 : 1;
    const docRecord = {
      id: newId,
      application_id: appId,
      document_requirement_id: parseInt(document_requirement_id, 10) || 1,
      file_name: file.originalname,
      file_path: `/uploads/${file.filename}`,
      file_size: file.size,
      uploaded_at: new Date().toISOString(),
      validation_status: validationResult.status,
      validation_notes: validationResult.notes
    };

    data.application_documents.push(docRecord);
    db.saveFallbackData();

    return res.status(201).json({
      success: true,
      message: validationResult.status === 'Valid' ? 'Document verified and uploaded successfully.' : 'Document uploaded with AI validation warning.',
      document: docRecord,
      validation: validationResult
    });
  } catch (err) {
    console.error('uploadDocument error:', err);
    return res.status(500).json({ success: false, message: 'Server error uploading document' });
  }
}

module.exports = {
  apply,
  getMyApplications,
  getApplicationById,
  uploadDocument
};
