'use client'

import { motion } from 'framer-motion'

interface GameToastProps {
  message: string
  onClose: () => void
}

const GameToast = ({ message, onClose }: GameToastProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
    >
      <div className="glass flex items-center gap-4 rounded-full px-6 py-3 shadow-[0_0_30px_var(--accent-glow)]">
        <span className="text-lg font-bold text-white">{message}</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-white/20 px-3 py-1 text-sm text-white/80 hover:bg-white/30"
        >
          OK
        </button>
      </div>
    </motion.div>
  )
}

export default GameToast
