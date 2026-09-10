const db = require('../config/db');

/**
 * Raise a new grievance or escalation on a stuck application
 */
async function raiseGrievance(req, res) {
  try {
    const { application_id, subject, description } = req.body;
    const data = db.getFallbackData();

    if (!subject || !description) {
      return res.status(400).json({ success: false, message: 'Subject and description are required.' });
    }

    const newId = data.grievances.length ? Math.max(...data.grievances.map(g => g.id)) + 1 : 1;
    const now = new Date().toISOString();

    const newGrievance = {
      id: newId,
      application_id: application_id ? parseInt(application_id, 10) : null,
      user_id: req.user.id,
      subject: subject.trim(),
      description: description.trim(),
      status: 'Open',
      resolution_note: null,
      created_at: now,
      resolved_at: null
    };

    data.grievances.push(newGrievance);

    // Notify admins / officers
    data.notifications.push({
      id: data.notifications.length ? Math.max(...data.notifications.map(n => n.id)) + 1 : 1,
      user_id: 1, // SuperAdmin
      message: `New Grievance Raised: "${subject}" by ${req.user.name}`,
      type: 'warning',
      is_read: false,
      created_at: now
    });

    db.saveFallbackData();

    return res.status(201).json({
      success: true,
      message: 'Grievance registered. An escalation ticket has been forwarded to the nodal grievance officer.',
      grievance: newGrievance
    });
  } catch (err) {
    console.error('raiseGrievance error:', err);
    return res.status(500).json({ success: false, message: 'Server error raising grievance' });
  }
}

/**
 * Get grievances raised by current user
 */
async function getMyGrievances(req, res) {
  try {
    const data = db.getFallbackData();
    const list = data.grievances
      .filter(g => g.user_id === req.user.id)
      .map(g => {
        const app = data.applications.find(a => a.id === g.application_id);
        const approval = data.approval_types.find(t => t.id === app?.approval_type_id);
        return {
          ...g,
          application_number: app ? app.application_number : 'General Complaint',
          approval_name: approval ? approval.name : 'N/A'
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.json({
      success: true,
      grievances: list
    });
  } catch (err) {
    console.error('getMyGrievances error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving grievances' });
  }
}

/**
 * Admin/Officer view of all grievances
 */
async function getAllGrievances(req, res) {
  try {
    const data = db.getFallbackData();
    const list = data.grievances.map(g => {
      const user = data.users.find(u => u.id === g.user_id);
      const app = data.applications.find(a => a.id === g.application_id);
      const approval = data.approval_types.find(t => t.id === app?.approval_type_id);

      return {
        ...g,
        applicant_name: user ? user.name : 'Applicant',
        applicant_email: user ? user.email : '',
        application_number: app ? app.application_number : 'General Complaint',
        approval_name: approval ? approval.name : 'General'
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.json({
      success: true,
      grievances: list
    });
  } catch (err) {
    console.error('getAllGrievances error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving all grievances' });
  }
}

/**
 * Resolve grievance
 */
async function resolveGrievance(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, resolution_note } = req.body;
    const data = db.getFallbackData();

    const g = data.grievances.find(item => item.id === id);
    if (!g) {
      return res.status(404).json({ success: false, message: 'Grievance not found.' });
    }

    g.status = status || 'Resolved';
    g.resolution_note = resolution_note || 'Issue investigated and resolved by department authority.';
    g.resolved_at = new Date().toISOString();

    // Notify user
    data.notifications.push({
      id: data.notifications.length ? Math.max(...data.notifications.map(n => n.id)) + 1 : 1,
      user_id: g.user_id,
      message: `Grievance "${g.subject}" updated to: ${g.status}. Resolution: ${g.resolution_note}`,
      type: 'success',
      is_read: false,
      created_at: new Date().toISOString()
    });

    db.saveFallbackData();

    return res.json({
      success: true,
      message: 'Grievance updated successfully.',
      grievance: g
    });
  } catch (err) {
    console.error('resolveGrievance error:', err);
    return res.status(500).json({ success: false, message: 'Server error resolving grievance' });
  }
}

module.exports = {
  raiseGrievance,
  getMyGrievances,
  getAllGrievances,
  resolveGrievance
};
