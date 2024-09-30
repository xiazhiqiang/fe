import { MinioUploader } from './minio';
import { OssUploader } from './oss';

export class Uploader {
  sts: any;
  client: any;

  constructor(sts: any) {
    this.sts = sts;
  }

  // 获取凭证，策略模式初始化client
  async initClient(stsReqOpts = {}) {
    try {
      // 初始化凭证
      const credentials = await this.sts.getCredentials(stsReqOpts);
      if (!credentials || !this.sts.validateCredentials(credentials)) {
        throw new Error('缺少credentials参数！');
      }

      // 初始化client
      if (credentials?.type === 'oss') {
        this.client = new OssUploader(credentials);
      }

      if (credentials?.type === 'minio') {
        this.client = new MinioUploader(credentials);
      }
    } catch (err) {
      console.log('init client error', err);
      this.client = null;
    }
  }

  // 获取upload client，如果凭证过期则重新获取凭证并初始化client
  async getClient() {
    if (this.sts.isCredentialsExpired()) {
      // 凭证过期，重新请求凭证并初始化client
      await this.initClient();
    } else {
      if (!this.client) {
        await this.initClient();
      }
    }

    return this.client || null;
  }

  // 单文件上传
  async uploadFile(file: File): Promise<any> {
    this.client = await this.getClient();
    return await this.client?.uploadFile(file, this.sts?.credentials);
  }

  // 单文件下载
  async getFileDownloadUrl(filePath: string) {
    this.client = await this.getClient();

    try {
      if (this.sts?.httpInterceptors) {
        const stsToken = await this.sts.httpInterceptors.ins({
          url: '/sts',
          method: 'get',
          params: { type: 'download', path: filePath },
        });
        if (!stsToken.url) {
          return;
        }

        const url = stsToken.url.replace('http://', 'https://');
        return url;
      } else {
        return await this.client?.getDownloadUrl(
          filePath,
          this.sts?.credentials,
        );
      }
    } catch (err) {
      return;
    }
  }

  // 单文件预览
  async getFilePreviewUrl(filePath: string): Promise<string | any> {
    this.client = await this.getClient();

    try {
      if (this.sts?.httpInterceptors) {
        const stsToken = await this.sts.httpInterceptors.ins({
          url: '/sts',
          method: 'get',
          params: { type: 'preview', path: filePath },
        });
        if (!stsToken.url) {
          return;
        }

        const url = stsToken.url.replace('http://', 'https://');
        return url;
      } else {
        return await this.client?.getPreviewUrl(
          filePath,
          this.sts?.credentials,
        );
      }
    } catch (err) {
      return;
    }
  }

  // 删除文件
  async deleteFile(filePath: string): Promise<any> {
    this.client = await this.getClient();
    return await this.client?.deleteFile(filePath, this.sts.credentials);
  }

  // ----------------------------------------------------------------

  // 初始化分片上传
  async handleInitMultipartUpload(fileName: string) {
    this.client = await this.getClient();
    return await this.client?.handleInitMultipartUpload(
      fileName,
      this.sts?.credentials,
    );
  }

  // 执行分片上传
  async handleMultipartUpload(
    uploadInfo: any,
    file: File,
    chunkSize: number = 5 * 1024 * 1024,
    progressFn: (p: number) => any,
  ) {
    this.client = await this.getClient();
    return await this.client?.handleMultipartUpload(
      uploadInfo,
      file,
      chunkSize,
      progressFn,
      this.sts?.credentials,
    );
  }

  // 合并分片上传
  async handleCompleteMultipartUpload(uploadInfo: any, uploadParts: any) {
    this.client = await this.getClient();
    return await this.client?.handleCompleteMultipartUpload(
      uploadInfo,
      uploadParts,
      this.sts?.credentials,
    );
  }

  // 取消分段上传
  async handleAbortMultipartUpload(uploadInfo: any) {
    this.client = await this.getClient();
    return await this.client?.handleAbortMultipartUpload(
      uploadInfo,
      this.sts?.credentials,
    );
  }
}
