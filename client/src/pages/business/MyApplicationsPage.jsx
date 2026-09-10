import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Clock, CheckCircle2, AlertCircle, AlertTriangle,
  ArrowRight, ShieldCheck, Calendar, MessageSquarePlus
} from 'lucide-react';

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/applications/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setApplications(json.applications || []);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="badge badge-green">Approved & Licensed</span>;
      case 'Under Review':
        return <span className="badge badge-amber">Under Scrutiny</span>;
      case 'Inspection Scheduled':
        return <span className="badge badge-blue">Inspection Booked</span>;
      case 'Correction Required':
        return <span className="badge badge-red">Correction Required</span>;
      case 'Rejected':
        return <span className="badge badge-red">Rejected</span>;
      default:
        return <span className="badge badge-blue">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <p>Loading your state applications...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>My Applications & Tracker</h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Real-time departmental review progress, document verification status, and inspections.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/business/checklist" className="btn btn-primary">
              <span>Apply for New Licence</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
            <FileText size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Applications Filed Yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
              Your profile is ready. Check your personalized regulatory checklist to discover required clearances and file your first application.
            </p>
            <Link to="/business/checklist" className="btn btn-primary">
              View Applicable Clearances &rarr;
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {applications.map(app => (
              <div key={app.id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-700)', background: 'var(--primary-50)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                        {app.application_number}
                      </span>
                      {getStatusBadge(app.status)}
                      <span className="badge badge-purple">{app.department_code}</span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)' }}>
                      {app.approval_name}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Link
                      to={`/business/grievances?app_id=${app.id}&app_no=${app.application_number}`}
                      className="btn btn-secondary btn-sm"
                      title="Report delay or dispute"
                    >
                      <MessageSquarePlus size={14} />
                      <span>Raise Grievance</span>
                    </Link>

                    <Link
                      to={`/business/applications/${app.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      <span>Manage & Upload Docs</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>

                {/* Details Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.825rem', color: 'var(--navy-800)', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                  <div>
                    <strong>Authority:</strong> {app.department_name}
                  </div>
                  <div>
                    <strong>Assigned Officer:</strong> {app.assigned_officer_name}
                  </div>
                  <div>
                    <strong>Submitted On:</strong> {new Date(app.submitted_at).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Risk Score:</strong> <span style={{ fontWeight: 700 }}>{app.risk_score}/100</span>
                  </div>
                  <div>
                    <strong>Uploaded Documents:</strong> {app.documents?.length || 0} File(s)
                  </div>
                </div>

                {/* Correction Alert notice if returned */}
                {app.status === 'Correction Required' && (
                  <div className="alert alert-danger" style={{ marginTop: '0.85rem', marginBottom: 0, padding: '0.6rem 0.9rem' }}>
                    <AlertTriangle size={16} />
                    <span style={{ fontSize: '0.85rem' }}>
                      Officer flagged defect remarks. Please open application to view specific corrections and re-upload documents.
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
