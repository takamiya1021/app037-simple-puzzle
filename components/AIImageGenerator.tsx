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
    setApiKey(loadApiKey('imagen'))
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
    <section className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-100 p-4 shadow-inner">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">AI Image</p>
          <p className="text-lg font-semibold text-slate-800">Imagen 生成</p>
          <p className="text-sm text-slate-500">お気に入りのシーンを文章から作成しよう</p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isPending}
          className="rounded-full bg-orange-500 px-4 py-1 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isPending ? '生成中…' : '画像生成'}
        </button>
      </header>
      <textarea
        className="w-full rounded-2xl border border-orange-200 bg-white/80 p-3 text-sm shadow focus:outline-none focus:ring-2 focus:ring-orange-300"
        rows={3}
        placeholder="例：宇宙を旅する猫と流れ星"
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
      />
      {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
      {imageData && !error && (
        <div className="mt-4 rounded-2xl bg-white/70 p-3 shadow">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageData} alt="AI生成画像" className="w-full rounded-2xl object-cover" />
        </div>
      )}
    </section>
  )
}

export default AIImageGenerator
