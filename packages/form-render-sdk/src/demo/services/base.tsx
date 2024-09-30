import { Notification } from '@alifd/next';
import { RequestBase, RequestHttp } from 'fe-request';

const httpInterceptors = new RequestBase.InterceptorManager();

function getCurrentProjectCode() {
  if (sessionStorage.getItem('currentProject')) {
    return (
      JSON.parse(sessionStorage.getItem('currentProject') || '{}')?.code || ''
    );
  } else if (localStorage.getItem('currentProject')) {
    return (
      JSON.parse(localStorage.getItem('currentProject') || '{}').bizCode || ''
    );
  } else if (sessionStorage?.getItem('mainAppParams')) {
    return (
      JSON.parse(sessionStorage.getItem('mainAppParams') || '{}').ItemCode || ''
    );
  } else {
    return '';
  }
}

function normalReq(p: any = {}) {
  const { headers = {}, ...others } = p || {};
  let hd = {
    ...headers,
    auth_type: 'token',
    projectcode: getCurrentProjectCode(),
  };

  const mainAppParams = sessionStorage?.getItem('mainAppParams');
  if (mainAppParams) {
    hd = { ...hd, ...JSON.parse(mainAppParams) };
  }

  return { ...others, headers: hd };
}

httpInterceptors.useReqInterceptor('normalReq', normalReq);
httpInterceptors.useResInterceptor('normalRes', RequestHttp.normalResFulfilled);

export default async function request(
  params: any,
  noTip?: any,
  tipCallback?: any,
) {
  try {
    const res = await httpInterceptors.ins(params);
    return res.data || res || {};
  } catch (err: any) {
    typeof tipCallback === 'function' && tipCallback(err);

    if (noTip) {
      const errMsg = err?.errorMsg || err?.message || '系统出错啦';
      Notification.open({
        title: errMsg,
        type: 'error',
      });
    }
  }
}
