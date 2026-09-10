import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck, UserCheck, CheckCircle2, Clock, AlertTriangle,
  FileText, Calendar, ArrowRight, Sparkles, Filter
} from 'lucide-react';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOfficerData();
  }, []);

  const fetchOfficerData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [appsRes, anaRes] = await Promise.all([
        fetch('/api/officer/applications', { headers }),
        fetch('/api/officer/analytics', { headers })
      ]);

      if (appsRes.ok) {
        const a = await appsRes.json();
        setApplications(a.applications || []);
      }
      if (anaRes.ok) {
        const an = await anaRes.json();
        setAnalytics(an);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <p>Loading departmental review queue and scrutiny metrics...</p>
      </div>
    );
  }

  const pendingScrutiny = applications.filter(a => ['Submitted', 'Under Review'].includes(a.status));
  const inspectionsPending = applications.filter(a => a.status === 'Inspection Scheduled');
  const overdueItems = applications.filter(a => a.is_overdue);

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Department Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #78350f 0%, #b45309 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.25rem',
          color: 'white',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.7rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              <UserCheck size={14} /> Departmental Scrutiny & Clearance Desk
            </div>
            <h1 style={{ color: 'white', fontSize: '1.85rem', marginBottom: '0.4rem' }}>
              Welcome, {user?.name}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem' }}>
              Assigned Desk: <strong>{user?.department_id === 1 ? 'State Pollution Control Board (PCB)' : user?.department_id === 3 ? 'Fire and Rescue Services' : 'State Regulatory Authority'}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/officer/inspections" className="btn btn-secondary btn-sm" style={{ background: 'white', color: '#92400e' }}>
              <Calendar size={14} /> Inspections ({inspectionsPending.length})
            </Link>
            <Link to="/officer/analytics" className="btn btn-primary btn-sm" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)' }}>
              Bottleneck Analytics
            </Link>
          </div>
        </div>

        {/* Bottleneck alert banner if overdue files exist */}
        {overdueItems.length > 0 && (
          <div className="alert alert-danger" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} />
              <span><strong>Bottleneck Alert:</strong> {overdueItems.length} application(s) have exceeded the statutory 14-day SLA deadline.</span>
            </div>
            <Link to="/officer/analytics" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#991b1b', textDecoration: 'underline' }}>
              View Bottleneck Report &rarr;
            </Link>
          </div>
        )}

        {/* Queue Metrics */}
        <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
          <div className="card">
            <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Pending Scrutiny
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--amber-600)' }}>
              {pendingScrutiny.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Awaiting officer verification
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Inspections Booked
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-600)' }}>
              {inspectionsPending.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Physical verification pending
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Overdue SLA Files
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: overdueItems.length > 0 ? 'var(--rose-600)' : 'var(--navy-700)' }}>
              {overdueItems.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Exceeding SLA limits
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Total Processed
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669' }}>
              {applications.filter(a => a.status === 'Approved').length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Licences issued
            </div>
          </div>
        </div>

        {/* Assigned Scrutiny Queue Table */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Department Scrutiny Queue ({applications.length})</h2>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Ranked by Risk Score & Days Pending
            </span>
          </div>

          {applications.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '1.5rem 0', textAlign: 'center' }}>
              No active applications assigned to your departmental jurisdiction.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {applications.map(app => (
                <div
                  key={app.id}
                  style={{
                    padding: '1.25rem',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    borderLeft: `4px solid ${app.risk_score > 70 ? 'var(--rose-600)' : app.risk_score >= 40 ? 'var(--amber-500)' : 'var(--emerald-600)'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{app.application_number}</span>
                        <span className={`badge badge-${app.status === 'Approved' ? 'green' : app.status === 'Correction Required' ? 'red' : 'amber'}`}>
                          {app.status}
                        </span>
                        <span className="badge badge-purple">Risk: {app.risk_score}/100</span>
                        {app.is_overdue && <span className="badge badge-red">SLA Overdue ({app.days_pending}d)</span>}
                      </div>

                      <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-900)' }}>
                        {app.approval_name} &bull; <span style={{ color: 'var(--primary-700)' }}>{app.company_name}</span>
                      </h3>
                    </div>

                    <Link
                      to={`/officer/review/${app.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      <span>Scrutinize File</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.825rem', color: 'var(--navy-800)', borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                    <div><strong>Sector:</strong> {app.sector}</div>
                    <div><strong>Location:</strong> {app.location}</div>
                    <div><strong>Pending:</strong> {app.days_pending} Days</div>
                    <div><strong>Documents Uploaded:</strong> {app.documents_count} Files</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
