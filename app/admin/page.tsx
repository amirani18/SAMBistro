'use client';
import { useEffect, useState, useCallback } from 'react';
import GoldDivider from '@/components/GoldDivider';
import { calculateScore, getScoreLabel } from '@/lib/scoring';
import { getSupabase } from '@/lib/supabase';

const ADMIN_PIN = '2025';

interface Team {
  id: string;
  team_name: string;
  created_at: string;
}

interface Selection {
  id: string;
  team_id: string;
  service_requirement: string;
  selected_tools: string[];
  reason: string;
  teams?: { team_name: string };
}

interface StickyNote {
  id: string;
  team_id: string;
  team_name: string;
  prompt: string;
  content: string;
  created_at: string;
}

interface DeleteConfirm {
  type: 'team' | 'selection' | 'note';
  id: string;
  label: string;
  step: 1 | 2;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  const [teams, setTeams] = useState<Team[]>([]);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [revealEnabled, setRevealEnabled] = useState(false);
  const [revealLoading, setRevealLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirm | null>(null);
  const [activeTab, setActiveTab] = useState<'teams' | 'selections' | 'notes'>('teams');

  const loadAll = useCallback(async () => {
    const [teamsRes, selRes, notesRes, sessRes] = await Promise.all([
      fetch('/api/teams'),
      fetch('/api/selections'),
      fetch('/api/sticky-notes'),
      fetch('/api/session'),
    ]);
    const { teams: t } = await teamsRes.json();
    const { selections: s } = await selRes.json();
    const { notes: n } = await notesRes.json();
    const { session } = await sessRes.json();

    setTeams(t ?? []);
    setSelections(s ?? []);
    setNotes(n ?? []);
    setRevealEnabled(session?.reveal_enabled ?? false);
  }, []);

  useEffect(() => {
    if (!authed) return;
    loadAll();

    // Real-time
    const supabase = getSupabase();
    const channel = supabase
      .channel('admin-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tool_selections' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sticky_notes' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_state' }, loadAll)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [authed, loadAll]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setAuthed(true);
    } else {
      setPinError('Incorrect PIN. Try again.');
      setPin('');
    }
  }

  async function toggleReveal() {
    setRevealLoading(true);
    await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reveal_enabled: !revealEnabled }),
    });
    setRevealEnabled(prev => !prev);
    setRevealLoading(false);
  }

  function initiateDelete(type: DeleteConfirm['type'], id: string, label: string) {
    setDeleteConfirm({ type, id, label, step: 1 });
  }

  async function confirmDelete() {
    if (!deleteConfirm) return;
    if (deleteConfirm.step === 1) {
      setDeleteConfirm({ ...deleteConfirm, step: 2 });
      return;
    }
    // Step 2 — actually delete
    await fetch(`/api/admin?type=${deleteConfirm.type}&id=${deleteConfirm.id}`, { method: 'DELETE' });
    setDeleteConfirm(null);
    loadAll();
  }

  // Group selections by team
  const selectionsByTeam = teams.map(team => ({
    team,
    selections: selections.filter(s => s.team_id === team.id),
    allTools: selections.filter(s => s.team_id === team.id).flatMap(s => s.selected_tools ?? []),
  }));

  /* ── Login screen ── */
  if (!authed) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#070D22',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div
          style={{
            background: '#111D3C',
            border: '1px solid #8B7234',
            borderRadius: 4,
            padding: '2.5rem',
            width: '100%',
            maxWidth: 380,
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: '#C9A84C', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>
            SAM Bistro
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: '#fff', fontSize: '1.6rem', marginBottom: '0.25rem' }}>
            Admin Access
          </h1>
          <GoldDivider />
          <form onSubmit={handleLogin}>
            <label style={{ fontSize: '0.65rem', letterSpacing: '0.12em', color: '#C9A84C', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem', textAlign: 'left' }}>
              Admin PIN
            </label>
            <input
              className="bistro-input"
              type="password"
              placeholder="Enter PIN"
              value={pin}
              onChange={e => setPin(e.target.value)}
              maxLength={10}
              style={{ marginBottom: '0.5rem' }}
            />
            {pinError && <p style={{ color: '#E07B39', fontSize: '0.8rem', margin: '0 0 0.5rem' }}>{pinError}</p>}
            <button className="btn-gold" type="submit" style={{ width: '100%', marginTop: '0.75rem' }}>
              Enter
            </button>
          </form>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', marginTop: '1.5rem', marginBottom: 0 }}>Default PIN: 2025</p>
        </div>
      </div>
    );
  }

  /* ── Admin dashboard ── */
  return (
    <div style={{ minHeight: '100vh', background: '#070D22', display: 'flex', flexDirection: 'column' }}>
      {/* Admin header */}
      <div
        style={{
          borderBottom: '1px solid #1C2E5C',
          background: 'rgba(7,13,34,0.95)',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <span style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C', fontSize: '1rem' }}>SAM Bistro</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginLeft: '0.75rem' }}>Admin Dashboard</span>
        </div>

        {/* Reveal toggle */}
        <button
          onClick={toggleReveal}
          disabled={revealLoading}
          style={{
            background: revealEnabled ? 'rgba(93,184,64,0.15)' : 'rgba(201,168,76,0.15)',
            border: `1px solid ${revealEnabled ? '#5DB840' : '#8B7234'}`,
            color: revealEnabled ? '#5DB840' : '#C9A84C',
            borderRadius: 3,
            padding: '0.5rem 1.25rem',
            fontSize: '0.8rem',
            cursor: 'pointer',
            letterSpacing: '0.06em',
          }}
        >
          {revealLoading ? '...' : revealEnabled ? '✓ Reveal Active — Click to Hide' : 'Reveal Final Bills'}
        </button>
      </div>

      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '2rem 1.5rem' }}>

        {/* Stats bar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Teams Registered', value: teams.length },
            { label: 'Selections Saved', value: selections.length },
            { label: 'Notes Posted', value: notes.length },
            { label: 'Reveal Status', value: revealEnabled ? 'LIVE' : 'HIDDEN' },
          ].map(stat => (
            <div
              key={stat.label}
              style={{
                background: '#111D3C',
                border: '1px solid #1C2E5C',
                borderRadius: 3,
                padding: '0.75rem 1.25rem',
                flex: '1 1 160px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#C9A84C', fontFamily: "'Playfair Display', serif" }}>{stat.value}</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #1C2E5C', paddingBottom: '0.75rem' }}>
          {(['teams', 'selections', 'notes'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? 'rgba(201,168,76,0.12)' : 'transparent',
                border: `1px solid ${activeTab === tab ? '#8B7234' : '#1C2E5C'}`,
                color: activeTab === tab ? '#C9A84C' : 'rgba(255,255,255,0.4)',
                borderRadius: 3,
                padding: '0.5rem 1.25rem',
                fontSize: '0.78rem',
                letterSpacing: '0.08em',
                textTransform: 'capitalize',
                cursor: 'pointer',
              }}
            >
              {tab === 'teams' ? `Teams (${teams.length})` : tab === 'selections' ? `Selections (${selections.length})` : `Notes (${notes.length})`}
            </button>
          ))}
        </div>

        {/* Teams tab */}
        {activeTab === 'teams' && (
          <div>
            {teams.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '2rem' }}>No teams registered yet.</p>
            ) : (
              selectionsByTeam.map(({ team, allTools }) => {
                const score = allTools.length ? calculateScore(allTools) : null;
                const label = score ? getScoreLabel(score.totalComplexityScore) : null;
                return (
                  <div
                    key={team.id}
                    style={{
                      background: '#111D3C',
                      border: '1px solid #1C2E5C',
                      borderRadius: 4,
                      padding: '1.25rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div>
                        <span style={{ fontFamily: "'Playfair Display', serif", color: '#fff', fontSize: '1.1rem' }}>{team.team_name}</span>
                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginLeft: '0.75rem' }}>
                          Joined {new Date(team.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        {score && (
                          <span style={{ color: label?.color, fontSize: '0.8rem', border: `1px solid ${label?.color}`, borderRadius: 3, padding: '0.2rem 0.6rem' }}>
                            Score: {score.totalComplexityScore} — {label?.label}
                          </span>
                        )}
                        <button
                          onClick={() => initiateDelete('team', team.id, team.team_name)}
                          style={{ background: 'transparent', border: '1px solid #C94C4C', color: '#C94C4C', borderRadius: 3, padding: '0.3rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* All tools summary */}
                    {allTools.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {[...new Set(allTools)].map(t => (
                          <span key={t} className="tool-badge">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Selections tab */}
        {activeTab === 'selections' && (
          <div>
            {selections.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '2rem' }}>No selections submitted yet.</p>
            ) : (
              <div
                style={{
                  background: '#111D3C',
                  border: '1px solid #1C2E5C',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                {/* Header */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.5fr 1.5fr auto', gap: '1rem', padding: '0.75rem 1.25rem', background: 'rgba(201,168,76,0.08)', borderBottom: '1px solid #8B7234' }}>
                  {['Team', 'Service Requirement', 'Tools', 'Reason', ''].map(h => (
                    <div key={h} style={{ fontSize: '0.6rem', letterSpacing: '0.1em', color: '#C9A84C', textTransform: 'uppercase' }}>{h}</div>
                  ))}
                </div>
                {selections.map(s => (
                  <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.5fr 1.5fr auto', gap: '1rem', padding: '0.75rem 1.25rem', borderBottom: '1px solid #1C2E5C', alignItems: 'start' }}>
                    <div style={{ color: '#C9A84C', fontSize: '0.8rem' }}>{s.teams?.team_name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>{s.service_requirement}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {s.selected_tools?.map(t => <span key={t} className="tool-badge" style={{ fontSize: '0.7rem' }}>{t}</span>)}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', fontStyle: 'italic' }}>{s.reason || '—'}</div>
                    <button
                      onClick={() => initiateDelete('selection', s.id, `${s.teams?.team_name} · ${s.service_requirement}`)}
                      style={{ background: 'transparent', border: '1px solid #C94C4C', color: '#C94C4C', borderRadius: 3, padding: '0.2rem 0.5rem', fontSize: '0.7rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes tab */}
        {activeTab === 'notes' && (
          <div>
            {notes.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '2rem' }}>No notes posted yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                {notes.map(note => (
                  <div
                    key={note.id}
                    style={{
                      background: '#1C3460',
                      border: '1px solid #2A4880',
                      borderRadius: 3,
                      padding: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.65rem', color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{note.team_name}</span>
                      <button
                        onClick={() => initiateDelete('note', note.id, `note by ${note.team_name}`)}
                        style={{ background: 'transparent', border: 'none', color: 'rgba(201,76,76,0.6)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                      >
                        ✕
                      </button>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', margin: '0 0 0.5rem', fontStyle: 'italic' }}>{note.prompt}</p>
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem', margin: 0, lineHeight: 1.5 }}>{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
          }}
        >
          <div
            style={{
              background: '#111D3C',
              border: '1px solid #C94C4C',
              borderRadius: 4,
              padding: '2rem',
              maxWidth: 420,
              width: '90%',
              textAlign: 'center',
            }}
          >
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: '#fff', marginTop: 0 }}>
              {deleteConfirm.step === 1 ? 'Are you sure?' : 'This cannot be undone.'}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              {deleteConfirm.step === 1
                ? `You are about to delete: "${deleteConfirm.label}"`
                : `Permanently delete "${deleteConfirm.label}"? All associated data will be removed.`}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                className="btn-outline"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  background: '#C94C4C',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 3,
                  padding: '0.65rem 1.5rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {deleteConfirm.step === 1 ? 'Yes, continue' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
