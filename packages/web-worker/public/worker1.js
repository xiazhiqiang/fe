console.log('worker1 loaded~');

function msgHandler(event) {
  console.log('data', event.data);
  self.postMessage({ message: 'from worker', data: { x: 1, y: 2 } });
}
function closeHandler(event) {
  // worker进程中关闭进程
  self.close();
}
function loadScriptHandler(event, data) {
  self.importScripts('/script1.js', '/script2.js');
}

const handlersMap = {
  msgHandler,
  closeHandler,
  loadScriptHandler,
};

self.addEventListener('message', function (event) {
  const { type, data } = event && event.data ? event.data : {};

  // 验证消息type类型
  if (!handlersMap[`${type}Handler`]) {
    return;
  }

  handlersMap[`${type}Handler`](event, data);
});
