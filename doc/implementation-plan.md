# カスタム画像パズル - 実装計画書（TDD準拠版）

## 実装方針

### TDD（Test-Driven Development）サイクル
各Phaseで以下のサイクルを繰り返します：
1. **Red（失敗）**: テストを書く → 失敗を確認
2. **Green（成功）**: 最小限の実装でテストを通す
3. **Refactor（改善）**: テストが通った状態でリファクタリング

### 完了条件（各Phase共通）
- ✅ 全テストがパス
- ✅ コードカバレッジ80%以上
- ✅ ESLint警告ゼロ
- ✅ 動作確認完了

---

## Phase 0: テスト環境構築（予定工数: 2時間）

### タスク
- [ ] Jestセットアップ（Red）
  - jest.config.js作成
  - テスト実行確認（失敗することを確認）
- [ ] 設定ファイル作成（Green）
  - jest.setup.ts作成
  - Testing Library設定
- [ ] サンプルテスト作成（Refactor）
  - 簡単なユニットテスト作成
  - テスト実行確認（成功）

### 完了条件
- ✅ `npm test`でテスト実行可能
- ✅ サンプルテストがパス

---

## Phase 1: 画像処理基盤（予定工数: 8時間）

### タスク

#### 1.1 画像アップロード処理
- [ ] テスト作成（Red）：`lib/image/uploader.test.ts`
  - ファイル読み込みテスト
  - 正方形トリミングテスト
  - Base64変換テスト
- [ ] 実装（Green）：`lib/image/uploader.ts`
  - FileReader API使用
  - Canvas APIで正方形トリミング
  - Base64変換
- [ ] リファクタリング（Refactor）
  - エラーハンドリング追加
  - パフォーマンス最適化

#### 1.2 画像分割処理
- [ ] テスト作成（Red）：`lib/image/processor.test.ts`
  - 4×4分割テスト
  - 5×5分割テスト
  - 6×6分割テスト
  - 空きマス位置テスト
- [ ] 実装（Green）：`lib/image/processor.ts`
  - Canvas APIで画像分割
  - ImageFragment配列生成
- [ ] リファクタリング（Refactor）
  - コード整理
  - 型安全性向上

#### 1.3 プリセット画像準備
- [ ] プリセット画像収集・配置
  - `public/presets/animals/` に3〜5枚
  - `public/presets/sea/` に3〜5枚
  - `public/presets/landscapes/` に3〜5枚
- [ ] 定義ファイル作成：`lib/image/presets.ts`
  - プリセット画像のメタデータ

### 完了条件
- ✅ 画像アップロード・分割のテストがパス
- ✅ プリセット画像が正しく配置
- ✅ カバレッジ80%以上

---

## Phase 2: パズル基本機能（予定工数: 10時間）

### タスク

#### 2.1 型定義
- [ ] `lib/puzzle/types.ts`作成
  - PuzzleState、TileData、Position等の型定義

#### 2.2 パズル生成ロジック
- [ ] テスト作成（Red）：`lib/puzzle/generator.test.ts`
  - 完成状態生成テスト
  - シャッフルテスト（必ず解ける配置になるか）
  - サイズ別テスト（4×4、5×5、6×6）
- [ ] 実装（Green）：`lib/puzzle/generator.ts`
  - createSolvedState実装
  - generatePuzzle実装
  - getValidMoves実装
  - applyMove実装
- [ ] リファクタリング（Refactor）
  - シャッフル回数調整
  - コード最適化

#### 2.3 移動可否判定
- [ ] テスト作成（Red）：`lib/puzzle/validator.test.ts`
  - 移動可能判定テスト
  - 完成判定テスト
  - 不正な移動のテスト
- [ ] 実装（Green）：`lib/puzzle/validator.ts`
  - canMove実装
  - isComplete実装
- [ ] リファクタリング（Refactor）

#### 2.4 パズルボードコンポーネント
- [ ] テスト作成（Red）：`components/PuzzleBoard.test.tsx`
  - ボード表示テスト
  - タイルクリックテスト
- [ ] 実装（Green）：
  - `components/PuzzleBoard.tsx`
  - `components/Tile.tsx`
- [ ] リファクタリング（Refactor）
  - アクセシビリティ改善

### 完了条件
- ✅ パズル生成・移動のテストがパス
- ✅ ボード表示が正常動作
- ✅ カバレッジ80%以上

---

## Phase 3: A*ソルバー（予定工数: 12時間）

### タスク

#### 3.1 A*アルゴリズム実装
- [ ] テスト作成（Red）：`lib/puzzle/solver.test.ts`
  - 簡単な配置の解テスト
  - Manhattan距離計算テスト
  - 各サイズ（4×4、5×5、6×6）のテスト
  - パフォーマンステスト（時間計測）
- [ ] 実装（Green）：`lib/puzzle/solver.ts`
  - PriorityQueue実装
  - calculateManhattanDistance実装
  - solvePuzzle実装
  - reconstructPath実装
- [ ] リファクタリング（Refactor）
  - パフォーマンス最適化
  - メモリ効率改善

#### 3.2 最適解表示コンポーネント
- [ ] テスト作成（Red）：`components/OptimalSolutionViewer.test.tsx`
- [ ] 実装（Green）：`components/OptimalSolutionViewer.tsx`
- [ ] リファクタリング（Refactor）

### 完了条件
- ✅ A*ソルバーのテストがパス
- ✅ パフォーマンス要件達成：
  - 4×4: < 1秒
  - 5×5: < 5秒
  - 6×6: < 30秒
- ✅ カバレッジ80%以上

---

## Phase 4: ゲームモード・統計（予定工数: 8時間）

### タスク

#### 4.1 タイマー・手数カウンター
- [ ] テスト作成（Red）
  - `components/Timer.test.tsx`
  - `components/MoveCounter.test.tsx`
- [ ] 実装（Green）
  - `components/Timer.tsx`
  - `components/MoveCounter.tsx`
  - `components/GameStats.tsx`
- [ ] リファクタリング（Refactor）

#### 4.2 ゲームモード
- [ ] テスト作成（Red）：`components/GameModeSelector.test.tsx`
- [ ] 実装（Green）
  - `components/GameModeSelector.tsx`
  - フリープレイ・タイムアタック・手数チャレンジ
- [ ] リファクタリング（Refactor）

#### 4.3 IndexedDB統合
- [ ] テスト作成（Red）：`lib/db/operations.test.ts`
  - ゲーム保存テスト
  - ゲーム取得テスト
  - 設定保存テスト
- [ ] 実装（Green）
  - `lib/db/schema.ts`（Dexie.js）
  - `lib/db/operations.ts`
- [ ] リファクタリング（Refactor）

### 完了条件
- ✅ タイマー・手数カウントが正常動作
- ✅ IndexedDB保存・取得が動作
- ✅ カバレッジ80%以上

---

## Phase 5: AI機能（予定工数: 10時間）

### タスク

#### 5.1 AIヒント生成
- [ ] テスト作成（Red）
  - `lib/ai/hintGenerator.test.ts`
  - `app/actions/ai.test.ts`
- [ ] 実装（Green）
  - `lib/ai/hintGenerator.ts`
  - `app/actions/ai.ts`（generateHint）
  - `components/HintButton.tsx`
- [ ] リファクタリング（Refactor）
  - APIキー未設定時のフォールバック
  - エラーハンドリング

#### 5.2 プレイスタイル分析
- [ ] テスト作成（Red）
  - `lib/ai/analyzePlay.test.ts`
- [ ] 実装（Green）
  - `lib/ai/analyzePlay.ts`
  - `app/actions/ai.ts`（analyzePlayStyle）
  - `components/AnalysisReport.tsx`
- [ ] リファクタリング（Refactor）

#### 5.3 APIキー管理
- [ ] テスト作成（Red）：`lib/utils/apiKeyStorage.test.ts`
- [ ] 実装（Green）
  - `lib/utils/apiKeyStorage.ts`
  - `components/SettingsModal.tsx`
- [ ] リファクタリング（Refactor）

### 完了条件
- ✅ AIヒント・分析が動作
- ✅ APIキー管理が動作
- ✅ カバレッジ80%以上

---

## Phase 6: AI画像生成（予定工数: 6時間）

### タスク

#### 6.1 Imagen統合
- [ ] テスト作成（Red）：`app/actions/image.test.ts`
- [ ] 実装（Green）
  - `app/actions/image.ts`（generateImage）
- [ ] リファクタリング（Refactor）
  - エラーハンドリング
  - タイムアウト処理

#### 6.2 画像生成UI
- [ ] テスト作成（Red）：`components/AIImageGenerator.test.tsx`
- [ ] 実装（Green）
  - `components/AIImageGenerator.tsx`
  - プロンプト入力
  - ローディング表示
  - プレビュー
- [ ] リファクタリング（Refactor）

#### 6.3 画像選択統合
- [ ] テスト作成（Red）：`components/ImageSelector.test.tsx`
- [ ] 実装（Green）
  - `components/ImageSelector.tsx`
  - アップロード・AI生成・プリセット選択
- [ ] リファクタリング（Refactor）

### 完了条件
- ✅ AI画像生成が動作
- ✅ 画像選択UIが完成
- ✅ カバレッジ80%以上

---

## Phase 7: UI/UX磨き込み（予定工数: 8時間）

### タスク

#### 7.1 アニメーション
- [ ] Framer Motion導入
- [ ] タイル移動アニメーション実装
- [ ] 完成時アニメーション実装

#### 7.2 効果音
- [ ] テスト作成（Red）：`lib/audio/soundManager.test.ts`
- [ ] 実装（Green）
  - `lib/audio/soundManager.ts`
  - `public/sounds/move.mp3`準備
  - `public/sounds/complete.mp3`準備
- [ ] リファクタリング（Refactor）

#### 7.3 ポップなデザイン適用
- [ ] Tailwind CSSでカラースキーム実装
  - パステルカラー中心
  - 明るく楽しい配色
- [ ] レスポンシブ対応
- [ ] アクセシビリティ改善

### 完了条件
- ✅ アニメーションがスムーズ
- ✅ 効果音が動作
- ✅ デザインがポップで親しみやすい

---

## Phase 8: PWA完成（予定工数: 6時間）

### タスク

#### 8.1 PWA設定
- [ ] next.config.jsにnext-pwa追加
- [ ] manifest.json作成
- [ ] アイコン作成（192×192、512×512）

#### 8.2 Service Worker
- [ ] キャッシュ戦略実装
  - App Shell: Cache First
  - プリセット画像: Precache
  - API: Network First
- [ ] オフライン対応確認

#### 8.3 PWAテスト
- [ ] Lighthouse監査
  - PWAスコア確認
  - パフォーマンススコア90点以上
  - アクセシビリティスコア90点以上
- [ ] インストールテスト

### 完了条件
- ✅ PWAとしてインストール可能
- ✅ オフライン動作確認
- ✅ Lighthouse PWAスコア90点以上

---

## Phase 9: 履歴・統計（予定工数: 6時間）

### タスク

#### 9.1 プレイ履歴表示
- [ ] テスト作成（Red）：`components/HistoryView.test.tsx`
- [ ] 実装（Green）
  - `components/HistoryView.tsx`
  - 履歴一覧表示
  - ソート機能
- [ ] リファクタリング（Refactor）

#### 9.2 統計グラフ
- [ ] 統計データ計算
- [ ] グラフ表示（recharts使用検討）
  - クリアタイム推移
  - 手数推移
  - 難易度別ベスト

### 完了条件
- ✅ 履歴表示が動作
- ✅ 統計グラフが表示
- ✅ カバレッジ80%以上

---

## 最終チェックリスト

### 機能面
- [ ] 画像アップロード・AI生成・プリセットの3つの方法で選択可能
- [ ] 4×4、5×5、6×6のパズルが正しく動作
- [ ] AIヒント・最適解が正確
- [ ] オフラインで基本機能が完全動作

### パフォーマンス
- [ ] タイル移動アニメーション < 300ms
- [ ] 画像アップロード処理 < 1秒
- [ ] AI画像生成 < 10秒
- [ ] AIヒント生成 < 3秒
- [ ] A*最適解計算:
  - 4×4: < 1秒
  - 5×5: < 5秒
  - 6×6: < 30秒
- [ ] Lighthouse スコア 90点以上

### ユーザビリティ
- [ ] 初回訪問から1分以内にプレイ開始可能
- [ ] 画像選択が直感的
- [ ] タイル操作が快適
- [ ] APIキー未設定でも基本機能使用可能

### テスト
- [ ] 全テストパス
- [ ] カバレッジ80%以上
- [ ] E2Eテスト実行・パス

### デプロイ
- [ ] 本番環境デプロイ
- [ ] PWA動作確認
- [ ] Lighthouse監査

---

## 見積もり総工数
- Phase 0: 2時間
- Phase 1: 8時間
- Phase 2: 10時間
- Phase 3: 12時間
- Phase 4: 8時間
- Phase 5: 10時間
- Phase 6: 6時間
- Phase 7: 8時間
- Phase 8: 6時間
- Phase 9: 6時間

**合計**: 76時間（約2週間）

---

## 備考
- 各Phaseは独立して実装・テスト可能
- TDDサイクルを厳守
- リファクタリングは必ずテストが通った状態で実施
- 進捗は実装計画書のチェックボックスで管理
