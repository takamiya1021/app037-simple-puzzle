import { describe, expect, it } from '@jest/globals'
import { groupPresetImages, presetCategories, presetImages } from './presets'

describe('preset image definitions', () => {
  it('provides at least three images per category', () => {
    const groups = groupPresetImages()
    Object.entries(groups).forEach(([category, items]) => {
      expect(items.length).toBeGreaterThanOrEqual(3)
      items.forEach((item) => {
        expect(item.src).toMatch(new RegExp(`/presets/${category}/`))
      })
    })
  })

  it('matches categories and metadata definitions', () => {
    const categoryIds = new Set(presetCategories.map((category) => category.id))
    presetImages.forEach((image) => {
      expect(categoryIds.has(image.category)).toBe(true)
      expect(image.name).toBeTruthy()
    })
  })
})
