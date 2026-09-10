import React, { useState, useEffect } from 'react';
import { Gift, CheckCircle2, ArrowRight, DollarSign, Award, Info } from 'lucide-react';

export default function SchemesPage() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/compliance/schemes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setSchemes(json.schemes || []);
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
        <p>Searching state and national subsidy database matching your enterprise...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.7rem', borderRadius: '9999px', background: 'var(--primary-50)', color: 'var(--primary-700)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <Gift size={14} /> State & Central Industrial Subsidies
          </div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Government Schemes & Incentives Finder</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Financial grants, capital subsidies, and interest subventions automatically matched to your business sector and scale.
          </p>
        </div>

        <div className="grid-2">
          {schemes.map(s => (
            <div key={s.id} className="card" style={{ borderLeft: '4px solid var(--emerald-600)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)' }}>{s.name}</h3>
                  <span className="badge badge-green">{s.sector} Sector</span>
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  {s.description}
                </p>

                <div style={{ background: '#ecfdf5', padding: '0.85rem', borderRadius: '6px', border: '1px solid #a7f3d0', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>
                    Financial Benefit Summary
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#065f46', marginTop: '0.2rem' }}>
                    {s.benefit_summary}
                  </div>
                </div>

                <div style={{ fontSize: '0.825rem', color: 'var(--navy-800)', marginBottom: '1rem' }}>
                  <strong>Eligibility:</strong> {s.eligibility_criteria}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => alert(`Incentive claim submitted under Single Window policy for ${s.name}`)}
                  className="btn btn-primary btn-sm"
                >
                  <span>Claim Scheme Benefit</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
