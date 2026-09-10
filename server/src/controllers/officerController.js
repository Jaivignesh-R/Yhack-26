const db = require('../config/db');

/**
 * Get applications assigned to the logged-in officer's department
 */
async function getAssignedApplications(req, res) {
  try {
    const data = db.getFallbackData();
    const officer = req.user;

    // Filter approval types for this officer's department
    const deptApprovalTypeIds = data.approval_types
      .filter(a => officer.department_id ? a.department_id === officer.department_id : true)
      .map(a => a.id);

    const apps = data.applications
      .filter(a => deptApprovalTypeIds.includes(a.approval_type_id))
      .map(app => {
        const approval = data.approval_types.find(t => t.id == app.approval_type_id);
        const profile = data.business_profiles.find(p => p.id == app.business_profile_id);
        const docs = data.application_documents.filter(d => d.application_id == app.id);
        const inspection = data.inspections.find(i => i.application_id == app.id);

        // Check if overdue
        const submittedDate = new Date(app.submitted_at);
        const daysPending = Math.floor((new Date() - submittedDate) / (1000 * 60 * 60 * 24));
        const isOverdue = daysPending > (approval?.processing_days || 14);

        return {
          ...app,
          approval_name: approval?.name,
          risk_level: approval?.risk_level,
          company_name: profile?.company_name || 'N/A',
          sector: profile?.sector || 'N/A',
          location: profile?.location || 'N/A',
          days_pending: daysPending,
          is_overdue: isOverdue,
          documents_count: docs.length,
          inspection: inspection || null
        };
      })
      .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));

    return res.json({
      success: true,
      officer_department: officer.department_id,
      applications: apps
    });
  } catch (err) {
    console.error('getAssignedApplications error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving applications' });
  }
}

/**
 * Scrutiny Decision: Approve, Reject, or Return for Correction
 */
async function processApplicationAction(req, res) {
  try {
    const appId = parseInt(req.params.id, 10);
    const { action, comment } = req.body; // action: 'Approve' | 'Reject' | 'Correction Required'
    const data = db.getFallbackData();

    if (!comment || comment.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'A mandatory remark/comment of at least 5 characters is required for any departmental action.'
      });
    }

    const app = data.applications.find(a => a.id === appId);
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const approval = data.approval_types.find(t => t.id === app.approval_type_id);
    const profile = data.business_profiles.find(p => p.id === app.business_profile_id);
    const inspection = data.inspections.find(i => i.application_id === app.id);
    const previousStatus = app.status;
    const now = new Date().toISOString();

    if (action === 'Approve') {
      // Check if inspection is mandatory and completed
      if (approval?.requires_inspection && (!inspection || inspection.status !== 'Completed')) {
        return res.status(400).json({
          success: false,
          message: `Cannot approve directly: This approval (${approval.name}) mandates a physical site inspection. Please schedule and complete the inspection first.`
        });
      }

      app.status = 'Approved';
      app.decision_date = now;
      app.reference_number = `LIC-${approval?.id || 'GOV'}-${Date.now().toString().slice(-6)}`;

      // Generate Digital Certificate / Licence
      const licenceId = data.licences.length ? Math.max(...data.licences.map(l => l.id)) + 1 : 1;
      const issueDate = new Date().toISOString().split('T')[0];
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + (approval?.validity_years || 2));
      const expiryDate = expiry.toISOString().split('T')[0];

      const newLicence = {
        id: licenceId,
        application_id: app.id,
        licence_number: app.reference_number,
        issue_date: issueDate,
        expiry_date: expiryDate,
        renewal_status: 'Active',
        qr_code_hash: `SHA256:${Buffer.from(`${app.reference_number}:${app.id}:${issueDate}`).toString('base64')}`,
        created_at: now
      };

      data.licences.push(newLicence);
    } else if (action === 'Reject') {
      app.status = 'Rejected';
      app.decision_date = now;
    } else if (action === 'Correction Required') {
      app.status = 'Correction Required';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action specified.' });
    }

    // Record officer comment
    data.application_comments.push({
      id: data.application_comments.length ? Math.max(...data.application_comments.map(c => c.id)) + 1 : 1,
      application_id: app.id,
      officer_id: req.user.id,
      comment: comment.trim(),
      action_type: action,
      created_at: now
    });

    // Audit log
    data.audit_log.push({
      id: data.audit_log.length ? Math.max(...data.audit_log.map(a => a.id)) + 1 : 1,
      application_id: app.id,
      from_status: previousStatus,
      to_status: app.status,
      changed_by: req.user.id,
      duration_hours: 12.0,
      changed_at: now
    });

    // Notify Business Applicant
    if (profile) {
      data.notifications.push({
        id: data.notifications.length ? Math.max(...data.notifications.map(n => n.id)) + 1 : 1,
        user_id: profile.user_id,
        message: `Application ${app.application_number} status updated to: ${app.status}. Remarks: "${comment}"`,
        type: action === 'Approve' ? 'success' : action === 'Reject' ? 'urgent' : 'warning',
        is_read: false,
        created_at: now
      });
    }

    db.saveFallbackData();

    return res.json({
      success: true,
      message: `Application ${action} recorded successfully.`,
      application: app
    });
  } catch (err) {
    console.error('processApplicationAction error:', err);
    return res.status(500).json({ success: false, message: 'Server error processing application action' });
  }
}

/**
 * Schedule physical site inspection
 */
async function scheduleInspection(req, res) {
  try {
    const appId = parseInt(req.params.id, 10);
    const { scheduled_date, report_notes } = req.body;
    const data = db.getFallbackData();

    if (!scheduled_date) {
      return res.status(400).json({ success: false, message: 'Scheduled date is required.' });
    }

    const app = data.applications.find(a => a.id === appId);
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const now = new Date().toISOString();
    let inspection = data.inspections.find(i => i.application_id === appId);

    if (inspection) {
      inspection.scheduled_date = scheduled_date;
      inspection.report_notes = report_notes || 'Inspection rescheduled';
      inspection.status = 'Scheduled';
    } else {
      const newId = data.inspections.length ? Math.max(...data.inspections.map(i => i.id)) + 1 : 1;
      inspection = {
        id: newId,
        application_id: appId,
        scheduled_date,
        inspector_id: req.user.id,
        status: 'Scheduled',
        report_notes: report_notes || 'Physical verification scheduled by department officer.',
        inspection_score: null,
        created_at: now
      };
      data.inspections.push(inspection);
    }

    app.status = 'Inspection Scheduled';

    // Comment
    data.application_comments.push({
      id: data.application_comments.length ? Math.max(...data.application_comments.map(c => c.id)) + 1 : 1,
      application_id: app.id,
      officer_id: req.user.id,
      comment: `Inspection scheduled for ${scheduled_date}. Notes: ${report_notes || 'None'}`,
      action_type: 'Inspection Scheduled',
      created_at: now
    });

    db.saveFallbackData();

    return res.json({
      success: true,
      message: 'Inspection scheduled successfully.',
      inspection
    });
  } catch (err) {
    console.error('scheduleInspection error:', err);
    return res.status(500).json({ success: false, message: 'Server error scheduling inspection' });
  }
}

/**
 * Record Inspection Outcome / Report
 */
async function submitInspectionReport(req, res) {
  try {
    const appId = parseInt(req.params.id, 10);
    const { status, report_notes, inspection_score } = req.body; // status: 'Completed' | 'Defects Found'
    const data = db.getFallbackData();

    const inspection = data.inspections.find(i => i.application_id === appId);
    if (!inspection) {
      return res.status(404).json({ success: false, message: 'Inspection not found for this application.' });
    }

    const app = data.applications.find(a => a.id === appId);

    inspection.status = status || 'Completed';
    inspection.report_notes = report_notes || 'Inspection report filed.';
    inspection.inspection_score = parseInt(inspection_score, 10) || 85;

    if (status === 'Defects Found') {
      app.status = 'Correction Required';
    } else {
      app.status = 'Inspection Completed';
    }

    data.application_comments.push({
      id: data.application_comments.length ? Math.max(...data.application_comments.map(c => c.id)) + 1 : 1,
      application_id: appId,
      officer_id: req.user.id,
      comment: `Inspection Report: Status ${status}. Score: ${inspection.inspection_score}/100. Findings: ${report_notes}`,
      action_type: 'Inspection Report',
      created_at: new Date().toISOString()
    });

    db.saveFallbackData();

    return res.json({
      success: true,
      message: 'Inspection report recorded successfully.',
      inspection
    });
  } catch (err) {
    console.error('submitInspectionReport error:', err);
    return res.status(500).json({ success: false, message: 'Server error recording inspection report' });
  }
}

/**
 * Departmental Analytics & Bottleneck Tracking
 */
async function getDepartmentAnalytics(req, res) {
  try {
    const data = db.getFallbackData();
    const officer = req.user;

    const deptApps = data.applications.filter(a => {
      const approval = data.approval_types.find(t => t.id == a.approval_type_id);
      return officer.department_id ? approval?.department_id === officer.department_id : true;
    });

    const statusCounts = {
      Submitted: 0,
      'Under Review': 0,
      'Inspection Scheduled': 0,
      'Inspection Completed': 0,
      'Correction Required': 0,
      Approved: 0,
      Rejected: 0
    };

    let totalPendingDays = 0;
    let overdueCount = 0;

    deptApps.forEach(a => {
      if (statusCounts[a.status] !== undefined) statusCounts[a.status]++;
      const days = Math.floor((new Date() - new Date(a.submitted_at)) / (1000 * 60 * 60 * 24));
      totalPendingDays += days;
      if (days > 14 && !['Approved', 'Rejected'].includes(a.status)) {
        overdueCount++;
      }
    });

    const avgProcessingDays = deptApps.length ? (totalPendingDays / deptApps.length).toFixed(1) : 0;

    return res.json({
      success: true,
      totalApplications: deptApps.length,
      statusCounts,
      avgProcessingDays,
      overdueCount,
      bottleneckAlert: overdueCount > 0 ? `${overdueCount} application(s) exceed the statutory 14-day SLA deadline.` : 'All departmental files are within timeline standards.'
    });
  } catch (err) {
    console.error('getDepartmentAnalytics error:', err);
    return res.status(500).json({ success: false, message: 'Server error calculating analytics' });
  }
}

module.exports = {
  getAssignedApplications,
  processApplicationAction,
  scheduleInspection,
  submitInspectionReport,
  getDepartmentAnalytics
};
