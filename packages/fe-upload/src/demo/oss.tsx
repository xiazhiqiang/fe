// @ts-nocheck
import '@alifd/next/index.css';
import mime from 'mime';
import { useEffect, useRef } from 'react';
import { OSS, StsCredentials, Uploader } from '../index';

// 原始oss sdk 上传
export default function (props) {
  const { credentials = {} } = props || {};
  const bucket = credentials?.bucket;
  const inputRef = useRef(null);
  const ossClient = new OSS(credentials);

  console.log('oss client:', ossClient);

  useEffect(() => {
    (async () => {
      try {
        const bucket = await ossClient.getBucket(bucket);
        console.log('bucket', bucket);
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  const onFileChange = async (event) => {
    const file = event.target.files[0];
    console.log('file', file);

    try {
      const res: { name: string; res: any; url: string } = await ossClient.put(
        `assets/tmp/${file.name}`,
        file,
      );
      console.log('res', res);
    } catch (err) {
      console.log('err', err);
    }
  };

  const download = async () => {
    try {
      const file = inputRef.current.files[0];

      // 配置响应头实现通过URL访问时自动下载文件，并设置下载后的文件名。
      const response = {
        'content-disposition': `attachment; filename=${encodeURIComponent(
          file.name,
        )}`,
      };
      // 获取下载链接
      const url = await ossClient.signatureUrl(`assets/tmp/${file.name}`, {
        response,
      });
      console.log('download url', url);

      const dom = document.createElement('a');
      dom.download = file.name; // 下载文件名
      dom.href = url;
      dom.style.display = 'none';
      document.body.appendChild(dom);
      dom.click();
      document.body.removeChild(dom);
    } catch (err) {
      console.log('error', err);
    }
  };

  const preview = async () => {
    try {
      const file = inputRef.current.files[0];
      const url = await ossClient.signatureUrl(`assets/tmp/${file.name}`, {
        expires: 60 * 60,
      });
      console.log('preview url', url);
      window.open(url, '_blank');
    } catch (err) {}
  };

  return (
    <>
      <input type="file" ref={inputRef} onChange={onFileChange} />
      <button onClick={download}>下载</button>
      <button onClick={preview}>预览</button>
    </>
  );
}

// 封装后的单文件上传
export function SimpleUpload(props) {
  const { credentials } = props;
  const inputRef = useRef<any>(null);
  const uploaderRef = useRef<Uploader>();

  useEffect(() => {
    (async () => {
      // 异步初始化Client
      const stsIns = new StsCredentials({ credentials });
      uploaderRef.current = new Uploader(stsIns);
      await uploaderRef.current.initClient();

      // 设置测试的上传目录
      uploaderRef.current.client.setUploadDir('assets/tmp');
    })();
  }, []);

  const onFileChange = async (event) => {
    const file = event.target.files[0];
    const res = await uploaderRef.current.uploadFile(file);
    console.log('res', res);
  };

  const download = async () => {
    const url = await uploaderRef.current.getFileDownloadUrl(
      'assets/tmp/README.md',
    );
    console.log('download url', url);
  };
  const preview = async () => {
    const url = await uploaderRef.current.getFilePreviewUrl(
      'assets/tmp/README.md',
    );
    console.log('preview url', url);
  };

  return (
    <>
      <input type="file" ref={inputRef} onChange={onFileChange} />
      <button onClick={download}>下载</button>
      <button onClick={preview}>预览</button>
    </>
  );
}

// 封装后的分片上传
export function MultipartUpload(props) {
  const { credentials } = props || {};
  const inputRef = useRef(null);
  const uploaderRef = useRef<Uploader>(null);
  const uploadInfoRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      // 异步初始化Client
      const stsIns = new StsCredentials({ credentials });
      uploaderRef.current = new Uploader(stsIns);
      await uploaderRef.current.initClient();

      // 设置测试的上传目录
      uploaderRef.current.client.setUploadDir('assets/tmp');
    })();
  }, []);

  const onFileChange = async (event) => {
    try {
      const file = event.target.files[0];

      // 初始化分片
      const uploadInfo = await uploaderRef.current?.handleInitMultipartUpload(
        file?.name,
      );
      uploadInfoRef.current = uploadInfo;
      console.log('initMultipartUpload', uploadInfo);

      // 分片上传
      const uploadParts = await uploaderRef.current.handleMultipartUpload(
        uploadInfo,
        file,
        5 * 1024 * 1024, // 最小分片5M
      );
      console.log('parts', uploadParts);

      // 分片合并
      const res = await uploaderRef.current?.handleCompleteMultipartUpload(
        uploadInfo,
        uploadParts,
      );
      console.log('res', res);
    } catch (err) {
      console.log('error uploading', err);
    }
  };

  const abortUpload = async () => {
    try {
      const res = await uploaderRef.current?.handleAbortMultipartUpload(
        uploadInfoRef.current,
      );
      console.log('abort', res);
    } catch (err) {}
  };

  return (
    <>
      <input type="file" ref={inputRef} onChange={onFileChange} />
      <button onClick={abortUpload}>取消分段上传</button>
    </>
  );
}
