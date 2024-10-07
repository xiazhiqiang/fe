import React from 'react';
import { ConfigProvider } from '@alifd/next';
import zhCN from '@alifd/next/lib/locale/zh-cn';
import './index.scss';

export default function BasicLayout(props) {
  return <ConfigProvider locale={zhCN}>{props.children}</ConfigProvider>;
}
