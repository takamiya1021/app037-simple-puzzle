"use client"

import { useMemo, useState } from 'react'
import type { GameHistoryRecord } from '@/lib/db/schema'

interface Props {
  games: GameHistoryRecord[]
}

const headers: Array<{ key: keyof GameHistoryRecord; label: string }> = [
  { key: 'completedAt', label: '日時' },
  { key: 'size', label: 'サイズ' },
  { key: 'mode', label: 'モード' },
  { key: 'moveCount', label: '手数' },
  { key: 'durationSeconds', label: '時間' },
  { key: 'efficiencyScore', label: '効率' },
]

export const GameHistoryTable = ({ games }: Props) => {
  const [sortKey, setSortKey] = useState<keyof GameHistoryRecord>('completedAt')
  const [sortAsc, setSortAsc] = useState(false)

  const sorted = useMemo(() => {
    const numericKeys: Array<keyof GameHistoryRecord> = ['completedAt', 'durationSeconds', 'moveCount', 'efficiencyScore', 'size']
    return [...games].sort((a, b) => {
      const dir = sortAsc ? 1 : -1
      const aValue = a[sortKey]
      const bValue = b[sortKey]
      if (numericKeys.includes(sortKey)) {
        return ((aValue as number) - (bValue as number)) * dir
      }
      return String(aValue).localeCompare(String(bValue)) * dir
    })
  }, [games, sortKey, sortAsc])

  const changeSort = (key: keyof GameHistoryRecord) => {
    if (sortKey === key) {
      setSortAsc((prev) => !prev)
    } else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-sm text-slate-600">
        <thead>
          <tr>
            {headers.map((header) => (
              <th
                key={header.key}
                scope="col"
                className="cursor-pointer border-b border-slate-200 px-2 py-1 text-left"
                onClick={() => changeSort(header.key)}
              >
                {header.label} {sortKey === header.key ? (sortAsc ? '↑' : '↓') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((game) => (
            <tr key={game.id} className="border-b border-slate-100">
              <td className="px-2 py-1">{new Date(game.completedAt).toLocaleString()}</td>
              <td className="px-2 py-1">{game.size}×{game.size}</td>
              <td className="px-2 py-1">{game.mode}</td>
              <td className="px-2 py-1">{game.moveCount}</td>
              <td className="px-2 py-1">{Math.round(game.durationSeconds)}秒</td>
              <td className="px-2 py-1">{Math.round(game.efficiencyScore * 100)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
