import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, AlertTriangle, UserCheck, ArrowRight, Shield } from 'lucide-react';

export default function OfficerInspectionsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Inspection outcome filing state
  const [selectedApp, setSelectedApp] = useState(null);
  const [status, setStatus] = useState('Completed');
  const [score, setScore] = useState(85);
  const [reportNotes, setReportNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/officer/applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        // Filter applications that have inspection or require inspection
        setApplications(json.applications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/officer/inspections/${selectedApp.id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          inspection_score: score,
          report_notes: reportNotes
        })
      });

      const json = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Inspection report recorded successfully!' });
        setSelectedApp(null);
        setReportNotes('');
        fetchInspections();
      } else {
        setMessage({ type: 'danger', text: json.message || 'Error recording report' });
      }
    } catch (err) {
      setMessage({ type: 'danger', text: 'Error submitting inspection report' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <p>Loading scheduled inspections and field visit records...</p>
      </div>
    );
  }

  const inspectionApps = applications.filter(a => a.inspection || a.status === 'Inspection Scheduled');

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Physical Site Inspections Desk</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Schedule on-site verifications, assess building/pollution safety scores, and issue field inspection reports.
          </p>
        </div>

        {message && (
          <div className={`alert alert-${message.type}`} style={{ marginBottom: '1.5rem' }}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid-2" style={{ alignItems: 'flex-start' }}>
          {/* List of inspections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Inspection Queue ({inspectionApps.length})</h3>

            {inspectionApps.length === 0 ? (
              <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No active inspections pending for your department.
              </div>
            ) : (
              inspectionApps.map(a => (
                <div
                  key={a.id}
                  className="card"
                  style={{
                    borderLeft: `4px solid ${a.inspection?.status === 'Completed' ? 'var(--emerald-600)' : 'var(--amber-500)'}`,
                    padding: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: '0.9rem' }}>
                        {a.application_number}
                      </span>
                      <h4 style={{ fontSize: '1.05rem', color: 'var(--navy-900)' }}>
                        {a.approval_name}
                      </h4>
                    </div>
                    <span className={`badge badge-${a.inspection?.status === 'Completed' ? 'green' : 'amber'}`}>
                      {a.inspection ? a.inspection.status : 'Scheduled'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.825rem', color: 'var(--navy-800)', marginBottom: '0.75rem' }}>
                    <div><strong>Enterprise:</strong> {a.company_name} ({a.location})</div>
                    <div><strong>Visit Date:</strong> {a.inspection?.scheduled_date || 'TBD'}</div>
                    {a.inspection?.inspection_score && (
                      <div><strong>Field Score:</strong> {a.inspection.inspection_score}/100</div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        setSelectedApp(a);
                        setReportNotes(a.inspection?.report_notes || '');
                        setScore(a.inspection?.inspection_score || 85);
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      <span>File / Update Inspection Report</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Form to submit inspection report */}
          <div className="card" style={{ borderLeft: '4px solid var(--primary-600)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={18} style={{ color: 'var(--primary-600)' }} />
              Inspection Report Filing
            </h3>

            {selectedApp ? (
              <form onSubmit={handleReportSubmit}>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <strong>Selected File:</strong> {selectedApp.application_number} &bull; {selectedApp.company_name}
                </div>

                <div className="form-group">
                  <label className="form-label">Inspection Verdict</label>
                  <select
                    className="form-control"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Completed">Completed - Compliant with Norms</option>
                    <option value="Defects Found">Defects Found - Mandatory Rectification</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="inspection_score">
                    Compliance Score (0 to 100)
                  </label>
                  <input
                    id="inspection_score"
                    type="number"
                    min="0"
                    max="100"
                    required
                    className="form-control"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="report_notes">
                    Field Findings & Official Notes *
                  </label>
                  <textarea
                    id="report_notes"
                    rows="4"
                    required
                    className="form-control"
                    placeholder="Enter physical observations: e.g. ETP equipment verified, adequate egress staircases, water meters calibrated..."
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedApp(null)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    {saving ? 'Recording Report...' : 'Submit Official Report'}
                  </button>
                </div>
              </form>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Select an inspection from the list on the left to record findings and submit the field report.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
