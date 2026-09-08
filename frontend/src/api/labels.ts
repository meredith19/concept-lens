import type { MappingStatus, MappingType } from './types.ts'

/** Human-readable form of a mapping type. The wire value stays the enum. */
export function mappingTypeLabel(type: MappingType): string {
  switch (type) {
    case 'SAME_MEANING':
      return 'Same meaning'
  }
}

/** Human-readable form of a mapping's review status. */
export function mappingStatusLabel(status: MappingStatus): string {
  switch (status) {
    case 'CONFIRMED':
      return 'Confirmed'
  }
}
