import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GitFork, CheckCircle2, Clock, Lock, ArrowRight, Shield,
  Building2, AlertTriangle, Layers, FileText
} from 'lucide-react';

export default function ComplianceRoadmapPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/compliance/roadmap', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok) {
        setData(json);
      } else {
        setError(json.message);
      }
    } catch (err) {
      setError('Failed to fetch compliance roadmap.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (approvalTypeId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/applications/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ approval_type_id: approvalTypeId })
      });
      const json = await res.json();
      if (res.ok) {
        navigate(`/business/applications/${json.application.id}`);
      } else {
        alert(json.message);
      }
    } catch (e) {
      alert('Application initiation failed');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <p>Analyzing approval dependency graph and calculating optimal execution sequence...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container" style={{ padding: '3rem 0', maxWidth: '600px' }}>
        <div className="alert alert-danger">
          <AlertTriangle size={20} />
          <div>{error || 'Profile required to generate roadmap.'}</div>
        </div>
        <Link to="/business/profile" className="btn btn-primary">
          Complete Business Profile First &rarr;
        </Link>
      </div>
    );
  }

  const { profile, roadmap } = data;

  const renderBadge = (item) => {
    if (item.readiness === 'APPROVED') {
      return (
        <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          <CheckCircle2 size={13} /> Approved & Active
        </span>
      );
    }
    if (item.readiness === 'UNDER REVIEW' || item.readiness === 'SUBMITTED' || item.readiness === 'INSPECTION SCHEDULED') {
      return (
        <span className="badge badge-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          <Clock size={13} /> {item.statusText}
        </span>
      );
    }
    if (item.readiness === 'READY_TO_APPLY') {
      return (
        <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          Ready to Apply
        </span>
      );
    }
    return (
      <span className="badge" style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
        <Lock size={12} /> Locked
      </span>
    );
  };

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{
          background: 'white',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '2.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-purple">Directed Acyclic Graph (DAG)</span>
              <span className="badge badge-blue">{profile.sector}</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>
              Personalized Compliance Roadmap
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Sequential dependency flow for <strong>{profile.company_name}</strong>. Approvals must be obtained in phase order to satisfy regulatory prerequisites.
            </p>
          </div>

          <Link to="/business/checklist" className="btn btn-secondary">
            View All Checklist Items
          </Link>
        </div>

        {/* Roadmap Stages */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', position: 'relative' }}>
          {roadmap.map((stage, sIdx) => (
            <div key={stage.stageNumber} style={{ position: 'relative' }}>
              {/* Stage Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--navy-900)',
                  color: 'white',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.95rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {stage.stageNumber}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', color: 'var(--navy-900)' }}>
                    {stage.stageName}
                  </h2>
                </div>
              </div>

              {/* Stage Approvals Cards */}
              <div className="grid-2">
                {stage.items.map((item) => (
                  <div
                    key={item.id}
                    className="card"
                    style={{
                      borderLeft: `4px solid ${item.readiness === 'APPROVED' ? 'var(--emerald-600)' : item.readiness === 'READY_TO_APPLY' ? 'var(--primary-600)' : item.readiness === 'LOCKED' ? '#94a3b8' : 'var(--amber-500)'}`,
                      opacity: item.readiness === 'LOCKED' ? 0.85 : 1
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-900)' }}>{item.name}</h3>
                      {renderBadge(item)}
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      {item.description}
                    </p>

                    <div style={{ fontSize: '0.8rem', color: 'var(--navy-800)', marginBottom: '0.75rem', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                      <div><strong>Est. SLA:</strong> {item.processing_days} Days &bull; <strong>Gov Fee:</strong> ₹{item.fee}</div>
                    </div>

                    {/* Prerequisites check */}
                    {item.prerequisites && item.prerequisites.length > 0 && (
                      <div style={{ fontSize: '0.78rem', marginBottom: '0.75rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Prerequisites: </span>
                        {item.prerequisites.join(', ')}
                        {item.missingPrerequisites && item.missingPrerequisites.length > 0 && (
                          <div style={{ color: 'var(--rose-600)', marginTop: '0.2rem', fontWeight: 600 }}>
                            &bull; Incomplete: {item.missingPrerequisites.join(', ')}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action */}
                    <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                      {item.applicationId ? (
                        <Link
                          to={`/business/applications/${item.applicationId}`}
                          className="btn btn-secondary btn-sm"
                        >
                          <span>Track Application ({item.applicationNumber})</span>
                          <ArrowRight size={14} />
                        </Link>
                      ) : item.readiness === 'READY_TO_APPLY' ? (
                        <button
                          onClick={() => handleApply(item.id)}
                          className="btn btn-primary btn-sm"
                        >
                          <span>Apply for Stage Clearance</span>
                          <ArrowRight size={14} />
                        </button>
                      ) : (
                        <button
                          disabled
                          className="btn btn-secondary btn-sm"
                          style={{ cursor: 'not-allowed', color: 'var(--text-muted)' }}
                        >
                          <Lock size={13} />
                          <span>Locked by Prerequisites</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Connecting arrow to next stage */}
              {sIdx < roadmap.length - 1 && (
                <div style={{ textAlign: 'center', margin: '1.25rem 0 0 1.25rem', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ height: '24px', width: '2px', background: 'var(--primary-500)', margin: '0 auto' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
