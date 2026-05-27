'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import StepIndicator from '@/components/StepIndicator';
import GoldDivider from '@/components/GoldDivider';
import { ALL_TOOLS, SERVICE_REQUIREMENTS, TOOL_CATEGORIES } from '@/lib/tools';

interface RowData {
  selected_tools: string[];
  reason: string;
}

type OrderState = Record<string, RowData>;

const INITIAL_ROW: RowData = { selected_tools: [], reason: '' };

export default function OrderPad() {
  const router = useRouter();
  const [teamId, setTeamId] = useState('');
  const [teamName, setTeamName] = useState('');
  const [order, setOrder] = useState<OrderState>(() =>
    Object.fromEntries(SERVICE_REQUIREMENTS.map(r => [r, { ...INITIAL_ROW }]))
  );
  const [summary, setSummary] = useState({ must_have_tools: '', nice_to_have_tools: '', removable_tool: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('sam_team_id');
    const name = localStorage.getItem('sam_team_name');
    if (!id) { router.replace('/'); return; }
    setTeamId(id);
    setTeamName(name ?? '');

    // Load existing selections
    fetch(`/api/selections?team_id=${id}`)
      .then(r => r.json())
      .then(({ selections }) => {
        if (selections?.length) {
          const loaded: OrderState = Object.fromEntries(
            SERVICE_REQUIREMENTS.map(r => [r, { ...INITIAL_ROW }])
          );
          selections.forEach((s: { service_requirement: string; selected_tools: string[]; reason: string }) => {
            if (loaded[s.service_requirement]) {
              loaded[s.service_requirement] = {
                selected_tools: s.selected_tools ?? [],
                reason: s.reason ?? '',
              };
            }
          });
          setOrder(loaded);
        }
      });

    fetch(`/api/summary?team_id=${id}`)
      .then(r => r.json())
      .then(({ summary: s }) => {
        if (s) setSummary({ must_have_tools: s.must_have_tools, nice_to_have_tools: s.nice_to_have_tools, removable_tool: s.removable_tool });
      });
  }, [router]);

  const toggleTool = (req: string, tool: string) => {
    setOrder(prev => {
      const current = prev[req].selected_tools;
      const updated = current.includes(tool)
        ? current.filter(t => t !== tool)
        : [...current, tool];
      return { ...prev, [req]: { ...prev[req], selected_tools: updated } };
    });
    setSaved(false);
  };

  const setReason = (req: string, reason: string) => {
    setOrder(prev => ({ ...prev, [req]: { ...prev[req], reason } }));
    setSaved(false);
  };

  const handleSubmit = useCallback(async () => {
    if (!teamId) return;
    setSaving(true);

    try {
      // Save each row
      await Promise.all(
        SERVICE_REQUIREMENTS.map(req =>
          fetch('/api/selections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              team_id: teamId,
              service_requirement: req,
              selected_tools: order[req].selected_tools,
              reason: order[req].reason,
            }),
          })
        )
      );

      // Save summary
      await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_id: teamId, ...summary }),
      });

      setSaved(true);
      router.push('/reveal');
    } catch {
      alert('Something went wrong saving your order. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [teamId, order, summary, router]);

  const totalTools = [...new Set(Object.values(order).flatMap(r => r.selected_tools))].length;

  return (
    <div style={{ minHeight: '100vh', background: '#070D22', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader />
      <StepIndicator currentStep={3} />

      <main style={{ flex: 1, maxWidth: 1000, margin: '0 auto', width: '100%', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: '#C9A84C', textTransform: 'uppercase', margin: 0 }}>
            Virtual Order Pad
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
            Place Your Order
          </h1>
          {teamName && (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', margin: 0 }}>
              Team: <span style={{ color: '#C9A84C' }}>{teamName}</span>
              {totalTools > 0 && <span style={{ marginLeft: '1rem', color: '#5DB840' }}>{totalTools} unique tool{totalTools !== 1 ? 's' : ''} selected</span>}
            </p>
          )}
          <GoldDivider thick />
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', margin: 0, fontStyle: 'italic' }}>
            For each service requirement, select the tool(s) your team would use and explain why.
          </p>
        </div>

        {/* Navigation helper */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <button className="btn-outline" style={{ fontSize: '0.75rem', padding: '0.4rem 1rem' }} onClick={() => router.push('/menu')}>
            ← Back to Menu
          </button>
        </div>

        {/* Order table */}
        <div
          style={{
            background: '#111D3C',
            border: '1px solid #1C2E5C',
            borderRadius: 4,
            overflow: 'hidden',
            marginBottom: '1.5rem',
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 1.8fr 1.6fr',
              background: 'rgba(201,168,76,0.08)',
              borderBottom: '1px solid #8B7234',
              padding: '0.75rem 1.25rem',
            }}
          >
            {['Service Requirement', 'Selected Tool(s)', 'Why did you choose it?'].map(h => (
              <div
                key={h}
                style={{
                  fontSize: '0.65rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#C9A84C',
                }}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          {SERVICE_REQUIREMENTS.map((req, i) => (
            <div
              key={req}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 1.8fr 1.6fr',
                borderBottom: i < SERVICE_REQUIREMENTS.length - 1 ? '1px solid #1C2E5C' : 'none',
                padding: '0.9rem 1.25rem',
                gap: '1rem',
                alignItems: 'start',
              }}
            >
              {/* Service Requirement */}
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', paddingTop: '0.4rem' }}>
                {req}
              </div>

              {/* Tool multi-select */}
              <div style={{ position: 'relative' }}>
                {/* Selected badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: order[req].selected_tools.length ? '0.5rem' : 0 }}>
                  {order[req].selected_tools.map(t => (
                    <span
                      key={t}
                      className="tool-badge"
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleTool(req, t)}
                      title="Click to remove"
                    >
                      {t} ×
                    </span>
                  ))}
                </div>

                {/* Dropdown trigger */}
                <button
                  onClick={() => setOpenDropdown(openDropdown === req ? null : req)}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid #1C2E5C',
                    borderRadius: 3,
                    color: 'rgba(255,255,255,0.45)',
                    fontSize: '0.78rem',
                    padding: '0.4rem 0.75rem',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                  }}
                >
                  + Add tool...
                </button>

                {/* Dropdown panel */}
                {openDropdown === req && (
                  <div
                    style={{
                      position: 'absolute',
                      zIndex: 100,
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: '#0D1830',
                      border: '1px solid #8B7234',
                      borderRadius: 3,
                      maxHeight: 280,
                      overflowY: 'auto',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    }}
                  >
                    {Object.entries(TOOL_CATEGORIES).map(([cat, tools]) => (
                      <div key={cat}>
                        <div
                          style={{
                            padding: '0.4rem 0.75rem',
                            fontSize: '0.6rem',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: '#C9A84C',
                            background: 'rgba(201,168,76,0.06)',
                            borderBottom: '1px solid #1C2E5C',
                          }}
                        >
                          {cat}
                        </div>
                        {tools.map(tool => (
                          <label
                            key={tool}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.45rem 0.75rem',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              color: order[req].selected_tools.includes(tool) ? '#E8CC80' : 'rgba(255,255,255,0.7)',
                              background: order[req].selected_tools.includes(tool) ? 'rgba(201,168,76,0.08)' : 'transparent',
                              borderBottom: '1px solid rgba(255,255,255,0.03)',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={order[req].selected_tools.includes(tool)}
                              onChange={() => toggleTool(req, tool)}
                            />
                            {tool}
                          </label>
                        ))}
                      </div>
                    ))}
                    <div style={{ padding: '0.5rem', borderTop: '1px solid #1C2E5C' }}>
                      <button
                        onClick={() => setOpenDropdown(null)}
                        className="btn-gold"
                        style={{ width: '100%', padding: '0.4rem', fontSize: '0.75rem' }}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Reason */}
              <textarea
                className="bistro-textarea"
                placeholder="Why this tool?"
                value={order[req].reason}
                onChange={e => setReason(req, e.target.value)}
                style={{ minHeight: 60, fontSize: '0.82rem' }}
              />
            </div>
          ))}
        </div>

        {/* Final Order Summary */}
        <div
          style={{
            background: '#111D3C',
            border: '1px solid #8B7234',
            borderRadius: 4,
            padding: '1.75rem',
            marginBottom: '2rem',
            position: 'relative',
          }}
        >
          <p
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.1rem',
              color: '#C9A84C',
              marginTop: 0,
              marginBottom: '1rem',
              textAlign: 'center',
              letterSpacing: '0.08em',
            }}
          >
            Final Order
          </p>
          <GoldDivider />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            {[
              { key: 'must_have_tools', label: 'Must-have tools', placeholder: 'List your essentials...' },
              { key: 'nice_to_have_tools', label: 'Nice-to-have tools', placeholder: 'Good to have, not critical...' },
              { key: 'removable_tool', label: 'Tool we could remove', placeholder: 'Which tool is optional?' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ fontSize: '0.65rem', letterSpacing: '0.12em', color: '#C9A84C', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                  {field.label}
                </label>
                <textarea
                  className="bistro-textarea"
                  placeholder={field.placeholder}
                  value={summary[field.key as keyof typeof summary]}
                  onChange={e => setSummary(prev => ({ ...prev, [field.key]: e.target.value }))}
                  style={{ minHeight: 80, fontSize: '0.82rem' }}
                />
              </div>
            ))}
          </div>
        </div>

        <GoldDivider />

        {/* Submit */}
        <div style={{ textAlign: 'center', paddingBottom: '2rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
            Once you submit, you&apos;ll receive instructions to return to the main Teams room.
          </p>
          <button
            className="btn-gold"
            onClick={handleSubmit}
            disabled={saving || saved}
            style={{ fontSize: '0.95rem', padding: '1rem 3rem' }}
          >
            {saving ? 'Submitting order...' : saved ? '✓ Order Submitted' : 'Submit Final Order'}
          </button>
        </div>
      </main>
    </div>
  );
}
