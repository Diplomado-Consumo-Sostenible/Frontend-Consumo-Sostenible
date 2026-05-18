// Chart dimensions (SVG viewBox units)
const W = 640;
const H = 180;
const PAD_X = 4;
const PAD_TOP = 8;
const PAD_BOT = 8;

/**
 * Single-series SVG line chart with HTML labels (no distortion).
 * @param {number[]} series - Cumulative count values
 * @param {string}   color  - Hex color for line + gradient
 */
export default function UserLineChart({ series, color = '#1F3D2B' }) {
  if (!series || series.length < 2) return null;

  const gradId = `lcg-${color.replace('#', '')}`;

  const lastVal = series[series.length - 1];
  const firstVal = series[0];
  const rawMax = Math.max(...series, 1);
  // Add 10% headroom so the line isn't glued to the top
  const max = rawMax * 1.12;

  const xAt = i => PAD_X + (i / (series.length - 1)) * (W - PAD_X * 2);
  const yAt = v => PAD_TOP + (1 - v / max) * (H - PAD_TOP - PAD_BOT);

  const pathD =
    'M ' + series.map((v, i) => `${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(' L ');
  const areaD =
    pathD +
    ` L ${xAt(series.length - 1).toFixed(1)},${H} L ${xAt(0).toFixed(1)},${H} Z`;

  // 5 Y-axis ticks evenly spaced from 0 → rawMax
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(p => Math.round(rawMax * p));

  // Position of the last point as % of the rendered SVG element height
  const endYPct = (yAt(lastVal) / H) * 100;

  // Delta vs first value
  const delta = lastVal - firstVal;
  const deltaLabel = delta >= 0 ? `+${delta}` : `${delta}`;

  return (
    <div className="flex gap-2">
      {/* ── Y-axis labels (HTML, no distortion) ─────────────────── */}
      <div className="flex flex-col justify-between text-right w-10 shrink-0 py-1" style={{ height: 180 }}>
        {[...ticks].reverse().map((t, i) => (
          <span key={i} className="text-[11px] font-medium leading-none" style={{ color: 'var(--color-muted)' }}>
            {t.toLocaleString('es-CO')}
          </span>
        ))}
      </div>

      {/* ── SVG chart + callout ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-1">
        <div className="relative">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            style={{ width: '100%', height: 180, display: 'block' }}
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.22" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid lines only — no text inside SVG */}
            {ticks.map((t, i) => (
              <line
                key={i}
                x1={0} x2={W}
                y1={yAt(t)} y2={yAt(t)}
                stroke="rgba(31,61,43,0.08)"
                strokeDasharray="4 4"
              />
            ))}

            {/* Area fill */}
            <path d={areaD} fill={`url(#${gradId})`} />

            {/* Line */}
            <path
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* End dot */}
            <circle
              cx={xAt(series.length - 1)}
              cy={yAt(lastVal)}
              r="5"
              fill={color}
              stroke="#FFF"
              strokeWidth="2.5"
            />
          </svg>

          {/* ── Current value callout (HTML, perfectly positioned) ── */}
          <div
            className="absolute right-0 flex items-center gap-1.5 pointer-events-none"
            style={{ top: `${endYPct}%`, transform: 'translateY(-50%) translateX(0)' }}
          >
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full text-white shadow-sm"
              style={{ background: color }}
            >
              {lastVal.toLocaleString('es-CO')}
            </span>
            {delta !== 0 && (
              <span
                className="text-[10px] font-semibold"
                style={{ color: delta >= 0 ? 'var(--color-ok-text)' : 'var(--color-terracotta)' }}
              >
                {deltaLabel}
              </span>
            )}
          </div>
        </div>

        {/* ── X-axis labels ─────────────────────────────────────── */}
        <div className="flex justify-between px-0.5">
          <span className="text-[11px] font-medium" style={{ color: 'var(--color-muted)' }}>
            inicio
          </span>
          <span className="text-[11px] font-medium" style={{ color: 'var(--color-muted)' }}>
            hoy
          </span>
        </div>
      </div>
    </div>
  );
}
