'use client'

interface GameToastProps {
  message: string
  onClose: () => void
}

const GameToast = ({ message, onClose }: GameToastProps) => {
  return (
    <div className="fixed bottom-6 right-6 flex items-center gap-3 rounded-2xl bg-emerald-500/90 px-4 py-3 text-white shadow-lg">
      <span>{message}</span>
      <button type="button" onClick={onClose} className="rounded-full bg-white/30 px-2 py-0.5 text-xs">
        閉じる
      </button>
    </div>
  )
}

export default GameToast
