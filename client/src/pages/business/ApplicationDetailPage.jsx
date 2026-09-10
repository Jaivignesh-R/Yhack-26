import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText, Upload, CheckCircle2, AlertCircle, AlertTriangle,
  Clock, ShieldCheck, UserCheck, Calendar, ArrowLeft, Award, Sparkles
} from 'lucide-react';

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingDocId, setUploadingDocId] = useState(null);
  const [uploadMessage, setUploadMessage] = useState(null);

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
      console.error('Failed to load application:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (requirementId, file) => {
    if (!file) return;
    setUploadingDocId(requirementId);
    setUploadMessage(null);

    const formData = new FormData();
    formData.append('document', file);
    formData.append('document_requirement_id', requirementId);

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/applications/${id}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const json = await res.json();
      if (res.ok) {
        setUploadMessage({
          type: json.validation.status === 'Valid' ? 'success' : 'danger',
          text: json.validation.status === 'Valid'
            ? `AI Verification Passed: ${json.document.file_name} accepted.`
            : `AI Verification Warning: ${json.validation.notes}`
        });
        fetchApplication();
      } else {
        setUploadMessage({ type: 'danger', text: json.message || 'Upload failed' });
      }
    } catch (e) {
      setUploadMessage({ type: 'danger', text: 'Error uploading document' });
    } finally {
      setUploadingDocId(null);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <p>Loading application data and scrutiny records...</p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="container" style={{ padding: '3rem 0' }}>
        <p>Application not found.</p>
        <Link to="/business/applications" className="btn btn-secondary">
          Back to Applications
        </Link>
      </div>
    );
  }

  const steps = ['Submitted', 'Under Review', 'Inspection Scheduled', 'Approved'];
  const currentStepIdx = steps.indexOf(app.status) !== -1 ? steps.indexOf(app.status) : 1;

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Back Link */}
        <Link to="/business/applications" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          <ArrowLeft size={16} /> Back to My Applications
        </Link>

        {/* Application Header Card */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-700)', background: 'var(--primary-50)', padding: '0.2rem 0.65rem', borderRadius: '4px' }}>
                  {app.application_number}
                </span>
                <span className="badge badge-blue">{app.department?.code}</span>
                <span className="badge badge-amber">Risk Score: {app.risk_score}/100</span>
              </div>
              <h1 style={{ fontSize: '1.75rem', color: 'var(--navy-900)' }}>
                {app.approval?.name}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Department: <strong>{app.department?.name}</strong> &bull; Submitted: {new Date(app.submitted_at).toLocaleDateString()}
              </p>
            </div>

            {app.licence && (
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.8rem 1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>OFFICIAL DIGITAL LICENCE ISSUED</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#065f46' }}>{app.licence.licence_number}</div>
                <Link to="/business/licences" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#059669' }}>
                  View Certificate &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Timeline bar */}
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Application Lifecycle Progress
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
              {steps.map((step, idx) => {
                const isCompleted = idx <= currentStepIdx || app.status === 'Approved';
                const isCurrent = app.status === step;
                return (
                  <div key={step} style={{ textAlign: 'center', zIndex: 2, flex: 1 }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: isCompleted ? 'var(--emerald-600)' : '#e2e8f0',
                      color: isCompleted ? 'white' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      margin: '0 auto 0.4rem'
                    }}>
                      {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'var(--primary-700)' : 'var(--navy-800)' }}>
                      {step}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {uploadMessage && (
          <div className={`alert alert-${uploadMessage.type}`} style={{ marginBottom: '1.5rem' }}>
            {uploadMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{uploadMessage.text}</span>
          </div>
        )}

        <div className="grid-2" style={{ alignItems: 'flex-start' }}>
          {/* Left Column: Required Documents & AI Validation */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Sparkles size={20} style={{ color: 'var(--primary-600)' }} />
              <h2 style={{ fontSize: '1.25rem' }}>Document Upload & AI Verification</h2>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Upload required regulatory evidence. The AI engine checks format, scan resolution, and regulatory attributes instantly.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {app.required_documents?.map((reqDoc) => {
                const uploaded = app.uploaded_documents?.find(d => d.document_requirement_id === reqDoc.id);

                return (
                  <div key={reqDoc.id} style={{
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    background: uploaded ? '#ffffff' : '#f8fafc'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--navy-900)' }}>
                          {reqDoc.document_name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {reqDoc.description}
                        </div>
                      </div>
                      {uploaded ? (
                        <span className={`badge badge-${uploaded.validation_status === 'Valid' ? 'green' : 'red'}`}>
                          {uploaded.validation_status === 'Valid' ? 'AI Validated' : 'Defect Detected'}
                        </span>
                      ) : (
                        <span className="badge badge-amber">Pending Upload</span>
                      )}
                    </div>

                    {uploaded ? (
                      <div style={{ marginTop: '0.75rem', fontSize: '0.825rem', background: uploaded.validation_status === 'Valid' ? '#f0fdf4' : '#fef2f2', padding: '0.6rem 0.8rem', borderRadius: '6px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--navy-900)', marginBottom: '0.2rem' }}>
                          File: {uploaded.file_name} ({(uploaded.file_size / 1024).toFixed(0)} KB)
                        </div>
                        <div style={{ color: uploaded.validation_status === 'Valid' ? '#15803d' : '#b91c1c' }}>
                          {uploaded.validation_notes}
                        </div>

                        {/* Re-upload button if defect detected */}
                        <div style={{ marginTop: '0.5rem' }}>
                          <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                            <Upload size={13} />
                            <span>Re-upload / Correct File</span>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              style={{ display: 'none' }}
                              onChange={(e) => handleFileUpload(reqDoc.id, e.target.files[0])}
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginTop: '0.75rem' }}>
                        <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                          <Upload size={13} />
                          <span>{uploadingDocId === reqDoc.id ? 'Uploading & Verifying...' : 'Upload Document'}</span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFileUpload(reqDoc.id, e.target.files[0])}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Reused Business Details & Officer Scrutiny Trail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Reused Profile Summary */}
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={18} style={{ color: 'var(--primary-600)' }} />
                Reused Verified Profile Data
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                No re-entry required. Department scrutinizes against your verified enterprise identity.
              </p>
              <div style={{ fontSize: '0.85rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '6px' }}>
                <div><strong>Company:</strong> {app.business_profile?.company_name}</div>
                <div><strong>Sector:</strong> {app.business_profile?.sector}</div>
                <div><strong>Investment:</strong> ₹{parseFloat(app.business_profile?.investment || 0).toLocaleString()}</div>
                <div><strong>Employees:</strong> {app.business_profile?.employees}</div>
                <div><strong>Pollution Cat:</strong> {app.business_profile?.environmental_category}</div>
                <div><strong>Stage:</strong> {app.business_profile?.business_stage}</div>
              </div>
            </div>

            {/* Inspection Card if present */}
            {app.inspection && (
              <div className="card" style={{ borderLeft: '4px solid var(--primary-600)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={18} style={{ color: 'var(--primary-600)' }} />
                  Physical Site Inspection
                </h3>
                <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <strong>Scheduled Visit:</strong> {app.inspection.scheduled_date} &bull; <strong>Status:</strong> {app.inspection.status}
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  {app.inspection.report_notes}
                </div>
              </div>
            )}

            {/* Officer Remarks & Defect Trail */}
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <UserCheck size={18} style={{ color: 'var(--amber-600)' }} />
                Department Scrutiny Comments & Defect Trail
              </h3>

              {app.comments?.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Awaiting initial departmental officer scrutiny.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {app.comments?.map(c => (
                    <div key={c.id} style={{ background: '#f8fafc', borderLeft: '3px solid var(--amber-500)', padding: '0.75rem', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>{c.action_type}</span>
                        <span>{new Date(c.created_at).toLocaleString()}</span>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--navy-900)' }}>
                        "{c.comment}"
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
