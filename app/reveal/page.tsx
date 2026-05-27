'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import StepIndicator from '@/components/StepIndicator';
import GoldDivider from '@/components/GoldDivider';
import { calculateScore, getScoreLabel } from '@/lib/scoring';
import { getSupabase } from '@/lib/supabase';

interface Selection {
  service_requirement: string;
  selected_tools: string[];
  reason: string;
}

interface Summary {
  must_have_tools: string;
  nice_to_have_tools: string;
  removable_tool: string;
}

export default function FinalBillReveal() {
  const router = useRouter();
  const [teamId, setTeamId] = useState('');
  const [teamName, setTeamName] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [waiting, setWaiting] = useState(true);

  const loadData = useCallback(async (id: string) => {
    const [selRes, sumRes] = await Promise.all([
      fetch(`/api/selections?team_id=${id}`),
      fetch(`/api/summary?team_id=${id}`),
    ]);
    const { selections: sels } = await selRes.json();
    const { summary: sum } = await sumRes.json();
    setSelections(sels ?? []);
    setSummary(sum ?? null);
  }, []);

  useEffect(() => {
    const id = localStorage.getItem('sam_team_id');
    const name = localStorage.getItem('sam_team_name');
    if (!id) { router.replace('/'); return; }
    setTeamId(id);
    setTeamName(name ?? '');
    loadData(id);

    // Check initial session state
    fetch('/api/session')
      .then(r => r.json())
      .then(({ session }) => {
        if (session?.reveal_enabled) {
          setRevealed(true);
          setWaiting(false);
        }
      });

    // Subscribe to real-time session state changes
    const supabase = getSupabase();
    const channel = supabase
      .channel('session-reveal')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'session_state' }, payload => {
        if (payload.new?.reveal_enabled) {
          setRevealed(true);
          setWaiting(false);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [router, loadData]);

  const allTools = selections.flatMap(s => s.selected_tools ?? []);
  const score = allTools.length > 0 ? calculateScore(allTools) : null;
  const scoreLabel = score ? getScoreLabel(score.totalComplexityScore) : null;

  return (
    <div style={{ minHeight: '100vh', background: '#070D22', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader />
      <StepIndicator currentStep={4} />

      <main style={{ flex: 1, maxWidth: 900, margin: '0 auto', width: '100%', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: '#C9A84C', textTransform: 'uppercase', margin: 0 }}>
            Chef&apos;s Final Bill
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              color: '#fff',
              marginTop: '0.5rem',
              marginBottom: '0.25rem',
            }}
          >
            Final Bill Reveal
          </h1>
          {teamName && (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', margin: 0 }}>
              Team: <span style={{ color: '#C9A84C' }}>{teamName}</span>
            </p>
          )}
          <GoldDivider thick />
        </div>

        {/* Waiting state */}
        {waiting && !revealed && (
          <div
            style={{
              background: '#111D3C',
              border: '2px solid #8B7234',
              borderRadius: 4,
              padding: '4rem 2rem',
              textAlign: 'center',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                fontSize: '2rem',
                marginBottom: '1rem',
              }}
            >
              ⏳
            </div>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                color: '#C9A84C',
                fontSize: '1.4rem',
                marginBottom: '0.75rem',
              }}
            >
              Do Not Open Until the Chef Reveals the Bill
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Please return to the main Microsoft Teams room. The facilitator will reveal
              the final bill when everyone is ready.
            </p>
            <GoldDivider />
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontStyle: 'italic' }}>
              This page will automatically unlock when the session resumes.
            </p>
          </div>
        )}

        {/* Revealed state */}
        {revealed && score && (
          <>
            {/* Score summary card */}
            <div
              style={{
                background: '#111D3C',
                border: `2px solid ${scoreLabel?.color}`,
                borderRadius: 4,
                padding: '2rem',
                textAlign: 'center',
                marginBottom: '1.5rem',
                position: 'relative',
              }}
            >
              <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: '#C9A84C', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>
                Your Complexity Score
              </p>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '4rem',
                  fontWeight: 700,
                  color: scoreLabel?.color,
                  lineHeight: 1,
                  marginBottom: '0.5rem',
                }}
              >
                {score.totalComplexityScore}
              </div>
              <div
                style={{
                  display: 'inline-block',
                  border: `1px solid ${scoreLabel?.color}`,
                  borderRadius: 3,
                  padding: '0.25rem 1rem',
                  fontSize: '0.8rem',
                  letterSpacing: '0.1em',
                  color: scoreLabel?.color,
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                }}
              >
                {scoreLabel?.label}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', margin: 0 }}>
                Lower score = cleaner, more manageable stack. · Base tools selected: <strong style={{ color: '#fff' }}>{score.baseToolCount}</strong>
              </p>
            </div>

            {/* Findings table */}
            <div
              style={{
                background: '#111D3C',
                border: '1px solid #1C2E5C',
                borderRadius: 4,
                overflow: 'hidden',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  background: 'rgba(201,168,76,0.08)',
                  borderBottom: '1px solid #8B7234',
                  padding: '0.75rem 1.25rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto',
                  gap: '1rem',
                }}
              >
                {['Finding', 'Category', 'Points Added'].map(h => (
                  <div key={h} style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C9A84C' }}>{h}</div>
                ))}
              </div>

              {score.findings.map(f => (
                <div
                  key={f.description}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto auto',
                    gap: '1rem',
                    padding: '0.75rem 1.25rem',
                    borderBottom: '1px solid #1C2E5C',
                    background: f.triggered ? 'rgba(224,123,57,0.06)' : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: f.triggered ? '#E07B39' : '#5DB840', fontSize: '0.8rem' }}>
                      {f.triggered ? '⚠' : '✓'}
                    </span>
                    <span style={{ color: f.triggered ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>
                      {f.description}
                    </span>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', whiteSpace: 'nowrap', paddingTop: '0.1rem' }}>
                    {f.category}
                  </div>
                  <div
                    style={{
                      color: f.triggered ? '#E07B39' : 'rgba(255,255,255,0.25)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      textAlign: 'right',
                    }}
                  >
                    {f.triggered ? `+${f.points}` : '—'}
                  </div>
                </div>
              ))}
            </div>

            {/* Order recap */}
            <div className="bistro-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', color: '#C9A84C', textTransform: 'uppercase', marginTop: 0, marginBottom: '1rem' }}>
                Your Order Recap
              </p>
              {selections.map(s => (
                <div key={s.service_requirement} style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #1C2E5C' }}>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.3rem' }}>
                    {s.service_requirement}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: s.reason ? '0.4rem' : 0 }}>
                    {s.selected_tools?.length ? s.selected_tools.map(t => (
                      <span key={t} className="tool-badge">{t}</span>
                    )) : <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem' }}>No tools selected</span>}
                  </div>
                  {s.reason && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', margin: 0, fontStyle: 'italic' }}>&ldquo;{s.reason}&rdquo;</p>}
                </div>
              ))}
            </div>

            {/* Final order summary */}
            {summary && (
              <div className="bistro-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', color: '#C9A84C', textTransform: 'uppercase', marginTop: 0, marginBottom: '1rem' }}>
                  Final Order Summary
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {[
                    { label: 'Must-have tools', value: summary.must_have_tools },
                    { label: 'Nice-to-have tools', value: summary.nice_to_have_tools },
                    { label: 'Tool we could remove', value: summary.removable_tool },
                  ].map(f => (
                    <div key={f.label}>
                      <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.3rem' }}>{f.label}</p>
                      <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', margin: 0 }}>{f.value || '—'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <GoldDivider />

            <div style={{ textAlign: 'center', paddingBottom: '2rem' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                Ready for the group debrief? Head to the Takeaway Wall.
              </p>
              <button className="btn-gold" onClick={() => router.push('/takeaway')}>
                Go to Takeaway Wall →
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
