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
- [x] Jestセットアップ（Red）
  - jest.config.js作成
  - テスト実行確認（失敗することを確認）
- [x] 設定ファイル作成（Green）
  - jest.setup.ts作成
  - Testing Library設定
- [x] サンプルテスト作成（Refactor）
  - 簡単なユニットテスト作成
  - テスト実行確認（成功）

### 完了条件
- ✅ `npm test`でテスト実行可能
- ✅ サンプルテストがパス

---

## Phase 1: 画像処理基盤（予定工数: 8時間）

### タスク

#### 1.1 画像アップロード処理
- [x] テスト作成（Red）：`lib/image/uploader.test.ts`
  - ファイル読み込みテスト
  - 正方形トリミングテスト
  - Base64変換テスト
- [x] 実装（Green）：`lib/image/uploader.ts`
  - FileReader API使用
  - Canvas APIで正方形トリミング
  - Base64変換
- [x] リファクタリング（Refactor）
  - エラーハンドリング追加
  - パフォーマンス最適化

#### 1.2 画像分割処理
- [x] テスト作成（Red）：`lib/image/processor.test.ts`
  - 4×4分割テスト
  - 5×5分割テスト
  - 6×6分割テスト
  - 空きマス位置テスト
- [x] 実装（Green）：`lib/image/processor.ts`
  - Canvas APIで画像分割
  - ImageFragment配列生成
- [x] リファクタリング（Refactor）
  - コード整理
  - 型安全性向上

#### 1.3 プリセット画像準備
- [x] プリセット画像収集・配置
  - `public/presets/animals/` に3〜5枚
  - `public/presets/sea/` に3〜5枚
  - `public/presets/landscapes/` に3〜5枚
- [x] 定義ファイル作成：`lib/image/presets.ts`
  - プリセット画像のメタデータ

### 完了条件
- ✅ 画像アップロード・分割のテストがパス
- ✅ プリセット画像が正しく配置
- ✅ カバレッジ80%以上

---

## Phase 2: パズル基本機能（予定工数: 10時間）

### タスク

#### 2.1 型定義
- [x] `lib/puzzle/types.ts`作成
  - PuzzleState、TileData、Position等の型定義

#### 2.2 パズル生成ロジック
- [x] テスト作成（Red）：`lib/puzzle/generator.test.ts`
  - 完成状態生成テスト
  - シャッフルテスト（必ず解ける配置になるか）
  - サイズ別テスト（4×4、5×5、9×9、10×10の代表値）
- [x] 実装（Green）：`lib/puzzle/generator.ts`
  - createSolvedState実装
  - generatePuzzle実装
  - getValidMoves実装
  - applyMove実装
- [ ] 追加実装: シングルブランクガードを`generator.ts`/`validator.ts`に組み込み、空きマスが複数生成された場合は例外をthrowして再生成
- [x] リファクタリング（Refactor）
  - シャッフル回数調整
  - コード最適化

#### 2.3 移動可否判定
- [x] テスト作成（Red）：`lib/puzzle/validator.test.ts`
  - 移動可能判定テスト
  - 完成判定テスト
  - 不正な移動のテスト
- [x] 実装（Green）：`lib/puzzle/validator.ts`
  - canMove実装
  - isComplete実装
- [x] リファクタリング（Refactor）

#### 2.4 パズルボードコンポーネント
- [x] テスト作成（Red）：`components/PuzzleBoard.test.tsx`
  - ボード表示テスト
  - タイルクリックテスト
- [x] 実装（Green）：
  - `components/PuzzleBoard.tsx`
  - `components/Tile.tsx`
- [x] リファクタリング（Refactor）
  - アクセシビリティ改善

### 完了条件
- ✅ パズル生成・移動のテストがパス
- ✅ ボード表示が正常動作
- ✅ カバレッジ80%以上

---

## Phase 3: A*ソルバー（予定工数: 12時間）

### タスク

#### 3.1 A*アルゴリズム実装
- [x] テスト作成（Red）：`lib/puzzle/solver.test.ts`
  - 簡単な配置の解テスト
  - Manhattan距離計算テスト
  - 各サイズ（4×4、5×5、9×9、10×10）のテスト
  - パフォーマンステスト（時間計測）
- [x] 実装（Green）：`lib/puzzle/solver.ts`
  - PriorityQueue実装
  - calculateManhattanDistance実装
  - solvePuzzle実装
  - reconstructPath実装
- [x] リファクタリング（Refactor）
  - パフォーマンス最適化
  - メモリ効率改善

#### 3.2 最適解表示コンポーネント
- [x] テスト作成（Red）：`components/OptimalSolutionViewer.test.tsx`
- [x] 実装（Green）：`components/OptimalSolutionViewer.tsx`
- [x] リファクタリング（Refactor）

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
- [x] テスト作成（Red）
  - `components/Timer.test.tsx`
  - `components/MoveCounter.test.tsx`
- [x] 実装（Green）
  - `components/Timer.tsx`
  - `components/MoveCounter.tsx`
  - `components/GameStats.tsx`
- [x] リファクタリング（Refactor）

#### 4.2 ゲームモード
- [x] テスト作成（Red）：`components/GameModeSelector.test.tsx`
- [x] 実装（Green）
  - `components/GameModeSelector.tsx`
  - フリープレイ・タイムアタック・手数チャレンジ
- [x] リファクタリング（Refactor）

#### 4.3 IndexedDB統合
- [x] テスト作成（Red）：`lib/db/operations.test.ts`
  - ゲーム保存テスト
  - ゲーム取得テスト
  - 設定保存テスト
- [x] 実装（Green）
  - `lib/db/schema.ts`（Dexie.js）
  - `lib/db/operations.ts`
- [x] リファクタリング（Refactor）

#### 4.4 HUD + カスタムサイズUI（新規）
- [ ] テスト作成（Red）
  - `components/GameModeSelector.test.tsx`にモードチップのスナップショットを追加
  - `components/GameStats.test.tsx`でHUDカードの数値表示を検証
  - `components/CustomSizeSlider.test.tsx`（新規）で4×4〜10×10をカバー
- [ ] 実装（Green）
  - `components/hud/ModeChips.tsx`でタイトル直下のチップを描画
  - `components/hud/StatusHUD.tsx`を追加し、Timer/MoveCounter/サイズを合成
  - `components/hud/CustomSizeSlider.tsx`でスライダーUI + ラベル
- [ ] リファクタリング（Refactor）
  - ストアの`size`/`mode`を書き換える際の副作用を整理
  - HUDをモバイルでは折り返すレイアウトに調整

### 完了条件
- ✅ タイマー・手数カウントが正常動作
- ✅ IndexedDB保存・取得が動作
- ✅ カバレッジ80%以上

---

## Phase 5: AI機能（予定工数: 10時間）

### タスク

#### 5.1 AIヒント生成
- [x] テスト作成（Red）
  - `lib/ai/hintGenerator.test.ts`
  - `app/actions/ai.test.ts`
- [x] 実装（Green）
  - `lib/ai/hintGenerator.ts`
  - `app/actions/ai.ts`（generateHint）
  - `components/HintButton.tsx`
- [x] リファクタリング（Refactor）
  - APIキー未設定時のフォールバック
  - エラーハンドリング

#### 5.2 プレイスタイル分析
- [x] テスト作成（Red）
  - `lib/ai/analyzePlay.test.ts`
- [x] 実装（Green）
  - `lib/ai/analyzePlay.ts`
  - `app/actions/ai.ts`（analyzePlayStyle）
  - `components/AnalysisReport.tsx`
- [x] リファクタリング（Refactor）

#### 5.3 APIキー管理
- [x] テスト作成（Red）：`lib/utils/apiKeyStorage.test.ts`
- [x] 実装（Green）
  - `lib/utils/apiKeyStorage.ts`
  - `components/SettingsModal.tsx`
- [x] リファクタリング（Refactor）

#### 5.4 AI設定UI強化（新規）
- [ ] テスト作成（Red）
  - `components/SettingsModal.test.tsx`でAPIキー検証結果の表示をテスト
  - `components/settings/AISettingsPanel.test.tsx`を新設し、トグル/ヒント上限の状態遷移を確認
- [ ] 実装（Green）
  - `components/settings/AISettingsPanel.tsx`を追加し、Gemini（ヒント）/Gemini 2.5 Flash Image（画像）のキー入力・保存・検証フローを実装
  - `useSettingsStore`に`aiAssistEnabled`/`autoAnalysisEnabled`/`hintLimit`/`lastValidatedAt`等を追加
  - `HintButton`/`AnalysisReport`に設定値を反映してUIを出し分け
- [ ] リファクタリング（Refactor）
  - APIキーの暗号化保存ロジックを`lib/utils/apiKeyStorage.ts`へ集約
  - UIのバリデーションメッセージを共通化

### 完了条件
- ✅ AIヒント・分析が動作
- ✅ APIキー管理が動作
- ✅ カバレッジ80%以上

---

## Phase 6: AI画像生成（予定工数: 6時間）

### タスク

#### 6.1 Gemini 2.5 Flash Image統合
- [x] テスト作成（Red）：`app/actions/image.test.ts`
- [x] 実装（Green）
  - `app/actions/image.ts`（`gemini-2.5-flash-image` 呼び出し）
- [x] リファクタリング（Refactor）
  - エラーハンドリング
  - タイムアウト処理

#### 6.2 画像生成UI
- [x] テスト作成（Red）：`components/AIImageGenerator.test.tsx`
- [x] 実装（Green）
  - `components/AIImageGenerator.tsx`
  - プロンプト入力
  - ローディング表示
  - プレビュー
- [x] リファクタリング（Refactor）

#### 6.3 画像選択統合
- [x] テスト作成（Red）：`components/ImageSelector.test.tsx`
- [x] 実装（Green）
  - `components/ImageSelector.tsx`
  - アップロード・AI生成・プリセット選択
- [x] リファクタリング（Refactor）

### 完了条件
- ✅ AI画像生成が動作
- ✅ 画像選択UIが完成
- ✅ カバレッジ80%以上

---

## Phase 7: UI/UX磨き込み（予定工数: 8時間）

### タスク

#### 7.1 アニメーション
- [x] Framer Motion導入
- [x] タイル移動アニメーション実装
- [x] 完成時アニメーション実装

#### 7.2 効果音
- [x] テスト作成（Red）：`lib/audio/soundManager.test.ts`
- [x] 実装（Green）
  - `lib/audio/soundManager.ts`
  - `public/sounds/move.mp3`準備
  - `public/sounds/complete.mp3`準備
- [x] リファクタリング（Refactor）

#### 7.3 ポップなデザイン適用
- [x] Tailwind CSSでカラースキーム実装
  - パステルカラー中心
  - 明るく楽しい配色
- [x] レスポンシブ対応
- [x] アクセシビリティ改善

#### 7.4 ネオングラデーションUI（モック準拠）
- [ ] `globals.css`に背景グラデーション（#0b1b4f→#6a18ff）を追加
- [ ] `components/AnalysisReport.tsx`とAIパネル群をガラスモーフィズムカード化
- [ ] ボタン配色を「ヒント=ティール」「最適解=オレンジ」で統一
- [ ] `OfflineIndicator`のモーション（fade-in/out + 状態別カラー）をTailwindで表現

### 完了条件
- ✅ アニメーションがスムーズ
- ✅ 効果音が動作
- ✅ デザインがポップで親しみやすい

---

## Phase 8: PWA完成（予定工数: 6時間）

### タスク

#### 8.1 PWA設定
- [x] next.config.jsにnext-pwa追加
- [x] manifest.json作成
- [x] アイコン作成（192×192、512×512）

#### 8.2 Service Worker
- [x] キャッシュ戦略実装
  - App Shell: Cache First
  - プリセット画像: Precache
  - API: Network First
- [x] オフライン対応確認

#### 8.3 オフラインインジケータ
- [ ] `hooks/useOfflineStatus.ts`を追加し、`navigator.onLine`とService Workerの`statechange`を購読
- [ ] `components/hud/OfflineIndicator.tsx`で状態文言（「オフラインで遊べます」等）とカラーを切替
- [ ] QA: オフライン⇔オンライン切替時のアニメーションが1秒以内で完了すること

#### 8.4 クロスプラットフォームアイコン刷新
- [ ] iOS向け180/152/120px PNGを作成し、`public/icons/ios-*`へ配置
- [ ] Android向け192/256/512px PNGとAdaptive Iconのforeground/backgroundを作成
- [ ] Manifestと`next-pwa`設定を更新し、新アイコンを参照
- [ ] QA: iOS Safariの「ホーム画面に追加」とAndroid Chromeでのインストール時サムネイルをスクショ確認

#### 8.5 PWAテスト
- [x] Lighthouse監査
  - PWAスコア確認
  - パフォーマンススコア90点以上
  - アクセシビリティスコア90点以上
- [x] インストールテスト

### 完了条件
- ✅ PWAとしてインストール可能
- ✅ オフライン動作確認
- ✅ Lighthouse PWAスコア90点以上

---

## Phase 9: 履歴・統計（予定工数: 6時間）

### タスク

#### 9.1 プレイ履歴表示
- [x] テスト作成（Red）：`components/HistoryView.test.tsx`
- [x] 実装（Green）
  - `components/HistoryView.tsx`
  - 履歴一覧表示
  - ソート機能
- [x] リファクタリング（Refactor）

#### 9.2 統計グラフ
- [x] 統計データ計算
- [x] グラフ表示（recharts使用検討）
  - クリアタイム推移
  - 手数推移
  - 難易度別ベスト

#### 9.3 プレイスタイルスパークライン（右サイドパネル）
- [ ] `components/charts/PlayStyleChart.tsx`作成
- [ ] HUDのAI参謀パネルに最新3ゲームの効率推移を描画
- [ ] IndexedDBからの履歴読み込みをサマリ化し、詳細ビュー（HistoryView）へリンク

### 完了条件
- ✅ 履歴表示が動作
- ✅ 統計グラフが表示
- ✅ カバレッジ80%以上

---

## 最終チェックリスト

### 機能面
- [ ] 画像アップロード・AI生成・プリセットの3つの方法で選択可能
- [ ] 4×4〜10×10のパズルが正しく動作（UIチップ + カスタムスライダー）
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
  - 9×9: < 60秒
  - 10×10: < 90秒
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
- [ ] **Initialization & Analysis**
    - [x] Read documentation (`doc/requirements.md`, `doc/technical-design.md`, `doc/implementation-plan.md`)
    - [x] Verify `app/actions/image.ts` (Gemini 2.5 Flash Image)
    - [x] Verify `components/AIImageGenerator.tsx`
    - [x] Verify `lib/puzzle/generator.ts` (Single blank logic)

## Phase 4: Core Game UI Enhancements
#### [NEW] [StatusHUD.tsx](file:///home/ustar-wsl-2-2/projects/100apps/app037-simple-puzzle/components/hud/StatusHUD.tsx)
- Combine Timer, MoveCounter, and Size display into a single glassmorphism card.

#### [NEW] [CustomSizeSlider.tsx](file:///home/ustar-wsl-2-2/projects/100apps/app037-simple-puzzle/components/hud/CustomSizeSlider.tsx)
- Slider for selecting puzzle size (4x4 to 10x10).

#### [NEW] [ModeChips.tsx](file:///home/ustar-wsl-2-2/projects/100apps/app037-simple-puzzle/components/hud/ModeChips.tsx)
- Chip-style selector for game modes (Free Play, Time Attack, etc.).

#### [MODIFY] [GameModeSelector.tsx](file:///home/ustar-wsl-2-2/projects/100apps/app037-simple-puzzle/components/GameModeSelector.tsx)
- Refactor to use `ModeChips`.

## Phase 5: AI & Settings
#### [NEW] [settingsStore.ts](file:///home/ustar-wsl-2-2/projects/100apps/app037-simple-puzzle/lib/store/settingsStore.ts)
- Zustand store for AI settings (API keys, toggles, limits).

#### [NEW] [AISettingsPanel.tsx](file:///home/ustar-wsl-2-2/projects/100apps/app037-simple-puzzle/components/settings/AISettingsPanel.tsx)
- UI for entering API keys and configuring AI options.

#### [MODIFY] [SettingsModal.tsx](file:///home/ustar-wsl-2-2/projects/100apps/app037-simple-puzzle/components/SettingsModal.tsx)
- Integrate `AISettingsPanel`.

## Phase 7: UI Polish
#### [MODIFY] [globals.css](file:///home/ustar-wsl-2-2/projects/100apps/app037-simple-puzzle/app/globals.css)
- Apply Neon Gradient theme (#0b1b4f → #6a18ff).

## Phase 8: PWA & Offline
#### [NEW] [useOfflineStatus.ts](file:///home/ustar-wsl-2-2/projects/100apps/app037-simple-puzzle/hooks/useOfflineStatus.ts)
- Hook to track online/offline status.

#### [NEW] [OfflineIndicator.tsx](file:///home/ustar-wsl-2-2/projects/100apps/app037-simple-puzzle/components/hud/OfflineIndicator.tsx)
- Visual indicator for PWA status.

## Phase 9: Analysis
#### [NEW] [PlayStyleChart.tsx](file:///home/ustar-wsl-2-2/projects/100apps/app037-simple-puzzle/components/charts/PlayStyleChart.tsx)
- Sparkline chart for playstyle analysis using Recharts.

## Verification Plan

### Automated Tests
- **Jest**: Run `npm test` to verify logic and component rendering.
    - Create tests for new components: `StatusHUD.test.tsx`, `CustomSizeSlider.test.tsx`, etc.
- **Playwright**: Run `npm run test:e2e` to verify full game flow.

### Manual Verification
- **UI Check**: Verify the "Neon" look and feel.
- **PWA Check**: Test offline mode using Chrome DevTools "Offline" mode.
- **AI Check**: Verify Image Generation and Hint generation (requires API keys).
