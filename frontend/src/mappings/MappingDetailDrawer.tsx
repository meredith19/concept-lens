import Drawer from '../components/Drawer.tsx'
import styles from './MappingDetailDrawer.module.css'

const SOURCE_FACT = {
  owner: 'RETURNS · RETURNABLE',
  native: 'valid_return_path',
  description: 'A valid path exists for returning the item.',
}

const TARGET_FACT = {
  owner: 'PAYMENTS · REFUNDABLE',
  native: 'refund_path_available',
  description: 'A valid path exists for refunding the purchase.',
}

const DETAILS = [
  { label: 'RELATIONSHIP', value: 'Same meaning' },
  { label: 'STATUS', value: 'Confirmed' },
  { label: 'REVIEWED BY', value: 'Domain reviewer' },
  { label: 'RELATION ID', value: 'rel_018' },
]

interface MappingDetailDrawerProps {
  open: boolean
  onClose: () => void
}

/** Shows the mock's single worked example; the backend will supply real mappings later. */
export default function MappingDetailDrawer({ open, onClose }: MappingDetailDrawerProps) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      eyebrow="TRACE THE REASONING"
      title="Why is this shared?"
      lead="The source systems keep their own concepts and vocabulary. Concept Lens stores a separate, provenance-bearing relationship between their facts."
    >
      {[SOURCE_FACT, null, TARGET_FACT].map((fact, index) =>
        fact ? (
          <div key={fact.native} className={styles.factCard}>
            <div className={styles.owner}>{fact.owner}</div>
            <div className={styles.native}>{fact.native}</div>
            <div className={styles.description}>{fact.description}</div>
          </div>
        ) : (
          <div key={index} className={styles.equals}>
            ≡
          </div>
        ),
      )}

      <div className={styles.details}>
        {DETAILS.map((detail) => (
          <div key={detail.label}>
            <small>{detail.label}</small>
            <b>{detail.value}</b>
          </div>
        ))}
      </div>
    </Drawer>
  )
}
