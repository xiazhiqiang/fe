<!-- oss上传，访问路由：/oss -->

```jsx
/**
 * title: 简单上传&下载&预览
 */
import '@alifd/next/index.css';
import Uploader from '../src/demo/oss';
import { useEffect, useRef } from 'react';

const OSS_CONF = {
  //base64编码后
  key: '',
  secret: '',
  bucket: '',
  endpoint: '',
};

export default function () {
  return (
    <Uploader
      credentials={{
        type: 'oss',
        endpoint: OSS_CONF.endpoint,
        accessKeyId: window.atob(OSS_CONF.key),
        accessKeySecret: window.atob(OSS_CONF.secret),
        bucket: OSS_CONF.bucket,
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
import { SimpleUpload } from '../src/demo/oss';

const OSS_CONF = {
  //base64编码后
  key: '',
  secret: '',
  bucket: '',
  endpoint: '',
};

export default () => {
  return (
    <SimpleUpload
      credentials={{
        type: 'oss',
        endpoint: OSS_CONF.endpoint,
        accessKeyId: window.atob(OSS_CONF.key),
        accessKeySecret: window.atob(OSS_CONF.secret),
        bucket: OSS_CONF.bucket,
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
import { MultipartUpload } from '../src/demo/oss';
import { useEffect, useRef } from 'react';

const OSS_CONF = {
  //base64编码后
  key: '',
  secret: '',
  bucket: '',
  endpoint: '',
};

export default () => {
  return (
    <MultipartUpload
      credentials={{
        type: 'oss',
        endpoint: OSS_CONF.endpoint,
        accessKeyId: window.atob(OSS_CONF.key),
        accessKeySecret: window.atob(OSS_CONF.secret),
        bucket: OSS_CONF.bucket,
      }}
    />
  );
};
```
