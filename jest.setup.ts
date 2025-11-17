import '@testing-library/jest-dom'
import 'jest-canvas-mock'

// Mock fetch for JSDOM environment
global.fetch = jest.fn()
