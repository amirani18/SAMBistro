'use client'; 
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import StepIndicator from '@/components/StepIndicator';
import GoldDivider from '@/components/GoldDivider';
import CornerOrnaments from '@/components/CornerOrnaments';

export default function HostStand() {
  const router = useRouter();
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!teamName.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_name: teamName.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to register team');

      localStorage.setItem('sam_team_id', json.team.id);
      localStorage.setItem('sam_team_name', json.team.team_name);
      router.push('/table');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#070D22', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader />
      <StepIndicator currentStep={0} />

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1.5rem',
        }}
      >
        {/* Hero title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.7rem',
              letterSpacing: '0.3em',
              color: '#C9A84C',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}
          >
            Today&apos;s Service: High-Priority Request
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(2.5rem, 7vw, 5rem)',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              margin: 0,
              lineHeight: 1,
            }}
          >
            SAM Bistro
          </h1>
          <GoldDivider thick />
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem', fontStyle: 'italic', marginTop: 0 }}>
            A curated tasting of Software Asset Management insights, impact, and software value.
          </p>
        </div>

        {/* Main card */}
        <div
          style={{
            maxWidth: 640,
            width: '100%',
            background: '#111D3C',
            border: '1px solid #8B7234',
            borderRadius: 4,
            padding: '2.5rem',
            position: 'relative',
          }}
        >
          <CornerOrnaments />

          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.4rem',
              color: '#C9A84C',
              marginTop: 0,
              marginBottom: '0.5rem',
              textAlign: 'center',
            }}
          >
            Welcome to SAM Bistro Online
          </h2>
          <GoldDivider />

          <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            Your virtual table has been assigned a <strong style={{ color: '#fff' }}>high-priority service request</strong>.
            Your team must build the best technology stack using today&apos;s menu. Choose the tools you need
            to deliver the request successfully.
          </p>

          {/* How to participate */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid #1C2E5C',
              borderRadius: 3,
              padding: '1rem 1.25rem',
              marginBottom: '2rem',
            }}
          >
            <p
              style={{
                fontSize: '0.65rem',
                letterSpacing: '0.15em',
                color: '#C9A84C',
                textTransform: 'uppercase',
                marginBottom: '0.6rem',
                marginTop: 0,
              }}
            >
              How to Participate
            </p>
            <ol style={{ margin: 0, paddingLeft: '1.25rem', color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem', lineHeight: 2 }}>
              <li>Enter your team name below.</li>
              <li>Read your table&apos;s service request.</li>
              <li>Browse the digital menu of tools.</li>
              <li>Build your order on the Order Pad.</li>
              <li>Submit — then return to the main Teams room.</li>
            </ol>
          </div>

          {/* Team name form */}
          <form onSubmit={handleStart}>
            <label
              htmlFor="teamName"
              style={{
                display: 'block',
                fontSize: '0.7rem',
                letterSpacing: '0.15em',
                color: '#C9A84C',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              Your Team Name
            </label>
            <input
              id="teamName"
              className="bistro-input"
              type="text"
              placeholder="e.g. Team Phoenix"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              maxLength={40}
              required
            />
            {error && (
              <p style={{ color: '#E07B39', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</p>
            )}
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <button
                type="submit"
                className="btn-gold"
                disabled={loading || !teamName.trim()}
                style={{ width: '100%', fontSize: '0.9rem', padding: '0.9rem 2rem' }}
              >
                {loading ? 'Reserving your table...' : 'Start Your Order →'}
              </button>
            </div>
          </form>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', marginTop: '2rem', letterSpacing: '0.05em' }}>
          OneIT VIP Limited Series · SAM Bistro · June 01, 2026
        </p>
      </main>
    </div>
  );
}
