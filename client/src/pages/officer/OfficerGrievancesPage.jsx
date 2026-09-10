import React, { useState, useEffect } from 'react';
import { MessageSquarePlus, CheckCircle2, AlertTriangle, ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OfficerGrievancesPage() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [status, setStatus] = useState('Resolved');
  const [resolving, setResolving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchGrievances();
  }, []);

  const fetchGrievances = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/grievances/all', {
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

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!selectedGrievance) return;
    setResolving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/grievances/${selectedGrievance.id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          resolution_note: resolutionNote
        })
      });

      const json = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Grievance updated and notification sent to applicant.' });
        setSelectedGrievance(null);
        setResolutionNote('');
        fetchGrievances();
      } else {
        setMessage({ type: 'danger', text: json.message });
      }
    } catch (err) {
      setMessage({ type: 'danger', text: 'Error resolving grievance' });
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <p>Loading grievance dispute queue...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        <Link to="/officer/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          <ArrowLeft size={16} /> Back to Desk
        </Link>

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Grievance Redressal & Dispute Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Investigate applicant escalations, provide official clarifications, and resolve scrutiny bottlenecks.
          </p>
        </div>

        {message && (
          <div className={`alert alert-${message.type}`} style={{ marginBottom: '1.5rem' }}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid-2" style={{ alignItems: 'flex-start' }}>
          {/* List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Escalation Tickets ({grievances.length})</h3>

            {grievances.map(g => (
              <div
                key={g.id}
                className="card"
                style={{
                  borderLeft: `4px solid ${g.status === 'Resolved' ? 'var(--emerald-600)' : 'var(--amber-500)'}`,
                  padding: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--navy-900)' }}>{g.subject}</h4>
                  <span className={`badge badge-${g.status === 'Resolved' ? 'green' : 'amber'}`}>
                    {g.status}
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Applicant: <strong>{g.applicant_name}</strong> ({g.applicant_email}) &bull; Ref: {g.application_number}
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--navy-900)', marginBottom: '0.75rem' }}>
                  "{g.description}"
                </p>

                {g.resolution_note && (
                  <div style={{ background: '#ecfdf5', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', color: '#065f46', marginBottom: '0.75rem' }}>
                    <strong>Resolution:</strong> {g.resolution_note}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      setSelectedGrievance(g);
                      setResolutionNote(g.resolution_note || '');
                      setStatus(g.status === 'Open' ? 'Under Investigation' : g.status);
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    Investigate / Resolve Ticket &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="card" style={{ borderLeft: '4px solid var(--primary-600)' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Grievance Resolution Action</h3>

            {selectedGrievance ? (
              <form onSubmit={handleResolve}>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <strong>Ticket:</strong> {selectedGrievance.subject} &bull; {selectedGrievance.applicant_name}
                </div>

                <div className="form-group">
                  <label className="form-label">Update Grievance Status</label>
                  <select
                    className="form-control"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Under Investigation">Under Investigation</option>
                    <option value="Resolved">Resolved - Action Taken</option>
                    <option value="Escalated">Escalated to Higher Authority</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="resolution_note">
                    Official Resolution Note to Applicant *
                  </label>
                  <textarea
                    id="resolution_note"
                    rows="4"
                    required
                    className="form-control"
                    placeholder="Provide official clarification, explanation of delay, or confirmation of expedited inspection..."
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedGrievance(null)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resolving}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    {resolving ? 'Recording...' : 'Send Official Resolution'}
                  </button>
                </div>
              </form>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Select an escalation ticket from the list to investigate and file a formal resolution note.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
