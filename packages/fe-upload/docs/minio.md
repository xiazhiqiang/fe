<!-- minio上传，访问路由：/minio -->

```jsx
/**
 * title: 简单上传&下载&预览
 * inline: false
 */
import '@alifd/next/index.css';
import Uploader from '../src/demo/minio';
import { useEffect, useRef } from 'react';

export default function () {
  return (
    <Uploader
      credentials={{
        endPoint: '127.0.0.1', // 本地ip
        port: 9000,
        useSSL: false, // 本地http的，需要关掉
        accessKey: '',
        secretKey: '',
        bucket: '',
      }}
    />
  );
}
```

```jsx
/**
 * title: 封装上传&下载&预览测试
 */
import '@alifd/next/index.css';
import { useEffect, useRef } from 'react';
import { SimpleUpload } from '../src/demo/minio';

export default () => {
  return (
    <SimpleUpload
      credentials={{
        type: 'minio',
        bucket: '',
        endPoint: '127.0.0.1',
        port: 9000,
        useSSL: false, // 本地http的，需要关掉
        accessKey: '',
        secretKey: '',
      }}
    />
  );
};
```

```jsx
/**
 * title: 封装分段上传测试
 */
import '@alifd/next/index.css';
import { MultipartUpload } from '../src/demo/minio';
import { useEffect, useRef } from 'react';

export default () => {
  return (
    <MultipartUpload
      credentials={{
        type: 'minio',
        bucket: '',
        endPoint: '127.0.0.1',
        port: 9000,
        useSSL: false, // 本地http的，需要关掉
        accessKey: '',
        secretKey: '',
      }}
    />
  );
};
```
