import OSS from 'ali-oss';
import mime from 'mime';
import { BaseUploader } from './base';
import { ICredentials, UploadInterface } from './typings';

export class OssUploader extends BaseUploader implements UploadInterface {
  ossClient: any;

  constructor(credentials: any) {
    super();
    this.ossClient = this.initClient(credentials);
  }

  initClient(credentials: ICredentials) {
    try {
      if (!credentials) {
        throw new Error('缺少必要参数！');
      }

      return new OSS({
        ...(credentials || {}),
        bucket: credentials?.bucket,
        region: credentials?.region,
        accessKeyId: credentials?.accessKeyId,
        accessKeySecret: credentials?.accessKeySecret,
        stsToken: credentials?.stsToken || credentials?.securityToken,
        endpoint: credentials?.endpoint,
      });
    } catch (err) {
      console.error('实例化oss ossClient失败', err);
      return null;
    }
  }

  // 上传单个文件
  async uploadFile(file: File): Promise<any | void> {
    try {
      if (!this.ossClient || !file || !file.name) {
        throw new Error(`缺少上传必要参数`);
      }

      const filePath = this.createPathByFileName(file.name);
      const result: { name: string; res: any; url: string } =
        await this.ossClient.put(filePath, file);
      console.log('oss res', result);

      return result ? filePath : false;
    } catch (err) {
      console.error(err);
      return;
    }
  }

  // 上传多个文件
  async uploadFiles<T = { filePath: string; res: any }>(
    files: File[],
  ): Promise<Array<T> | void> {
    if (!this.ossClient || !files || files.length < 1) {
      return;
    }
    let _files = files.filter((i) => i && i.name);
    if (_files.length < 1) {
      return;
    }

    // 批量上传文件
    const result: Array<T> = [];
    for (let i = 0; i < _files.length; i++) {
      const filePath = this.createPathByFileName(_files[i].name);
      let res;
      try {
        res = await this.ossClient.put(filePath, _files[i]);
      } catch (e) {}
      result.push({ filePath, res } as T);
    }

    return result;
  }

  // 单个文件下载
  async getDownloadUrl(filePath: string): Promise<string | void> {
    try {
      if (!filePath) {
        throw new Error(`缺少必要参数！`);
      }

      const arr = filePath.split('/');
      const fileName = arr[arr.length - 1];
      const response = {
        'content-disposition': `attachment;filename=${encodeURIComponent(
          fileName,
        )}`,
      };

      // 填写Object完整路径。Object完整路径中不能包含Bucket名称。
      const url = this.ossClient.signatureUrl(filePath, { response });
      return url;
    } catch (err) {
      return;
    }
  }

  // 单个文件预览
  async getPreviewUrl(filePath: string) {
    try {
      if (!filePath) {
        throw new Error(`缺少必要参数！`);
      }

      const arr = filePath.split('/');
      const fileName = arr[arr.length - 1];
      const contentType = mime.getType(fileName) || '';

      // 填写Object完整路径。Object完整路径中不能包含Bucket名称。
      const url = this.ossClient.signatureUrl(filePath, {
        response: {
          'content-type': `${contentType};charset=UTF-8`,
        },
      });
      return url;
    } catch (err) {
      return;
    }
  }

  // 删除单个文件
  async deleteFile(filePath: string) {
    try {
      return await this.ossClient.delete(filePath);
    } catch (err) {
      return false;
    }
  }

  // ----------------------------------------------------------------

  // 初始化分片上传
  async handleInitMultipartUpload(fileName: string) {
    try {
      const filePath = this.createPathByFileName(fileName);
      const uploadInfo: {
        bucket: string;
        name: string;
        res: any;
        uploadId: string;
      } = (await this.ossClient.initMultipartUpload(filePath)) || {};
      console.log('uploadInfo', uploadInfo);
      return { ...uploadInfo, filePath: uploadInfo?.name };
    } catch (err) {
      console.error('初始化分片上传失败', err);
      return null;
    }
  }

  // 执行分片上传
  async handleMultipartUpload(
    uploadInfo: any,
    file: File,
    chunkSize = 5 * 1024 * 1024,
    progressFn: (p: number) => any = () => {},
  ) {
    const uploadParts: { number: number; part: number; etag: string }[] = [];
    const totalPart = Math.ceil(file.size / chunkSize);
    for (let i = 1; i <= totalPart; i++) {
      const start = (i - 1) * chunkSize;
      const end = Math.min(i * chunkSize, file.size);
      const res = await this._uploadPartWithRetry(
        uploadInfo,
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
      uploadParts.push({ part: i, number: i, etag: res.etag });
      progressFn(Math.floor((i / totalPart) * 100));
    }

    return uploadParts;
  }

  // 上传分段，包含错误重试
  async _uploadPartWithRetry(
    uploadInfo: any,
    file: File,
    partNo: number,
    start: number,
    end: number,
    retry = 3,
  ) {
    let res;
    let count = 0;
    do {
      try {
        const ret: undefined | any = await this.ossClient.uploadPart(
          uploadInfo?.name,
          uploadInfo?.uploadId,
          partNo,
          file,
          start,
          end,
        );
        res = ret;
      } catch (err) {
        // console.log('error part', err);
        res = null;
      }
      count++;
    } while (res === null && count < retry);

    return res;
  }

  // 合并分片上传
  async handleCompleteMultipartUpload(uploadInfo: any, uploadParts: any) {
    try {
      const ret: { bucket: string; etag: string; name: string } =
        await this.ossClient.completeMultipartUpload(
          uploadInfo?.name,
          uploadInfo?.uploadId,
          uploadParts,
        );
      console.log('分段合并完成', ret);
      return ret;
    } catch (err) {
      console.error('完成分段上传失败', err);
      return null;
    }
  }

  // 取消分段上传
  async handleAbortMultipartUpload(uploadInfo: any) {
    try {
      const result: { res: any } = await this.ossClient.abortMultipartUpload(
        uploadInfo?.name,
        uploadInfo?.uploadId,
      );
      console.log('abort multipart upload', result);
      return result;
    } catch (err) {
      console.error('终止分段上传失败', err);
      return null;
    }
  }
}
