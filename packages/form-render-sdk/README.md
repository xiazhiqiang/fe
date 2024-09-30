# form-render-sdk

基于 formily 抽象的表单渲染 SDK

## Install

```sh
npm i form-render-sdk -S
```

## Usage

```jsx
import FormRender from 'form-render-sdk';
import { Button } from '@alifd/next';
import React, { useEffect, useRef } from 'react';
import CustomComp from 'CustomComp';

const formSchema = {
  form: {
    labelCol: 6,
    wrapperCol: 12,
    layout: 'vertical',
    scope: {
      globalData: {
        fn: () => {
          console.log('jinlaile2222');
        },
      },
    },
  },
  schema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        title: 'Input',
        'x-decorator': 'FormItem',
        'x-component': 'Input',
        'x-validator': [],
        'x-component-props': {},
        'x-decorator-props': {},
        required: true,
      },
      description: {
        type: 'string',
        title: 'TextArea',
        'x-decorator': 'FormItem',
        'x-component': 'Input.TextArea',
        'x-validator': [],
        'x-component-props': {},
        'x-decorator-props': {},
        required: true,
      },
      list: {
        title: 'Select',
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        'x-validator': [],
        'x-component-props': {},
        'x-decorator-props': {},
      },
      custom: {
        title: '111',
        'x-component': 'CustomComp',
        'x-component-props': {
          a: 1,
          b: 2,
        },
      },
    },
  },
};

export default function Demo() {
  const formRef = useRef(null);

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
        customComps={{ CustomComp }}
      />
      <Button
        type="primary"
        onClick={async () => {
          try {
            const ret = await formRef.current.submit();
            console.log('ret', ret);
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
    </div>
  );
}
```

## Development

```bash
# install dependencies
$ tnpm install

# develop library by docs demo
$ tnpm start

# build library source code
$ tnpm run build

# build library source code in watch mode
$ tnpm run build:watch

# build docs
$ tnpm run docs:build

# Locally preview the production build.
$ tnpm run docs:preview

# check your project for potential problems
$ tnpm run doctor
```

## LICENSE

MIT
