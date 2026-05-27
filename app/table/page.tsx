'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import StepIndicator from '@/components/StepIndicator';
import GoldDivider from '@/components/GoldDivider';
import CornerOrnaments from '@/components/CornerOrnaments';

const SERVICE_REQUIREMENTS = [
  { icon: '⌨', text: 'Develop the application' },
  { icon: '🤝', text: 'Collaborate with your team' },
  { icon: '🎨', text: 'Design visuals and diagrams' },
  { icon: '📋', text: 'Manage the project' },
  { icon: '🔌', text: 'Test APIs and integrations' },
  { icon: '📁', text: 'Store and share documents' },
];

export default function TableAssignment() {
  const router = useRouter();

  useEffect(() => {
    const id = localStorage.getItem('sam_team_id');
    if (!id) router.replace('/');
  }, [router]);

  const teamName =
    typeof window !== 'undefined' ? localStorage.getItem('sam_team_name') ?? '' : '';

  return (
    <div style={{ minHeight: '100vh', background: '#070D22', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader />
      <StepIndicator currentStep={1} />

      <main style={{ flex: 1, maxWidth: 860, margin: '0 auto', width: '100%', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: '#C9A84C', textTransform: 'uppercase', margin: 0 }}>
            Table Assignment
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
            Your Service Request
          </h1>
          {teamName && (
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', margin: 0 }}>
              Serving: <span style={{ color: '#C9A84C' }}>{teamName}</span>
            </p>
          )}
          <GoldDivider thick />
        </div>

        {/* Identity Card */}
        <div
          style={{
            background: '#111D3C',
            border: '1px solid #8B7234',
            borderRadius: 4,
            padding: '2.5rem',
            position: 'relative',
            marginBottom: '1.5rem',
          }}
        >
          <CornerOrnaments />

          <div
            style={{
              display: 'inline-block',
              background: 'rgba(201,168,76,0.12)',
              border: '1px solid #8B7234',
              borderRadius: 2,
              padding: '0.25rem 0.75rem',
              fontSize: '0.65rem',
              letterSpacing: '0.2em',
              color: '#C9A84C',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}
          >
            Your Table Identity
          </div>

          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.5rem',
              color: '#fff',
              marginTop: 0,
              marginBottom: '0.75rem',
            }}
          >
            You are a Business Unit delivering a solution independently.
          </h2>

          <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, fontSize: '0.95rem', marginBottom: '1.25rem' }}>
            Your organization needs to design and deliver a new internal application — fast. Leadership has
            flagged this as <strong style={{ color: '#fff' }}>high-priority</strong>. Your team is responsible
            for selecting the right technology stack to build and ship this solution using the tools available
            on today&apos;s menu.
          </p>

          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', margin: 0, fontStyle: 'italic' }}>
            You make decisions based on what your team knows, what you believe will work best, and how quickly
            you can deliver. <strong style={{ color: '#C9A84C' }}>Delivery expectations are high — and the timeline is tight.</strong>
          </p>
        </div>

        {/* Two-column: Your Order + Dining Rules */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Your Order */}
          <div className="bistro-card" style={{ padding: '1.5rem' }}>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: '#C9A84C', textTransform: 'uppercase', marginTop: 0, marginBottom: '0.75rem' }}>
              Your Order
            </p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>
              Work together to select the tools you need from the menu. Build your ideal technology stack
              to deliver the request. You may select <strong style={{ color: '#fff' }}>up to 3 tools per category</strong> — choose wisely, every selection counts.
            </p>
          </div>

          {/* Dining Rules */}
          <div className="bistro-card" style={{ padding: '1.5rem' }}>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: '#C9A84C', textTransform: 'uppercase', marginTop: 0, marginBottom: '0.75rem' }}>
              Dining Rules
            </p>
            <ul style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', lineHeight: 1.9, paddingLeft: '1.1rem', margin: 0 }}>
              <li>Order across multiple categories.</li>
              <li>Up to 3 tools per category, across all requirements.</li>
              <li>Prioritize what your team truly needs to deliver.</li>
              <li>Finalize your order on the Order Pad before submitting.</li>
            </ul>
          </div>
        </div>

        {/* Service Requirements */}
        <div className="bistro-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: '#C9A84C', textTransform: 'uppercase', marginTop: 0, marginBottom: '1rem' }}>
            Service Requirements — To successfully deliver, your team must:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {SERVICE_REQUIREMENTS.map(req => (
              <div
                key={req.text}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid #1C2E5C',
                  borderRadius: 3,
                  padding: '0.6rem 0.9rem',
                  fontSize: '0.875rem',
                  color: 'rgba(255,255,255,0.75)',
                }}
              >
                <span style={{ fontSize: '1rem' }}>{req.icon}</span>
                {req.text}
              </div>
            ))}
          </div>
        </div>

        {/* Final note */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <GoldDivider />
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', fontStyle: 'italic', margin: '0 0 1.5rem' }}>
            Every table is solving the same request — but decisions are made independently.
            Your order will determine how your service is delivered.
          </p>
          <button
            className="btn-gold"
            onClick={() => router.push('/menu')}
            style={{ fontSize: '0.9rem' }}
          >
            View the Menu →
          </button>
        </div>
      </main>
    </div>
  );
}
