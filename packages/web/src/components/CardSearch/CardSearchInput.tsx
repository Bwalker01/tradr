import { useEffect, useState } from 'react';
import type { ProductSummary, CardFilterOverrides } from '@tradr/shared';
import { searchCards } from '../../api/client';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useAppState, type ListKey } from '../../state/AppStateContext';
import { ConditionSelect, FoilSelect, LanguageSelect } from '../common/OverrideFields';
import styles from './CardSearchInput.module.css';

interface CardSearchInputProps {
  list: ListKey;
  placeholder: string;
}

/**
 * Add-card search box with an inline "quick override" strip: any override
 * chosen here becomes the default applied to every card added next, so
 * users can batch-add e.g. a run of foil cards without editing each row.
 */
export function CardSearchInput({ list, placeholder }: CardSearchInputProps) {
  const { state, addCard } = useAppState();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductSummary[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [quickOverrides, setQuickOverrides] = useState<CardFilterOverrides>({});
  const debouncedQuery = useDebouncedValue(query, 250);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    searchCards(debouncedQuery, state.defaults.gameId)
      .then(({ results: found }) => {
        if (!cancelled) setResults(found);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, state.defaults.gameId]);

  function handleSelect(product: ProductSummary) {
    addCard(list, product, quickOverrides);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.searchRow}>
        <input
          className={styles.input}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        />
      </div>

      {isOpen && debouncedQuery.trim().length >= 2 ? (
        <div className={styles.results}>
          {results.length === 0 ? (
            <div className={styles.empty}>No matching cards found.</div>
          ) : (
            results.map((product) => (
              <button
                key={product.productId}
                type="button"
                className={styles.resultItem}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(product)}
              >
                <span className={styles.resultName}>{product.name}</span>
                {product.setName ? <span className={styles.resultSet}>{product.setName}</span> : null}
              </button>
            ))
          )}
        </div>
      ) : null}

      <div className={styles.quickOverrides}>
        <span className={styles.quickLabel}>New cards use:</span>
        <ConditionSelect
          value={quickOverrides.minCondition}
          onChange={(minCondition) => setQuickOverrides((prev) => ({ ...prev, minCondition }))}
          unsetLabel="Default quality"
        />
        <LanguageSelect
          value={quickOverrides.languageId}
          onChange={(languageId) => setQuickOverrides((prev) => ({ ...prev, languageId }))}
          unsetLabel="Default language"
        />
        <FoilSelect
          value={quickOverrides.foil}
          onChange={(foil) => setQuickOverrides((prev) => ({ ...prev, foil }))}
          unsetLabel="Default foiling"
        />
      </div>
    </div>
  );
}
