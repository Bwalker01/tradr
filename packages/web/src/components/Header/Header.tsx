import styles from './Header.module.css';
import { ModeToggle } from '../ModeToggle/ModeToggle';

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <h1 className={styles.title}>tradr</h1>
        <span className={styles.subtitle}>Cardmarket pricing calculator</span>
      </div>
      <ModeToggle />
    </header>
  );
}
