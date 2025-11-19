export type PresetCategoryId = 'animals' | 'sea' | 'landscapes'

export interface PresetCategory {
  id: PresetCategoryId
  label: string
  description: string
}

export interface PresetImage {
  id: string
  name: string
  category: PresetCategoryId
  src: string
  accent: string
  description: string
}

export const presetCategories: PresetCategory[] = [
  { id: 'animals', label: '動物', description: 'ペットやかわいい動物たちの写真' },
  { id: 'sea', label: '海の生物', description: '海や水に関連した幻想的な世界' },
  { id: 'landscapes', label: '景色', description: '自然や景観のダイナミックな表情' },
]

export const presetImages: PresetImage[] = [
  {
    id: 'dog-sunshine',
    name: 'Sunny Dog',
    category: 'animals',
    src: '/presets/animals/dog.png',
    accent: '#F6D365',
    description: '明るい日差しの中で遊ぶ子犬のような暖かい雰囲気。',
  },
  {
    id: 'cat-dream',
    name: 'Dreamy Cat',
    category: 'animals',
    src: '/presets/animals/cat.png',
    accent: '#F8A5C2',
    description: 'ふわふわの毛並みと優しい色合いでリラックスできる猫。',
  },
  {
    id: 'panda-hug',
    name: 'Panda Hug',
    category: 'animals',
    src: '/presets/animals/panda.png',
    accent: '#C5D0D9',
    description: 'のんびりしたパンダをイメージした癒やし系デザイン。',
  },
  {
    id: 'dolphin-splash',
    name: 'Dolphin Splash',
    category: 'sea',
    src: '/presets/sea/dolphin.png',
    accent: '#7EC8E3',
    description: '青い海を跳ねるイルカのスピード感を意識した色合い。',
  },
  {
    id: 'jelly-mystic',
    name: 'Mystic Jellyfish',
    category: 'sea',
    src: '/presets/sea/jellyfish.png',
    accent: '#9B89B3',
    description: 'クラゲの神秘的な光をイメージした幻想的なパレット。',
  },
  {
    id: 'coral-garden',
    name: 'Coral Garden',
    category: 'sea',
    src: '/presets/sea/coral.png',
    accent: '#00BFA6',
    description: '珊瑚礁の多彩な色彩を表現した元気な雰囲気。',
  },
  {
    id: 'mountain-breeze',
    name: 'Mountain Breeze',
    category: 'landscapes',
    src: '/presets/landscapes/mountain.png',
    accent: '#9ADBC4',
    description: '澄んだ空気を感じる高原の朝を想起させる配色。',
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    category: 'landscapes',
    src: '/presets/landscapes/sunset.png',
    accent: '#FFB085',
    description: '夕焼けのグラデーションをそのまま閉じ込めたロマンチックなビュー。',
  },
  {
    id: 'aurora-dream',
    name: 'Aurora Dream',
    category: 'landscapes',
    src: '/presets/landscapes/aurora.png',
    accent: '#6C8FF6',
    description: 'オーロラのダンスのように幻想的な夜空。',
  },
]

export function groupPresetImages(): Record<PresetCategoryId, PresetImage[]> {
  const grouped = presetImages.reduce<Record<PresetCategoryId, PresetImage[]>>((acc, image) => {
    if (!acc[image.category]) {
      acc[image.category] = []
    }
    acc[image.category]!.push(image)
    return acc
  }, {} as Record<PresetCategoryId, PresetImage[]>)

  return grouped
}
