import { Options } from 'ali-oss';
// @ts-ignore
import { ClientOptions } from 'minio-es';

export interface ICredentials extends ClientOptions, Options {
  type?: string;
  [k: string]: any;
}

export interface IUploadInfo {
  uploadId: string;
  [k: string]: any;
}

export interface UploadInterface {
  initClient(credentials: ICredentials): any;
  uploadFile(file: File, credentials?: ICredentials): Promise<any>;
  getDownloadUrl(filePath: string, credentials?: ICredentials): Promise<any>;
  getPreviewUrl(
    filePath: string,
    credentials?: ICredentials,
  ): Promise<string | any>;
  deleteFile(filePath: string, credentials?: ICredentials): Promise<any>;
  handleInitMultipartUpload(
    fileName: string,
    credentials?: ICredentials,
  ): Promise<any>;
  handleMultipartUpload(
    uploadInfo: any,
    file: File,
    chunkSize: number,
    progressFn: (p: number) => any,
    credentials?: ICredentials,
  ): Promise<any>;
  handleCompleteMultipartUpload(
    uploadInfo: any,
    uploadParts: any,
    credentials?: ICredentials,
  ): Promise<any>;
  handleAbortMultipartUpload(
    uploadInfo: any,
    credentials?: ICredentials,
  ): Promise<any>;
}
