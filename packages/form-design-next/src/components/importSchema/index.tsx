import React, { useEffect, useState, useRef } from 'react';
import { Modal, Radio, Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import CodeEditor from '../codeEditor';

export default function ImportSchema(props: any) {
  const { title = '导入Schema', visible = false, onOk, onCancel } = props || {};
  const [schema, setSchema] = useState('');
  const [importMode, setImportMode] = useState<string>('text');
  const [importFileList, setImportFileList] = useState<any>([]);

  // 弹窗变化重置状态
  useEffect(() => {
    setSchema('');
    setImportMode('text');
    setImportFileList([]);
  }, [visible]);

  const fileOnChange = (info: any) => {
    // const file = event.target.files[0];
    // console.log('info', info);
    setImportFileList(info.fileList);

    const file = info.file.originFileObj;
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e: any) {
        const content = e.target.result || '';
        setSchema(content);
      };
      reader.readAsText(file);
    } else {
      setSchema('');
    }
  };

  const beforeUpload = (file: any) => {
    const isJson = ['application/json'].indexOf(file.type) >= 0;
    if (!isJson) {
      message.error('只能上传json文件');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('json文件需小于2MB!');
    }

    return isJson && isLt2M;
  };

  return (
    <>
      <Modal
        title={title}
        open={visible}
        onCancel={onCancel}
        onOk={() => {
          if (typeof onOk === 'function') {
            // console.log('schema', schema);
            onOk(schema);
          }
        }}
        okText="确认"
        cancelText="取消"
      >
        <Radio.Group
          onChange={(e) => setImportMode(e.target.value)}
          value={importMode}
        >
          <Radio value="text">纯文本</Radio>
          <Radio value="file">读取文件</Radio>
        </Radio.Group>
        <div style={{ margin: '10px 0 0' }}>
          {importMode === 'text' ? (
            <CodeEditor
              mode="json"
              height="300px"
              onChange={(v: string = '') => {
                try {
                  const fn = new Function(`return ${v || ''}`);
                  setSchema(JSON.stringify(fn(v)));
                } catch (e) {}
              }}
            />
          ) : null}
          {importMode === 'file' ? (
            <Upload
              listType="picture-card"
              fileList={importFileList}
              beforeUpload={beforeUpload}
              onChange={fileOnChange}
              maxCount={1}
              // 禁用组件默认发起的请求
              customRequest={(info: any) =>
                info.onSuccess(undefined, undefined)
              }
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传 JSON</div>
              </div>
            </Upload>
          ) : null}
        </div>
      </Modal>
    </>
  );
}
