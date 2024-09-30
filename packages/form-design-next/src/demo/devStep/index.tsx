import React from 'react';
import { Steps, Button, message } from 'antd';
import copy from 'copy-to-clipboard';
import CodeEditor from '../../components/codeEditor';
import { storageKey } from '../index';

const code = `import React, { useEffect, useMemo } from 'react';
import SchemaFormRender from 'form-render-next';
import { createForm } from '@formily/core';
import { FormButtonGroup, Reset, Submit } from '@formily/next';
import { FormProvider } from '@formily/react';
import '@alifd/next/components.scss';
import { form as layout, schema } from './schema.json';

export default function () {
  const form = useMemo(() => createForm(), []);

  const onSubmit = (p) => {
    console.log('form submit', p);
  };

  return (
    <>
      <FormProvider form={form}>
        <SchemaFormRender schema={schema} layout={layout} />
        <FormButtonGroup className="actions">
          <Submit size="large" onSubmit={onSubmit}>
            确认
          </Submit>
          <Reset type="secondary" size="large" onReset={() => form.reset()}>
            重置
          </Reset>
        </FormButtonGroup>
      </FormProvider>
    </>
  );
}`;

export default function Dev() {
  const listContent = [
    {
      title: '包安装',
      description: (
        <>
          <CodeEditor
            mode="powershell"
            height="20px"
            value={`tnpm i form-render-next2 -S`}
          />
          <p>工程需要安装react@^16、react-dom@^16、@alifd/next、moment。</p>
        </>
      ),
    },
    {
      title: '创建schema.json',
      description: (
        <>
          创建schema.json文件，然后将
          <Button
            type="link"
            onClick={() => {
              const storageString = localStorage.getItem(storageKey) || '{}';
              copy(storageString);
              message.success('Schema已复制');
            }}
          >
            复制
          </Button>
          内容粘贴到schema.json文件中。
        </>
      ),
    },
    {
      title: (
        <>
          渲染代码
          <Button
            type="link"
            onClick={() => {
              copy(code);
              message.success('code已复制');
            }}
          >
            复制
          </Button>
        </>
      ),
      description: (
        <>
          <CodeEditor value={code} height="300px" mode="javascript" />
        </>
      ),
    },
    {
      title: '运行',
      description: (
        <>
          <CodeEditor value={`npm start`} height="20px" mode="powershell" />
        </>
      ),
    },
    {
      title: '文档',
      description: (
        <>
          <ul>
            <li>
              <a href="https://v2.formilyjs.org/zh-CN/guide">Formily</a>
            </li>
            <li>
              <a href="https://react.formilyjs.org/zh-CN/guide">
                Formily React
              </a>
            </li>
            <li>
              <a href="https://core.formilyjs.org/zh-CN/guide">Formily Core</a>
            </li>
          </ul>
        </>
      ),
    },
  ];

  return (
    <>
      <Steps
        progressDot
        direction="vertical"
        current={listContent.length - 1}
        items={listContent}
      />
    </>
  );
}
