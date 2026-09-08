import styles from './Hero.module.css'

interface HeroProps {
  eyebrow?: string
  title: string
  lead: string
  /** Optional line naming what the reviewer is looking at, such as the demo catalog size. */
  meta?: string
}

export default function Hero({ eyebrow, title, lead, meta }: HeroProps) {
  return (
    <section className={styles.hero}>
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.lead}>{lead}</p>
      {meta && <div className={styles.meta}>{meta}</div>}
    </section>
  )
}
