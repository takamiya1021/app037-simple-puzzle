'use server';

/**
 * AI関連のServer Actions
 * ヒント生成とプレイスタイル分析
 */

import { PuzzleState, PuzzleGame } from '@/lib/puzzle/types';
import { getNextOptimalMove } from '@/lib/ai/hintGenerator';
import { analyzePlayStyle, PlayStyleAnalysis } from '@/lib/ai/analyzePlay';

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
 * プレイスタイル分析のレスポンス
 */
export interface AnalysisResponse {
  success: boolean;
  analysis?: PlayStyleAnalysis;
  advice?: string;
  error?: string;
}

/**
 * プレイスタイルを分析してアドバイスを生成
 * @param game ゲームデータ
 * @param optimalMoves 最適手数
 * @returns 分析結果とアドバイス
 */
export async function analyzeGamePlayStyle(
  game: PuzzleGame,
  optimalMoves: number
): Promise<AnalysisResponse> {
  try {
    // プレイスタイルを分析
    const analysis = analyzePlayStyle(game, optimalMoves);

    // アドバイスメッセージを生成
    const advice = generateAdviceMessage(analysis, game);

    return {
      success: true,
      analysis,
      advice,
    };
  } catch (error) {
    console.error('Error analyzing play style:', error);
    return {
      success: false,
      error: '分析中にエラーが発生しました。',
    };
  }
}

/**
 * 分析結果に基づいてアドバイスメッセージを生成
 * @param analysis プレイスタイル分析結果
 * @param game ゲームデータ
 * @returns アドバイスメッセージ
 */
function generateAdviceMessage(
  analysis: PlayStyleAnalysis,
  game: PuzzleGame
): string {
  const { efficiency, rank, movePatterns, hintsUsed } = analysis;

  let advice = '';

  // ランクに基づいたメッセージ
  if (rank === 'S') {
    advice += 'お見事です！完璧なプレイでした。\n';
  } else if (rank === 'A') {
    advice += '素晴らしいプレイです！かなり効率的に解けました。\n';
  } else if (rank === 'B') {
    advice += '良いプレイです！まずまずの効率で解けました。\n';
  } else if (rank === 'C') {
    advice += 'もう少しです！効率を意識すると更に良くなります。\n';
  } else {
    advice += 'クリアできました！次はもっと少ない手数を目指しましょう。\n';
  }

  // 効率性に基づいたアドバイス
  if (efficiency < 50) {
    advice += '\n【改善ポイント】\n';
    advice += '・無駄な移動を減らすことを意識しましょう\n';
    advice += '・数手先の展開を考えてから動かすと効果的です\n';
  } else if (efficiency < 75) {
    advice += '\n【アドバイス】\n';
    advice += '・移動前に最終的な配置をイメージすると更に効率的です\n';
  }

  // 移動パターンに基づいたアドバイス
  if (movePatterns.mostFrequent) {
    const directionNames = {
      up: '上',
      down: '下',
      left: '左',
      right: '右',
    };
    advice += `・${directionNames[movePatterns.mostFrequent]}方向への移動が多めでした。バランスよく動かすと良いでしょう\n`;
  }

  // ヒント使用に関するアドバイス
  if (hintsUsed === 0 && efficiency >= 75) {
    advice += '\nヒントなしでクリア！素晴らしいです！';
  } else if (hintsUsed > 0) {
    advice += `\nヒントを${hintsUsed}回使用しました。次は自力でチャレンジしてみましょう！`;
  }

  return advice;
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
