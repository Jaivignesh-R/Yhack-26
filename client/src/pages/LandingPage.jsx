import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, FileCheck2, Building2, UserCheck, ArrowRight, CheckCircle2, Clock, Bell, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemoLogin = async (email, role) => {
    try {
      await login(email, 'password123');
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'officer') navigate('/officer/dashboard');
      else navigate('/business/dashboard');
    } catch (err) {
      console.error('Demo login failed:', err);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)',
        borderBottom: '1px solid var(--border-light)',
        padding: '4.5rem 0 3.5rem'
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '860px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.9rem',
            borderRadius: '9999px',
            background: 'white',
            border: '1px solid var(--primary-100)',
            boxShadow: 'var(--shadow-sm)',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--primary-700)',
            marginBottom: '1.5rem'
          }}>
            <Sparkles size={16} /> National Single-Window Government Clearance System
          </div>

          <h1 style={{
            fontSize: '2.75rem',
            letterSpacing: '-0.03em',
            marginBottom: '1.25rem',
            lineHeight: 1.15
          }}>
            Accelerate Business Growth with <span style={{ color: 'var(--primary-600)' }}>Transparent Compliance</span>
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            marginBottom: '2rem'
          }}>
            One unified portal to discover required licences, submit verified documentation directly to government departments, track application lifecycles, and automate renewals.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              <span>Register Your Enterprise</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Sign In to Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Evaluation Role Switcher */}
      <section style={{ padding: '2.5rem 0 1rem' }}>
        <div className="container">
          <div style={{
            background: 'white',
            border: '1.5px dashed var(--primary-500)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck style={{ color: 'var(--primary-600)' }} size={22} />
                  1-Click Hackathon Evaluation & Role Switcher
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Jump directly into any of the three roles with pre-seeded credentials (all passwords: <code>password123</code>):
                </p>
              </div>
              <span className="badge badge-green">Zero-Config Demo Mode</span>
            </div>

            <div className="grid-3">
              {/* Role 1: Business User */}
              <div className="card" style={{ background: '#f8fafc', borderColor: 'var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className="badge badge-blue">Business Owner</span>
                  <Building2 size={20} style={{ color: 'var(--primary-600)' }} />
                </div>
                <h4 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>Apex Organic Foods</h4>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  vikram@apexfoods.com
                </p>
                <button
                  onClick={() => handleQuickDemoLogin('vikram@apexfoods.com', 'business_user')}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  Enter as Business User &rarr;
                </button>
              </div>

              {/* Role 2: Officer */}
              <div className="card" style={{ background: '#f8fafc', borderColor: 'var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className="badge badge-amber">Gov Officer</span>
                  <UserCheck size={20} style={{ color: 'var(--amber-600)' }} />
                </div>
                <h4 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>Pollution Control (PCB)</h4>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  officer.pcb@gov.in
                </p>
                <button
                  onClick={() => handleQuickDemoLogin('officer.pcb@gov.in', 'officer')}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', borderColor: 'var(--amber-500)', color: 'var(--amber-600)' }}
                >
                  Enter as Pollution Officer &rarr;
                </button>
              </div>

              {/* Role 3: Admin */}
              <div className="card" style={{ background: '#f8fafc', borderColor: 'var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className="badge badge-purple">System Admin</span>
                  <ShieldCheck size={20} style={{ color: 'var(--primary-900)' }} />
                </div>
                <h4 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>Gov Single Window Admin</h4>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  admin@gov.in
                </p>
                <button
                  onClick={() => handleQuickDemoLogin('admin@gov.in', 'admin')}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', borderColor: '#7e22ce', color: '#7e22ce' }}
                >
                  Enter as Admin &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Workflow Pillars */}
      <section style={{ padding: '3.5rem 0 4rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>End-to-End Approval Lifecycle</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
              Eliminating bureaucracy and multiple counter visits through automated checklist generation and real-time review.
            </p>
          </div>

          <div className="grid-4">
            <div className="card">
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'var(--primary-50)',
                color: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <CheckCircle2 size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>1. Smart Checklist</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Input business sector, scale, and stage to auto-derive required NOCs, licences, and document mandates.
              </p>
            </div>

            <div className="card">
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'var(--primary-50)',
                color: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <FileCheck2 size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>2. Unified Filing</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Upload digital evidence once; documents route automatically to the relevant regulatory departments.
              </p>
            </div>

            <div className="card">
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'var(--primary-50)',
                color: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <Clock size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>3. Transparent Review</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Officers verify documents, schedule site inspections, or issue clear defect return comments.
              </p>
            </div>

            <div className="card">
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'var(--primary-50)',
                color: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <Bell size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>4. Expiry & Renewals</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Never miss compliance deadlines with automated advance reminder alerts and seamless renewal filing.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
