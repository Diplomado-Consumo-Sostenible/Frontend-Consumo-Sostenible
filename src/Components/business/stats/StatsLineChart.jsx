import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function StatsLineChart({ data = [], xKey = 'label', yKey, color = '#2E6B47', height = 200 }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center text-sm text-muted" style={{ height }}>
        Sin datos disponibles
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#C8DED1" vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 12, fill: '#5B8A6F' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#5B8A6F' }}
          axisLine={false}
          tickLine={false}
          width={45}
          domain={[0, dataMax => Math.max(dataMax, 1)]}
          allowDataOverflow={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: '1px solid #C8DED1',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            fontSize: 13,
          }}
          labelStyle={{ color: '#1A3D2B', fontWeight: 600 }}
          itemStyle={{ color: '#2E6B47' }}
        />
        <Line
          type="monotone"
          dataKey={yKey}
          stroke={color}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, fill: color, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
