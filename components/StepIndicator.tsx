'use client';

const STEPS = [
  { label: 'Host Stand', path: '/' },
  { label: 'Table Assignment', path: '/table' },
  { label: 'Digital Menu', path: '/menu' },
  { label: 'Order Pad', path: '/order' },
  { label: 'Final Bill', path: '/reveal' },
  { label: 'Takeaway Wall', path: '/takeaway' },
];

interface StepIndicatorProps {
  currentStep: number; // 0-indexed
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem 1.5rem',
        flexWrap: 'wrap' as const,
        gap: '0.5rem',
      }}
    >
      {STEPS.map((step, i) => {
        const isDone = i < currentStep;
        const isActive = i === currentStep;
        return (
          <div
            key={step.label}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: isDone ? '#5DB840' : isActive ? '#C9A84C' : '#1C2E5C',
                  boxShadow: isActive ? '0 0 6px rgba(201,168,76,0.5)' : 'none',
                  transition: 'background 0.3s',
                }}
              />
              <span
                style={{
                  fontSize: '0.6rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: isDone ? '#5DB840' : isActive ? '#C9A84C' : 'rgba(255,255,255,0.25)',
                  whiteSpace: 'nowrap',
                }}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                style={{
                  width: 32,
                  height: 1,
                  background: isDone ? '#5DB840' : '#1C2E5C',
                  marginBottom: '1rem',
                  transition: 'background 0.3s',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
