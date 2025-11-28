'use client'

import { useState } from 'react'
import { saveApiKey, deleteApiKey, loadApiKey } from '@/lib/utils/apiKeyStorage'
import { useSettingsStore } from '@/lib/store/settingsStore'
import type { PuzzleSize } from '@/lib/puzzle/types'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

const SettingsModal = ({ open, onClose }: SettingsModalProps) => {
  const { timeLimits, setTimeLimit } = useSettingsStore()
  const [apiKey, setApiKey] = useState(() => loadApiKey('gemini') ?? '')
  const [message, setMessage] = useState<string | null>(null)

  if (!open) return null

  const handleSave = () => {
    if (apiKey.trim()) saveApiKey('gemini', apiKey.trim())
    setMessage('設定を保存しました')
    setTimeout(() => setMessage(null), 2000)
  }

  const handleClear = () => {
    deleteApiKey('gemini')
    setApiKey('')
    setMessage('APIキーを削除しました')
    setTimeout(() => setMessage(null), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="glass w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/50">Settings</p>
            <h2 className="text-lg font-bold text-white">設定</h2>
          </div>
          <button type="button" className="text-2xl text-white/50 hover:text-white" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="space-y-6">
          {/* API Keys */}
          <div className="rounded-xl bg-white/5 p-4">
            <label className="block text-sm font-medium text-white/70">Gemini API Key</label>
            <p className="mb-2 text-xs text-white/40">AI生成・ヒント・分析に共通で使用します</p>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="API Key を入力"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <button
                type="button"
                className="rounded-lg bg-rose-500/20 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/30"
                onClick={handleClear}
              >
                削除
              </button>
            </div>
          </div>

          {/* Time Attack Settings */}
          <div className="rounded-xl bg-white/5 p-4">
            <label className="mb-3 block text-sm font-medium text-white/70">タイムアタック制限時間 (秒)</label>
            <div className="grid gap-3">
              {[4, 5, 6].map((size) => (
                <div key={size} className="flex items-center justify-between">
                  <span className="text-sm text-white/60">{size}×{size}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="60"
                      max="1200"
                      step="30"
                      value={timeLimits[size as PuzzleSize]}
                      onChange={(e) => setTimeLimit(size as PuzzleSize, parseInt(e.target.value, 10))}
                      className="w-32 accent-[var(--accent)]"
                    />
                    <span className="w-16 text-right text-sm font-mono text-[var(--accent)]">
                      {Math.floor(timeLimits[size as PuzzleSize] / 60)}分
                      {(timeLimits[size as PuzzleSize] % 60).toString().padStart(2, '0')}秒
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {message && (
            <p className="text-center text-sm text-emerald-400">{message}</p>
          )}

          <button
            type="button"
            className="btn-glow w-full rounded-lg py-2.5 font-bold text-white"
            onClick={handleSave}
          >
            保存する
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
