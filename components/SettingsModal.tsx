'use client'

import { useState } from 'react'
import { saveApiKey, deleteApiKey, loadApiKey } from '@/lib/utils/apiKeyStorage'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

const SettingsModal = ({ open, onClose }: SettingsModalProps) => {
  const [geminiKey, setGeminiKey] = useState(() => loadApiKey('gemini') ?? '')
  const [imagenKey, setImagenKey] = useState(() => loadApiKey('imagen') ?? '')
  const [message, setMessage] = useState<string | null>(null)

  if (!open) return null

  const handleSave = () => {
    if (geminiKey.trim()) saveApiKey('gemini', geminiKey.trim())
    if (imagenKey.trim()) saveApiKey('imagen', imagenKey.trim())
    setMessage('APIキーを保存しました')
  }

  const handleClear = (provider: 'gemini' | 'imagen') => {
    deleteApiKey(provider)
    if (provider === 'gemini') setGeminiKey('')
    if (provider === 'imagen') setImagenKey('')
    setMessage('APIキーを削除しました')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Settings</p>
            <h2 className="text-lg font-semibold text-slate-800">APIキー管理</h2>
          </div>
          <button type="button" className="text-slate-500" onClick={onClose}>
            ×
          </button>
        </header>
        <div className="space-y-4">
          <fieldset className="rounded-2xl border border-slate-200 p-4">
            <legend className="text-sm font-semibold text-slate-700">Gemini (ヒント・分析)</legend>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 p-2 text-sm"
              placeholder="Gemini API Key"
              value={geminiKey}
              onChange={(event) => setGeminiKey(event.target.value)}
            />
            <div className="mt-2 flex gap-2 text-sm">
              <button
                type="button"
                className="rounded-full bg-indigo-600 px-3 py-1 text-white"
                onClick={() => handleClear('gemini')}
              >
                削除
              </button>
            </div>
          </fieldset>
          <fieldset className="rounded-2xl border border-slate-200 p-4">
            <legend className="text-sm font-semibold text-slate-700">Imagen (AI画像生成)</legend>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 p-2 text-sm"
              placeholder="Imagen API Key"
              value={imagenKey}
              onChange={(event) => setImagenKey(event.target.value)}
            />
            <div className="mt-2 flex gap-2 text-sm">
              <button
                type="button"
                className="rounded-full bg-orange-500 px-3 py-1 text-white"
                onClick={() => handleClear('imagen')}
              >
                削除
              </button>
            </div>
          </fieldset>
          {message && <p className="text-sm text-emerald-600">{message}</p>}
          <button
            type="button"
            className="w-full rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
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
