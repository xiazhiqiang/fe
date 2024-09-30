import React, { useEffect, useState, useMemo } from 'react';
import { PageHeader, Drawer, Modal, Space, message } from 'antd';
import SchemaFormRender from 'form-render-next2';
import { createForm } from '@formily/core';
import { FormButtonGroup, Reset, Submit } from '@formily/next';
import { FormProvider } from '@formily/react';
import { Button } from '@alifd/next';
import copy from 'copy-to-clipboard';
import { storageKey } from '../index';
import DevStep from '../devStep';
import CodeEditor from '../../components/codeEditor';
import ImportSchema from '../../components/importSchema';
import '@alifd/next/components.scss';
import './index.less';

export default (props: any = {}) => {
  const [schema, setSchema] = useState(props.schema || {});
  const [layout, setLayout] = useState(props.layout || {});

  const [importSchemaVisible, setImportSchemaVisible] = useState(false);
  const [submitDialogVisible, setSubmitDialogVisible] = useState(false);
  const [codeDrawerVisible, setCodeDrawerVisible] = useState(false);

  const form = useMemo(() => createForm(), []);

  useEffect(() => {
    if (props.schema) {
      setSchema(props.schema);
    }
    if (props.layout) {
      setLayout(props.layout);
    }
  }, [props.schema, props.layout]);

  useEffect(() => {
    const storageString = localStorage.getItem(storageKey) || '{}';
    let schema = {},
      layout = {};
    try {
      const obj = JSON.parse(storageString) || {};
      schema = obj.schema;
      layout = obj.form;
    } catch (err) {}
    setSchema(schema);
    setLayout(layout);
  }, []);

  return (
    <FormProvider form={form}>
      <PageHeader
        className="render-container"
        onBack={() => {
          location.href = '#/';
        }}
        title="FormRender"
        extra={[
          <Button onClick={() => setImportSchemaVisible(true)}>导入</Button>,
          <FormButtonGroup className="actions">
            <Submit
              onSubmit={(p) => {
                console.log('submit form', p);
                setSubmitDialogVisible(true);
              }}
            >
              提交
            </Submit>
            <Reset onReset={() => form.reset()}>重置</Reset>
          </FormButtonGroup>,
          <Button
            onClick={() => {
              setCodeDrawerVisible(true);
            }}
          >
            开发
          </Button>,
        ]}
      >
        <div className="container-content">
          <SchemaFormRender schema={schema} layout={layout} />
        </div>
      </PageHeader>
      <Modal
        title="提交结果"
        open={submitDialogVisible}
        footer={
          <Space>
            <Button
              type="primary"
              onClick={() => {
                setSubmitDialogVisible(false);
                const formState = form.getState();
                copy(JSON.stringify(formState.values || {}));
                message.success('结果复制成功');
              }}
            >
              复制
            </Button>
            <Button onClick={() => setSubmitDialogVisible(false)}>关闭</Button>
          </Space>
        }
        onOk={() => {
          setSubmitDialogVisible(false);
        }}
        onCancel={() => {
          setSubmitDialogVisible(false);
        }}
      >
        <CodeEditor
          mode="json"
          readOnly={true}
          value={JSON.stringify(form.getState().values || {}, null, 2)}
          height="300px"
        />
      </Modal>
      <Drawer
        title="开发步骤"
        placement="right"
        size="large"
        onClose={() => {
          setCodeDrawerVisible(false);
        }}
        open={codeDrawerVisible}
      >
        <DevStep />
      </Drawer>
      <ImportSchema
        visible={importSchemaVisible}
        onOk={(data: string = '') => {
          // console.log('data', data);
          form.reset();
          try {
            const obj = JSON.parse(data) || {};
            setSchema(obj.schema);
            setLayout(obj.form);
          } catch (e) {
            console.log('err', e);
          }
          setImportSchemaVisible(false);
        }}
        onCancel={() => setImportSchemaVisible(false)}
      />
    </FormProvider>
  );
};
