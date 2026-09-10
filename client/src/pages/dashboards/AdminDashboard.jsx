import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Shield, Settings, Users, Building, Layers, CheckCircle2,
  GitFork, BarChart3, AlertTriangle, ArrowRight, MessageSquarePlus
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminOverview = async () => {
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
    fetchAdminOverview();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <p>Loading administrative console...</p>
      </div>
    );
  }

  const { totals } = analytics || {};

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #4c1d95 0%, #7e22ce 100%)',
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
              <Shield size={14} /> System Administrator Console
            </div>
            <h1 style={{ color: 'white', fontSize: '1.85rem', marginBottom: '0.4rem' }}>
              Welcome, {user?.name}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem' }}>
              Single-Window compliance configuration, data-driven rule management, and cross-departmental oversight.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/admin/rules" className="btn btn-secondary btn-sm" style={{ background: 'white', color: '#7e22ce' }}>
              <GitFork size={14} /> Rule Engine & DAG
            </Link>
            <Link to="/admin/analytics" className="btn btn-primary btn-sm" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)' }}>
              <BarChart3 size={14} /> Bottleneck Analytics
            </Link>
          </div>
        </div>

        {/* Global Metrics */}
        <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
          <div className="card">
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Total Applications
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#7e22ce' }}>
              {totals?.total_applications || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Cross-departmental filings
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Licences Issued
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669' }}>
              {totals?.approved || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Active digital certificates
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Registered Enterprises
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy-900)' }}>
              {totals?.total_enterprises || 1}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Active businesses
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Open Grievances
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: (totals?.open_grievances || 0) > 0 ? 'var(--rose-600)' : 'var(--navy-700)' }}>
              {totals?.open_grievances || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Escalation disputes
            </div>
          </div>
        </div>

        {/* Administration Management Cards */}
        <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
          <Link to="/admin/rules" className="card" style={{ display: 'block', textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#faf5ff', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GitFork size={20} />
              </div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-900)' }}>Rule Engine & DAG Config</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Add and edit dynamic conditions (sector, investment, scale) and prerequisite dependencies without code changes.
            </p>
          </Link>

          <Link to="/admin/departments" className="card" style={{ display: 'block', textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#eff6ff', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building size={20} />
              </div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-900)' }}>Departments & Types</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Configure state regulatory departments, approval types, fees, SLA turnaround days, and inspection mandates.
            </p>
          </Link>

          <Link to="/admin/analytics" className="card" style={{ display: 'block', textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart3 size={20} />
              </div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-900)' }}>Platform Analytics & Bottlenecks</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Track statutory SLA disposal times, cross-department bottlenecks, and risk distribution metrics.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
