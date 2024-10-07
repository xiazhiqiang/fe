import { useEffect } from 'react';
import { Button } from '@alifd/next';
import styles from './index.module.css';

export default function SidePanel() {
  return (
    <div className={styles.app}>
      <h1>All sites sidePanel extension</h1>
      <p>This side panel is enabled on all sites</p>
    </div>
  );
}
