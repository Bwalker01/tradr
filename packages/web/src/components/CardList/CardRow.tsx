import type { CardEntry, CardPriceResult } from '@tradr/shared';
import { NumberInput } from '../common/NumberInput';
import { ConditionSelect, FoilSelect, LanguageSelect } from '../common/OverrideFields';
import { formatCurrency } from '../../utils/format';
import { useAppState, type ListKey } from '../../state/AppStateContext';
import styles from './CardRow.module.css';

interface CardRowProps {
  list: ListKey;
  entry: CardEntry;
  priceResult: CardPriceResult | undefined;
}

export function CardRow({ list, entry, priceResult }: CardRowProps) {
  const { updateQuantity, updateOverrides, removeCard } = useAppState();

  return (
    <div className={styles.row}>
      <div className={styles.name}>
        <span className={styles.nameText} title={entry.product.name}>
          {entry.product.name}
        </span>
        {entry.product.setName ? <span className={styles.setText}>{entry.product.setName}</span> : null}
        {priceResult?.warning ? <span className={`${styles.setText} ${styles.warning}`}>{priceResult.warning}</span> : null}
      </div>

      <ConditionSelect
        value={entry.overrides.minCondition}
        onChange={(minCondition) => updateOverrides(list, entry.id, { minCondition })}
        unsetLabel="Default quality"
      />
      <LanguageSelect
        value={entry.overrides.languageId}
        onChange={(languageId) => updateOverrides(list, entry.id, { languageId })}
        unsetLabel="Default language"
      />
      <FoilSelect
        value={entry.overrides.foil}
        onChange={(foil) => updateOverrides(list, entry.id, { foil })}
        unsetLabel="Default foiling"
      />

      <div className={styles.qty}>
        <NumberInput value={entry.quantity} onChange={(quantity) => updateQuantity(list, entry.id, quantity)} />
      </div>

      <span className={styles.price}>{formatCurrency(priceResult?.unitPrice ?? null)}</span>
      <span className={styles.lineTotal}>{formatCurrency(priceResult?.lineTotal ?? null)}</span>

      <button
        type="button"
        className={styles.remove}
        aria-label={`Remove ${entry.product.name}`}
        onClick={() => removeCard(list, entry.id)}
      >
        ×
      </button>
    </div>
  );
}
