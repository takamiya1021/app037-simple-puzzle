'use client'

/* eslint-disable @next/next/no-img-element */

import { useState } from 'react'
import clsx from 'clsx'
import AIImageGenerator from './AIImageGenerator'
import { presetImages, presetCategories } from '@/lib/image/presets'
import { processUploadedFile } from '@/lib/image/uploader'
import type { ImageSourceType } from '@/lib/image/types'

interface ImageSelectorProps {
  selectedImage: string | null
  onSelect: (image: string, source: ImageSourceType) => void
}

const tabs: { id: ImageSourceType; label: string }[] = [
  { id: 'upload', label: 'アップロード' },
  { id: 'preset', label: 'プリセット' },
  { id: 'ai', label: 'AI生成' },
]

const ImageSelector = ({ selectedImage, onSelect }: ImageSelectorProps) => {
  const [activeTab, setActiveTab] = useState<ImageSourceType>('preset')
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      setError(null)
      const result = await processUploadedFile(file, { targetSize: 600 })
      onSelect(result.squareDataUrl, 'upload')
    } catch (err) {
      setError('画像を読み込めませんでした')
      console.error(err)
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={clsx('chip', activeTab === tab.id ? 'chip-active' : 'chip-inactive')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'upload' && (
        <div className="space-y-3">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-white/5 p-6 transition-colors hover:border-[var(--accent)] hover:bg-white/10">
            <svg className="mb-2 h-8 w-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-white/70">クリックして画像を選択</span>
            <input
              aria-label="image-upload-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {error && <p className="text-sm text-rose-400">{error}</p>}
        </div>
      )}

      {activeTab === 'preset' && (
        <div className="space-y-4">
          {presetCategories.map((category) => (
            <div key={category.id}>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/50">{category.label}</p>
              <div className="grid grid-cols-3 gap-2">
                {presetImages
                  .filter((image) => image.category === category.id)
                  .map((image) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => onSelect(image.src, 'preset')}
                      className="group overflow-hidden rounded-lg border border-white/10 transition-all hover:border-[var(--accent)] hover:shadow-[0_0_10px_var(--accent-glow)]"
                    >
                      <img src={image.src} alt={image.name} className="aspect-square w-full object-cover" />
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'ai' && (
        <AIImageGenerator onSelect={(image) => onSelect(image, 'ai')} />
      )}

      {selectedImage && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/50">プレビュー</p>
          <img src={selectedImage} alt="選択中の画像" className="w-full rounded-lg object-cover" />
        </div>
      )}
    </section>
  )
}

export default ImageSelector
