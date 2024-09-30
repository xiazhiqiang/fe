import { useForm } from '@formily/react';
import React, { useState } from 'react';
import styles from './index.module.scss';

export default function FormCard(props: any) {
  const { children, number, title, hidePathPattern } = props;
  const form = useForm();

  const [checked, setChecked] = useState('normal');

  const changeModel = (type: string) => {
    setChecked(type);
    if (type == 'normal') {
      hidePathPattern.forEach((path: string) => {
        form.setFieldState(path, (state) => {
          state.display = 'hide';
        });
      });
    } else {
      hidePathPattern.forEach((path: string) => {
        form.setFieldState(path, (state) => {
          state.display = 'visible';
        });
      });
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.title}>
        <div className={styles.left}>
          <div className={styles.num}>{number}</div>
          <div className={styles.main}>{title}</div>
        </div>
        <div className={styles.right}>
          {hidePathPattern ? (
            <div className={styles.tab}>
              <div
                onClick={() => changeModel('normal')}
                className={checked == 'normal' ? styles.checked : undefined}
              >
                基础配置
              </div>
              <div
                onClick={() => changeModel('advanced')}
                className={checked == 'advanced' ? styles.checked : undefined}
              >
                高级配置
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  );
}
