export * from './base';
export * from './uploader';

export * as Minio from 'minio-es';
// @ts-ignore
export * as OSS from 'ali-oss';

import CommonUpload from './components/Upload';
import BigUpload from './components/BigUpload';
import SimpleUpload from './components/SimpleUpload';
export { CommonUpload, BigUpload, SimpleUpload };
