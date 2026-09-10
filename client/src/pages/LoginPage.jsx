import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, AlertCircle, ArrowRight, CheckCircle, UserCheck, Building2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      // Redirect based on role or previous attempted route
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'officer') {
        navigate('/officer/dashboard', { replace: true });
      } else {
        navigate('/business/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div style={{ padding: '3.5rem 0', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '520px' }}>
        <div className="card" style={{ padding: '2.25rem', boxShadow: 'var(--shadow-lg)' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'var(--primary-50)',
              color: 'var(--primary-600)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <Shield size={26} />
            </div>
            <h2 style={{ fontSize: '1.65rem', marginBottom: '0.35rem' }}>Sign In to Portal</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Access your business approvals or departmental review desk
            </p>
          </div>

          {error && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email-input">
                Registered Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="email-input"
                  type="email"
                  required
                  className="form-control"
                  placeholder="name@company.com or officer@gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" htmlFor="password-input" style={{ margin: 0 }}>
                  Password
                </label>
              </div>
              <input
                id="password-input"
                type="password"
                required
                className="form-control"
                placeholder="Enter account password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign In Securely'}
            </button>
          </form>

          {/* Fast Evaluation Demo Credentials */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border-light)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', textAlign: 'center' }}>
              One-Click Demo Evaluator
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => fillDemoAccount('vikram@apexfoods.com', 'password123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', justifyContent: 'flex-start' }}
              >
                <Building2 size={14} style={{ color: 'var(--primary-600)' }} />
                <span>Business User</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('officer.pcb@gov.in', 'password123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', justifyContent: 'flex-start' }}
              >
                <UserCheck size={14} style={{ color: 'var(--amber-600)' }} />
                <span>Pollution Officer</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('officer.fire@gov.in', 'password123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', justifyContent: 'flex-start' }}
              >
                <UserCheck size={14} style={{ color: 'var(--rose-600)' }} />
                <span>Fire Officer</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('admin@gov.in', 'password123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', justifyContent: 'flex-start' }}
              >
                <Shield size={14} style={{ color: '#7e22ce' }} />
                <span>System Admin</span>
              </button>
            </div>
          </div>

          <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            New business enterprise?{' '}
            <Link to="/register" style={{ fontWeight: 600 }}>
              Create an account &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
