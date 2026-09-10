import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield, Building2, UserCheck, LogOut, ChevronDown,
  LayoutDashboard, FileText, GitFork, Award, AlertTriangle,
  Gift, Bell, CheckCircle, Clock, Settings
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch (e) {
        // silent fail
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      // silent
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="badge badge-purple">Admin</span>;
      case 'officer':
        return <span className="badge badge-amber">Gov Officer</span>;
      case 'business_user':
      default:
        return <span className="badge badge-blue">Enterprise</span>;
    }
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner" style={{ flexWrap: 'wrap', gap: '0.75rem', height: 'auto', padding: '0.75rem 1.5rem' }}>
        {/* Brand */}
        <Link to="/" className="brand-logo">
          <div className="brand-emblem">
            <Shield size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--navy-900)' }}>
              GovCompliance
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '-2px' }}>
              Single-Window Licensing & Approvals
            </div>
          </div>
        </Link>

        {/* Dynamic Navigation Links based on role */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flexWrap: 'wrap' }}>
          {user ? (
            <>
              {user.role === 'business_user' && (
                <>
                  <Link to="/business/dashboard" style={{ fontWeight: location.pathname === '/business/dashboard' ? 700 : 500, fontSize: '0.85rem' }}>
                    Dashboard
                  </Link>
                  <Link to="/business/profile" style={{ fontWeight: location.pathname === '/business/profile' ? 700 : 500, fontSize: '0.85rem' }}>
                    Business Profile
                  </Link>
                  <Link to="/business/checklist" style={{ fontWeight: location.pathname === '/business/checklist' ? 700 : 500, fontSize: '0.85rem' }}>
                    Checklist
                  </Link>
                  <Link to="/business/roadmap" style={{ fontWeight: location.pathname === '/business/roadmap' ? 700 : 500, fontSize: '0.85rem' }}>
                    Compliance Roadmap
                  </Link>
                  <Link to="/business/applications" style={{ fontWeight: location.pathname.startsWith('/business/applications') ? 700 : 500, fontSize: '0.85rem' }}>
                    Applications
                  </Link>
                  <Link to="/business/licences" style={{ fontWeight: location.pathname === '/business/licences' ? 700 : 500, fontSize: '0.85rem' }}>
                    Certificates & Renewals
                  </Link>
                  <Link to="/business/schemes" style={{ fontWeight: location.pathname === '/business/schemes' ? 700 : 500, fontSize: '0.85rem' }}>
                    Schemes
                  </Link>
                  <Link to="/business/grievances" style={{ fontWeight: location.pathname === '/business/grievances' ? 700 : 500, fontSize: '0.85rem' }}>
                    Grievances
                  </Link>
                </>
              )}

              {user.role === 'officer' && (
                <>
                  <Link to="/officer/dashboard" style={{ fontWeight: location.pathname === '/officer/dashboard' ? 700 : 500, fontSize: '0.875rem' }}>
                    Scrutiny Desk
                  </Link>
                  <Link to="/officer/inspections" style={{ fontWeight: location.pathname === '/officer/inspections' ? 700 : 500, fontSize: '0.875rem' }}>
                    Inspections
                  </Link>
                  <Link to="/officer/analytics" style={{ fontWeight: location.pathname === '/officer/analytics' ? 700 : 500, fontSize: '0.875rem' }}>
                    Bottlenecks & Analytics
                  </Link>
                  <Link to="/officer/grievances" style={{ fontWeight: location.pathname === '/officer/grievances' ? 700 : 500, fontSize: '0.875rem' }}>
                    Grievances
                  </Link>
                </>
              )}

              {user.role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" style={{ fontWeight: location.pathname === '/admin/dashboard' ? 700 : 500, fontSize: '0.875rem' }}>
                    Console
                  </Link>
                  <Link to="/admin/rules" style={{ fontWeight: location.pathname === '/admin/rules' ? 700 : 500, fontSize: '0.875rem' }}>
                    Rule Engine & DAG
                  </Link>
                  <Link to="/admin/departments" style={{ fontWeight: location.pathname === '/admin/departments' ? 700 : 500, fontSize: '0.875rem' }}>
                    Departments & Types
                  </Link>
                  <Link to="/admin/analytics" style={{ fontWeight: location.pathname === '/admin/analytics' ? 700 : 500, fontSize: '0.875rem' }}>
                    Platform Analytics
                  </Link>
                </>
              )}

              <div style={{ height: '1.5rem', width: '1px', background: 'var(--border-light)' }} />

              {/* Notification Bell */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setShowNotes(!showNotes)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    padding: '0.4rem',
                    color: 'var(--navy-800)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      background: 'var(--rose-600)',
                      color: 'white',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      borderRadius: '9999px',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotes && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '2.5rem',
                    width: '320px',
                    background: 'white',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)',
                    zIndex: 200,
                    padding: '1rem',
                    maxHeight: '380px',
                    overflowY: 'auto'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{notifications.length} total</span>
                    </div>

                    {notifications.length === 0 ? (
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                        No notifications yet.
                      </p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          style={{
                            padding: '0.6rem 0.5rem',
                            borderBottom: '1px solid var(--border-light)',
                            cursor: 'pointer',
                            background: n.is_read ? 'transparent' : '#f0fdf4',
                            borderRadius: '4px',
                            marginBottom: '0.35rem'
                          }}
                        >
                          <div style={{ fontSize: '0.8rem', color: 'var(--navy-900)', lineHeight: 1.4 }}>
                            {n.message}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* User Identity Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {getRoleBadge(user.role)}
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-900)' }}>
                  {user.name.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  title="Sign out"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                >
                  <LogOut size={13} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register Business
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
