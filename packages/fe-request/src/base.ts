import axios from 'axios';

/**
 * 拦截器类主要作用：
 * - 给拦截器起别名
 * - 使用拦截器时可以传入额外参数
 */
export class InterceptorManager {
  [x: string]: any;

  constructor(config = {}, globalParams = {}) {
    this.globalParams = globalParams || {}; // 拦截器中共享参数
    this.bindReqInterceptorIds = []; // 已绑定的请求拦截器
    this.bindResInterceptorIds = []; // 已绑定的响应拦截器

    // 实例化axios
    this.instance = axios.create(config);
  }

  // 给所有拦截器中设置公共参数
  setGlobalParams(globalParams = {}) {
    this.globalParams = globalParams || {};
  }

  // 绑定使用请求拦截器
  useReqInterceptor(
    id?: string,
    fulfilled?: any,
    rejected?: any,
    opts?: any, // use方法参数
    params?: any, // 透传给拦截器参数
  ) {
    if (!id) {
      console.warn('拦截器缺少必要参数！');
      return false;
    }
    const idx = this.bindReqInterceptorIds.findIndex((i) => i && i.id === id);
    if (idx >= 0) {
      return true;
    }

    const ret = this.instance.interceptors.request.use(
      typeof fulfilled === 'function' &&
        ((...p) => fulfilled(...p, params || {}, this.globalParams)),
      typeof rejected === 'function' &&
        ((...p) => rejected(...p, params || {}, this.globalParams)),
      opts || {},
    );
    this.bindReqInterceptorIds.push({ id, ret });

    return true;
  }

  // 绑定使用响应拦截器
  useResInterceptor(
    id?: string,
    fulfilled?: any,
    rejected?: any,
    opts?: any, // use方法参数
    params?: any, // 透传给拦截器参数
  ) {
    if (!id) {
      console.warn('拦截器缺少必要参数！');
      return false;
    }
    const idx = this.bindResInterceptorIds.findIndex((i) => i && i.id === id);
    if (idx >= 0) {
      return true;
    }

    const ret = this.instance.interceptors.response.use(
      typeof fulfilled === 'function' &&
        ((...p) => fulfilled(...p, params || {}, this.globalParams)),
      typeof rejected === 'function' &&
        ((...p) => rejected(...p, params || {}, this.globalParams)),
      opts || {},
    );
    this.bindResInterceptorIds.push({ id, ret });

    return true;
  }

  // 解绑请求拦截器
  ejectReqInterceptorById(id: string) {
    if (!id) {
      return false;
    }
    const idx = this.bindReqInterceptorIds.findIndex((i) => i && i.id === id);
    if (idx < 0) {
      return false;
    }
    this.instance.interceptors.request.eject(
      this.bindReqInterceptorIds[idx].ret,
    );
    this.bindReqInterceptorIds.splice(idx, 1);
    return true;
  }

  // 解绑响应拦截器
  ejectResInterceptorById(id: string) {
    if (!id) {
      return false;
    }
    const idx = this.bindResInterceptorIds.findIndex((i) => i && i.id === id);
    if (idx < 0) {
      return false;
    }
    this.instance.interceptors.response.eject(
      this.bindResInterceptorIds[idx].ret,
    );
    this.bindResInterceptorIds.splice(idx, 1);
    return true;
  }

  // 清除所有请求拦截器
  clearReqInterceptors() {
    this.bindReqInterceptorIds.forEach((i) => {
      i && this.instance.interceptors.request.eject(i.ret);
    });
    this.bindReqInterceptorIds = [];
  }

  // 清除所有响应拦截器
  clearResInterceptors() {
    this.bindResInterceptorIds.forEach((i) => {
      i && this.instance.interceptors.response.eject(i.ret);
    });
    this.bindResInterceptorIds = [];
  }

  // 清除所有拦截器
  clearInterceptors() {
    this.clearReqInterceptors();
    this.clearResInterceptors();
  }

  get ins() {
    return this.instance;
  }
}
