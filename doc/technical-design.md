# カスタム画像パズル - 技術設計書

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
- **Gemini 2.5 Flash**: ヒント生成・プレイスタイル分析
- **Gemini 2.5 Flash Image（nano-banana）**: 画像生成

**選択理由**:
- Gemini 2.5 Flash は高速・低コスト
- Gemini 2.5 Flash Image は Imagen 4.0 からのアップデート版で、同一エコシステム内でテキスト/画像APIを揃えられる

### パズルアルゴリズム
- **A*アルゴリズム**: 最適解計算
- **Manhattan距離**: ヒューリスティック関数

### 画像処理
- **Canvas API**: 画像分割・トリミング・リサイズ
- **FileReader API**: 画像アップロード

### データ管理
- **IndexedDB**: ローカルデータ永続化（Dexie.js 使用）
- **Zustand**: グローバル状態管理（軽量・シンプル）

### PWA
- **Workbox**: Service Worker 管理（Next.js PWA プラグイン）
- **next-pwa**: Next.js 向け PWA 設定

### 音声
- **Web Audio API**: 効果音再生

### データ可視化
- **Recharts**: HUD内のミニスパークラインとプレイスタイル分析グラフを描画
- **理由**: 軽量でクライアントサイドレンダリングと相性が良く、モバイルでも滑らかに表示できる

---

## アーキテクチャ設計

### コンポーネント構成

```
app/
├── layout.tsx                    # ルートレイアウト
├── page.tsx                      # メインページ（画像選択 + パズル）
├── actions/
│   ├── ai.ts                     # AI関連Server Actions
│   └── image.ts                  # 画像生成Server Actions
└── globals.css                   # グローバルスタイル

components/
├── ImageSelector.tsx             # アップロード/AI/プリセットを1画面で切替
├── AIImageGenerator.tsx          # Gemini Flash Image呼び出しUI
├── PuzzleBoard.tsx               # パズルボード本体
├── Tile.tsx                      # 個別タイル
├── PuzzlePreview.tsx             # 完成イメージプレビュー
├── GameModeSelector.tsx          # タイトル直下のモードチップ
├── GameStats.tsx                 # HUDカード（経過時間/手数/サイズ）
├── hud/
│   ├── ModeChips.tsx             # モードチップUI（追加予定）
│   ├── StatusHUD.tsx             # 経過時間・手数表示（追加予定）
│   ├── CustomSizeSlider.tsx      # 4×4〜10×10スライダー（追加予定）
│   └── OfflineIndicator.tsx      # PWA状態バッジ（追加予定）
├── Timer.tsx                     # タイマー
├── MoveCounter.tsx               # 手数カウンター
├── HintButton.tsx                # ヒントボタン
├── OptimalSolutionViewer.tsx     # 最適解表示
├── AnalysisReport.tsx            # AIプレイ分析
├── HistoryView.tsx               # 履歴リスト
├── charts/
│   ├── GameHistoryChart.tsx      # 履歴画面用折れ線
│   └── PlayStyleChart.tsx        # AI参謀パネル内スパークライン（追加予定）
├── GameToast.tsx                 # 成功/失敗トースト
├── SettingsModal.tsx             # AI設定モーダル（APIキー/トグル/ヒント上限）
├── settings/
│   └── AISettingsPanel.tsx       # 設定モーダル内のフォーム群（追加予定）
└── ErrorBoundary.tsx             # エラーバウンダリ

lib/
├── puzzle/
│   ├── generator.ts              # パズル生成
│   ├── solver.ts                 # A*ソルバー
│   ├── validator.ts              # 移動可否判定・完成判定
│   └── types.ts                  # 型定義
├── image/
│   ├── processor.ts              # 画像処理（分割・トリミング）
│   ├── uploader.ts               # アップロード処理
│   └── presets.ts                # プリセット画像定義
├── ai/
│   ├── hintGenerator.ts          # AIヒント生成（A* + Gemini）
│   └── analyzePlay.ts            # AIプレイ分析
├── audio/
│   └── soundManager.ts           # 効果音管理
├── db/
│   ├── schema.ts                 # IndexedDB スキーマ
│   └── operations.ts             # CRUD 操作
└── utils/
    ├── apiKeyStorage.ts          # APIキー管理
    ├── constants.ts              # 定数定義
    └── helpers.ts                # ヘルパー関数

public/
├── sounds/
│   ├── move.mp3                  # タイル移動音
│   └── complete.mp3              # 完成音
├── presets/
│   ├── animals/                  # プリセット画像（動物）
│   ├── sea/                      # プリセット画像（海の生物）
│   └── landscapes/               # プリセット画像（景色）
├── icons/
│   ├── ios-icon-180.png          # iOS 180px
│   ├── ios-icon-152.png          # iOS 152px
│   ├── ios-icon-120.png          # iOS 120px
│   ├── android-chrome-256.png    # Android 256px
│   ├── android-chrome-192.png    # Android 192px
│   └── adaptive/
│       ├── foreground.png        # Adaptive Icon前景
│       └── background.png        # Adaptive Icon背景
├── manifest.json                 # PWA Manifest
├── icon-192.png                  # アプリアイコン
└── icon-512.png                  # アプリアイコン
```

### パズル生成ルール（single-blank保証）
1. `createSolvedState`は常に`tiles.length === size * size - 1`の画像タイルと`EMPTY_TILE = 0`の空きマスを返す。
2. `generatePuzzle`は`EMPTY_TILE`の位置を追跡しながら合法な隣接移動のみでシャッフルし、空きマスを複製しない。
3. `validator.canMove`は「タイルが空きマスに隣接」かつ「空きマスが1枚存在する」ことを同時に満たす場合のみtrue。
4. UIでは空きマスが0枚の状態を検出した時点でフェイルファスト（例外 throw）し、recoverableな再生成を行う。

### UIレイアウト（nano-banana-1763530962994.png準拠）
1. **モードチップ**: `GameModeSelector`が`ModeChips`を呼び出し、`useGameStore().mode`を元にアクティブスタイルを切替。
2. **ステータスHUD**: `GameStats`が`StatusHUD`を内包し、`Timer`/`MoveCounter`/サイズラベルを1カードで合成。
3. **AI参謀パネル**: `AnalysisReport`の左側に`HintButton`と`OptimalSolutionViewer`を縦積みし、`PlayStyleChart`（Recharts）でスパークラインを描画。
4. **難易度チップ + カスタムスライダー**: `CustomSizeSlider`が`size`ストアを更新し、`PuzzleBoard`と`StatusHUD`双方へ反映。
5. **オフラインインジケータ**: `OfflineIndicator`がService Workerの状態イベント（`navigator.serviceWorker.ready`/`navigator.onLine`）を監視し、文言・色を変化。

### AI設定UI設計
1. **エントリポイント**: `SettingsModal`をヘッダー右上のボタンから呼び出し、`useSettingsStore`で開閉状態を管理。
2. **APIキー管理**: `AISettingsPanel`が`geminiApiKey`/`geminiImageApiKey`フィールドを表示し、貼り付け→検証→保存を一連で行う。検証は`app/actions/ai.ts`の`validateKey` Server Action経由。
3. **AIトグル**: `aiAssistEnabled`（ヒントON/OFF）、`autoAnalysisEnabled`（クリア後自動表示）、`hintLimit`（1〜5）をZustandに保存し、`HintButton`や`AnalysisReport`が参照。
4. **ステータス表示**: 成功時は緑の「有効」、失敗時は赤の「無効」バッジ。最後の検証日時を`lastValidatedAt`として表示。
5. **ガードレール**: APIキーはブラウザ内でAES暗号化してIndexedDBにもバックアップし、Service Worker経由のリクエスト送信時には常に環境変数よりローカル設定を優先。

---

## データモデル設計

### 1. PuzzleGame（ゲームセッション）
```typescript
interface PuzzleGame {
  id: string;                     // UUID
  timestamp: number;              // 開始時刻（Unix time）
  mode: 'freePlay' | 'timeAttack' | 'moveChallenge'; // ゲームモード
  size: 4 | 5 | 6 | 7 | 8 | 9 | 10; // パズルサイズ（カスタムスライダー対応）
  imageData: string;              // 画像データ（Base64 or URL）
  imageSource: 'upload' | 'ai' | 'preset'; // 画像ソース
  moves: Move[];                  // 移動履歴
  duration: number;               // プレイ時間（秒）
  moveCount: number;              // 総手数
  hintsUsed: number;              // ヒント使用回数
  completed: boolean;             // クリア済みか
  efficiency: number;             // 効率性（最適解との比率）
  aiAdvice?: string;              // AIアドバイス
  imageMode: 'image' | 'number' | 'outline'; // 表示モード
  shuffleCount: number;           // 初期シャッフル回数（HUD表示用）
}
```

### 2. Move（移動）
```typescript
interface Move {
  tileIndex: number;              // 移動したタイルのインデックス
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
  tiles: TileData[][];            // 2次元配列（タイルデータ）
  emptyPos: Position;             // 空きマスの位置
  moveCount: number;              // 現在の手数
  size: 4 | 5 | 6 | 7 | 8 | 9 | 10; // パズルサイズ
  displayMode: 'image' | 'number' | 'outline'; // 現在の表示モード
  shuffleCount: number;           // 現在のシャッフル回数
}

interface TileData {
  index: number;                  // タイル番号（0は空きマス）
  imageFragment?: ImageFragment;  // 画像の断片
}

interface ImageFragment {
  imageData: string;              // 画像データ（Base64 or URL）
  sx: number;                     // ソース画像のx座標
  sy: number;                     // ソース画像のy座標
  sWidth: number;                 // ソース画像の幅
  sHeight: number;                // ソース画像の高さ
}
```

### 4. UserSettings（ユーザー設定）
```typescript
interface UserSettings {
  soundEnabled: boolean;          // 効果音
  animationSpeed: 'slow' | 'normal' | 'fast'; // アニメーション速度
  geminiApiKey?: string;          // Gemini（ヒント/分析）APIキー
  geminiImageApiKey?: string;     // Gemini 2.5 Flash Image APIキー
  imageMode: 'image' | 'number' | 'outline'; // 盤面表示モード初期値
  offlineBadgeDismissed?: boolean; // オフラインバッジの説明を閉じたか
  aiAssistEnabled: boolean;       // AIヒントボタンを表示するか
  autoAnalysisEnabled: boolean;   // クリア後に自動で分析を表示するか
  hintLimit: 1 | 2 | 3 | 4 | 5;   // 1ゲームあたりのヒント最大回数
  lastValidatedAt?: number;       // APIキー最終検証時刻
  geminiKeyStatus?: 'valid' | 'invalid' | 'unknown';
  geminiImageKeyStatus?: 'valid' | 'invalid' | 'unknown';
}
```

---

## 画像処理設計

### 画像アップロード処理（lib/image/uploader.ts）

```typescript
export async function processUploadedImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // 正方形にトリミング
        const size = Math.min(img.width, img.height);
        const canvas = document.createElement('canvas');
        canvas.width = 600;  // 最終サイズ
        canvas.height = 600;

        const ctx = canvas.getContext('2d')!;

        // 中央部分を切り取って正方形に
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;

        ctx.drawImage(img, sx, sy, size, size, 0, 0, 600, 600);

        // Base64に変換
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.src = e.target?.result as string;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

### 画像分割処理（lib/image/processor.ts）

```typescript
export function splitImageIntoTiles(
  imageData: string,
  size: 4 | 5 | 6
): ImageFragment[][] {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const img = new Image();

  img.src = imageData;

  const tileWidth = 600 / size;
  const tileHeight = 600 / size;

  const tiles: ImageFragment[][] = [];

  for (let row = 0; row < size; row++) {
    tiles[row] = [];
    for (let col = 0; col < size; col++) {
      // 最後のタイル（右下）は空きマス
      if (row === size - 1 && col === size - 1) {
        tiles[row][col] = null; // 空きマス
      } else {
        tiles[row][col] = {
          imageData,
          sx: col * tileWidth,
          sy: row * tileHeight,
          sWidth: tileWidth,
          sHeight: tileHeight,
        };
      }
    }
  }

  return tiles;
}
```

---

## パズルアルゴリズム設計

### パズル生成アルゴリズム（lib/puzzle/generator.ts）

**要件**: 必ず解ける配置を生成する

**実装方針**:
1. 完成状態から逆算してランダム移動
2. シャッフル回数を難易度に応じて調整
   - 4×4: 30回
   - 5×5: 50回
   - 6×6: 80回

```typescript
export function generatePuzzle(size: 4 | 5 | 6, imageData: string): PuzzleState {
  // 完成状態を作成
  const tiles = createSolvedState(size, imageData);

  let state: PuzzleState = {
    tiles,
    emptyPos: { row: size - 1, col: size - 1 },
    moveCount: 0,
    size,
  };

  // シャッフル回数
  const shuffleCount = size === 4 ? 30 : size === 5 ? 50 : 80;

  // ランダムに移動（必ず解ける配置を保証）
  for (let i = 0; i < shuffleCount; i++) {
    const validMoves = getValidMoves(state);
    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    state = applyMove(state, randomMove);
  }

  return state;
}
```

### A*ソルバー（最適解計算）（lib/puzzle/solver.ts）

**アルゴリズム**: A*探索
**ヒューリスティック関数**: Manhattan距離

```typescript
interface Node {
  state: PuzzleState;
  g: number;  // 開始からのコスト
  h: number;  // ヒューリスティック（ゴールまでの推定コスト）
  f: number;  // 総コスト（g + h）
  parent: Node | null;
  move?: Move;
}

export function solvePuzzle(initialState: PuzzleState): Move[] {
  const openSet = new PriorityQueue<Node>();
  const closedSet = new Set<string>();

  const startNode: Node = {
    state: initialState,
    g: 0,
    h: calculateManhattanDistance(initialState),
    f: 0 + calculateManhattanDistance(initialState),
    parent: null,
  };

  openSet.enqueue(startNode, startNode.f);

  while (!openSet.isEmpty()) {
    const current = openSet.dequeue();

    if (isGoalState(current.state)) {
      return reconstructPath(current);
    }

    closedSet.add(stateToString(current.state));

    // 隣接ノードを展開
    const neighbors = getNeighborStates(current.state);
    for (const { state: neighbor, move } of neighbors) {
      if (closedSet.has(stateToString(neighbor))) continue;

      const g = current.g + 1;
      const h = calculateManhattanDistance(neighbor);
      const f = g + h;

      openSet.enqueue({ state: neighbor, g, h, f, parent: current, move }, f);
    }
  }

  return []; // 解なし（通常は発生しない）
}

function calculateManhattanDistance(state: PuzzleState): number {
  let distance = 0;
  const size = state.size;

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const tile = state.tiles[row][col];
      if (tile.index === 0) continue; // 空きマスは無視

      // 目標位置を計算
      const targetRow = Math.floor((tile.index - 1) / size);
      const targetCol = (tile.index - 1) % size;

      // Manhattan距離を加算
      distance += Math.abs(row - targetRow) + Math.abs(col - targetCol);
    }
  }

  return distance;
}
```

---

## AI API 統合設計

### ヒント生成フロー（lib/ai/hintGenerator.ts）

```
1. 現在のパズル状態を取得
   ↓
2. A*アルゴリズムで次の最適な一手を計算
   ↓
3. Gemini API にプロンプト送信
   ↓
4. AI がヒント（理由付き）を生成
   ↓
5. ヒント表示
```

**app/actions/ai.ts**:
```typescript
'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { PuzzleState, Move } from '@/lib/puzzle/types';
import { getNextOptimalMove } from '@/lib/ai/hintGenerator';

export async function generateHint(
  state: PuzzleState,
  clientApiKey?: string
): Promise<HintResponse> {
  // 次の最適な一手を計算
  const nextMove = getNextOptimalMove(state);

  if (!nextMove) {
    return {
      success: false,
      error: 'パズルは既に完成しているか、解が見つかりません。',
    };
  }

  // APIキー取得
  const apiKey = clientApiKey || process.env.GEMINI_IMAGE_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // フォールバック: シンプルなメッセージ
    return {
      success: true,
      hint: `このタイルを${nextMove.direction}に動かしましょう`,
      move: nextMove,
      isDefaultMessage: true,
    };
  }

  // Gemini APIでヒント生成
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
スライドパズルのヒントを生成してください。

【次の最適な一手】
- 移動方向: ${nextMove.direction}

【指示】
- 30文字程度で簡潔に
- なぜこの移動が良いかを説明
- ポジティブなトーンで
`;

  const result = await model.generateContent(prompt);
  const hint = result.response.text();

  return {
    success: true,
    hint,
    move: nextMove,
    isDefaultMessage: false,
  };
}
```

### AI画像生成（app/actions/image.ts）

```typescript
'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

export async function generateImage(
  prompt: string,
  clientApiKey?: string
): Promise<ImageResponse> {
  const apiKey = clientApiKey || process.env.GEMINI_IMAGE_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'APIキーが設定されていません',
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });

    const result = await model.generateContent({
      prompt: prompt,
      // Gemini 2.5 Flash Image specific parameters（例: aspectRatio, background）
    });

    const imageData = result.response.images[0].data; // Base64

    return {
      success: true,
      imageData: `data:image/png;base64,${imageData}`,
    };
  } catch (error) {
    console.error('Image generation error:', error);
    return {
      success: false,
      error: '画像生成中にエラーが発生しました',
    };
  }
}
```

---

## PWA 実装設計

### Service Worker 戦略

**キャッシュ戦略**:
- **App Shell**: Cache First（HTML、CSS、JS）
- **画像**: Cache First
- **プリセット画像**: Precache（事前キャッシュ）
- **API レスポンス**: Network First → Cache Fallback

**next.config.js**:
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/generativelanguage\.googleapis\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'gemini-api-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24時間
        },
      },
    },
  ],
});

module.exports = withPWA({
  // Next.js config
});
```

**public/manifest.json**:
```json
{
  "name": "カスタム画像パズル",
  "short_name": "パズル",
  "description": "自分の画像でパズル！AI画像生成も",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#fef3c7",
  "theme_color": "#f59e0b",
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

## IndexedDB スキーマ（Dexie.js）

**lib/db/schema.ts**:
```typescript
import Dexie, { Table } from 'dexie';

export class PuzzleGameDB extends Dexie {
  games!: Table<PuzzleGame>;
  settings!: Table<UserSettings>;

  constructor() {
    super('PuzzleGameDB');
    this.version(1).stores({
      games: 'id, timestamp, size, mode, completed, efficiency',
      settings: 'id',
    });
  }
}

export const db = new PuzzleGameDB();
```

---

## アニメーション設計（Framer Motion）

### タイル移動アニメーション

**components/Tile.tsx**:
```typescript
import { motion } from 'framer-motion';

export function Tile({ tile, position, onClick, size }: TileProps) {
  if (tile.index === 0) return <div className="empty-tile" />;

  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="tile"
      style={{
        backgroundImage: `url(${tile.imageFragment.imageData})`,
        backgroundPosition: `-${tile.imageFragment.sx}px -${tile.imageFragment.sy}px`,
        backgroundSize: `${size * 100}px ${size * 100}px`,
      }}
    />
  );
}
```

---

## セキュリティ・パフォーマンス考慮

### セキュリティ
- ✅ API キー localStorage管理（XSS対策として適切なCSP設定）
- ✅ HTTPS 必須（PWA 要件）
- ✅ 画像アップロードのファイルサイズ制限（5MB）
- ✅ 画像形式バリデーション（JPEG、PNG、GIFのみ）

### パフォーマンス
- ✅ A*アルゴリズムの最適化（6×6で30秒以内）
- ✅ 画像処理の非同期化（Worker使用検討）
- ✅ タイルアニメーションのGPU加速（transform使用）
- ✅ IndexedDB の非同期操作
- ✅ Service Worker によるキャッシュ
- ✅ 画像の遅延読み込み・最適化

---

## テスト戦略

### 単体テスト（Jest）
- `lib/puzzle/generator.ts`: パズル生成ロジック
- `lib/puzzle/solver.ts`: A*ソルバー
- `lib/puzzle/validator.ts`: 移動可否判定・完成判定
- `lib/image/processor.ts`: 画像分割ロジック

### 統合テスト（React Testing Library）
- `PuzzleBoard.tsx`: タイル移動・表示
- `ImageSelector.tsx`: 画像選択フロー
- `GameStats.tsx`: 統計計算

### E2E テスト（Playwright）
- フルゲームフロー（画像アップロード → パズル → 完成）
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
    "@google/generative-ai": "^0.24.0",
    "dexie": "^4.0.0",
    "dexie-react-hooks": "^1.1.0",
    "zustand": "^4.5.0",
    "framer-motion": "^11.0.0",
    "next-pwa": "^5.6.0"
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

### Phase 0: プロジェクトセットアップ
- Next.js プロジェクト初期化
- 依存パッケージインストール
- 基本ディレクトリ構造作成
- PWA設定
- テスト環境構築

### Phase 1: 画像処理基盤
- 画像アップロード機能
- 画像分割ロジック
- プリセット画像準備

### Phase 2: パズル基本機能
- パズル生成
- タイル表示・移動
- 完成判定

### Phase 3: A*ソルバー
- A*アルゴリズム実装
- 最適解計算

### Phase 4: ゲームモード・統計
- タイマー・手数カウント
- ゲームモード実装
- IndexedDB統合

### Phase 5: AI機能
- AIヒント生成（Gemini）
- プレイスタイル分析

### Phase 6: AI画像生成
- Gemini 2.5 Flash Image（nano-banana）統合
- 画像生成UI

### Phase 7: UI/UX磨き込み
- アニメーション
- 効果音
- ポップなデザイン適用

### Phase 8: PWA完成
- Service Worker完全動作
- オフライン対応

### Phase 9: 履歴・統計
- プレイ履歴表示
- 統計グラフ

---

## 完了条件
- ✅ 全機能が要件定義書を満たす
- ✅ TDD で全テストパス
- ✅ PWA として完全動作（オフライン含む）
- ✅ Lighthouse スコア 90点以上
- ✅ AI 機能が正常動作
- ✅ A*ソルバーが各サイズで目標時間内に最適解を計算
- ✅ 画像処理が1秒以内に完了
