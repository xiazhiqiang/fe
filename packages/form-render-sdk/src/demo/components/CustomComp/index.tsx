import { SchemaOptionsContext } from '@formily/react';
import React, { useContext } from 'react';
import styles from './index.module.scss';

/**
 * 扩展表单组件实现
 * @param props
 * @returns
 */
export default function CustomComp(props: any) {
  // console.log('custom ext', props);
  // 获取 SchemaField options context 中透传的参数
  const fieldContext: any = useContext(SchemaOptionsContext) || {};

  console.log('fieldContent data', fieldContext);

  return (
    <div className={styles.container}>
      <p>组件value：{JSON.stringify(props.value)}</p>
      <select
        onChange={(e) => {
          props.onChange({ v: e.target.value });
        }}
      >
        <option value="_1">_1</option>
        <option value="_2">_2</option>
      </select>
    </div>
  );
}
