# シンプルパズル - 技術設計書

## 技術スタック選択

### フロントエンド
- **Next.js 14.2.x**: App Router、Server Components 活用
- **React 18.x**: Hooks ベースの実装
- **TypeScript**: 型安全性確保
- **Tailwind CSS v3**: ユーティリティファーストCSS
- **Framer Motion**: タイルアニメーション

**選択理由**:
- Next.js 14 の App Router により、PWA 対応が容易
- Framer Motion で滑らかなタイル移動アニメーション
- TypeScript でパズルロジックの型安全性を確保

### AI 統合
- **Primary**: Google Gemini API（gemini-1.5-flash）
- **Fallback**: OpenAI API（gpt-4o-mini）

**選択理由**:
- Gemini Flash は高速・低コスト
- ヒント生成・プレイスタイル分析に最適

### パズルアルゴリズム
- **A*アルゴリズム**: 最適解計算
- **Manhattan距離**: ヒューリスティック関数
- **IDA*（Iterative Deepening A*）**: 大きなパズルサイズ用

### データ管理
- **IndexedDB**: ローカルデータ永続化（Dexie.js 使用）
- **Zustand**: グローバル状態管理（軽量・シンプル）

### PWA
- **Workbox**: Service Worker 管理（Next.js PWA プラグイン）
- **next-pwa**: Next.js 向け PWA 設定

---

## アーキテクチャ設計

### コンポーネント構成

```
app/
├── layout.tsx                    # ルートレイアウト
├── page.tsx                      # トップページ（難易度選択）
├── play/
│   └── page.tsx                  # プレイ画面
├── results/
│   └── page.tsx                  # 結果・分析画面
├── history/
│   └── page.tsx                  # プレイ履歴
└── settings/
    └── page.tsx                  # 設定画面

components/
├── PuzzleBoard.tsx               # パズルボード本体
├── Tile.tsx                      # 個別タイル
├── GameStats.tsx                 # 統計表示
├── Timer.tsx                     # タイマー
├── MoveCounter.tsx               # 手数カウンター
├── AIAssist.tsx                  # AIアシスト機能
├── HintButton.tsx                # ヒントボタン
├── OptimalSolutionViewer.tsx     # 最適解表示
├── AnalysisReport.tsx            # プレイスタイル分析
├── DifficultySelector.tsx        # 難易度選択
├── ModeSelector.tsx              # モード選択
└── ProgressChart.tsx             # 上達グラフ

lib/
├── puzzle/
│   ├── generator.ts              # パズル生成
│   ├── solver.ts                 # A*ソルバー
│   ├── validator.ts              # 移動可否判定
│   └── animator.ts               # アニメーション制御
├── ai/
│   ├── generateHint.ts           # AIヒント生成
│   └── analyzePlay.ts            # AIプレイ分析
├── db/
│   ├── schema.ts                 # IndexedDB スキーマ
│   └── operations.ts             # CRUD 操作
└── utils/
    ├── constants.ts              # 定数定義
    └── helpers.ts                # ヘルパー関数
```

---

## データモデル設計

### 1. PuzzleGame（ゲームセッション）
```typescript
interface PuzzleGame {
  id: string;                     // UUID
  timestamp: number;              // 開始時刻（Unix time）
  mode: 'timeAttack' | 'minMoves' | 'freePlay'; // ゲームモード
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'custom'; // 難易度
  size: number;                   // パズルサイズ（4, 5, 9, 10, 11...）
  displayMode: 'number' | 'image'; // 表示モード
  initialState: number[];         // 初期配置
  moves: Move[];                  // 移動履歴
  duration: number;               // プレイ時間（秒）
  moveCount: number;              // 総手数
  hintsUsed: number;              // ヒント使用回数
  completed: boolean;             // クリア済みか
  aiAdvice: string;               // AIアドバイス
}
```

### 2. Move（移動）
```typescript
interface Move {
  tileNumber: number;             // 移動したタイル番号
  from: Position;                 // 移動前の位置
  to: Position;                   // 移動後の位置
  timestamp: number;              // 移動時刻
}

interface Position {
  row: number;                    // 行
  col: number;                    // 列
}
```

### 3. PuzzleState（パズル状態）
```typescript
interface PuzzleState {
  board: number[][];              // 2次元配列（0は空きマス）
  emptyPos: Position;             // 空きマスの位置
  moveCount: number;              // 現在の手数
}
```

### 4. UserSettings（ユーザー設定）
```typescript
interface UserSettings {
  darkMode: boolean;              // ダークモード
  soundEnabled: boolean;          // 効果音
  animationSpeed: 'slow' | 'normal' | 'fast'; // アニメーション速度
  shuffleCount: number;           // シャッフル回数（20-200）
  aiProvider: 'gemini' | 'openai'; // AI プロバイダー
  hintLimit: number;              // ヒント使用制限（回数）
}
```

---

## パズルアルゴリズム設計

### パズル生成アルゴリズム

**要件**: 必ず解ける配置を生成する

**実装方針**:
1. 完成状態から逆算してランダム移動
2. シャッフル回数を難易度に応じて調整

**コード例（lib/puzzle/generator.ts）**:
```typescript
export function generatePuzzle(size: number, shuffleCount: number): PuzzleState {
  // 完成状態を作成（1, 2, 3, ..., 0）
  const solved = createSolvedState(size);

  let state = { ...solved };
  const emptyPos = { row: size - 1, col: size - 1 };

  // ランダムに移動（必ず解ける配置を保証）
  for (let i = 0; i < shuffleCount; i++) {
    const validMoves = getValidMoves(state, emptyPos);
    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    state = applyMove(state, randomMove);
  }

  return state;
}
```

### A*ソルバー（最適解計算）

**アルゴリズム**: A*探索
**ヒューリスティック関数**: Manhattan距離

**実装方針**:
```typescript
export function solvePuzzle(initialState: PuzzleState): Move[] {
  const openSet = new PriorityQueue<Node>();
  const closedSet = new Set<string>();

  const startNode: Node = {
    state: initialState,
    g: 0, // 開始からのコスト
    h: calculateManhattanDistance(initialState), // ヒューリスティック
    f: 0 + calculateManhattanDistance(initialState), // 総コスト
    parent: null,
  };

  openSet.enqueue(startNode, startNode.f);

  while (!openSet.isEmpty()) {
    const current = openSet.dequeue();

    if (isGoalState(current.state)) {
      return reconstructPath(current); // 解の経路を再構築
    }

    closedSet.add(stateToString(current.state));

    // 隣接ノードを展開
    const neighbors = getNeighbors(current.state);
    for (const neighbor of neighbors) {
      if (closedSet.has(stateToString(neighbor))) continue;

      const g = current.g + 1;
      const h = calculateManhattanDistance(neighbor);
      const f = g + h;

      openSet.enqueue({ state: neighbor, g, h, f, parent: current }, f);
    }
  }

  return []; // 解なし
}

function calculateManhattanDistance(state: PuzzleState): number {
  let distance = 0;
  const size = state.board.length;

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const value = state.board[row][col];
      if (value === 0) continue; // 空きマスは無視

      // 目標位置を計算
      const targetRow = Math.floor((value - 1) / size);
      const targetCol = (value - 1) % size;

      // Manhattan距離を加算
      distance += Math.abs(row - targetRow) + Math.abs(col - targetCol);
    }
  }

  return distance;
}
```

---

## AI API 統合設計

### ヒント生成フロー

```
1. 現在のパズル状態を取得
   ↓
2. A*アルゴリズムで次の最適な一手を計算
   ↓
3. AI API にプロンプト送信
   プロンプト例:
   「パズルのヒントを生成してください。
   次の最適な一手: タイル5を右に移動
   理由を簡潔に説明してください。」
   ↓
4. AI がヒントを生成
   ↓
5. ヒント表示 + 手数ペナルティ
```

### プレイスタイル分析フロー

```
1. ゲーム完了後、移動履歴を収集
   ↓
2. 統計を計算
   - 平均手数 vs 最適解
   - 移動パターン分析
   - 効率性スコア
   ↓
3. AI API にプロンプト送信
   プロンプト例:
   「以下のパズルプレイを分析し、改善アドバイスを提供してください。
   - 手数: 85手（最適解: 52手）
   - 効率性: 61%
   - よく使う移動: 左下方向が多い」
   ↓
4. AI が分析レポートを生成
   ↓
5. 結果画面に表示
```

### API 実装（Server Actions）

**app/actions/ai.ts**
```typescript
'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateHint(
  nextMove: Move,
  currentState: PuzzleState
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
スライドパズルのヒントを生成してください。

【次の最適な一手】
- タイル番号: ${nextMove.tileNumber}
- 移動方向: ${getMoveDirection(nextMove)}

【指示】
- 50文字程度で簡潔に
- なぜこの移動が良いかを説明
- ポジティブなトーンで
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function analyzePlayStyle(
  game: PuzzleGame,
  optimalMoves: number
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const efficiency = (optimalMoves / game.moveCount) * 100;

  const prompt = `
スライドパズルのプレイスタイルを分析し、具体的なアドバイスを提供してください。

【データ】
- 手数: ${game.moveCount}手
- 最適解: ${optimalMoves}手
- 効率性: ${efficiency.toFixed(1)}%
- プレイ時間: ${Math.floor(game.duration / 60)}分${game.duration % 60}秒

【指示】
- 200文字程度で簡潔に
- 具体的な改善ポイントを提案
- ポジティブなトーンで
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
```

---

## IndexedDB スキーマ（Dexie.js）

**lib/db/schema.ts**
```typescript
import Dexie, { Table } from 'dexie';

export class PuzzleGameDB extends Dexie {
  games!: Table<PuzzleGame>;
  settings!: Table<UserSettings>;

  constructor() {
    super('PuzzleGameDB');
    this.version(1).stores({
      games: 'id, timestamp, difficulty, mode, completed',
      settings: 'id',
    });
  }
}

export const db = new PuzzleGameDB();
```

---

## PWA 実装設計

### Service Worker 戦略

**キャッシュ戦略**:
- **App Shell**: Cache First（HTML、CSS、JS）
- **画像**: Cache First
- **API レスポンス**: Network First → Cache Fallback

**next.config.js**
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  // Next.js config
});
```

**public/manifest.json**
```json
{
  "name": "シンプルパズル",
  "short_name": "パズル",
  "description": "AI搭載スライドパズルゲーム",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1e3a8a",
  "theme_color": "#6b21a8",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## アニメーション設計（Framer Motion）

### タイル移動アニメーション

**components/Tile.tsx**
```typescript
import { motion } from 'framer-motion';

export function Tile({ number, position, onClick }: TileProps) {
  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="tile"
    >
      {number}
    </motion.div>
  );
}
```

---

## ファイル構成

```
app037-simple-puzzle/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── play/
│   ├── results/
│   ├── history/
│   ├── settings/
│   └── actions/
│       └── ai.ts
├── components/
│   ├── PuzzleBoard.tsx
│   ├── Tile.tsx
│   ├── GameStats.tsx
│   ├── AIAssist.tsx
│   └── ...
├── lib/
│   ├── puzzle/
│   ├── ai/
│   ├── db/
│   └── utils/
├── public/
│   ├── manifest.json
│   ├── icon-192.png
│   └── icon-512.png
├── doc/
│   ├── requirements.md
│   ├── technical-design.md
│   └── implementation-plan.md
├── png/
│   └── ui-reference.png
├── .env.local
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## セキュリティ・パフォーマンス考慮

### セキュリティ
- ✅ API キー環境変数管理（`.env.local`）
- ✅ HTTPS 必須（PWA 要件）
- ✅ XSS 対策（React デフォルト）

### パフォーマンス
- ✅ A*アルゴリズムの最適化（大きなパズルサイズ対応）
- ✅ タイルアニメーションのGPU加速（transform使用）
- ✅ IndexedDB の非同期操作
- ✅ Service Worker によるキャッシュ

---

## テスト戦略

### 単体テスト（Jest）
- `lib/puzzle/generator.ts`: パズル生成ロジック
- `lib/puzzle/solver.ts`: A*ソルバー
- `lib/puzzle/validator.ts`: 移動可否判定

### 統合テスト（React Testing Library）
- `PuzzleBoard.tsx`: タイル移動・表示
- `GameStats.tsx`: 統計計算

### E2E テスト（Playwright）
- フルゲームフロー
- AI機能動作確認
- オフライン動作確認

---

## 依存パッケージ

```json
{
  "dependencies": {
    "next": "14.2.x",
    "react": "18.x",
    "react-dom": "18.x",
    "@google/generative-ai": "^0.21.0",
    "dexie": "^4.0.0",
    "dexie-react-hooks": "^1.1.0",
    "zustand": "^4.5.0",
    "framer-motion": "^11.0.0",
    "next-pwa": "^5.6.0",
    "recharts": "^2.12.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "tailwindcss": "^3.4.0",
    "eslint": "^8",
    "eslint-config-next": "14.2.x",
    "@playwright/test": "^1.40.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0"
  }
}
```

---

## 実装優先順位

1. **Phase 0**: プロジェクトセットアップ、テスト環境構築
2. **Phase 1**: パズル生成・表示・基本移動機能
3. **Phase 2**: A*ソルバー実装
4. **Phase 3**: タイマー・手数カウント
5. **Phase 4**: AIヒント生成
6. **Phase 5**: AI分析・アドバイス
7. **Phase 6**: 画像モード
8. **Phase 7**: PWA対応
9. **Phase 8**: 履歴・グラフ機能

---

## 完了条件
- ✅ 全機能が要件定義書を満たす
- ✅ TDD で全テストパス
- ✅ PWA として完全動作（オフライン含む）
- ✅ Lighthouse スコア 90点以上
- ✅ AI 機能が正常動作
- ✅ A*ソルバーが5秒以内に最適解を計算
