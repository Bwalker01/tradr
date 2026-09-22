import type { ListMode } from '@tradr/shared';
import { useAppState } from '../../state/AppStateContext';
import styles from './ModeToggle.module.css';

const MODES: { key: ListMode; label: string }[] = [
  { key: 'buy', label: 'Buy' },
  { key: 'trade', label: 'Trade' },
];

export function ModeToggle() {
  const { state, setMode } = useAppState();

  return (
    <div className={styles.toggle} role="tablist" aria-label="Calculator mode">
      {MODES.map((mode) => (
        <button
          key={mode.key}
          type="button"
          role="tab"
          aria-selected={state.mode === mode.key}
          className={state.mode === mode.key ? styles.optionActive : styles.option}
          onClick={() => setMode(mode.key)}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
