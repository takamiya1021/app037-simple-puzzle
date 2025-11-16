/**
 * セットアップ確認用テスト
 * テスト環境が正しく動作することを確認する
 */

describe('テスト環境セットアップ', () => {
  it('Jestが正常に動作すること', () => {
    expect(true).toBe(true);
  });

  it('数値の計算が正しいこと', () => {
    expect(1 + 1).toBe(2);
  });

  it('文字列の比較が正しいこと', () => {
    expect('hello').toBe('hello');
  });

  it('配列の要素チェックが正しいこと', () => {
    const arr = [1, 2, 3];
    expect(arr).toContain(2);
    expect(arr.length).toBe(3);
  });

  it('オブジェクトの比較が正しいこと', () => {
    const obj = { name: 'test', value: 42 };
    expect(obj).toHaveProperty('name');
    expect(obj.name).toBe('test');
    expect(obj.value).toBe(42);
  });
});
