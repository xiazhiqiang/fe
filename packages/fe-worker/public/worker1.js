console.log('worker1 loaded~');

function msgHandler(event) {
  console.log('data', event.data);
  self.postMessage({ message: 'from worker', data: { x: 1, y: 2 } });
}
function closeHandler(event) {
  // worker进程中关闭进程
  self.close();
}

const msgTypesList = ['msg', 'close'];
const handlersMap = {
  msgHandler,
  closeHandler,
};

self.addEventListener('message', function (event) {
  const { type } = event && event.data ? event.data : {};

  // 验证消息type类型
  if (!msgTypesList.includes(type) || !handlersMap[`${type}Handler`]) {
    return;
  }

  handlersMap[`${type}Handler`](event);
});
