```jsx
/**
 * title: 简单上传
 */
import '@alifd/next/index.css';
import { useEffect, useRef } from 'react';

export default function () {
  const inputRef = useRef(null);

  const onFileChange = async () => {
    const file = inputRef.current.files[0];
    console.log('file', file);
    try {
      // const res = await CloudOss.uploadOssFile(file);
      // console.log(res);
    } catch (err) {
      console.error(err);
    }

    // 重置文件输入框的值以便下次选择相同文件仍然触发onChange事件
    inputRef.current.value = '';
  };

  return (
    <div>
      <input type="file" ref={inputRef} onChange={onFileChange} />
    </div>
  );
}
```

```jsx
/**
 * title: 封装UI组件简单上传
 */
import '@alifd/next/index.css';
import CustomUpload from '../src/components/Upload';
import { useEffect, useState } from 'react';
import { Radio } from '@alifd/next';

const RadioGroup = Radio.Group;
const OSS_KEY = {
  //base64编码后
  key: '',
  secret: '',
};

export default function () {
  const [credentials, setCredentials] = useState();
  return (
    <>
      <RadioGroup
        dataSource={[
          { label: 'minio', value: 'minio' },
          { label: 'oss', value: 'oss' },
        ]}
        onChange={(v) => {
          if (v === 'minio') {
            setCredentials({
              type: v,
              bucket: '',
              endPoint: '127.0.0.1',
              port: 9000,
              useSSL: false, // 本地http的，需要关掉
              accessKey: '',
              secretKey: '',
            });
          }
          if (v === 'oss') {
            setCredentials({
              type: v,
              region: '',
              accessKeyId: window.atob(OSS_KEY.key),
              accessKeySecret: window.atob(OSS_KEY.secret),
              bucket: '',
            });
          }
        }}
      />
      <CustomUpload
        multiple={true}
        // disabled={true}
        // value={[
        //   { name: 'swagger.json', path: '', size: 284067 },
        //   { name: 'README.md', path: '', size: 284067 },
        // ]}
        onChange={(v) => console.log('onChange', v)}
        onComplete={(v) => console.log('onComplete', v)}
        stsParams={{ credentials }}
      />
    </>
  );
}
```

```jsx
/**
 * title: 封装UI组件分片上传
 */
import '@alifd/next/index.css';
import CustomUpload from '../src/components/Upload';
import { useEffect, useState } from 'react';
import { Radio } from '@alifd/next';

const RadioGroup = Radio.Group;
const OSS_KEY = {
  //base64编码后
  key: '',
  secret: '',
};

export default function () {
  const [credentials, setCredentials] = useState();
  return (
    <>
      <RadioGroup
        dataSource={[
          { label: 'minio', value: 'minio' },
          { label: 'oss', value: 'oss' },
        ]}
        onChange={(v) => {
          if (v === 'minio') {
            setCredentials({
              type: v,
              bucket: '',
              endPoint: '127.0.0.1',
              port: 9000,
              useSSL: false, // 本地http的，需要关掉
              accessKey: '',
              secretKey: '',
            });
          }
          if (v === 'oss') {
            setCredentials({
              type: v,
              region: '',
              accessKeyId: window.atob(OSS_KEY.key),
              accessKeySecret: window.atob(OSS_KEY.secret),
              bucket: '',
            });
          }
        }}
      />
      <CustomUpload
        type="big"
        // disabled={true}
        // value={[
        //   { name: 'swagger.json', path: '', size: 284067 },
        //   { name: 'README.md', path: '', size: 284067 },
        // ]}
        multiple={true}
        webkitdirectory={false}
        onChange={(v) => console.log('onChange', v)}
        onComplete={(v) => console.log('onComplete', v)}
        stsParams={{ credentials }}
      />
    </>
  );
}
```
