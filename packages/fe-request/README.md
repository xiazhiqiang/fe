# fe-request

通用请求库

## 使用方法

### install

```sh
npm i fe-request -S
```

已经支持 umd 格式。建议使用 externals 在生产环境排除依赖，减少打包体积。

```json
{
  "externals": {
    {
      "fe-request": "FeRequest",
    }
  }
}
```

然后在 html 中引入 umd cdn 资源

### 基础用法

```javascript
import { RequestHttp, RequestGraphql } from 'fe-request';
const { httpRequest } = RequestHttp;

export const myHttpReuqest = httpRequest;
```

### http 详细使用方法

- 详情见：[src/demo/http.tsx](src/demo/http.tsx)

### 参数

| 属性名称    | 说明                                                                             | 类型                                                |
| ----------- | -------------------------------------------------------------------------------- | --------------------------------------------------- |
| RequestBase | 基础拦截器，主要作用：给拦截器起别名，使用拦截器时可以传入额外参数。             | 可选参数：[InterceptorManager](#interceptormanager) |
| RequestHttp | 通用拦截器，主要作用：基于 RequestBase 封装的 基础 方法合集， 包含上云版本等能力 | [RequestHttp](#requesthttp)                         |
| RequestUtil | 工具方法                                                                         | [RequestUtil](#requestutil)                         |

#### InterceptorManager

> 拦截器核心功能 const myInterceptor = new InterceptorManager()

| 属性名称                | 说明                       | 类型                                                                                                                                                          |
| ----------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| setGlobalParams         | 给所有拦截器中设置公共参数 | Function(globalParams) => void; 参数 globalParams： 公共参数                                                                                                  |
| useReqInterceptor       | 绑定使用请求拦截器         | Function(<br> id?: string , <br> fulfilled?: any, <br>rejected?: any, <br> opts?: any, // use 方法参数 <br>params?: any, //透传给拦截器参数 <br> ) => boolean |
| useResInterceptor       | 绑定使用响应拦截器         | 同 useReqInterceptor                                                                                                                                          |
|                         |
| ejectReqInterceptorById | 解绑请求拦截器             | Function(id) => void;                                                                                                                                         |
| ejectResInterceptorById | 解绑响应拦截器             | Function(id) => void;                                                                                                                                         |
| clearReqInterceptors    | 清除所有请求拦截器         | Function() => void;                                                                                                                                           |
| clearResInterceptors    | 清除所有响应拦截器         | Function() => void;                                                                                                                                           |
| clearInterceptors       | 清除所有拦截器             | Function() => void;                                                                                                                                           |

#### RequestHttp

| 属性名称           | 说明                      | 类型                                                                                                                                  |
| ------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| httpInterceptors   | InterceptorManager 的实例 | [InterceptorManager](#interceptormanager)                                                                                             |
| normalReqFulfilled | 通用请求拦截方法          | Funtion(params) => reqParams <br> 参数：<br> params：请求参数 <br> 返回值：<br> reqParams：最终的参数                                 |
| normalResFulfilled | 通用响应拦截方法          | Funtion(res) => data <br> 参数：<br> res: 响应结果 <br> 返回值：<br> data：最终的响应值                                               |
| httpErrCb          | 通用错误处理方法          | Funtion(res) => void <br> 参数：<br> res: 响应结果                                                                                    |
| setHttpErrCb       | 支持外部覆写错误处理      | Funtion(fn) => void <br> 参数：<br> fn: 覆写方法                                                                                      |
| httpRequest        | 通用请求方法              | Funtion(<br>params: any = {} // 请求参数,<br>notice = true, // 是否展示报错<br>renderErr?: (...p: any) => void//报错方法重写) => void |

## LICENSE

MIT
