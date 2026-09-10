import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle2, FileText, ArrowLeft, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OfficerAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/officer/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setAnalytics(json);
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
        <p>Analyzing departmental turnaround metrics and bottleneck logs...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        <Link to="/officer/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          <ArrowLeft size={16} /> Back to Scrutiny Desk
        </Link>

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Departmental Scrutiny Analytics & Bottleneck Tracking</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Service level agreement (SLA) turnaround monitoring, backlog flags, and disposal analytics.
          </p>
        </div>

        {/* Bottleneck alert banner */}
        <div className={`alert alert-${analytics?.overdueCount > 0 ? 'danger' : 'success'}`} style={{ marginBottom: '2rem' }}>
          {analytics?.overdueCount > 0 ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
          <div>
            <strong>Status: </strong> {analytics?.bottleneckAlert}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
          <div className="card">
            <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Total Assigned Volume
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--navy-900)' }}>
              {analytics?.totalApplications}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              All-time departmental files
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Average Disposal Time
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary-600)' }}>
              {analytics?.avgProcessingDays} Days
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Statutory SLA Target: 14 Days
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Overdue Applications
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: analytics?.overdueCount > 0 ? 'var(--rose-600)' : 'var(--emerald-600)' }}>
              {analytics?.overdueCount}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Files pending beyond 14 days
            </div>
          </div>
        </div>

        {/* Status Distribution Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Application Status Breakdown</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
            {analytics?.statusCounts && Object.entries(analytics.statusCounts).map(([k, v]) => (
              <div key={k} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{k}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-900)', marginTop: '0.25rem' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
