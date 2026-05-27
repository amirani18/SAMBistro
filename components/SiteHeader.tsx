'use client';
import Image from 'next/image';

export default function SiteHeader() {
  return (
    <header
      style={{
        borderBottom: '1px solid #1C2E5C',
        background: 'rgba(7,13,34,0.95)',
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: OneIT logo */}
        <Image
          src="/logos/oneit-white.png"
          alt="OneIT"
          width={80}
          height={32}
          style={{ objectFit: 'contain' }}
        />

        {/* Center: title */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '0.95rem',
              letterSpacing: '0.2em',
              color: '#C9A84C',
              textTransform: 'uppercase',
            }}
          >
            SAM Bistro
          </div>
          <div
            style={{
              fontSize: '0.65rem',
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Limited Series
          </div>
        </div>

        {/* Right: IDEA logo */}
        <Image
          src="/logos/idea-blue-green.png"
          alt="IDEA"
          width={80}
          height={32}
          style={{ objectFit: 'contain' }}
        />
      </div>
    </header>
  );
}
