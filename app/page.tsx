import PuzzlePreview from '@/components/PuzzlePreview'

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50 p-6">
      <div className="w-full max-w-5xl rounded-3xl bg-white/90 p-8 shadow-2xl">
        <header className="mb-8 space-y-2 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Custom Image Puzzle</p>
          <h1 className="text-3xl font-bold text-slate-800">カスタム画像パズルを構築中…</h1>
          <p className="text-slate-600">Phase 2 の土台として、現在は基本的なパズル盤をプレイアブルにしています。</p>
        </header>
        <PuzzlePreview />
      </div>
    </main>
  )
}
