// @ts-nocheck
import FormRender from '@/index';
import { Button } from '@alifd/next';
import '@alifd/next/components.scss';
import { onFormSubmitFailed, onFormSubmitSuccess } from '@formily/core';
import React, { useEffect, useRef, useState } from 'react';
import CustomComp from './components/CustomComp';
import FormCard from './components/FormCard';
import './index.css';
import formSchema from './schema.json';

const globalData = {
  fun: () => {
    console.log('jinlaile2222');
  },
};
(formSchema as any).form.scope = {
  globalData,
};

function Demo() {
  const formRef = useRef<any>(null);
  const [data, setData] = useState({});

  useEffect(() => {
    setTimeout(() => {
      // 初始化表单值
      formRef.current.setValues({
        description: '11111',
      });
    }, 300);
  }, []);

  return (
    <div>
      <FormRender
        ref={formRef}
        formSchema={formSchema}
        createFormEffects={() => {
          onFormSubmitFailed(() => {
            console.log('failed');
          });
          onFormSubmitSuccess(() => {
            console.log('success');
          });
        }}
        customComps={{
          FormCard,
          CustomComp,
        }}
      />
      <Button
        type="primary"
        onClick={async () => {
          try {
            const ret = await formRef.current.submit();
            console.log('ret', ret);

            setData(ret);
          } catch (err) {
            console.log('err', err);
          }
        }}
      >
        确定
      </Button>
      <Button
        type="secondary"
        onClick={() => {
          formRef.current.reset();
        }}
      >
        重置
      </Button>
      <h2>结果：</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default Demo;
