import type { ListPriceResult } from '@tradr/shared';
import { useAppState, type ListKey } from '../../state/AppStateContext';
import { CardSearchInput } from '../CardSearch/CardSearchInput';
import { formatCurrency } from '../../utils/format';
import { BulkEditBar } from './BulkEditBar';
import { CardRow } from './CardRow';
import styles from './CardList.module.css';

interface CardListProps {
  list: ListKey;
  title: string;
  searchPlaceholder: string;
  pricing: ListPriceResult | null;
}

export function CardList({ list, title, searchPlaceholder, pricing }: CardListProps) {
  const { state } = useAppState();
  const entries = state.lists[list];
  const priceById = new Map((pricing?.items ?? []).map((item) => [item.id, item]));

  return (
    <section className={styles.panel} aria-label={title}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h2>{title}</h2>
          <span className={styles.count}>{entries.length} card{entries.length === 1 ? '' : 's'}</span>
        </div>
        <div className={styles.searchArea}>
          <CardSearchInput list={list} placeholder={searchPlaceholder} />
        </div>
      </div>

      {entries.length === 0 ? (
        <p className={styles.empty}>No cards added yet. Search above to add your first card.</p>
      ) : (
        <>
          <BulkEditBar list={list} />
          <div className={styles.columnLabels}>
            <span>Card</span>
            <span>Quality</span>
            <span>Language</span>
            <span>Foiling</span>
            <span>Qty</span>
            <span>Unit</span>
            <span>Total</span>
          </div>
          {entries.map((entry) => (
            <CardRow key={entry.id} list={list} entry={entry} priceResult={priceById.get(entry.id)} />
          ))}
        </>
      )}

      <div className={styles.subtotal}>
        <span>Subtotal</span>
        <span className={styles.subtotalValue}>{formatCurrency(pricing?.total ?? null)}</span>
      </div>
    </section>
  );
}
