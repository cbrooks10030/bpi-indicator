import { describe, expect, it } from 'vitest'
import { ACCEPTED_TYPES, isRenderable } from './attachments'

describe('attachment types', () => {
  it('accepts the phone and desktop image formats', () => {
    for (const extension of ['.heic', '.png', '.jpg', '.webp', '.tiff', '.avif', '.pdf']) {
      expect(ACCEPTED_TYPES).toContain(extension)
    }
  })

  it('thumbnails what the browser can draw and cards the rest', () => {
    expect(isRenderable('image/png', 'chart.png')).toBe(true)
    expect(isRenderable('image/jpeg', 'IMG_0421.JPG')).toBe(true)
    expect(isRenderable('image/heic', 'IMG_0421.HEIC')).toBe(false)
    expect(isRenderable('', 'IMG_0421.heif')).toBe(false)
    expect(isRenderable('application/pdf', 'setup.pdf')).toBe(false)
  })
})
