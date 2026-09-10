import React, { useState, useEffect } from 'react';
import { Award, Shield, CheckCircle2, Calendar, QrCode, Printer, AlertTriangle, Clock } from 'lucide-react';

export default function DigitalCertificatesPage() {
  const [licences, setLicences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    fetchLicences();
  }, []);

  const fetchLicences = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/compliance/licences', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setLicences(json.licences || []);
        if (json.licences && json.licences.length > 0) {
          setSelectedCert(json.licences[0]);
        }
      }
    } catch (e) {
      console.error('Failed to fetch licences:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <p>Retrieving digital licences and active compliance certificates...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Digital Certificates & Continuous Compliance</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Tamper-proof digital certificates, validity monitoring, and automated renewal alerts.
          </p>
        </div>

        {licences.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <Award size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Issued Licences Yet</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
              Once your departmental applications complete scrutiny and inspections, official digitally signed certificates will appear here.
            </p>
          </div>
        ) : (
          <div className="grid-2" style={{ alignItems: 'flex-start' }}>
            {/* Left: Licence List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Active Clearances ({licences.length})</h3>

              {licences.map(lic => (
                <div
                  key={lic.id}
                  className="card"
                  onClick={() => setSelectedCert(lic)}
                  style={{
                    cursor: 'pointer',
                    borderLeft: selectedCert?.id === lic.id ? '4px solid var(--primary-600)' : '1px solid var(--border-light)',
                    background: selectedCert?.id === lic.id ? '#eff6ff' : 'white',
                    padding: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.05rem', color: 'var(--navy-900)' }}>{lic.approval_name}</h4>
                    <span className="badge badge-green">Valid & Active</span>
                  </div>

                  <div style={{ fontSize: '0.825rem', color: 'var(--navy-800)', marginBottom: '0.5rem' }}>
                    <div><strong>Certificate No:</strong> {lic.licence_number}</div>
                    <div><strong>Department:</strong> {lic.department_name}</div>
                  </div>

                  {/* Renewal countdown alert */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: lic.days_to_expiry <= 60 ? 'var(--amber-600)' : 'var(--emerald-600)', background: 'white', padding: '0.4rem 0.65rem', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                    <Clock size={14} />
                    <span><strong>Renewal Status:</strong> {lic.days_to_expiry} days remaining (Expires: {lic.expiry_date})</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: High-Res Official Digital Certificate Display */}
            {selectedCert && (
              <div className="card" style={{
                padding: '2.5rem',
                border: '3px double #1e3a8a',
                background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
                boxShadow: 'var(--shadow-xl)',
                position: 'relative'
              }}>
                {/* Government Header */}
                <div style={{ textAlign: 'center', borderBottom: '2px solid #1e3a8a', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '48px', height: '48px', background: 'var(--primary-900)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}>
                    <Shield size={26} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--navy-900)' }}>
                    GOVERNMENT OF INDIA &bull; SINGLE WINDOW SYSTEM
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {selectedCert.department_name}
                  </div>
                  <h2 style={{ fontSize: '1.45rem', marginTop: '0.75rem', color: 'var(--primary-900)', fontWeight: 800 }}>
                    CERTIFICATE OF REGISTRATION & APPROVAL
                  </h2>
                </div>

                {/* Certificate Body */}
                <div style={{ fontSize: '0.9rem', lineHeight: 1.8, color: 'var(--navy-900)', marginBottom: '1.75rem' }}>
                  <p>
                    This is to certify that <strong>Apex Agro Foods & Beverages Ltd</strong> has been granted statutory regulatory clearance under the applicable State Industrial & Environmental Acts for the following compliance specification:
                  </p>

                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', margin: '1rem 0', border: '1px dashed #cbd5e1' }}>
                    <div><strong>Approval Title:</strong> {selectedCert.approval_name}</div>
                    <div><strong>Licence / Certificate Ref:</strong> <code>{selectedCert.licence_number}</code></div>
                    <div><strong>Date of Issuance:</strong> {selectedCert.issue_date}</div>
                    <div><strong>Valid Until:</strong> {selectedCert.expiry_date}</div>
                    <div><strong>Compliance Category:</strong> Continuous Periodic Monitoring</div>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    This is an electronically generated and cryptographically verifiable digital certificate. No physical signature is required.
                  </p>
                </div>

                {/* Verification Footer with QR & Hash */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ border: '1px solid #94a3b8', padding: '4px', borderRadius: '4px' }}>
                      <QrCode size={40} style={{ color: 'var(--navy-900)' }} />
                    </div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      <div><strong>Digital Hash:</strong></div>
                      <code>{selectedCert.qr_code_hash || 'SHA256:VERIFIED_GOV_CERT'}</code>
                    </div>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="btn btn-secondary btn-sm"
                  >
                    <Printer size={14} />
                    <span>Print Certificate</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
