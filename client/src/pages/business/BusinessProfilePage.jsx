import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, CheckCircle2, AlertCircle, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';

export default function BusinessProfilePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company_name: '',
    sector: 'Manufacturing',
    location: '',
    investment: '',
    project_size: '',
    employees: '25',
    production_capacity: '',
    land_type: 'Industrial Park',
    environmental_category: 'Orange',
    business_stage: 'Planning',
    pan_gstin: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch('/api/compliance/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setFormData(data.profile);
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/compliance/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save profile');

      setMessage({ type: 'success', text: 'Business profile successfully updated! Analyzing regulatory rules...' });
      setTimeout(() => {
        navigate('/business/checklist');
      }, 1200);
    } catch (err) {
      setMessage({ type: 'danger', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <p>Loading enterprise profile...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.7rem', borderRadius: '9999px', background: 'var(--primary-50)', color: 'var(--primary-700)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <Sparkles size={14} /> Step 1: Enterprise Profile & Project Attributes
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Business & Project Profile</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Enter your enterprise and project parameters. The Intelligent Rule Engine will evaluate these parameters to generate your mandatory approval checklist, risk score, and compliance roadmap.
          </p>
        </div>

        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="card" style={{ padding: '2.25rem', boxShadow: 'var(--shadow-md)' }}>
          <form onSubmit={handleSubmit}>
            {/* Section A: Core Identity */}
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              A. Enterprise Information
            </h3>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="company_name">Company / Entity Legal Name *</label>
                <input
                  id="company_name"
                  name="company_name"
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Apex Agro Foods Ltd"
                  value={formData.company_name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="sector">Industrial Sector *</label>
                <select
                  id="sector"
                  name="sector"
                  className="form-control"
                  value={formData.sector}
                  onChange={handleChange}
                >
                  <option value="Manufacturing">Manufacturing (General / Heavy)</option>
                  <option value="Food Processing">Food Processing & Beverage</option>
                  <option value="Chemicals">Chemicals & Petrochemicals</option>
                  <option value="Healthcare">Healthcare & Pharmaceuticals</option>
                  <option value="IT & Software">IT, Software & Data Centers</option>
                  <option value="Retail">Retail & Commercial Establishment</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="location">Operating Location / Industrial Zone *</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  className="form-control"
                  placeholder="Plot No., Industrial Area, City, State"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="pan_gstin">PAN / GSTIN Registration</label>
                <input
                  id="pan_gstin"
                  name="pan_gstin"
                  type="text"
                  className="form-control"
                  placeholder="27AABCA1234F1Z8"
                  value={formData.pan_gstin}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Section B: Scale & Environmental Attributes */}
            <h3 style={{ fontSize: '1.15rem', margin: '1.75rem 0 1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              B. Scale, Land & Environmental Classification
            </h3>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label" htmlFor="investment">Capital Investment (INR ₹) *</label>
                <input
                  id="investment"
                  name="investment"
                  type="number"
                  required
                  className="form-control"
                  placeholder="e.g. 8500000"
                  value={formData.investment}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="employees">Workforce / Employees *</label>
                <input
                  id="employees"
                  name="employees"
                  type="number"
                  required
                  className="form-control"
                  placeholder="e.g. 45"
                  value={formData.employees}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="project_size">Plot / Built-up Area</label>
                <input
                  id="project_size"
                  name="project_size"
                  type="text"
                  className="form-control"
                  placeholder="e.g. 25,000 sq ft"
                  value={formData.project_size}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label" htmlFor="production_capacity">Production Capacity</label>
                <input
                  id="production_capacity"
                  name="production_capacity"
                  type="text"
                  className="form-control"
                  placeholder="e.g. 150 MT / month"
                  value={formData.production_capacity}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="land_type">Land Tenure / Zone</label>
                <select
                  id="land_type"
                  name="land_type"
                  className="form-control"
                  value={formData.land_type}
                  onChange={handleChange}
                >
                  <option value="Industrial Park">Designated Industrial Park / Estate</option>
                  <option value="Commercial Zone">Approved Commercial Zone</option>
                  <option value="Agricultural (Converted)">Converted Agricultural Freehold</option>
                  <option value="Private Freehold">Private Non-Industrial Land</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="environmental_category">
                  Pollution Category (CPCB)
                </label>
                <select
                  id="environmental_category"
                  name="environmental_category"
                  className="form-control"
                  value={formData.environmental_category}
                  onChange={handleChange}
                >
                  <option value="Red">Red (Heavy Pollution Score &gt; 60)</option>
                  <option value="Orange">Orange (Moderate Pollution Score 41-59)</option>
                  <option value="Green">Green (Low Pollution Score 21-40)</option>
                  <option value="White">White (Practically Non-Polluting)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="business_stage">Current Project Stage *</label>
              <select
                id="business_stage"
                name="business_stage"
                className="form-control"
                value={formData.business_stage}
                onChange={handleChange}
              >
                <option value="Planning">1. Planning & Concept Formulation</option>
                <option value="Pre-Construction">2. Pre-Construction (Acquiring Land & Preliminary Clearances)</option>
                <option value="Under Construction">3. Under Construction (Building Erection & Machine Setup)</option>
                <option value="Operational">4. Operational (Active Production / Commercial Running)</option>
                <option value="Expansion">5. Expansion / Capacity Modification</option>
              </select>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary btn-lg"
              >
                {saving ? 'Evaluating Rules...' : 'Save & Run Rule Engine'}
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
