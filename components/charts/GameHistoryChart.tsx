"use client"

import dynamic from 'next/dynamic'
import type { HistoryTrendPoint } from '@/lib/history/analytics'

const ResponsiveContainer = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), { ssr: false })
const LineChart = dynamic(() => import('recharts').then((mod) => mod.LineChart), { ssr: false })
const Line = dynamic(() => import('recharts').then((mod) => mod.Line), { ssr: false })
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), { ssr: false })

type MetricKey = 'durationSeconds' | 'moveCount' | 'efficiency'

interface Props {
  points: HistoryTrendPoint[]
  metric: MetricKey
  label: string
  unit?: string
  color?: string
  className?: string
}

export const GameHistoryChart = ({ points, metric, label, unit, color = '#f97316', className }: Props) => {
  if (points.length === 0) {
    return null
  }

  const data = points.map((point) => ({
    time: point.label,
    value: metric === 'efficiency' ? point.efficiency : Math.round(point[metric]),
  }))

  return (
    <div className={className}>
      <h4 className="text-sm font-semibold text-slate-700">{label}</h4>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="time" stroke="#94a3b8" />
          <YAxis unit={unit} stroke="#94a3b8" allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
