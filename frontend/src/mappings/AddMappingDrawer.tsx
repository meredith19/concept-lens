import Drawer from '../components/Drawer.tsx'
import styles from './AddMappingDrawer.module.css'

interface AddMappingDrawerProps {
  open: boolean
  onClose: () => void
  onSave: () => void
}

/**
 * The mock's form is a static illustration: the fields are prefilled and Save only confirms.
 * Wiring it to the backend is deliberately left for later.
 */
export default function AddMappingDrawer({ open, onClose, onSave }: AddMappingDrawerProps) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      eyebrow="CREATE RELATIONSHIP"
      title="Add relationship"
      lead="Relate independently owned facts without modifying either source model."
    >
      <div className={styles.group}>
        <label htmlFor="sourceSystem">SOURCE SYSTEM</label>
        <select id="sourceSystem" defaultValue="Returns">
          <option>Returns</option>
          <option>Fulfillment</option>
          <option>Orders</option>
        </select>
      </div>

      <div className={styles.group}>
        <label htmlFor="sourceFact">SOURCE FACT</label>
        <input id="sourceFact" defaultValue="valid_return_path" />
      </div>

      <div className={styles.group}>
        <label htmlFor="relationship">RELATIONSHIP</label>
        <select id="relationship" defaultValue="Same meaning">
          <option>Same meaning</option>
          <option>Implies</option>
        </select>
      </div>

      <div className={styles.group}>
        <label htmlFor="targetSystem">TARGET SYSTEM</label>
        <select id="targetSystem" defaultValue="Payments">
          <option>Payments</option>
          <option>Delivery</option>
        </select>
      </div>

      <div className={styles.group}>
        <label htmlFor="targetFact">TARGET FACT</label>
        <input id="targetFact" defaultValue="refund_path_available" />
      </div>

      <div className={styles.group}>
        <label htmlFor="evidence">EVIDENCE / NOTE</label>
        <textarea
          id="evidence"
          defaultValue="These facts both mean that a valid path exists to reverse the purchase in their respective domains."
        />
      </div>

      <div className={styles.actions}>
        <button className="secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="primary" onClick={onSave}>
          Save mapping
        </button>
      </div>
    </Drawer>
  )
}
