import { AppStateProvider, useAppState } from './state/AppStateContext';
import { useListPricing } from './hooks/useListPricing';
import { Header } from './components/Header/Header';
import { SourceBanner } from './components/SourceBanner/SourceBanner';
import { FilterPanel } from './components/FilterPanel/FilterPanel';
import { CardList } from './components/CardList/CardList';
import { TotalsPanel } from './components/Totals/TotalsPanel';
import styles from './App.module.css';

function Calculator() {
  const { state } = useAppState();
  const listA = useListPricing('A');
  const listB = useListPricing('B');

  return (
    <div className={styles.app}>
      <Header />
      <div className={styles.layout}>
        <SourceBanner />
        <FilterPanel />

        {state.mode === 'buy' ? (
          <TotalsPanel mode="buy" listA={listA.result} />
        ) : (
          <TotalsPanel mode="trade" listA={listA.result} listB={listB.result} />
        )}

        <div className={state.mode === 'trade' ? styles.listsTrade : styles.lists}>
          <CardList
            list="A"
            title={state.mode === 'trade' ? 'Your cards' : 'Cards to buy'}
            searchPlaceholder="Search for a card to add…"
            pricing={listA.result}
          />
          {state.mode === 'trade' ? (
            <CardList list="B" title="Their cards" searchPlaceholder="Search for a card to add…" pricing={listB.result} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function App() {
  return (
    <AppStateProvider>
      <Calculator />
    </AppStateProvider>
  );
}
