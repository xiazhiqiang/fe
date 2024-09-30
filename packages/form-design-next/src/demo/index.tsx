import FormEditor, { setStorageKey } from '@/index';
import 'antd/dist/antd.less';
import '@alifd/next/dist/next.css';
import React from 'react';

export const storageKey = 'llm1-formily-schema';
setStorageKey(storageKey);

export default () => {
  return (
    <>
      <FormEditor />
    </>
  );
};
