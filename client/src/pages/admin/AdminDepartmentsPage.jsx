import React, { useState, useEffect } from 'react';
import { Building2, Plus, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDepartmentsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // New dept form
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptDesc, setDeptDesc] = useState('');

  // New approval type form
  const [typeName, setTypeName] = useState('');
  const [typeDeptId, setTypeDeptId] = useState('');
  const [typeFee, setTypeFee] = useState('2500');
  const [typeDays, setTypeDays] = useState('14');
  const [typeRisk, setTypeRisk] = useState('Medium');
  const [requiresInspection, setRequiresInspection] = useState(true);

  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/overview', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.departments?.length > 0 && !typeDeptId) {
          setTypeDeptId(json.departments[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: deptName, code: deptCode, description: deptDesc })
      });
      const json = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Department created successfully!' });
        setDeptName('');
        setDeptCode('');
        setDeptDesc('');
        fetchAdminData();
      } else {
        setMessage({ type: 'danger', text: json.message });
      }
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to add department' });
    }
  };

  const handleAddApprovalType = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/approval-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: typeName,
          department_id: typeDeptId,
          fee: typeFee,
          processing_days: typeDays,
          risk_level: typeRisk,
          requires_inspection: requiresInspection
        })
      });
      const json = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Approval type configured successfully!' });
        setTypeName('');
        fetchAdminData();
      } else {
        setMessage({ type: 'danger', text: json.message });
      }
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to add approval type' });
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <p>Loading regulatory department registry...</p>
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
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Departments & Approval Types Directory</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Manage regulatory government authorities, fees, SLA standards, and clearance categories.
          </p>
        </div>

        {message && (
          <div className={`alert alert-${message.type}`} style={{ marginBottom: '1.5rem' }}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Departments Section */}
        <div className="grid-2" style={{ alignItems: 'flex-start', marginBottom: '2.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Configured Departments ({data?.departments?.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {data?.departments?.map(d => (
                <div key={d.id} style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--navy-900)' }}>{d.name}</h4>
                    <span className="badge badge-blue">{d.code}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {d.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Add New Regulatory Authority</h3>
            <form onSubmit={handleAddDepartment}>
              <div className="form-group">
                <label className="form-label">Department Name *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Directorate of Town & Country Planning"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Short Code *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. DTCP"
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mandate / Description</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Zoning, land-use permissions, layout sanctions"
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Register Department
              </button>
            </form>
          </div>
        </div>

        {/* Approval Types Section */}
        <div className="grid-2" style={{ alignItems: 'flex-start' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Registered Approval & Licence Types ({data?.approval_types?.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '500px', overflowY: 'auto' }}>
              {data?.approval_types?.map(t => {
                const dept = data?.departments?.find(d => d.id === t.department_id);
                return (
                  <div key={t.id} style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', color: 'var(--navy-900)' }}>{t.name}</h4>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Dept: {dept ? dept.name : `ID: ${t.department_id}`}
                        </div>
                      </div>
                      <span className={`badge badge-${t.risk_level === 'High' ? 'red' : t.risk_level === 'Medium' ? 'amber' : 'green'}`}>
                        {t.risk_level} Risk
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--navy-800)', marginTop: '0.4rem' }}>
                      <div>Fee: ₹{t.fee}</div>
                      <div>SLA: {t.processing_days} Days</div>
                      <div>Inspection: {t.requires_inspection ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Configure New Approval Type</h3>
            <form onSubmit={handleAddApprovalType}>
              <div className="form-group">
                <label className="form-label">Approval Title *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Groundwater Extraction NOC"
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Issuing Department *</label>
                <select
                  className="form-control"
                  value={typeDeptId}
                  onChange={(e) => setTypeDeptId(e.target.value)}
                >
                  {data?.departments?.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Statutory Fee (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={typeFee}
                    onChange={(e) => setTypeFee(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">SLA Turnaround (Days)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={typeDays}
                    onChange={(e) => setTypeDays(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Risk Level</label>
                  <select
                    className="form-control"
                    value={typeRisk}
                    onChange={(e) => setTypeRisk(e.target.value)}
                  >
                    <option value="Low">Low Risk</option>
                    <option value="Medium">Medium Risk</option>
                    <option value="High">High Risk</option>
                  </select>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                    <input
                      type="checkbox"
                      checked={requiresInspection}
                      onChange={(e) => setRequiresInspection(e.target.checked)}
                    />
                    <span>Requires Site Inspection</span>
                  </label>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Add Approval Type
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
