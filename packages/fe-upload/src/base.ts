import { RequestBase } from 'fe-request';
import { v4 as uuidv4 } from 'uuid';
import { ICredentials } from './typings';

export class BaseUploader {
  uploadDir: string = 'apsara';

  setUploadDir(dir: string = '') {
    if (dir) {
      this.uploadDir = dir.replace(/^\/+|\/+$/g, '');
    }
  }

  // 根据上传文件name创建oss上传的path
  createPathByFileName(fileName: string): string {
    if (!fileName) {
      return '';
    }

    const randomDir = uuidv4().replace(/-/g, '');
    this.uploadDir = this.uploadDir || `apsara/${randomDir}`;
    return `${this.uploadDir}/${fileName}`;
  }
}

export class StsCredentials {
  credentials: ICredentials | null = null;
  httpInterceptors: any = null;

  constructor(p: { stsReqOpts?: any; credentials?: any } = {}) {
    if (this.validateCredentials(p?.credentials)) {
      this.credentials = p?.credentials;
    } else {
      this.initRequest(p?.stsReqOpts || {});
    }
  }

  validateCredentials(credentials: ICredentials) {
    if (!credentials) {
      return false;
    }

    if (credentials?.type === 'minio') {
      return (
        credentials?.bucket &&
        credentials?.endPoint &&
        credentials?.accessKey &&
        credentials?.secretKey
      );
    } else if (credentials?.type === 'oss') {
      return (
        credentials?.bucket &&
        credentials?.region &&
        credentials?.accessKeyId &&
        credentials?.accessKeySecret
      );
    } else {
      return true;
    }
  }

  // 初始化请求
  initRequest(stsReqOpts: any = {}) {
    const httpInterceptors = new RequestBase.InterceptorManager();
    httpInterceptors.clearInterceptors();
    httpInterceptors.useReqInterceptor('normalReq', (req: any) => {
      return {
        ...(stsReqOpts || {}),
        ...(req || {}),
        url: stsReqOpts?.url || req?.url || '/apsara/sts',
      };
    });
    httpInterceptors.useResInterceptor('normalRes', (res: any) => {
      console.log('normal res', res);
      if (!res || res?.status !== 200 || !res?.data) {
        throw res;
      }
      return res.data?.data || null;
    });

    this.httpInterceptors = httpInterceptors;
    return this.httpInterceptors;
  }

  // 判断凭证是否过期
  isCredentialsExpired() {
    if (!this.credentials || !this.validateCredentials(this.credentials)) {
      return true;
    }

    if (typeof this.credentials.expiration === 'undefined') {
      return false;
    } else {
      const expireDate = new Date(this.credentials.expiration);
      const now = new Date();

      // 如果有效期不足一分钟，视为过期。
      return expireDate.getTime() - now.getTime() <= 60000;
    }
  }

  // 请求新的凭证
  async requestCredentials(params = {}) {
    try {
      return await this.httpInterceptors.ins({
        url: '/sts',
        method: 'get',
        params,
      });
    } catch (e) {
      return null;
    }
  }

  // 获取凭证
  async getCredentials(stsReqOpts = {}) {
    // 临时凭证过期时，才重新获取，减少对sts服务的调用。
    if (this.httpInterceptors && this.isCredentialsExpired()) {
      this.credentials = null;
      this.credentials = await this.requestCredentials(stsReqOpts);
    }

    return this.credentials;
  }
}
