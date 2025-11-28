'use client'

import { useSettingsStore } from '@/lib/store/settingsStore'

const hintOptions = [1, 2, 3, 4, 5] as const

const toggleClasses = (enabled: boolean) =>
  enabled
    ? 'flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-inner'
    : 'flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3'

export default function AISettingsPanel() {
  const {
    aiAssistEnabled,
    autoAnalysisEnabled,
    hintLimit,
    setAiAssistEnabled,
    setAutoAnalysisEnabled,
    setHintLimit,
  } = useSettingsStore()

  return (
    <div className="space-y-4">
      <div className={toggleClasses(aiAssistEnabled)}>
        <div>
          <p className="text-sm font-semibold text-slate-800">ヒントを有効にする</p>
          <p className="text-xs text-slate-500">ヒントボタンの表示とリクエストを許可します</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={aiAssistEnabled}
          aria-label="ヒントを有効にする"
          onClick={() => setAiAssistEnabled(!aiAssistEnabled)}
          className={`relative h-8 w-14 rounded-full transition ${aiAssistEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
        >
          <span
            className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${aiAssistEnabled ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
      </div>

      <div className={toggleClasses(autoAnalysisEnabled)}>
        <div>
          <p className="text-sm font-semibold text-slate-800">AI分析を自動表示</p>
          <p className="text-xs text-slate-500">クリア後に自動でプレイスタイル分析を実行します</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={autoAnalysisEnabled}
          aria-label="AI分析を自動表示"
          onClick={() => setAutoAnalysisEnabled(!autoAnalysisEnabled)}
          className={`relative h-8 w-14 rounded-full transition ${autoAnalysisEnabled ? 'bg-indigo-500' : 'bg-slate-300'}`}
        >
          <span
            className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${autoAnalysisEnabled ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
        <label htmlFor="hintLimit" className="text-sm font-semibold text-slate-800">
          ヒント最大回数
        </label>
        <p className="text-xs text-slate-500">1ゲームあたりのヒント回数を設定します（1〜5回）</p>
        <select
          id="hintLimit"
          value={hintLimit}
          onChange={(event) => setHintLimit(Number(event.target.value) as typeof hintOptions[number])}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          {hintOptions.map((value) => (
            <option key={value} value={value}>
              {value} 回
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
