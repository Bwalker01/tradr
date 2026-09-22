import { useEffect } from 'react';
import { CONDITIONS, LANGUAGES, PRICING_METHODS, SELLER_COUNTRIES } from '@tradr/shared';
import { useAppState } from '../../state/AppStateContext';
import { Select } from '../common/Select';
import { Toggle } from '../common/Toggle';
import styles from './FilterPanel.module.css';

const ANY_COUNTRY = '__any__';

export function FilterPanel() {
  const { state, setDefaults } = useAppState();
  const { defaults, games } = state;
  const currentGame = games.find((g) => g.id === defaults.gameId);
  const isLive = currentGame?.live ?? false;

  // Live sources only expose a single aggregate market price with no
  // per-listing seller data, so those filters have nothing to apply to.
  useEffect(() => {
    if (!isLive) return;
    if (defaults.pricingMethod !== 'lowest' || defaults.sellerCountry !== null) {
      setDefaults({ pricingMethod: 'lowest', sellerCountry: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive]);

  return (
    <section className={styles.panel} aria-label="Default filters">
      <div className={styles.heading}>
        <h2>Default filters</h2>
        <span className={styles.hint}>Applied to every card unless overridden</span>
      </div>

      <div className={styles.grid}>
        <Select
          label="Game"
          value={defaults.gameId}
          options={games.map((g) => ({ value: g.id, label: g.name }))}
          onChange={(gameId) => setDefaults({ gameId })}
        />
        <Select
          label="Minimum quality"
          value={defaults.minCondition}
          options={CONDITIONS.map((c) => ({ value: c.code, label: c.label }))}
          onChange={(minCondition) => setDefaults({ minCondition })}
        />
        <Select
          label="Language"
          value={defaults.languageId}
          options={LANGUAGES.map((l) => ({ value: l.id, label: l.label }))}
          onChange={(languageId) => setDefaults({ languageId })}
        />
        <div title={isLive ? `Not available — ${currentGame?.sourceName} doesn't expose seller-level data.` : undefined}>
          <Select
            label="Seller location"
            value={defaults.sellerCountry ?? ANY_COUNTRY}
            disabled={isLive}
            options={[
              { value: ANY_COUNTRY, label: 'Any country' },
              ...SELLER_COUNTRIES.map((c) => ({ value: c.code, label: c.label })),
            ]}
            onChange={(value) => setDefaults({ sellerCountry: value === ANY_COUNTRY ? null : value })}
          />
        </div>
        <div title={isLive ? `${currentGame?.sourceName} provides a single market price only.` : undefined}>
          <Select
            label="Pricing basis"
            value={defaults.pricingMethod}
            disabled={isLive}
            options={
              isLive
                ? [{ value: 'lowest' as const, label: `${currentGame?.sourceName} market price` }]
                : PRICING_METHODS.map((m) => ({ value: m.id, label: m.label }))
            }
            onChange={(pricingMethod) => setDefaults({ pricingMethod })}
          />
        </div>
      </div>

      <div className={styles.toggles}>
        <Toggle label="Foil" checked={defaults.foil} onChange={(foil) => setDefaults({ foil })} />
        <Toggle label="Signed" checked={defaults.signed} onChange={(signed) => setDefaults({ signed })} />
        <Toggle label="Altered" checked={defaults.altered} onChange={(altered) => setDefaults({ altered })} />
        <Toggle label="Playset (4x)" checked={defaults.playset} onChange={(playset) => setDefaults({ playset })} />
      </div>
    </section>
  );
}
