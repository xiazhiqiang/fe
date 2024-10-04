# web-worker

## WebWorker

- 同源限制：worker 脚本必须与主进程脚本同源
- DOM 限制：worker 进程中无法读取主进程所有 DOM 对象，也无法使用 window，document，parent，但可使用 navigator 和 location
- 主进程通信：不能直接通信，可通过消息通信
- 脚本限制：不能使用 alert，confirm 方法，但可使用 XMLHttpRequest 发送请求
- 文件限制：无法读取 file://文件系统，但可以通过网络加载文件

## SharedWorker

- 本地分别打开：
  - page1: http://localhost:8000/page1
  - page2: http://localhost:8000/page2
  - [chrome 调试](chrome://inspect/#workers)

## References

- [MDN Web Worker](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Using_web_workers)
- [阮一峰 Web Worker 使用教程](https://www.ruanyifeng.com/blog/2018/07/web-worker.html)
- [WebWorker 中可使用的函数或类](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Functions_and_classes_available_to_workers)

## LICENSE

MIT
