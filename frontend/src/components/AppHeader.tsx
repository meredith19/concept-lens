import { NavLink } from 'react-router'

import styles from './AppHeader.module.css'

const LINKS = [
  { to: '/compare', label: 'Compare' },
  { to: '/mappings', label: 'Mappings' },
]

interface AppHeaderProps {
  onReset: () => void
}

export default function AppHeader({ onReset }: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>Concept Lens</div>
      <nav className={styles.nav}>
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
          >
            {link.label}
          </NavLink>
        ))}
        <button className={styles.reset} onClick={onReset}>
          Reset demo data
        </button>
      </nav>
    </header>
  )
}
