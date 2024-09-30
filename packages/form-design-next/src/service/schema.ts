import { Engine } from '@designable/core';
import {
  transformToSchema,
  transformToTreeNode,
} from '@designable/formily-transformer';
import { message, Modal } from 'antd';
import copy from 'copy-to-clipboard';

let storageKey = 'formily-schema';
export const getStorageKey = () => storageKey;
export const setStorageKey = (key = '') => {
  if (key) {
    storageKey = key;
  }
};

export const saveSchema = (designer: Engine) => {
  localStorage.setItem(
    storageKey,
    JSON.stringify(transformToSchema(designer.getCurrentTree())),
  );
  message.success('Save Success');
};

export const clearSchema = (designer: Engine) => {
  Modal.confirm({
    title: '确认',
    content: '清除后无法恢复，确认清除吗？',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      localStorage.removeItem(storageKey);
      message.success('已清除Schema');
      designer.setCurrentTree(transformToTreeNode({}));
    },
  });
};

export const copySchema = (designer: Engine) => {
  const schemaString = localStorage.getItem(storageKey) || '';
  if (schemaString) {
    copy(schemaString);
    message.success('Schema已复制');
  } else {
    message.warning('不存在Schema');
  }
};

export const exportSchema = (designer: Engine) => {
  const schemaString = localStorage.getItem(storageKey) || '';
  if (!schemaString) {
    message.warning('不存在Schema');
    return;
  }

  // 创建一个包含JSON数据的Blob对象
  const blob = new Blob([schemaString], { type: 'application/json' });

  // 创建一个链接元素
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = 'schema.json';

  // 将链接元素添加到文档中
  document.body.appendChild(downloadLink);

  // 触发点击事件进行下载
  downloadLink.click();

  // 删除链接元素
  document.body.removeChild(downloadLink);
};

export const importSchema = (designer: Engine, schema = '') => {
  if (typeof schema !== 'string' || !schema) {
    message.warning('schema内容为空');
  } else {
    try {
      designer.setCurrentTree(transformToTreeNode(JSON.parse(schema || '{}')));
      message.success('schema已导入');
    } catch {}
  }
};

export const loadInitialSchema = (designer: Engine) => {
  try {
    designer.setCurrentTree(
      transformToTreeNode(JSON.parse(localStorage.getItem(storageKey) || '{}')),
    );
  } catch {}
};
