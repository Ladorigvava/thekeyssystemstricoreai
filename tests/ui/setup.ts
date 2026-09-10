import { vi } from 'vitest'
import { configure } from '@testing-library/react'
configure({
  getElementError: (message, container) =>
    new Error(
      `${message}\nVisible text: ${container.textContent?.slice(-3000)}`,
    ),
})
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn((query) => ({
    matches: query.includes('reduced-motion'),
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
  })),
})
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { value() {} })
Object.defineProperty(HTMLElement.prototype, 'hasPointerCapture', {
  value() {
    return false
  },
})
Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
  value() {},
})
Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', {
  value() {},
})
vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
)
