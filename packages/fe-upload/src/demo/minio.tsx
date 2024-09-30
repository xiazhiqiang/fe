// @ts-nocheck
import '@alifd/next/index.css';
import mime from 'mime';
import { useEffect, useRef } from 'react';
import { Minio, StsCredentials, Uploader } from '../index';

// 原始minio sdk上传
export default function (props) {
  const { credentials = {} } = props || {};
  const bucket = credentials?.bucket;
  const inputRef = useRef(null);
  const minioClient = new Minio.Client(credentials);

  console.log('minio client:', minioClient);

  useEffect(() => {
    (async () => {
      try {
        const exists = await minioClient.bucketExists(bucket);
        console.log('exists', exists);
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  const onFileChange = async (event) => {
    const file = event.target.files[0];
    console.log('file', file);

    try {
      const url = await minioClient.presignedPutObject(
        bucket,
        `assets/${file.name}`,
      );

      const res: Response = await fetch(url, {
        method: 'put',
        body: file,
        headers: {
          'content-type': 'multipart/form-data',
        },
      });
      console.log('res', res);
    } catch (err) {
      console.log('err', err);
    }
  };

  const download = async () => {
    try {
      const file = inputRef.current.files[0];
      // 获取下载链接
      const url = await minioClient.presignedUrl(
        'get',
        bucket,
        `assets/${file.name}`,
        60,
        {
          'response-content-type': 'application/octet-stream', // 文件流
        },
      );
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
      console.log('file', file);
      const contentType = mime.getType(file.name) || 'text/plain';
      console.log('contentType', contentType);

      const url = await minioClient.presignedUrl(
        'get',
        bucket,
        `assets/${file.name}`,
        60 * 60,
        {
          'response-content-type': `${contentType};charset=UTF-8`,
        },
      );

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
    })();
  }, []);

  const onFileChange = async (event) => {
    const file = event.target.files[0];
    const res = await uploaderRef.current.uploadFile(file);
  };

  const download = async () => {
    const url = await uploaderRef.current.getFileDownloadUrl(
      'apsara/102be740943347c7b707c104d3b3c25a/README.md',
    );
  };
  const preview = async () => {
    const url = await uploaderRef.current.getFilePreviewUrl(
      'apsara/102be740943347c7b707c104d3b3c25a/README.md',
    );
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
        5 * 1024 * 1024, // minio最小分片5M
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
