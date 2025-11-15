# シンプルパズル - 実装計画書（TDD準拠版）

## 実装方針
- **TDDサイクル**: 全Phaseで Red → Green → Refactor を厳守
- **テストファースト**: 実装前に必ずテストを書く
- **段階的実装**: Phase単位で完結させ、都度コミット
- **完了条件**: 全テストパス + コードカバレッジ80%以上

---

## Phase 0: プロジェクトセットアップ・テスト環境構築（予定工数: 2時間）

### 目的
開発環境とテスト基盤を整備し、TDD開発の土台を構築する。

### タスク

- [ ] **Next.js プロジェクト作成（Red）**
  - `npx create-next-app@14 . --typescript --tailwind --app --no-src-dir`
  - 初期設定確認テスト作成（ビルド成功確認）

- [ ] **テストライブラリセットアップ（Green）**
  - Jest + React Testing Library インストール
  - `jest.config.js` 設定
  - `setupTests.ts` 作成
  - 動作確認用ダミーテスト実装

- [ ] **E2Eテスト環境構築（Refactor）**
  - Playwright インストール・設定
  - `playwright.config.ts` 作成
  - サンプルE2Eテスト作成

- [ ] **追加ライブラリインストール**
  - Framer Motion（アニメーション）
  - Zustand（状態管理）
  - Dexie.js（IndexedDB）

- [ ] **PWA基盤セットアップ**
  - `next-pwa` インストール
  - `next.config.js` PWA設定
  - `manifest.json` 作成

- [ ] **環境変数設定**
  - `.env.local.example` 作成
  - API キー管理構造確認

### 完了条件
- ✅ `npm run dev` でサーバー起動
- ✅ `npm test` でテスト実行可能
- ✅ `npm run test:e2e` でE2Eテスト実行可能

---

## Phase 1: パズル生成・表示・基本移動機能（予定工数: 8時間）

### 目的
パズルの生成、表示、タイル移動の基本機能を実装する。

### タスク

- [ ] **パズル生成ロジックテスト作成（Red）**
  - `lib/puzzle/generator.ts` のテスト作成
  - 正しいサイズのパズル生成テスト
  - 解ける配置であることの検証テスト

- [ ] **パズル生成ロジック実装（Green）**
  - `lib/puzzle/generator.ts` 実装
  - `generatePuzzle()` 関数実装
  - シャッフルアルゴリズム実装
  - テストが全てパスすることを確認

- [ ] **移動可否判定ロジックテスト作成（Red）**
  - `lib/puzzle/validator.ts` のテスト作成
  - 移動可能なタイルの判定テスト
  - 無効な移動の検出テスト

- [ ] **移動可否判定ロジック実装（Green）**
  - `lib/puzzle/validator.ts` 実装
  - `isMovable()` 関数実装
  - `getValidMoves()` 関数実装

- [ ] **Tileコンポーネントテスト作成（Red）**
  - `components/Tile.test.tsx` 作成
  - タイル表示テスト
  - クリックイベントテスト

- [ ] **Tileコンポーネント実装（Green）**
  - `components/Tile.tsx` 実装
  - Framer Motion でアニメーション
  - Tailwind CSS スタイリング

- [ ] **PuzzleBoardコンポーネント実装（Red → Green → Refactor）**
  - `components/PuzzleBoard.tsx` テスト・実装
  - タイル配置・表示
  - タイル移動ハンドリング
  - グリッドレイアウト

- [ ] **リファクタリング（Refactor）**
  - コンポーネント分割
  - パフォーマンス最適化（useMemo）
  - コード整理・命名改善

### 完了条件
- ✅ パズルが正しく生成される
- ✅ タイルをクリックして移動できる
- ✅ スムーズなアニメーション
- ✅ 全テストパス

---

## Phase 2: A*ソルバー実装（予定工数: 10時間）

### 目的
最適解を計算するA*アルゴリズムを実装する。

### タスク

- [ ] **Manhattan距離計算テスト作成（Red）**
  - `lib/puzzle/solver.ts` のテスト作成
  - Manhattan距離の正確性テスト
  - エッジケーステスト

- [ ] **Manhattan距離計算実装（Green）**
  - `calculateManhattanDistance()` 関数実装
  - テスト全パス確認

- [ ] **A*ソルバーテスト作成（Red）**
  - 簡単なパズル（3×3）の最適解テスト
  - 解なしパズルの検出テスト
  - パフォーマンステスト（9×9で5秒以内）

- [ ] **A*ソルバー実装（Green）**
  - `solvePuzzle()` 関数実装
  - 優先度キュー実装
  - ゴール状態判定実装
  - 経路再構築実装

- [ ] **最適化（Refactor）**
  - IDA*アルゴリズムへの切り替え（大きなパズル用）
  - メモリ使用量削減
  - 計算速度向上

- [ ] **OptimalSolutionViewerコンポーネント実装（Red → Green → Refactor）**
  - `components/OptimalSolutionViewer.tsx` テスト・実装
  - 最適解の手順表示
  - ステップバイステップ再生機能

### 完了条件
- ✅ A*ソルバーが正しく最適解を計算
- ✅ 9×9パズルで5秒以内に計算完了
- ✅ 最適解が視覚的に表示される
- ✅ 全テストパス

---

## Phase 3: タイマー・手数カウント機能（予定工数: 4時間）

### 目的
ゲームモード（タイムアタック、手数最小チャレンジ、フリープレイ）の基盤を実装する。

### タスク

- [ ] **Timerコンポーネントテスト作成（Red）**
  - `components/Timer.test.tsx` 作成
  - カウントアップ・カウントダウンテスト
  - 終了イベント発火テスト

- [ ] **Timerコンポーネント実装（Green）**
  - `components/Timer.tsx` 実装
  - モード別タイマー（タイムアタック/フリープレイ）
  - MM:SS 形式表示

- [ ] **MoveCounterコンポーネント実装（Red → Green → Refactor）**
  - `components/MoveCounter.tsx` テスト・実装
  - 手数カウント
  - ヒントペナルティ反映

- [ ] **GameStatsコンポーネント実装（Red → Green → Refactor）**
  - `components/GameStats.tsx` テスト・実装
  - 統計バー表示
  - リアルタイム更新

- [ ] **ゲームモード選択機能**
  - `components/ModeSelector.tsx` 実装
  - タイムアタック、手数最小、フリープレイ切り替え

### 完了条件
- ✅ タイマーが正確に動作
- ✅ 手数が正しくカウントされる
- ✅ モード切り替えが機能する
- ✅ 全テストパス

---

## Phase 4: AIヒント生成機能（予定工数: 5時間）

### 目的
AI による解法ヒント生成機能を実装する。

### タスク

- [ ] **ヒント生成ロジックテスト作成（Red）**
  - `lib/ai/generateHint.test.ts` 作成
  - モックAPIレスポンステスト
  - エラーハンドリングテスト

- [ ] **Server Action実装（Green）**
  - `app/actions/ai.ts` 作成
  - `generateHint()` 実装
  - A*ソルバーと連携して次の一手を取得
  - エラーハンドリング実装

- [ ] **HintButtonコンポーネント実装（Red → Green → Refactor）**
  - `components/HintButton.tsx` テスト・実装
  - ヒント表示UI
  - 使用制限（3回まで）
  - ペナルティ表示

- [ ] **統合テスト（E2E）**
  - Playwright E2Eテスト作成
  - ヒント使用フロー確認

- [ ] **リファクタリング（Refactor）**
  - ローディングUI改善
  - エラーハンドリング強化

### 完了条件
- ✅ AI ヒントが正確に生成される
- ✅ ヒント使用制限が機能する
- ✅ エラー時のフォールバック動作
- ✅ E2Eテストパス

---

## Phase 5: AI分析・アドバイス機能（予定工数: 5時間）

### 目的
プレイ後の AI 分析・アドバイス機能を実装する。

### タスク

- [ ] **プレイスタイル分析ロジックテスト作成（Red）**
  - `lib/ai/analyzePlay.test.ts` 作成
  - 効率性計算テスト
  - 移動パターン分析テスト

- [ ] **プレイスタイル分析ロジック実装（Green）**
  - `lib/ai/analyzePlay.ts` 実装
  - 効率性スコア計算
  - 移動パターン抽出

- [ ] **AI分析Server Action実装（Red → Green）**
  - `analyzePlayStyle()` テスト・実装
  - プロンプト設計
  - レスポンスパース処理

- [ ] **AnalysisReportコンポーネント実装（Red → Green → Refactor）**
  - `components/AnalysisReport.tsx` テスト・実装
  - AIアドバイス表示
  - 統計サマリー表示

- [ ] **結果画面実装（E2E）**
  - `app/results/page.tsx` 実装
  - E2Eテスト作成（プレイ完了 → 結果表示フロー）

### 完了条件
- ✅ プレイスタイルが正確に分析される
- ✅ AI が適切なアドバイスを生成
- ✅ 結果画面が見やすく表示
- ✅ 全テストパス

---

## Phase 6: 画像モード機能（予定工数: 6時間）

### 目的
数字ではなく画像を使ったパズルモードを実装する。

### タスク

- [ ] **画像分割ロジックテスト作成（Red）**
  - `lib/puzzle/imageProcessor.ts` のテスト作成
  - 画像を正しくグリッド分割できるかテスト

- [ ] **画像分割ロジック実装（Green）**
  - `lib/puzzle/imageProcessor.ts` 実装
  - Canvas API で画像をグリッド分割
  - 各タイルに画像片を割り当て

- [ ] **画像アップロード機能実装（Red → Green → Refactor）**
  - `components/ImageUploader.tsx` テスト・実装
  - ファイル選択UI
  - プレビュー表示
  - 画像検証（サイズ、形式）

- [ ] **プリセット画像機能**
  - `/public/images/presets/` にサンプル画像配置
  - プリセット選択UI実装

- [ ] **画像モードタイル表示**
  - `Tile.tsx` を拡張
  - 数字/画像の切り替え表示

### 完了条件
- ✅ 画像が正しく分割される
- ✅ 画像アップロードが機能する
- ✅ 画像パズルがプレイ可能
- ✅ 全テストパス

---

## Phase 7: PWA対応（予定工数: 3時間）

### 目的
完全なオフライン動作とインストール機能を実装する。

### タスク

- [ ] **Service Worker動作テスト作成（Red）**
  - Service Worker登録テスト
  - キャッシュ戦略テスト
  - オフライン動作テスト

- [ ] **Service Worker設定（Green）**
  - `next-pwa` 詳細設定
  - キャッシュルール定義
  - オフライン検出ロジック

- [ ] **IndexedDB統合（Red → Green → Refactor）**
  - `lib/db/schema.ts` 実装
  - Dexie.js セットアップ
  - CRUD操作実装
  - テスト作成・実装

- [ ] **インストールプロンプト実装**
  - PWAインストールボタン
  - インストール状態検出

- [ ] **E2Eテスト（Offline）**
  - Playwright オフラインモードテスト
  - キャッシュからの読み込み確認

### 完了条件
- ✅ オフラインで完全動作
- ✅ インストール可能
- ✅ Lighthouse PWA スコア 100点
- ✅ 全テストパス

---

## Phase 8: 履歴・グラフ機能（予定工数: 4時間）

### 目的
過去のプレイ履歴と上達グラフを表示する。

### タスク

- [ ] **履歴取得ロジックテスト作成（Red）**
  - IndexedDB クエリテスト
  - ソート・フィルタリングテスト

- [ ] **履歴取得ロジック実装（Green）**
  - `lib/db/operations.ts` 拡張
  - 履歴取得関数実装
  - ページネーション実装

- [ ] **ProgressChartコンポーネント実装（Red → Green → Refactor）**
  - `components/ProgressChart.tsx` テスト・実装
  - Recharts でグラフ描画
  - 手数推移グラフ
  - クリアタイム推移グラフ

- [ ] **履歴画面実装**
  - `app/history/page.tsx` 実装
  - 履歴一覧表示
  - グラフ表示
  - E2Eテスト

### 完了条件
- ✅ 履歴が正確に保存・取得される
- ✅ グラフが見やすく表示
- ✅ 上達傾向が可視化される
- ✅ 全テストパス

---

## Phase 9: 最終調整・パフォーマンス最適化（予定工数: 3時間）

### タスク

- [ ] **パフォーマンス計測**
  - Lighthouse テスト実行
  - Core Web Vitals 確認

- [ ] **最適化実施**
  - 画像最適化
  - コード分割
  - バンドルサイズ削減
  - A*アルゴリズム最適化

- [ ] **アクセシビリティ改善**
  - ARIA属性追加
  - キーボードナビゲーション改善
  - スクリーンリーダー対応

- [ ] **最終E2Eテスト**
  - 全機能フローテスト
  - クロスブラウザテスト

- [ ] **ドキュメント整備**
  - README.md 作成
  - 環境構築手順
  - 使用方法

### 完了条件
- ✅ Lighthouse スコア全項目90点以上
- ✅ 全E2Eテストパス
- ✅ コードカバレッジ80%以上

---

## 全体スケジュール

| Phase | 内容 | 工数 | 累計 |
|-------|------|------|------|
| Phase 0 | セットアップ・テスト環境 | 2h | 2h |
| Phase 1 | パズル生成・表示・移動 | 8h | 10h |
| Phase 2 | A*ソルバー | 10h | 20h |
| Phase 3 | タイマー・手数カウント | 4h | 24h |
| Phase 4 | AIヒント生成 | 5h | 29h |
| Phase 5 | AI分析・アドバイス | 5h | 34h |
| Phase 6 | 画像モード | 6h | 40h |
| Phase 7 | PWA対応 | 3h | 43h |
| Phase 8 | 履歴・グラフ | 4h | 47h |
| Phase 9 | 最終調整 | 3h | **50h** |

**総工数**: 約50時間（6.25日）

---

## Git コミット規律

### コミットタイミング
- 各Phase完了時
- Red → Green → Refactor の各サイクル完了時
- 全テストパス確認後

### コミットメッセージ例
```
feat(phase1): implement puzzle generator (Green)

- Add generatePuzzle() function
- Add shuffle algorithm
- All tests passing (coverage: 88%)
```

---

## 最終完了条件チェックリスト

- [ ] 全機能が要件定義書を満たす
- [ ] 全単体テストパス（コードカバレッジ80%以上）
- [ ] 全E2Eテストパス
- [ ] PWA として完全動作（オフライン含む）
- [ ] Lighthouse スコア 90点以上（全項目）
- [ ] A*ソルバーが5秒以内に最適解計算
- [ ] AI ヒント・分析が正常動作
- [ ] 画像モードが正常動作
- [ ] README.md 完備
- [ ] `.env.local.example` 提供

---

## 備考
- 各Phaseは独立して完結させる
- 問題発生時は即座に対応、次Phaseに持ち越さない
- TDDサイクルを厳守し、テストなしコードは書かない
- A*アルゴリズムのパフォーマンスに特に注意
