import { useAppState } from '../../state/AppStateContext';
import styles from './SourceBanner.module.css';

/** Tells the user exactly where the current game's prices come from, and what that source can't do. */
export function SourceBanner() {
  const { state } = useAppState();
  const game = state.games.find((g) => g.id === state.defaults.gameId);
  if (!game) return null;

  if (!game.live) {
    return (
      <div className={styles.demo} role="status">
        <span className={styles.dot} aria-hidden />
        <div className={styles.body}>
          <span>{game.name} pricing is simulated — no live data source is wired up for this game yet.</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.live} role="status">
      <span className={styles.dot} aria-hidden />
      <div className={styles.body}>
        <span>Live {game.name} prices via {game.sourceName}.</span>
        {game.limitations.length > 0 ? (
          <ul className={styles.limitations}>
            {game.limitations.map((limitation) => (
              <li key={limitation}>{limitation}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
