import styles from './FormControls.module.css';

interface NumberInputProps {
  label?: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export function NumberInput({ label, value, min = 1, max = 999, onChange }: NumberInputProps) {
  return (
    <label className={styles.fieldCompact}>
      {label ? <span className={styles.fieldLabel}>{label}</span> : null}
      <input
        type="number"
        className={styles.numberInput}
        value={value}
        min={min}
        max={max}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (Number.isFinite(next)) onChange(Math.min(max, Math.max(min, next)));
        }}
      />
    </label>
  );
}
