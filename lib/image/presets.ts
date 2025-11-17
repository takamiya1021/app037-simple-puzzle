/**
 * Phase 1: Preset Images (TDD - Green)
 *
 * Defines preset image metadata for puzzle creation
 */

export interface PresetImage {
  id: string
  name: string
  category: 'animals' | 'sea' | 'landscapes'
  path: string
  thumbnail?: string
  description?: string
}

export const PRESET_IMAGES: PresetImage[] = [
  // Animals
  {
    id: 'animal-1',
    name: '猫',
    category: 'animals',
    path: '/presets/animals/cat.jpg',
    description: 'かわいい猫の写真',
  },
  {
    id: 'animal-2',
    name: '犬',
    category: 'animals',
    path: '/presets/animals/dog.jpg',
    description: 'かわいい犬の写真',
  },
  {
    id: 'animal-3',
    name: 'うさぎ',
    category: 'animals',
    path: '/presets/animals/rabbit.jpg',
    description: 'かわいいうさぎの写真',
  },

  // Sea
  {
    id: 'sea-1',
    name: '海',
    category: 'sea',
    path: '/presets/sea/ocean.jpg',
    description: '美しい海の風景',
  },
  {
    id: 'sea-2',
    name: 'サンゴ礁',
    category: 'sea',
    path: '/presets/sea/coral.jpg',
    description: 'カラフルなサンゴ礁',
  },
  {
    id: 'sea-3',
    name: '魚',
    category: 'sea',
    path: '/presets/sea/fish.jpg',
    description: '熱帯魚の写真',
  },

  // Landscapes
  {
    id: 'landscape-1',
    name: '山',
    category: 'landscapes',
    path: '/presets/landscapes/mountain.jpg',
    description: '壮大な山の風景',
  },
  {
    id: 'landscape-2',
    name: '森',
    category: 'landscapes',
    path: '/presets/landscapes/forest.jpg',
    description: '緑豊かな森',
  },
  {
    id: 'landscape-3',
    name: '夕焼け',
    category: 'landscapes',
    path: '/presets/landscapes/sunset.jpg',
    description: '美しい夕焼け',
  },
]

/**
 * Get presets by category
 */
export function getPresetsByCategory(
  category: 'animals' | 'sea' | 'landscapes'
): PresetImage[] {
  return PRESET_IMAGES.filter((preset) => preset.category === category)
}

/**
 * Get preset by ID
 */
export function getPresetById(id: string): PresetImage | undefined {
  return PRESET_IMAGES.find((preset) => preset.id === id)
}
