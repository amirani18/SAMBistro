/** CSS-only art deco corner brackets. Wrap a relative-positioned element with this. */
export default function CornerOrnaments() {
  const corner = (pos: { top?: number | string; bottom?: number | string; left?: number | string; right?: number | string }, borders: string) => (
    <div
      style={{
        position: 'absolute',
        width: 28,
        height: 28,
        borderColor: '#8B7234',
        borderStyle: 'solid',
        opacity: 0.55,
        ...pos,
        borderWidth: borders,
      }}
    />
  );

  return (
    <>
      {corner({ top: 10, left: 10 }, '2px 0 0 2px')}
      {corner({ top: 10, right: 10 }, '2px 2px 0 0')}
      {corner({ bottom: 10, left: 10 }, '0 0 2px 2px')}
      {corner({ bottom: 10, right: 10 }, '0 2px 2px 0')}
    </>
  );
}
