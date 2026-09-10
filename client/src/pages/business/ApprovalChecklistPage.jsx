import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, AlertTriangle, ShieldCheck, FileText, ArrowRight,
  GitFork, Building2, Clock, DollarSign, Layers, Info
} from 'lucide-react';

export default function ApprovalChecklistPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChecklist();
  }, []);

  const fetchChecklist = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/compliance/checklist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok) {
        setData(json);
      } else {
        setError(json.message);
      }
    } catch (err) {
      setError('Failed to fetch approval checklist.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (approvalTypeId) => {
    setApplyingId(approvalTypeId);
    setError(null);

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
      if (!res.ok) {
        throw new Error(json.message || 'Failed to submit application');
      }

      navigate(`/business/applications/${json.application.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <p>Evaluating Intelligent Rule Engine against your enterprise profile...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="container" style={{ padding: '3rem 0', maxWidth: '600px' }}>
        <div className="alert alert-danger">
          <AlertTriangle size={20} />
          <div>{error}</div>
        </div>
        <Link to="/business/profile" className="btn btn-primary">
          Complete Business Profile First &rarr;
        </Link>
      </div>
    );
  }

  const { profile, riskScore, totalApplicable, approvals } = data;

  const getRiskBadge = (score) => {
    if (score > 70) return <span className="badge badge-red">High Risk ({score}/100)</span>;
    if (score >= 40) return <span className="badge badge-amber">Medium Risk ({score}/100)</span>;
    return <span className="badge badge-green">Low Risk ({score}/100)</span>;
  };

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Header Banner */}
        <div style={{
          background: 'white',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-blue">Intelligent Rule Engine</span>
              {getRiskBadge(riskScore)}
            </div>
            <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>
              Personalized Approval & Compliance Checklist
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Applicable permits derived for <strong>{profile.company_name}</strong> ({profile.sector} &bull; {profile.environmental_category} Category &bull; {profile.business_stage}).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/business/roadmap" className="btn btn-secondary">
              <GitFork size={16} />
              <span>Compliance Roadmap (DAG)</span>
            </Link>
            <Link to="/business/profile" className="btn btn-outline btn-sm">
              Edit Profile
            </Link>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Approvals Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {approvals.map((item, idx) => (
            <div key={item.id} className="card" style={{ borderLeft: `4px solid ${item.risk_level === 'High' ? 'var(--rose-600)' : item.risk_level === 'Medium' ? 'var(--amber-600)' : 'var(--primary-600)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>#{idx + 1}</span>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)' }}>{item.name}</h3>
                    <span className="badge badge-blue">{item.department_code}</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '750px' }}>
                    {item.description}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleApply(item.id)}
                    disabled={applyingId === item.id}
                    className="btn btn-primary"
                  >
                    {applyingId === item.id ? 'Filing Application...' : 'Apply Online'}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* Meta information row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', padding: '0.75rem 0', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', fontSize: '0.825rem', color: 'var(--navy-800)', margin: '0.75rem 0' }}>
                <div>
                  <strong>Issuing Authority:</strong> {item.department_name}
                </div>
                <div>
                  <strong>Standard SLA:</strong> {item.processing_days} Business Days
                </div>
                <div>
                  <strong>Government Fee:</strong> ₹{item.fee.toLocaleString()}
                </div>
                <div>
                  <strong>Site Inspection:</strong> {item.requires_inspection ? 'Mandatory' : 'Exempt'}
                </div>
              </div>

              {/* Dependencies & Required Docs */}
              <div className="grid-2" style={{ gap: '1rem', marginTop: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <GitFork size={14} /> Prerequisites (Dependencies)
                  </div>
                  {item.dependencies && item.dependencies.length > 0 ? (
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {item.dependencies.map((dep, i) => (
                        <span key={i} className="badge badge-amber" style={{ textTransform: 'none', fontSize: '0.75rem' }}>
                          Prereq: {dep}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None (Direct first-stage clearance)</span>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <FileText size={14} /> Mandatory Documents Required
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {item.required_documents && item.required_documents.length > 0 ? (
                      item.required_documents.map((doc, i) => (
                        <span key={i} className="badge badge-blue" style={{ textTransform: 'none', fontSize: '0.75rem' }}>
                          {doc.document_name}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Self-declaration only</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
