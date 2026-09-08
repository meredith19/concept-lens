import { describe, expect, it } from 'vitest'

import { mappingStatusLabel, mappingTypeLabel } from './labels.ts'

describe('mapping labels', () => {
  it('uses sentence case rather than the wire enum', () => {
    expect(mappingTypeLabel('SAME_MEANING')).toBe('Same meaning')
    expect(mappingStatusLabel('CONFIRMED')).toBe('Confirmed')
  })
})
