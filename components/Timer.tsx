'use client'

interface TimerProps {
  seconds: number
  label?: string
}

const Timer = ({ seconds, label }: TimerProps) => {
  const minutesPart = Math.floor(seconds / 60)
  const secondsPart = seconds % 60
  const formatted = `${minutesPart.toString().padStart(2, '0')}:${secondsPart.toString().padStart(2, '0')}`

  return (
    <div className="flex flex-col rounded-xl bg-white/80 p-3 text-center shadow">
      {label && <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</span>}
      <span className="text-2xl font-bold text-slate-800">{formatted}</span>
    </div>
  )
}

export default Timer
