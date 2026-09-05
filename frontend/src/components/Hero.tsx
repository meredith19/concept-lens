import styles from './Hero.module.css'

interface HeroProps {
  eyebrow: string
  title: string
  lead: string
}

export default function Hero({ eyebrow, title, lead }: HeroProps) {
  return (
    <section className={styles.hero}>
      <div className="eyebrow">{eyebrow}</div>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.lead}>{lead}</p>
    </section>
  )
}
