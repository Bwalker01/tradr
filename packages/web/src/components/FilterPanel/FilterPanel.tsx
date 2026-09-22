import { useEffect, useState } from 'react';
import { CONDITIONS, LANGUAGES, PRICING_METHODS, SELLER_COUNTRIES } from '@tradr/shared';
import { fetchGames, type GameOption } from '../../api/client';
import { useAppState } from '../../state/AppStateContext';
import { Select } from '../common/Select';
import { Toggle } from '../common/Toggle';
import styles from './FilterPanel.module.css';

const ANY_COUNTRY = '__any__';

export function FilterPanel() {
  const { state, setDefaults } = useAppState();
  const { defaults } = state;
  const [games, setGames] = useState<GameOption[]>([]);

  useEffect(() => {
    fetchGames()
      .then(({ games: fetched }) => setGames(fetched))
      .catch(() => setGames([]));
  }, []);

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
        <Select
          label="Seller location"
          value={defaults.sellerCountry ?? ANY_COUNTRY}
          options={[
            { value: ANY_COUNTRY, label: 'Any country' },
            ...SELLER_COUNTRIES.map((c) => ({ value: c.code, label: c.label })),
          ]}
          onChange={(value) => setDefaults({ sellerCountry: value === ANY_COUNTRY ? null : value })}
        />
        <Select
          label="Pricing basis"
          value={defaults.pricingMethod}
          options={PRICING_METHODS.map((m) => ({ value: m.id, label: m.label }))}
          onChange={(pricingMethod) => setDefaults({ pricingMethod })}
        />
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
