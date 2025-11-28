import PuzzlePreview from '@/components/PuzzlePreview'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-lg">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-light tracking-[0.2em] text-white/90">
            SIMPLE PUZZLE
          </h1>
        </header>
        <PuzzlePreview />
      </div>
    </main>
  )
}
