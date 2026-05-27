'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import StepIndicator from '@/components/StepIndicator';
import GoldDivider from '@/components/GoldDivider';
import { TOOL_CATEGORIES, CATEGORY_ICONS } from '@/lib/tools';

export default function DigitalMenu() {
  const router = useRouter();

  useEffect(() => {
    const id = localStorage.getItem('sam_team_id');
    if (!id) router.replace('/');
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', background: '#070D22', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader />
      <StepIndicator currentStep={2} />

      <main style={{ flex: 1, maxWidth: 1000, margin: '0 auto', width: '100%', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.25em', color: '#C9A84C', textTransform: 'uppercase', margin: 0 }}>
            OneIT SAM Bistro
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              color: '#fff',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginTop: '0.5rem',
              marginBottom: 0,
            }}
          >
            Menu
          </h1>
          <GoldDivider thick />
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>
            Browse today&apos;s available tools. Use this as your reference when placing your order.
          </p>
        </div>

        {/* Menu grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          {Object.entries(TOOL_CATEGORIES).map(([category, tools]) => (
            <div
              key={category}
              style={{
                background: '#111D3C',
                border: '1px solid #1C2E5C',
                borderRadius: 4,
                padding: '1.5rem',
              }}
            >
              {/* Category header */}
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <div
                  style={{
                    display: 'inline-block',
                    border: '1px solid #8B7234',
                    padding: '0.5rem 1.25rem',
                    marginBottom: '0.25rem',
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#fff',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      margin: 0,
                    }}
                  >
                    {CATEGORY_ICONS[category]} {category}
                  </p>
                </div>
              </div>

              <div
                style={{
                  height: 1,
                  background: 'linear-gradient(90deg, transparent, #8B7234, transparent)',
                  marginBottom: '1rem',
                }}
              />

              {/* Tools list */}
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', textAlign: 'center' }}>
                {tools.map((tool, i) => (
                  <li
                    key={tool}
                    style={{
                      color: 'rgba(255,255,255,0.75)',
                      fontSize: '0.875rem',
                      padding: '0.3rem 0',
                      borderBottom: i < tools.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    }}
                  >
                    {tool}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Other / Note */}
        <div
          style={{
            background: 'rgba(201,168,76,0.05)',
            border: '1px solid #8B7234',
            borderRadius: 3,
            padding: '1rem 1.5rem',
            textAlign: 'center',
            marginBottom: '2rem',
          }}
        >
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', fontStyle: 'italic', margin: 0 }}>
            Copy a menu item to your Order Pad. You may choose as many tools as you think you need.
            Digital Sherpa may be used during the Project Management section.
          </p>
        </div>

        <GoldDivider />

        <div style={{ textAlign: 'center' }}>
          <button className="btn-gold" onClick={() => router.push('/order')}>
            Go to Your Order Pad →
          </button>
        </div>
      </main>
    </div>
  );
}
