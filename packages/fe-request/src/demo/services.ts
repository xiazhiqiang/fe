import { RequestHttp } from '@/index';

const { httpInterceptors, httpRequest } = RequestHttp;

// console.log(
//   "services",
//   httpInterceptors,
//   httpInterceptors.instance.interceptors.response?.handlers,
//   httpInterceptors.instance.interceptors.request?.handlers
// );

httpInterceptors.clearReqInterceptors();
httpInterceptors.useReqInterceptor('customReq', customReqFulfilled);
httpInterceptors.useReqInterceptor('customReq2', function (p) {
  console.log('jinlaile2', p);
  return p;
});
httpInterceptors.useReqInterceptor('customReq3', function (p) {
  console.log('jinlaile3', p);
  return p;
});

// 定制http请求拦截器
function customReqFulfilled(params: any = {}) {
  console.log('jinlaile1', params);
  const { headers = {}, ...others } = params || {};
  headers.projectCode = '111';
  let reqParams = { headers, ...others };
  return reqParams;
}

export const openapiSchema = (params) => {
  return httpRequest(
    {
      url: '/llmapp/openapi/schema',
      method: 'get',
      params,
    },
    true,
  );
};
