import '@alifd/next/index.scss';
import React, { useEffect, useState } from 'react';
import './index.less';
import { openapiSchema } from './services';

export default function () {
  const [httpData, setHttpData] = useState<any>();

  // 测试http请求
  useEffect(() => {
    (async () => {
      const ret = await openapiSchema({});
      setHttpData(ret);
    })();
  }, []);

  return (
    <div>
      <h2>HTTP请求</h2>
      <pre>{JSON.stringify(httpData, null, 2)}</pre>
    </div>
  );
}
