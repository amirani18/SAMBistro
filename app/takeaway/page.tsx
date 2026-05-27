'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import StepIndicator from '@/components/StepIndicator';
import GoldDivider from '@/components/GoldDivider';
import { getSupabase } from '@/lib/supabase';

const PROMPTS = [
  'What surprised you about your order?',
  'Where did duplicate tools show up?',
  'What would you change before placing the order again?',
  'How does SAM help reduce cost, risk, or complexity?',
];

const NOTE_COLORS = ['#1C3460', '#1C3C30', '#3C2A1C', '#2A1C3C'];

interface StickyNote {
  id: string;
  team_name: string;
  prompt: string;
  content: string;
  created_at: string;
}

export default function TakeawayWall() {
  const router = useRouter();
  const [teamId, setTeamId] = useState('');
  const [teamName, setTeamName] = useState('');
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [posting, setPosting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const id = localStorage.getItem('sam_team_id');
    const name = localStorage.getItem('sam_team_name');
    if (!id) { router.replace('/'); return; }
    setTeamId(id);
    setTeamName(name ?? '');

    // Load existing notes
    fetch('/api/sticky-notes')
      .then(r => r.json())
      .then(({ notes: n }) => setNotes(n ?? []));

    // Real-time subscription
    const supabase = getSupabase();
    const channel = supabase
      .channel('takeaway-wall')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sticky_notes' }, payload => {
        setNotes(prev => [...prev, payload.new as StickyNote]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [router]);

  async function postNote(prompt: string) {
    const content = inputs[prompt]?.trim();
    if (!content || !teamId) return;
    setPosting(prev => ({ ...prev, [prompt]: true }));

    try {
      await fetch('/api/sticky-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_id: teamId, team_name: teamName, prompt, content }),
      });
      setSubmitted(prev => ({ ...prev, [prompt]: true }));
      setInputs(prev => ({ ...prev, [prompt]: '' }));
    } finally {
      setPosting(prev => ({ ...prev, [prompt]: false }));
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#070D22', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader />
      <StepIndicator currentStep={5} />

      <main style={{ flex: 1, maxWidth: 1100, margin: '0 auto', width: '100%', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: '#C9A84C', textTransform: 'uppercase', margin: 0 }}>
            Reflection
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
            Takeaway Wall
          </h1>
          {teamName && (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', margin: 0 }}>
              Team: <span style={{ color: '#C9A84C' }}>{teamName}</span>
            </p>
          )}
          <GoldDivider thick />
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: 0, fontStyle: 'italic' }}>
            Add your reflection for each prompt. Your notes appear on the shared wall in real time.
          </p>
        </div>

        {/* Prompt input sections */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {PROMPTS.map((prompt, i) => (
            <div
              key={prompt}
              style={{
                background: '#111D3C',
                border: `1px solid ${submitted[prompt] ? '#5DB840' : '#1C2E5C'}`,
                borderRadius: 4,
                padding: '1.5rem',
                transition: 'border-color 0.3s',
              }}
            >
              <p
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '0.95rem',
                  color: '#C9A84C',
                  marginTop: 0,
                  marginBottom: '1rem',
                  lineHeight: 1.5,
                }}
              >
                {i + 1}. {prompt}
              </p>

              {submitted[prompt] ? (
                <p style={{ color: '#5DB840', fontSize: '0.8rem', margin: 0 }}>
                  ✓ Note posted to the wall
                </p>
              ) : (
                <>
                  <textarea
                    className="bistro-textarea"
                    placeholder="Type your thoughts..."
                    value={inputs[prompt] ?? ''}
                    onChange={e => setInputs(prev => ({ ...prev, [prompt]: e.target.value }))}
                    style={{ minHeight: 80, marginBottom: '0.75rem' }}
                  />
                  <button
                    className="btn-gold"
                    style={{ width: '100%', padding: '0.6rem', fontSize: '0.8rem' }}
                    onClick={() => postNote(prompt)}
                    disabled={posting[prompt] || !inputs[prompt]?.trim()}
                  >
                    {posting[prompt] ? 'Posting...' : 'Post to Wall'}
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Live wall */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <GoldDivider thick />
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: '#C9A84C', textTransform: 'uppercase', margin: 0 }}>
              Shared Live Wall · {notes.length} note{notes.length !== 1 ? 's' : ''}
            </p>
          </div>

          {notes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.2)', fontSize: '0.9rem' }}>
              Notes will appear here as teams post them...
            </div>
          ) : (
            /* Group by prompt */
            PROMPTS.map(prompt => {
              const promptNotes = notes.filter(n => n.prompt === prompt);
              if (!promptNotes.length) return null;
              return (
                <div key={prompt} style={{ marginBottom: '2rem' }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', letterSpacing: '0.08em', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                    {prompt}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {promptNotes.map((note, ni) => (
                      <div
                        key={note.id}
                        style={{
                          background: NOTE_COLORS[ni % NOTE_COLORS.length],
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 3,
                          padding: '0.9rem 1rem',
                          minWidth: 180,
                          maxWidth: 260,
                          flex: '0 0 auto',
                        }}
                      >
                        <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', margin: '0 0 0.4rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                          {note.team_name}
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                          {note.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
