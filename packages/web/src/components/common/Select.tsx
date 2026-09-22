import styles from './FormControls.module.css';

export interface SelectOption<T extends string | number> {
  value: T;
  label: string;
}

interface SelectProps<T extends string | number> {
  label?: string;
  value: T;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function Select<T extends string | number>({
  label,
  value,
  options,
  onChange,
  disabled,
  compact,
}: SelectProps<T>) {
  const isNumeric = typeof value === 'number';

  return (
    <label className={compact ? styles.fieldCompact : styles.field}>
      {label ? <span className={styles.fieldLabel}>{label}</span> : null}
      <select
        className={styles.select}
        value={value}
        disabled={disabled}
        onChange={(event) => {
          const raw = event.target.value;
          onChange((isNumeric ? Number(raw) : raw) as T);
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
