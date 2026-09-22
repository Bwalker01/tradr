import { useEffect, useState } from 'react';
import type { AppMeta } from '@tradr/shared';
import { fetchMeta } from '../../api/client';
import styles from './DemoModeBanner.module.css';

export function DemoModeBanner() {
  const [meta, setMeta] = useState<AppMeta | null>(null);

  useEffect(() => {
    fetchMeta()
      .then(setMeta)
      .catch(() => setMeta(null));
  }, []);

  if (!meta || meta.mode !== 'demo') return null;

  return (
    <div className={styles.banner} role="status">
      <span className={styles.dot} aria-hidden />
      <span>{meta.message}</span>
    </div>
  );
}
