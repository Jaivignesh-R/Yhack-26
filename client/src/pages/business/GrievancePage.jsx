import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquarePlus, CheckCircle2, AlertTriangle, Clock, ShieldAlert, ArrowRight } from 'lucide-react';

export default function GrievancePage() {
  const [searchParams] = useSearchParams();
  const preAppId = searchParams.get('app_id') || '';
  const preAppNo = searchParams.get('app_no') || '';

  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState(preAppNo ? `Delay / Inquiry on Application ${preAppNo}` : '');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchGrievances();
  }, []);

  const fetchGrievances = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/grievances/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setGrievances(json.grievances || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/grievances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          application_id: preAppId || null,
          subject,
          description
        })
      });

      const json = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: json.message });
        setSubject('');
        setDescription('');
        fetchGrievances();
      } else {
        setMessage({ type: 'danger', text: json.message || 'Failed to submit' });
      }
    } catch (err) {
      setMessage({ type: 'danger', text: 'Error submitting grievance' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Grievance Redressal & Dispute Escalation</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Raise formal complaints on departmental bottlenecks, unreasonable delays, or scrutiny disputes.
          </p>
        </div>

        {message && (
          <div className={`alert alert-${message.type}`} style={{ marginBottom: '1.5rem' }}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid-2" style={{ alignItems: 'flex-start' }}>
          {/* Form */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MessageSquarePlus size={18} style={{ color: 'var(--primary-600)' }} />
              Lodge New Grievance
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="subject">Subject / Issue Summary *</label>
                <input
                  id="subject"
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Scrutiny Delay for Fire NOC (Over 14 days)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">Detailed Description & Reference *</label>
                <textarea
                  id="description"
                  required
                  rows="5"
                  className="form-control"
                  placeholder="Describe your issue, timeline delay, or departmental inquiry in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                {submitting ? 'Lodging Escalation Ticket...' : 'Submit Grievance to Nodal Officer'}
              </button>
            </form>
          </div>

          {/* Existing Grievances */}
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>My Lodged Grievances ({grievances.length})</h3>

            {grievances.length === 0 ? (
              <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No active grievances filed.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {grievances.map(g => (
                  <div key={g.id} className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <h4 style={{ fontSize: '1rem', color: 'var(--navy-900)' }}>{g.subject}</h4>
                      <span className={`badge badge-${g.status === 'Resolved' ? 'green' : g.status === 'Open' ? 'amber' : 'purple'}`}>
                        {g.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Ref: {g.application_number} &bull; Logged: {new Date(g.created_at).toLocaleDateString()}
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--navy-800)', marginBottom: '0.5rem' }}>
                      "{g.description}"
                    </p>

                    {g.resolution_note && (
                      <div style={{ background: '#ecfdf5', padding: '0.6rem 0.8rem', borderRadius: '4px', borderLeft: '3px solid #059669', fontSize: '0.825rem', marginTop: '0.5rem' }}>
                        <strong>Nodal Officer Resolution:</strong> {g.resolution_note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
