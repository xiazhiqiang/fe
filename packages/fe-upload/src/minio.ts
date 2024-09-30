import mime from 'mime';
// @ts-ignore
import * as Minio from 'minio-es';
import { BaseUploader } from './base';
import { ICredentials, IUploadInfo, UploadInterface } from './typings';

// 参考 minio 源码：https://github.com/minio/minio-js/blob/7.1.3/src/internal/client.ts
// 参考 minio-es 源码：https://github.com/hojas/minio-es/blob/main/packages/minio-core/src/main.ts
// 分片上传参考实现：https://juejin.cn/post/7039554714077233189，https://cloud.tencent.com/developer/article/2318112
export class MinioUploader extends BaseUploader implements UploadInterface {
  minioClient: any;

  constructor(credentials: any) {
    super();
    this.minioClient = this.initClient(credentials);
  }

  initClient(credentials: ICredentials) {
    try {
      if (!credentials) {
        throw new Error('缺少必要参数！');
      }

      // 初始化参数参考：https://github.com/minio/minio-js/blob/master/src/internal/client.ts#L153
      return new Minio.Client({
        ...(credentials || {}),
        bucket: credentials?.bucket,
        endPoint: credentials?.endPoint || credentials?.endpoint,
        region: credentials?.region,
        accessKey: credentials?.accessKey || credentials?.accessKeyId,
        secretKey: credentials?.secretKey || credentials?.accessKeySecret,
        sessionToken: credentials?.securityToken,
        useSSL: credentials?.useSSL || false,
      });
    } catch (err) {
      console.error('实例化minio client失败', err);
      return null;
    }
  }

  async uploadFile(file: File, credentials: ICredentials) {
    try {
      if (!this.minioClient || !file || !file.name) {
        throw new Error(`缺少上传必要参数`);
      }

      const filePath = this.createPathByFileName(file.name);
      const url = await this.minioClient.presignedPutObject(
        credentials?.bucket,
        filePath,
      );

      const res = await fetch(url, {
        method: 'put',
        body: file,
        headers: {
          'content-type': 'multipart/form-data',
        },
      });

      console.log('res', res);
      return res?.ok ? filePath : false;
    } catch (err) {
      console.error(err);
      return;
    }
  }

  async getDownloadUrl(
    filePath: string,
    credentials: ICredentials,
  ): Promise<string | any> {
    try {
      if (!filePath || !credentials?.bucket) {
        throw new Error(`缺少必要参数！`);
      }

      const arr = filePath.split('/');
      const fileName = arr[arr.length - 1];

      // 获取下载链接
      const url = await this.minioClient.presignedUrl(
        'get',
        credentials?.bucket,
        filePath,
        60,
        {
          'response-content-type': 'application/octet-stream', // 文件流
          'response-content-disposition': `attachment;filename=${encodeURIComponent(
            fileName,
          )}`,
        },
      );
      console.log('download url', url);
      return url;
    } catch (err) {
      return;
    }
  }

  async getPreviewUrl(
    filePath: string,
    credentials?: ICredentials,
  ): Promise<string | any> {
    try {
      if (!filePath || !credentials?.bucket) {
        throw new Error(`缺少必要参数！`);
      }

      const arr = filePath.split('/');
      const fileName = arr[arr.length - 1];
      const contentType = mime.getType(fileName) || '';

      // 获取下载链接
      const url = await this.minioClient.presignedUrl(
        'get',
        credentials?.bucket,
        filePath,
        60,
        {
          'response-content-type': `${contentType};charset=UTF-8`,
        },
      );

      console.log('download url', url);
      return url;
    } catch (err) {
      return;
    }
  }

  // 删除单个对象文件
  async deleteFile(filePath: string, credentials?: ICredentials) {
    try {
      return await this.minioClient.removeObject(credentials?.bucket, filePath);
    } catch (err) {
      return false;
    }
  }

  // ----------------------------------------------------------------

  // 初始化分片上传
  async handleInitMultipartUpload(fileName: string, credentials: ICredentials) {
    try {
      const filePath = this.createPathByFileName(fileName);
      const uploadId: string =
        await this.minioClient.initiateNewMultipartUpload(
          credentials?.bucket,
          filePath,
          { 'Content-Type': 'application/octet-stream' },
        );
      return { uploadId, filePath, name: filePath };
    } catch (err) {
      console.error('初始化分片上传失败', err);
      return null;
    }
  }

  // 执行分片上传
  async handleMultipartUpload(
    uploadInfo: any,
    file: File,
    chunkSize = 5 * 1024 * 1024, // https://docs.aws.amazon.com/AmazonS3/latest/API/API_CompleteMultipartUpload.html
    progressFn: (p: number) => any = () => {},
    credentials?: ICredentials | any,
  ) {
    // 计算上传文件的分片总数量，逐个分片上传
    const totalPart = Math.ceil(file.size / chunkSize);
    for (let i = 1; i <= totalPart; i++) {
      const start = (i - 1) * chunkSize;
      const end = Math.min(i * chunkSize, file.size);
      const res: Response | any = await this._uploadPartWithRetry(
        uploadInfo,
        credentials,
        file,
        i,
        start,
        end,
      );
      if (!res) {
        progressFn(0);
        console.error('分段上传失败！');
        return [];
      }
      progressFn(Math.floor((i / totalPart) * 100));
    }

    let uploadParts: {
      etag: string;
      size: number;
      part: number;
      lastModified: Date;
    }[] = [];
    try {
      // 获取
      uploadParts = await this.minioClient.listParts(
        credentials?.bucket,
        uploadInfo?.filePath,
        uploadInfo?.uploadId,
      );
    } catch (err) {}

    return uploadParts || [];
  }

  // 上传分段，包含错误重试
  async _uploadPartWithRetry(
    uploadInfo: any,
    credentials: ICredentials,
    file: File,
    partNo: number,
    start: number,
    end: number,
    retry: number = 3,
  ) {
    // 调用getPresignedObjectUrl生成上传地址
    const url = await this.minioClient.presignedUrl(
      'put',
      credentials?.bucket,
      uploadInfo.filePath,
      60 * 10,
      {
        partNumber: partNo,
        uploadId: uploadInfo.uploadId,
      },
    );

    let res;
    let count = 0;
    do {
      try {
        const ret: Response = await fetch(url, {
          method: 'put',
          body: file.slice(start, end),
          headers: {
            'content-type': 'multipart/form-data',
          },
        });
        res = ret?.ok ? ret : null;
      } catch (err) {
        // console.log('error part', err);
        res = null;
      }
      count++;
    } while (res === null && count < retry);

    return res;
  }

  // 合并分片上传
  async handleCompleteMultipartUpload(
    uploadInfo: any,
    uploadParts: any,
    credentials?: ICredentials,
  ): Promise<{ etag?: string; versionId?: string } | null> {
    try {
      let ret;

      // minio-es使用的是minio7.1.3版本，completeMultipartUpload方法用的是cb方式返回合并结果，>=8.0.0不需要
      if (/minio\-js\/7/.test(this.minioClient.userAgent)) {
        ret = await new Promise((resolve, reject) => {
          this.minioClient.completeMultipartUpload(
            credentials?.bucket,
            uploadInfo?.filePath,
            uploadInfo?.uploadId,
            uploadParts,
            (err: any, result: { etag: string; versionId: string | null }) => {
              if (err) {
                reject(err);
              } else {
                resolve(result);
              }
            },
          );
        });
      } else {
        ret = await this.minioClient.completeMultipartUpload(
          credentials?.bucket,
          uploadInfo?.filePath,
          uploadInfo?.uploadId,
          uploadParts,
        );
      }

      console.log('分段合并完成', ret);
      return ret;
    } catch (err) {
      console.error('完成分段上传失败', err);
      return null;
    }
  }

  // 取消分段上传
  async handleAbortMultipartUpload(
    uploadInfo: IUploadInfo,
    credentials: ICredentials,
  ) {
    try {
      let result;
      // minio-es使用的是minio7.1.3版本，completeMultipartUpload方法用的是cb方式返回合并结果，>=8.0.1不需要
      if (/minio\-js\/7/.test(this.minioClient.userAgent)) {
        result = await new Promise((resolve, reject) => {
          this.minioClient.removeIncompleteUpload(
            credentials?.bucket,
            uploadInfo?.filePath,
            (err: any, result: any) => {
              if (err) {
                reject(err);
              } else {
                resolve(result);
              }
            },
          );
        });
      } else {
        result = await this.minioClient.removeIncompleteUpload(
          credentials?.bucket,
          uploadInfo?.filePath,
        );
      }
      console.log('abort multipart upload', result);
      return result;
    } catch (err) {
      console.error('终止分段上传失败', err);
      return null;
    }
  }
}
