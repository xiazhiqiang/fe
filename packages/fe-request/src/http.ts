import { Notification } from '@alifd/next';
import { InterceptorManager } from './base';
import { throttle } from './utils';

// 全局设置Notification，避免接口提示信息堆叠显示
Notification.config({
  maxCount:
    typeof window?.configs?.common?.notificationNum !== 'undefined'
      ? window?.configs?.common?.notificationNum
      : -1, // 默认不限制
});

// Notification设置节流函数，在n秒内不允许重复出现
const showThrottledNotice = throttle(function (msg, type: any = 'error') {
  Notification.open({ type, title: msg });
}, window?.configs?.common?.notificationThrottledTime || 5000);

export const httpInterceptors = new InterceptorManager();

//----------------------------------------------------------------

export function normalReqFulfilled(params: any = {}) {
  let { headers = {}, ...others } = params || {};
  let reqParams = { headers, ...others };
  return reqParams;
}
export function normalResFulfilled(res: any = {}) {
  let { data } = res || {};
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
      // 解析失败
      throw data;
    }
  }

  if (!data || !data.success) {
    const win: any = window === window.top ? window : window.top;
    const errorCode = data?.errorCode || data?.code; // 兼容两种方式code message 以及 errorCode errorMsg
    if (errorCode === '302') {
      localStorage.setItem('isLogin', '0');
      let url = data?.data || '';
      if (url) {
        win.location.replace(
          url.indexOf('goto') < 0
            ? `${url}?goto=${encodeURIComponent(win.location.href)}`
            : url,
        );
      }
      return null;
    } else if (['401', 'NOT_LOGIN'].indexOf(errorCode) > -1) {
      localStorage.setItem('isLogin', '0');
      setTimeout(() => {
        // 登录态失效，非登录页面跳转登录
        if (win.location.hash.indexOf('#/login') < 0) {
          win.location.replace(
            window?.configs?.common?.loginUrl
              ? `${window?.configs?.common?.loginUrl}?goto=${encodeURIComponent(
                  win.location.href,
                )}`
              : `${win.location.pathname}#/login?goto=${encodeURIComponent(
                  win.location.href,
                )}`,
          );
        }
      }, 0);
      return null;
    } else if (errorCode === 'NO_AUTH') {
      // win.location.hash = '#/403';
      history.pushState('', '', '#/403');
      return data;
    } else {
      // 抛出数据
      throw data;
    }
  } else {
    return data;
  }
}

//----------------------------------------------------------------

httpInterceptors.useReqInterceptor('normalReq', normalReqFulfilled);
httpInterceptors.useResInterceptor('normalRes', normalResFulfilled);

//----------------------------------------------------------------

export let httpErrCb = (
  params: {
    err?: any;
    renderErr?: (...p: any) => any;
    notice?: any | true;
  } = {},
) => {
  const { err, renderErr, notice = true } = params || {};
  let errMsg =
    err?.response?.data?.errorMsg || // 兼容非2xx抛出错误信息
    err?.response?.data?.message || // 兼容非2xx抛出错误信息
    err?.errorMsg ||
    err?.message ||
    '系统出错啦';
  typeof renderErr === 'function' && renderErr(errMsg, err);
  if (notice) {
    showThrottledNotice(errMsg);
    // Notification.open({ type: 'error', title: errMsg });
  }
};

// 支持外部覆写错误处理
export function setHttpErrCb(fn?: (p?: any) => any) {
  if (typeof fn === 'function') {
    httpErrCb = fn;
  }
}

export async function httpRequest(
  params: any = {},
  notice = true,
  renderErr?: (...p: any) => void,
) {
  try {
    return await httpInterceptors.ins(params);
  } catch (err) {
    httpErrCb({ err, renderErr, notice });
    return false;
  }
}
