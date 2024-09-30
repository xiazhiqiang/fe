import { FormLayout } from '@formily/next';
import { createSchemaField, FormProvider } from '@formily/react';
import React, { forwardRef, useImperativeHandle } from 'react';
import { useFormRender } from './hooks';

export default forwardRef((props: IFormRenderProps, ref) => {
  const { form, schema, layout = {}, fieldComps } = useFormRender(props);

  // 通过ref对外暴露的方法
  useImperativeHandle(ref, () => form, [form]);

  if (!form || !schema) {
    return null;
  }

  const SchemaField = createSchemaField({
    components: fieldComps,
    scope: layout?.scope || {},
  });

  return (
    <FormProvider form={form}>
      <FormLayout {...layout}>
        <SchemaField schema={schema} scope={layout?.scope || {}} />
      </FormLayout>
    </FormProvider>
  );
});
