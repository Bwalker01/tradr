import { useState } from 'react';
import type { CardFilterOverrides } from '@tradr/shared';
import { useAppState, type ListKey } from '../../state/AppStateContext';
import { ConditionSelect, FoilSelect, LanguageSelect } from '../common/OverrideFields';
import styles from './BulkEditBar.module.css';

/** Applies a chosen override to every card currently in the list at once. */
export function BulkEditBar({ list }: { list: ListKey }) {
  const { bulkUpdateOverrides } = useAppState();
  const [pending, setPending] = useState<CardFilterOverrides>({});

  const hasPendingChange = Object.keys(pending).length > 0;

  function apply() {
    if (!hasPendingChange) return;
    bulkUpdateOverrides(list, pending);
    setPending({});
  }

  return (
    <div className={styles.bar}>
      <span className={styles.label}>Bulk edit:</span>

      <ConditionSelect
        value={pending.minCondition}
        onChange={(minCondition) => setPending((prev) => ({ ...prev, minCondition }))}
        unsetLabel="Quality: no change"
        labelPrefix="Quality: "
      />
      <LanguageSelect
        value={pending.languageId}
        onChange={(languageId) => setPending((prev) => ({ ...prev, languageId }))}
        unsetLabel="Language: no change"
        labelPrefix="Language: "
      />
      <FoilSelect
        value={pending.foil}
        onChange={(foil) => setPending((prev) => ({ ...prev, foil }))}
        unsetLabel="Foiling: no change"
        labelPrefix="Foiling: "
      />

      <button type="button" className={styles.applyButton} disabled={!hasPendingChange} onClick={apply}>
        Apply to all cards
      </button>
    </div>
  );
}
