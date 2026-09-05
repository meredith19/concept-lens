import { useState } from 'react'

import Hero from '../components/Hero.tsx'
import Toast from '../components/Toast.tsx'
import { useToast } from '../components/useToast.ts'
import { DEMO_MAPPINGS, MAPPING_WITH_DETAIL } from '../domain/mappings.ts'
import AddMappingDrawer from './AddMappingDrawer.tsx'
import MappingDetailDrawer from './MappingDetailDrawer.tsx'
import MappingRow from './MappingRow.tsx'
import styles from './MappingsPage.module.css'

const DETAIL_ONLY_IN_MOCK = 'Mapping detail is represented by the first example in this mock.'

export default function MappingsPage() {
  const [mappings, setMappings] = useState(DEMO_MAPPINGS)
  const [filter, setFilter] = useState('')
  const [detailOpen, setDetailOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const { message, showToast } = useToast()

  const query = filter.trim().toLowerCase()
  const visible = query ? mappings.filter((mapping) => mapping.search.includes(query)) : mappings

  const handleView = (id: string) => {
    if (id === MAPPING_WITH_DETAIL) {
      setDetailOpen(true)
    } else {
      showToast(DETAIL_ONLY_IN_MOCK)
    }
  }

  const handleRemove = (id: string) => {
    if (!window.confirm('Remove this mapping? Comparisons will no longer use it.')) {
      return
    }
    setMappings((current) => current.filter((mapping) => mapping.id !== id))
    showToast('Mapping removed')
  }

  const handleSave = () => {
    setAddOpen(false)
    showToast('Mapping saved as Confirmed · Domain reviewer')
  }

  return (
    <main>
      <Hero
        eyebrow="RELATIONSHIPS ACROSS SYSTEMS"
        title="Mappings"
        lead="Keep concepts independently owned. Make their relationships explicit without forcing source systems into one canonical vocabulary."
      />

      <section className="selector-card">
        <div className="selector-title">Mappings</div>
        <div className={styles.toolbar}>
          <input
            placeholder="Filter mappings…"
            aria-label="Filter mappings"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
          <button className="primary" onClick={() => setAddOpen(true)}>
            + Add mapping
          </button>
        </div>

        <div className={styles.list}>
          {visible.map((mapping) => (
            <MappingRow
              key={mapping.id}
              mapping={mapping}
              onView={() => handleView(mapping.id)}
              onRemove={() => handleRemove(mapping.id)}
            />
          ))}
        </div>
      </section>

      <MappingDetailDrawer open={detailOpen} onClose={() => setDetailOpen(false)} />
      <AddMappingDrawer
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleSave}
      />
      <Toast message={message} />
    </main>
  )
}
