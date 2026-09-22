import type { ListPriceResult } from '@tradr/shared';
import { computeTradeDifference } from '@tradr/shared';
import { formatCurrency } from '../../utils/format';
import styles from './TotalsPanel.module.css';

interface BuyTotalsPanelProps {
  mode: 'buy';
  listA: ListPriceResult | null;
}

interface TradeTotalsPanelProps {
  mode: 'trade';
  listA: ListPriceResult | null;
  listB: ListPriceResult | null;
}

type TotalsPanelProps = BuyTotalsPanelProps | TradeTotalsPanelProps;

export function TotalsPanel(props: TotalsPanelProps) {
  if (props.mode === 'buy') {
    return (
      <div className={styles.panel}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Total to buy</span>
          <span className={styles.statValue}>{formatCurrency(props.listA?.total ?? null)}</span>
        </div>
      </div>
    );
  }

  const { listA, listB } = props;
  const diff = listA && listB ? computeTradeDifference(listA, listB) : null;
  const diffClass = diff && diff.difference > 0 ? styles.positive : diff && diff.difference < 0 ? styles.negative : '';

  return (
    <div className={styles.panel}>
      <div className={styles.stat}>
        <span className={styles.statLabel}>Your cards</span>
        <span className={styles.statValue}>{formatCurrency(listA?.total ?? null)}</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.statLabel}>Their cards</span>
        <span className={styles.statValue}>{formatCurrency(listB?.total ?? null)}</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.statLabel}>Difference</span>
        <span className={`${styles.statValue} ${diffClass}`}>
          {diff ? formatCurrency(Math.abs(diff.difference)) : '—'}
        </span>
        <span className={styles.diffHint}>
          {diff && diff.difference > 0
            ? 'You give more value — ask for a top-up'
            : diff && diff.difference < 0
              ? 'You receive more value — offer a top-up'
              : 'Even trade'}
        </span>
      </div>
    </div>
  );
}
