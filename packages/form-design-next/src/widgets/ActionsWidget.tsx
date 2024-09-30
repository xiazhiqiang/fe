import { GlobalRegistry } from '@designable/core';
import { TextWidget, useDesigner } from '@designable/react';
import { observer } from '@formily/react';
import { Button, Space, Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  clearSchema,
  copySchema,
  exportSchema,
  loadInitialSchema,
  saveSchema,
  importSchema,
  getStorageKey,
} from '../service';
import ImportSchema from '../components/importSchema';

export const ActionsWidget = observer(() => {
  const designer = useDesigner();
  const supportLocales = ['zh-cn', 'en-us', 'ko-kr'];
  const [importSchemaVisible, setImportSchemaVisible] = useState(false);

  useEffect(() => {
    loadInitialSchema(designer);
  }, []);

  useEffect(() => {
    if (!supportLocales.includes(GlobalRegistry.getDesignerLanguage())) {
      GlobalRegistry.setDesignerLanguage('zh-cn');
    }
  }, []);

  return (
    <div style={{ marginRight: 10 }}>
      {/* <Radio.Group
        value={GlobalRegistry.getDesignerLanguage()}
        optionType="button"
        options={[
          { label: 'English', value: 'en-us' },
          { label: '简体中文', value: 'zh-cn' },
          { label: '한국어', value: 'ko-kr' },
        ]}
        onChange={(e: any) => {
          GlobalRegistry.setDesignerLanguage(e.target.value);
        }}
      /> */}
      <Space>
        <Button
          onClick={() => {
            setImportSchemaVisible(true);
          }}
        >
          <TextWidget>导入</TextWidget>
        </Button>
        <Button
          type="primary"
          onClick={() => {
            saveSchema(designer);
          }}
        >
          <TextWidget>Save</TextWidget>
        </Button>
        <Button
          danger
          onClick={() => {
            clearSchema(designer);
          }}
        >
          <TextWidget>清除</TextWidget>
        </Button>
        <Button
          onClick={() => {
            copySchema(designer);
          }}
        >
          <TextWidget>复制</TextWidget>
        </Button>
        <Button
          onClick={() => {
            exportSchema(designer);
          }}
        >
          <TextWidget>导出</TextWidget>
        </Button>
        <Button
          onClick={() => {
            Modal.confirm({
              title: '确认',
              content: '未保存的内容将丢失不被运行，确认当前内容已保存了吗？',
              okText: '确认',
              cancelText: '取消',
              onOk() {
                location.href = '#/render';
              },
            });
          }}
        >
          <TextWidget>运行</TextWidget>
        </Button>
        <Button
          type="primary"
          disabled
          onClick={() => {
            saveSchema(designer);
          }}
        >
          <TextWidget>Publish</TextWidget>
        </Button>
      </Space>
      <ImportSchema
        visible={importSchemaVisible}
        onOk={(schema: string = '') => {
          // console.log('schema', schema);
          importSchema(designer, schema);
          setImportSchemaVisible(false);
        }}
        onCancel={() => setImportSchemaVisible(false)}
      />
    </div>
  );
});
