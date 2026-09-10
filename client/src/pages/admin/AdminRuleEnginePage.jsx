import React, { useState, useEffect } from 'react';
import { GitFork, Plus, Trash2, CheckCircle2, AlertTriangle, ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminRuleEnginePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // New rule form
  const [ruleTypeId, setRuleTypeId] = useState('');
  const [ruleField, setRuleField] = useState('sector');
  const [ruleOp, setRuleOp] = useState('=');
  const [ruleVal, setRuleVal] = useState('');

  // New dependency form
  const [depChildId, setDepChildId] = useState('');
  const [depParentId, setDepParentId] = useState('');

  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/overview', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.approval_types?.length > 0) {
          if (!ruleTypeId) setRuleTypeId(json.approval_types[0].id);
          if (!depChildId) setDepChildId(json.approval_types[0].id);
          if (!depParentId) setDepParentId(json.approval_types[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = async (e) => {
    e.preventDefault();
    if (!ruleVal) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          approval_type_id: ruleTypeId,
          condition_field: ruleField,
          condition_operator: ruleOp,
          condition_value: ruleVal
        })
      });
      const json = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Rule condition added to the evaluation engine!' });
        setRuleVal('');
        fetchData();
      } else {
        setMessage({ type: 'danger', text: json.message });
      }
    } catch (err) {
      setMessage({ type: 'danger', text: 'Error adding rule' });
    }
  };

  const handleDeleteRule = async (id) => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`/api/admin/rules/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Rule condition removed.' });
      fetchData();
    } catch (e) {
      //
    }
  };

  const handleAddDependency = async (e) => {
    e.preventDefault();
    if (depChildId === depParentId) {
      setMessage({ type: 'danger', text: 'An approval cannot depend on itself.' });
      return;
    }
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/dependencies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          approval_type_id: depChildId,
          depends_on_approval_type_id: depParentId
        })
      });
      const json = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Dependency relationship added to DAG!' });
        fetchData();
      } else {
        setMessage({ type: 'danger', text: json.message });
      }
    } catch (err) {
      setMessage({ type: 'danger', text: 'Error adding dependency' });
    }
  };

  const handleDeleteDependency = async (id) => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`/api/admin/dependencies/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Dependency link deleted.' });
      fetchData();
    } catch (e) {
      //
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <p>Loading data-driven rule engine parameters and dependency graph...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        <Link to="/admin/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          <ArrowLeft size={16} /> Back to Admin Console
        </Link>

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Intelligent Rule Engine & Dependency (DAG) Configuration</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Data-driven rules evaluated against business profiles. Modify logic and execution dependencies without code changes.
          </p>
        </div>

        {message && (
          <div className={`alert alert-${message.type}`} style={{ marginBottom: '1.5rem' }}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Section 1: Data-Driven Rule Conditions */}
        <div className="card" style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Active Rule Engine Conditions ({data?.approval_rules?.length})</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            When a business profile matches these conditions, the approval type is automatically added to their customized checklist.
          </p>

          <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border-light)', textAlign: 'left' }}>
                  <th style={{ padding: '0.65rem' }}>Rule ID</th>
                  <th style={{ padding: '0.65rem' }}>Approval Type</th>
                  <th style={{ padding: '0.65rem' }}>Profile Field</th>
                  <th style={{ padding: '0.65rem' }}>Operator</th>
                  <th style={{ padding: '0.65rem' }}>Target Value</th>
                  <th style={{ padding: '0.65rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.approval_rules?.map(r => {
                  const type = data?.approval_types?.find(t => t.id === r.approval_type_id);
                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.65rem', color: 'var(--text-muted)' }}>#{r.id}</td>
                      <td style={{ padding: '0.65rem', fontWeight: 600 }}>{type?.name || `Type ${r.approval_type_id}`}</td>
                      <td style={{ padding: '0.65rem' }}><code>{r.condition_field}</code></td>
                      <td style={{ padding: '0.65rem', fontWeight: 700, color: 'var(--primary-700)' }}>{r.condition_operator}</td>
                      <td style={{ padding: '0.65rem' }}><code>{r.condition_value}</code></td>
                      <td style={{ padding: '0.65rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteRule(r.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--rose-600)', padding: '0.2rem 0.5rem' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Form to add rule */}
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Add New Dynamic Rule Condition</h4>
            <form onSubmit={handleAddRule} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', alignItems: 'flex-end' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Target Approval</label>
                <select className="form-control" value={ruleTypeId} onChange={(e) => setRuleTypeId(e.target.value)}>
                  {data?.approval_types?.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Profile Field</label>
                <select className="form-control" value={ruleField} onChange={(e) => setRuleField(e.target.value)}>
                  <option value="sector">sector</option>
                  <option value="environmental_category">environmental_category</option>
                  <option value="investment">investment</option>
                  <option value="employees">employees</option>
                  <option value="land_type">land_type</option>
                  <option value="business_stage">business_stage</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Operator</label>
                <select className="form-control" value={ruleOp} onChange={(e) => setRuleOp(e.target.value)}>
                  <option value="=">=</option>
                  <option value="!=">!=</option>
                  <option value=">=">&gt;=</option>
                  <option value="<=">&lt;=</option>
                  <option value="IN">IN (comma-separated)</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Condition Value</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Manufacturing or 5000000"
                  value={ruleVal}
                  onChange={(e) => setRuleVal(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem' }}>
                <Plus size={16} />
                <span>Add Rule</span>
              </button>
            </form>
          </div>
        </div>

        {/* Section 2: Approval Dependencies (DAG) */}
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Approval Dependency Relationships (DAG Engine)</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Defines which approvals are locked until their prerequisites have been approved and licensed.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {data?.approval_dependencies?.map(d => {
              const child = data?.approval_types?.find(t => t.id === d.approval_type_id);
              const parent = data?.approval_types?.find(t => t.id === d.depends_on_approval_type_id);
              return (
                <div key={d.id} style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.85rem' }}>
                    <strong>{child?.name}</strong>
                    <div style={{ color: 'var(--primary-700)', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                      &rarr; Depends on: <strong>{parent?.name}</strong>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteDependency(d.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--rose-600)', padding: '0.2rem 0.45rem' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Form to add dependency */}
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Add New Prerequisite Link</h4>
            <form onSubmit={handleAddDependency} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Locked Approval</label>
                <select className="form-control" value={depChildId} onChange={(e) => setDepChildId(e.target.value)}>
                  {data?.approval_types?.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Prerequisite Required First</label>
                <select className="form-control" value={depParentId} onChange={(e) => setDepParentId(e.target.value)}>
                  {data?.approval_types?.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary">
                Link Dependency
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
