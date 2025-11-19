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
  const [activeTab, setActiveTab] = useState<ImageSourceType>('upload')
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
    <section className="rounded-3xl bg-white/80 p-4 shadow-inner">
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'rounded-full border px-4 py-1 text-sm',
              activeTab === tab.id ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'upload' && (
        <div className="mt-4">
          <input
            aria-label="image-upload-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-sm"
          />
          {error && <p className="text-sm text-rose-500">{error}</p>}
        </div>
      )}

      {activeTab === 'preset' && (
        <div className="mt-4 space-y-3">
          {presetCategories.map((category) => (
            <div key={category.id}>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{category.label}</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {presetImages
                  .filter((image) => image.category === category.id)
                  .map((image) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => onSelect(image.src, 'preset')}
                      className="overflow-hidden rounded-2xl border border-slate-200"
                    >
                      <img src={image.src} alt={image.name} className="h-24 w-full object-cover" />
                      <p className="p-1 text-xs text-slate-600">{image.name}</p>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="mt-4">
          <AIImageGenerator onSelect={(image) => onSelect(image, 'ai')} />
        </div>
      )}

      {selectedImage && (
        <div className="mt-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Preview</p>
          <img src={selectedImage} alt="選択中の画像" className="mt-2 w-full rounded-2xl object-cover" />
        </div>
      )}
    </section>
  )
}

export default ImageSelector
