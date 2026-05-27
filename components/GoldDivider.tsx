export default function GoldDivider({ thick = false }: { thick?: boolean }) {
  return (
    <div
      style={{
        height: thick ? 2 : 1,
        background: thick
          ? 'linear-gradient(90deg, transparent, #C9A84C, #E8CC80, #C9A84C, transparent)'
          : 'linear-gradient(90deg, transparent, #C9A84C, transparent)',
        margin: '1.25rem 0',
      }}
    />
  );
}
