import { useEffect } from 'react';
import { Switch, DatePicker } from '@alifd/next';
import BasicLayout from '@/layout/BasicLayout';
import styles from './index.module.scss';

export default function Popup() {
  return (
    <BasicLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>控制面板</h2>
          <Switch size="small" />
        </div>
        <DatePicker size="small" style={{ width: '100%' }} />
      </div>
    </BasicLayout>
  );
}
