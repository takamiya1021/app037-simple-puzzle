'use client'

import { useEffect, useState, useTransition } from 'react'
import { generateImage } from '@/app/actions/image'
import { loadApiKey } from '@/lib/utils/apiKeyStorage'

interface AIImageGeneratorProps {
  onSelect?: (imageData: string) => void
}

const AIImageGenerator = ({ onSelect }: AIImageGeneratorProps) => {
  const [prompt, setPrompt] = useState('')
  const [imageData, setImageData] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setApiKey(loadApiKey('gemini'))
  }, [])

  const handleGenerate = () => {
    if (!prompt.trim()) {
      setError('プロンプトを入力してください')
      return
    }

    startTransition(async () => {
      setError(null)
      const response = await generateImage({ prompt, clientApiKey: apiKey ?? undefined })
      if (!response.success || !response.imageData) {
        setError(response.error ?? '生成できませんでした')
        return
      }
      setImageData(response.imageData)
      onSelect?.(response.imageData)
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1 text-sm text-white/70">プロンプト</p>
        <textarea
          className="w-full rounded-lg bg-white/10 p-3 text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-[var(--accent)]"
          rows={2}
          placeholder="例：宇宙を旅する猫と流れ星"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isPending}
        className="btn-glow w-full rounded-lg py-2.5 font-bold text-white disabled:opacity-50"
      >
        {isPending ? '生成中...' : '画像を生成'}
      </button>
      {error && <p className="text-sm text-rose-400">{error}</p>}
      {imageData && !error && (
        <div className="overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageData} alt="AI生成画像" className="w-full object-cover" />
        </div>
      )}
    </div>
  )
}

export default AIImageGenerator
