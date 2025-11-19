'use client'

interface MoveCounterProps {
  moves: number
}

const MoveCounter = ({ moves }: MoveCounterProps) => {
  return (
    <div className="flex flex-col rounded-xl bg-white/80 p-3 text-center shadow">
      <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Moves</span>
      <span className="text-2xl font-bold text-slate-800">{moves} 手</span>
    </div>
  )
}

export default MoveCounter
