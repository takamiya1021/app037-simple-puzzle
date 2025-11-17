import '@testing-library/jest-dom'
import 'jest-canvas-mock'

// Mock fetch for JSDOM environment
global.fetch = jest.fn()

// Polyfill structuredClone for IndexedDB tests
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj: any) => JSON.parse(JSON.stringify(obj))
}
