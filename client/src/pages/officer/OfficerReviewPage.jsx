import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileText, CheckCircle2, AlertTriangle, AlertCircle, Calendar,
  ArrowLeft, ShieldCheck, UserCheck, Eye, Award
} from 'lucide-react';

export default function OfficerReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  // Action form state
  const [action, setAction] = useState('Approve');
  const [comment, setComment] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Inspection scheduling state
  const [inspectionDate, setInspectionDate] = useState('');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/applications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setApp(json.application);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!comment || comment.trim().length < 5) {
      setActionMessage({ type: 'danger', text: 'A mandatory remark/comment of at least 5 characters is required.' });
      return;
    }

    setSubmittingAction(true);
    setActionMessage(null);

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/officer/applications/${id}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action, comment })
      });

      const json = await res.json();
      if (res.ok) {
        setActionMessage({ type: 'success', text: json.message });
        setComment('');
        fetchApplication();
      } else {
        setActionMessage({ type: 'danger', text: json.message || 'Action failed' });
      }
    } catch (err) {
      setActionMessage({ type: 'danger', text: 'Error recording action.' });
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleScheduleInspection = async (e) => {
    e.preventDefault();
    if (!inspectionDate) return;

    setScheduling(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/officer/applications/${id}/schedule-inspection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          scheduled_date: inspectionDate,
          report_notes: inspectionNotes
        })
      });

      const json = await res.json();
      if (res.ok) {
        setActionMessage({ type: 'success', text: 'Site inspection scheduled successfully!' });
        fetchApplication();
      } else {
        setActionMessage({ type: 'danger', text: json.message });
      }
    } catch (e) {
      setActionMessage({ type: 'danger', text: 'Error scheduling inspection' });
    } finally {
      setScheduling(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <p>Opening application file and evidence documents...</p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="container" style={{ padding: '3rem 0' }}>
        <p>Application not found.</p>
        <Link to="/officer/dashboard" className="btn btn-secondary">
          Back to Queue
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        <Link to="/officer/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          <ArrowLeft size={16} /> Back to Department Scrutiny Queue
        </Link>

        {/* Application Header */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                  {app.application_number}
                </span>
                <span className={`badge badge-${app.status === 'Approved' ? 'green' : app.status === 'Correction Required' ? 'red' : 'amber'}`}>
                  {app.status}
                </span>
                <span className="badge badge-purple">Risk Score: {app.risk_score}/100</span>
              </div>
              <h1 style={{ fontSize: '1.75rem', color: 'var(--navy-900)' }}>
                {app.approval?.name}
              </h1>
              <p style={{ color: 'var(--text-muted)' }}>
                Applicant: <strong>{app.business_profile?.company_name}</strong> &bull; Sector: {app.business_profile?.sector}
              </p>
            </div>

            {app.licence && (
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 700 }}>DIGITAL CERTIFICATE ISSUED</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#065f46' }}>{app.licence.licence_number}</div>
              </div>
            )}
          </div>
        </div>

        {actionMessage && (
          <div className={`alert alert-${actionMessage.type}`} style={{ marginBottom: '1.5rem' }}>
            {actionMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{actionMessage.text}</span>
          </div>
        )}

        <div className="grid-2" style={{ alignItems: 'flex-start' }}>
          {/* Left Column: Business Profile & Documents Scrutiny */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Enterprise Details */}
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={18} style={{ color: 'var(--primary-600)' }} />
                Applicant Verified Parameters
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem', background: '#f8fafc', padding: '1rem', borderRadius: '6px' }}>
                <div><strong>Company:</strong> {app.business_profile?.company_name}</div>
                <div><strong>Sector:</strong> {app.business_profile?.sector}</div>
                <div><strong>Location:</strong> {app.business_profile?.location}</div>
                <div><strong>Capital Investment:</strong> ₹{parseFloat(app.business_profile?.investment || 0).toLocaleString()}</div>
                <div><strong>Workforce:</strong> {app.business_profile?.employees} Employees</div>
                <div><strong>Pollution Cat:</strong> {app.business_profile?.environmental_category}</div>
                <div><strong>Land Zone:</strong> {app.business_profile?.land_type}</div>
                <div><strong>Project Stage:</strong> {app.business_profile?.business_stage}</div>
              </div>
            </div>

            {/* Uploaded Documents Scrutiny */}
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={18} style={{ color: 'var(--primary-600)' }} />
                Uploaded Documents & AI Verification
              </h3>

              {app.uploaded_documents?.length === 0 ? (
                <div style={{ color: 'var(--rose-600)', fontSize: '0.875rem', background: '#fef2f2', padding: '0.75rem', borderRadius: '6px' }}>
                  No evidence documents uploaded by applicant yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {app.uploaded_documents?.map(doc => (
                    <div key={doc.id} style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--navy-900)', fontSize: '0.9rem' }}>
                            {doc.file_name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {(doc.file_size / 1024).toFixed(0)} KB &bull; Uploaded: {new Date(doc.uploaded_at).toLocaleString()}
                          </div>
                        </div>
                        <span className={`badge badge-${doc.validation_status === 'Valid' ? 'green' : 'red'}`}>
                          {doc.validation_status}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: doc.validation_status === 'Valid' ? '#15803d' : '#b91c1c', marginTop: '0.4rem' }}>
                        {doc.validation_notes}
                      </div>

                      <div style={{ marginTop: '0.5rem' }}>
                        <a
                          href={doc.file_path}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.78rem' }}
                        >
                          <Eye size={12} />
                          <span>View Uploaded File</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Decision Actions & Inspections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Scrutiny Decision Form */}
            <div className="card" style={{ borderLeft: '4px solid var(--primary-600)' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <UserCheck size={18} style={{ color: 'var(--primary-600)' }} />
                Department Scrutiny Decision
              </h3>

              <form onSubmit={handleActionSubmit}>
                <div className="form-group">
                  <label className="form-label">Select Regulatory Decision</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setAction('Approve')}
                      className={`btn btn-sm ${action === 'Approve' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ background: action === 'Approve' ? 'var(--emerald-600)' : 'white' }}
                    >
                      Approve & License
                    </button>
                    <button
                      type="button"
                      onClick={() => setAction('Correction Required')}
                      className={`btn btn-sm ${action === 'Correction Required' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ background: action === 'Correction Required' ? 'var(--amber-600)' : 'white' }}
                    >
                      Return / Correct
                    </button>
                    <button
                      type="button"
                      onClick={() => setAction('Reject')}
                      className={`btn btn-sm ${action === 'Reject' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ background: action === 'Reject' ? 'var(--rose-600)' : 'white' }}
                    >
                      Reject File
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="officer_comment">
                    Mandatory Scrutiny Remarks / Defect Note *
                  </label>
                  <textarea
                    id="officer_comment"
                    rows="4"
                    required
                    className="form-control"
                    placeholder="Enter clear rationale. If returning for correction, detail missing documents or required architectural amendments..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingAction}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  {submittingAction ? 'Recording Decision...' : `Record Decision: ${action}`}
                </button>
              </form>
            </div>

            {/* Schedule Physical Site Inspection */}
            {app.approval?.requires_inspection && (
              <div className="card" style={{ borderLeft: '4px solid var(--amber-600)' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={18} style={{ color: 'var(--amber-600)' }} />
                  Physical Site Inspection Mandate
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Mandatory for {app.approval?.name}. An inspection must be completed before final approval can be granted.
                </p>

                {app.inspection ? (
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '0.85rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <div><strong>Scheduled Visit:</strong> {app.inspection.scheduled_date}</div>
                    <div><strong>Status:</strong> {app.inspection.status}</div>
                    <div style={{ marginTop: '0.3rem' }}><strong>Notes:</strong> {app.inspection.report_notes}</div>
                    <div style={{ marginTop: '0.75rem' }}>
                      <Link to="/officer/inspections" className="btn btn-secondary btn-sm">
                        Submit Inspection Report & Score &rarr;
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleScheduleInspection}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="inspection_date">Inspection Date *</label>
                      <input
                        id="inspection_date"
                        type="date"
                        required
                        className="form-control"
                        value={inspectionDate}
                        onChange={(e) => setInspectionDate(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="inspection_notes">Inspector Instructions</label>
                      <input
                        id="inspection_notes"
                        type="text"
                        className="form-control"
                        placeholder="Verify setbacks, booster pump pressure, ETP zero-discharge..."
                        value={inspectionNotes}
                        onChange={(e) => setInspectionNotes(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={scheduling}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%' }}
                    >
                      {scheduling ? 'Booking Inspection...' : 'Book Field Site Visit'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
