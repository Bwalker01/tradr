import type { ConditionCode } from '@tradr/shared';
import { CONDITIONS, LANGUAGES } from '@tradr/shared';
import styles from './OverrideFields.module.css';

const UNSET = '__unset__';

/**
 * The three per-card override selects (quality / language / foiling) share
 * this "value or inherit default" shape in three places — the add-card quick
 * defaults, each card row, and the bulk-edit bar — so the option lists and
 * sentinel handling live here once.
 */

interface ConditionSelectProps {
  value: ConditionCode | undefined;
  onChange: (value: ConditionCode | undefined) => void;
  unsetLabel: string;
  labelPrefix?: string;
}

export function ConditionSelect({ value, onChange, unsetLabel, labelPrefix }: ConditionSelectProps) {
  return (
    <select
      className={styles.select}
      data-overridden={value !== undefined}
      value={value ?? UNSET}
      onChange={(event) => onChange(event.target.value === UNSET ? undefined : (event.target.value as ConditionCode))}
    >
      <option value={UNSET}>{unsetLabel}</option>
      {CONDITIONS.map((c) => (
        <option key={c.code} value={c.code}>
          {labelPrefix}
          {c.label}
        </option>
      ))}
    </select>
  );
}

interface LanguageSelectProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  unsetLabel: string;
  labelPrefix?: string;
}

export function LanguageSelect({ value, onChange, unsetLabel, labelPrefix }: LanguageSelectProps) {
  return (
    <select
      className={styles.select}
      data-overridden={value !== undefined}
      value={value ?? UNSET}
      onChange={(event) => onChange(event.target.value === UNSET ? undefined : Number(event.target.value))}
    >
      <option value={UNSET}>{unsetLabel}</option>
      {LANGUAGES.map((l) => (
        <option key={l.id} value={l.id}>
          {labelPrefix}
          {l.label}
        </option>
      ))}
    </select>
  );
}

interface FoilSelectProps {
  value: boolean | undefined;
  onChange: (value: boolean | undefined) => void;
  unsetLabel: string;
  labelPrefix?: string;
}

export function FoilSelect({ value, onChange, unsetLabel, labelPrefix = '' }: FoilSelectProps) {
  return (
    <select
      className={styles.select}
      data-overridden={value !== undefined}
      value={value === undefined ? UNSET : String(value)}
      onChange={(event) => onChange(event.target.value === UNSET ? undefined : event.target.value === 'true')}
    >
      <option value={UNSET}>{unsetLabel}</option>
      <option value="false">{labelPrefix}Non-foil</option>
      <option value="true">{labelPrefix}Foil</option>
    </select>
  );
}
