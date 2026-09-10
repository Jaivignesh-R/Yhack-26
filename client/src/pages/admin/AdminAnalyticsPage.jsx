import React, { useState, useEffect } from 'react';
import { BarChart3, AlertTriangle, CheckCircle2, Shield, ArrowLeft, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/analytics', {
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
        <p>Calculating platform-wide analytics and cross-departmental bottleneck logs...</p>
      </div>
    );
  }

  const { totals, department_analytics, risk_distribution } = analytics || {};

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        <Link to="/admin/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          <ArrowLeft size={16} /> Back to Admin Console
        </Link>

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Platform Compliance Analytics & Bottleneck Engine</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            System-wide throughput, cross-departmental processing delays, and risk distribution metrics.
          </p>
        </div>

        {/* Global KPI Cards */}
        <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
          <div className="card">
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Total Applications
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy-900)' }}>
              {totals?.total_applications}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Across all state departments
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Approved & Licensed
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669' }}>
              {totals?.approved}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Issued digital certificates
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Active In Scrutiny
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--amber-600)' }}>
              {totals?.under_review}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Under review or inspection
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Open Grievances
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: totals?.open_grievances > 0 ? 'var(--rose-600)' : 'var(--navy-700)' }}>
              {totals?.open_grievances}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Disputes requiring resolution
            </div>
          </div>
        </div>

        {/* Department Bottlenecks Table */}
        <div className="card" style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Departmental SLA & Bottleneck Benchmark</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Identifies departmental bottlenecks where files exceed the statutory 14-day clearance timeline.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border-light)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem' }}>Department Name</th>
                  <th style={{ padding: '0.75rem' }}>Code</th>
                  <th style={{ padding: '0.75rem' }}>Total Files</th>
                  <th style={{ padding: '0.75rem' }}>Pending Scrutiny</th>
                  <th style={{ padding: '0.75rem' }}>Overdue (&gt;14d)</th>
                  <th style={{ padding: '0.75rem' }}>Avg Turnaround</th>
                  <th style={{ padding: '0.75rem' }}>Bottleneck Status</th>
                </tr>
              </thead>
              <tbody>
                {department_analytics?.map(dept => (
                  <tr key={dept.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{dept.name}</td>
                    <td style={{ padding: '0.75rem' }}><span className="badge badge-blue">{dept.code}</span></td>
                    <td style={{ padding: '0.75rem' }}>{dept.total_applications}</td>
                    <td style={{ padding: '0.75rem' }}>{dept.pending_count}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: dept.overdue_count > 0 ? 'var(--rose-600)' : 'var(--navy-900)' }}>
                      {dept.overdue_count}
                    </td>
                    <td style={{ padding: '0.75rem' }}>{dept.avg_processing_days} Days</td>
                    <td style={{ padding: '0.75rem' }}>
                      {dept.overdue_count > 0 ? (
                        <span className="badge badge-red">Bottleneck Detected</span>
                      ) : (
                        <span className="badge badge-green">Within SLA</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk Score Distribution */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Application Risk Classification Profile</h3>
          <div className="grid-3">
            <div style={{ background: '#ecfdf5', padding: '1.25rem', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
              <div style={{ color: '#047857', fontWeight: 700, fontSize: '0.9rem' }}>Low Risk (&lt; 40)</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#065f46', margin: '0.4rem 0' }}>
                {risk_distribution?.Low || 0}
              </div>
              <p style={{ fontSize: '0.8rem', color: '#047857' }}>
                Eligible for green-channel and expedited self-certification approvals.
              </p>
            </div>

            <div style={{ background: '#fffbeb', padding: '1.25rem', borderRadius: '8px', border: '1px solid #fde68a' }}>
              <div style={{ color: '#b45309', fontWeight: 700, fontSize: '0.9rem' }}>Medium Risk (40 - 70)</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#92400e', margin: '0.4rem 0' }}>
                {risk_distribution?.Medium || 0}
              </div>
              <p style={{ fontSize: '0.8rem', color: '#b45309' }}>
                Standard documentary scrutiny and conditional site inspections.
              </p>
            </div>

            <div style={{ background: '#fef2f2', padding: '1.25rem', borderRadius: '8px', border: '1px solid #fecaca' }}>
              <div style={{ color: '#b91c1c', fontWeight: 700, fontSize: '0.9rem' }}>High Risk (&gt; 70)</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#991b1b', margin: '0.4rem 0' }}>
                {risk_distribution?.High || 0}
              </div>
              <p style={{ fontSize: '0.8rem', color: '#b91c1c' }}>
                Strict multi-officer scrutiny, mandatory physical site visits & lab tests.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
