'use server';

/**
 * AI関連のServer Actions
 * ヒント生成とプレイスタイル分析
 */

import { PuzzleState } from '@/lib/puzzle/types';
import { getNextOptimalMove } from '@/lib/ai/hintGenerator';

/**
 * ヒント生成のレスポンス
 */
export interface HintResponse {
  success: boolean;
  hint?: string;
  tileNumber?: number;
  direction?: string;
  error?: string;
}

/**
 * パズルのヒントを生成
 * @param state 現在のパズル状態
 * @returns ヒント情報
 */
export async function generateHint(state: PuzzleState): Promise<HintResponse> {
  try {
    // 次の最適な一手を取得
    const nextMove = getNextOptimalMove(state);

    // 完成状態または解が見つからない場合
    if (!nextMove) {
      return {
        success: false,
        error: 'パズルは既に完成しているか、解が見つかりません。',
      };
    }

    // ヒントメッセージを生成（シンプルな形式）
    const hint = generateHintMessage(nextMove.tileNumber, nextMove.direction);

    return {
      success: true,
      hint,
      tileNumber: nextMove.tileNumber,
      direction: nextMove.direction,
    };
  } catch (error) {
    console.error('Error generating hint:', error);
    return {
      success: false,
      error: 'ヒントの生成中にエラーが発生しました。',
    };
  }
}

/**
 * ヒントメッセージを生成
 * @param tileNumber タイル番号
 * @param direction 移動方向
 * @returns ヒントメッセージ
 */
function generateHintMessage(tileNumber: number, direction: string): string {
  const messages = [
    `タイル${tileNumber}を${direction}に移動してみましょう！`,
    `次は${tileNumber}番のタイルを${direction}へ動かすと良いでしょう。`,
    `${tileNumber}番を${direction}に移動させることで、ゴールに近づきます。`,
    `ヒント: タイル${tileNumber}を${direction}方向へ！`,
  ];

  // ランダムにメッセージを選択
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

/**
 * TODO: AI API統合版（将来の実装用）
 * Gemini APIを使用して自然言語のヒントを生成
 */
/*
export async function generateAIHint(state: PuzzleState): Promise<HintResponse> {
  const nextMove = getNextOptimalMove(state);
  if (!nextMove) {
    return { success: false, error: 'No solution found' };
  }

  // Gemini API呼び出し
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
スライドパズルのヒントを生成してください。

【次の最適な一手】
- タイル番号: ${nextMove.tileNumber}
- 移動方向: ${nextMove.direction}

【指示】
- 50文字程度で簡潔に
- なぜこの移動が良いかを説明
- ポジティブなトーンで
`;

  const result = await model.generateContent(prompt);
  const hint = result.response.text();

  return {
    success: true,
    hint,
    tileNumber: nextMove.tileNumber,
    direction: nextMove.direction,
  };
}
*/
