import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Building2, FileCheck2, Clock, AlertTriangle, ArrowRight, ShieldCheck,
  CheckCircle2, GitFork, Award, Gift, MessageSquarePlus, Sparkles
} from 'lucide-react';

export default function BusinessDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [licences, setLicences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const headers = { Authorization: `Bearer ${token}` };

        const [profRes, appRes, licRes] = await Promise.all([
          fetch('/api/compliance/profile', { headers }),
          fetch('/api/applications/my', { headers }),
          fetch('/api/compliance/licences', { headers })
        ]);

        if (profRes.ok) {
          const p = await profRes.json();
          setProfile(p.profile);
        }
        if (appRes.ok) {
          const a = await appRes.json();
          setApplications(a.applications || []);
        }
        if (licRes.ok) {
          const l = await licRes.json();
          setLicences(l.licences || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <p>Loading enterprise dashboard...</p>
      </div>
    );
  }

  const correctionsNeeded = applications.filter(a => a.status === 'Correction Required').length;
  const underReview = applications.filter(a => ['Submitted', 'Under Review', 'Inspection Scheduled'].includes(a.status)).length;

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Welcome Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
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
              <Building2 size={14} /> Single-Window Business Applicant Portal
            </div>
            <h1 style={{ color: 'white', fontSize: '1.85rem', marginBottom: '0.4rem' }}>
              {profile ? profile.company_name : `Welcome, ${user?.name}!`}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', maxWidth: '650px' }}>
              {profile
                ? `${profile.sector} &bull; ${profile.environmental_category} Category &bull; ${profile.business_stage} Stage &bull; ${profile.location}`
                : 'Complete your business profile to generate your customized regulatory compliance roadmap.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/business/profile" className="btn btn-secondary btn-sm" style={{ background: 'white', color: 'var(--primary-700)' }}>
              Edit Profile
            </Link>
            <Link to="/business/roadmap" className="btn btn-primary btn-sm" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)' }}>
              <GitFork size={14} /> Compliance Roadmap
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
          <div className="card">
            <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Total Applications
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-600)' }}>
              {applications.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Filed with state departments
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              In Scrutiny / Review
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--amber-600)' }}>
              {underReview}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Under officer examination
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Corrections Needed
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: correctionsNeeded > 0 ? 'var(--rose-600)' : 'var(--navy-700)' }}>
              {correctionsNeeded}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Officer defects flagged
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Active Licences
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669' }}>
              {licences.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Digital certificates issued
            </div>
          </div>
        </div>

        {/* Quick Action Navigation Grid */}
        <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
          <Link to="/business/checklist" className="card" style={{ display: 'block', textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={20} />
              </div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-900)' }}>Rule Engine Checklist</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Discover mandatory approvals, NOCs, and document requirements mapped to your industry.
            </p>
          </Link>

          <Link to="/business/roadmap" className="card" style={{ display: 'block', textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GitFork size={20} />
              </div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-900)' }}>Compliance Roadmap (DAG)</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Sequential stage-by-stage dependency workflow showing which approvals unlock next.
            </p>
          </Link>

          <Link to="/business/licences" className="card" style={{ display: 'block', textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={20} />
              </div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-900)' }}>Certificates & Renewals</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              View and print tamper-proof digital certificates, validity countdowns, and renewal alerts.
            </p>
          </Link>
        </div>

        {/* Recent Applications Tracker Bar */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem' }}>Recent Applications Status</h3>
            <Link to="/business/applications" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              View All Tracker Records &rarr;
            </Link>
          </div>

          {applications.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No applications filed yet. Visit the <Link to="/business/checklist">Checklist</Link> to start.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {applications.slice(0, 3).map(app => (
                <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: '0.95rem' }}>
                      {app.approval_name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {app.application_number} &bull; Authority: {app.department_name}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className={`badge badge-${app.status === 'Approved' ? 'green' : app.status === 'Correction Required' ? 'red' : 'amber'}`}>
                      {app.status}
                    </span>
                    <Link to={`/business/applications/${app.id}`} className="btn btn-secondary btn-sm">
                      Open
                    </Link>
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
