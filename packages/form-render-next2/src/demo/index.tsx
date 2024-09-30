import React from 'react';
import { createForm } from '@formily/core';
import { FormButtonGroup, Reset, Submit } from '@formily/next';
import { FormProvider } from '@formily/react';
import SchemaFormRender from '@/index';
import { form as layout, schema } from './schema.json';
import '@alifd/next/components.scss';
import './index.css';

const form = createForm();

export default function () {
  return (
    <>
      <FormProvider form={form}>
        <SchemaFormRender schema={schema} layout={layout} />
        <FormButtonGroup className="actions">
          <Submit size="large" onSubmit={(v) => console.log('submit', v)}>
            确认
          </Submit>
          <Reset type="secondary" size="large" onReset={() => form.reset()}>
            重置
          </Reset>
        </FormButtonGroup>
      </FormProvider>
    </>
  );
}
